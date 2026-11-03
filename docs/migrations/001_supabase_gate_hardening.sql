-- =====================================================================================
-- PRERNA beta-gate hardening for the schema in docs/supabase-access-gate-setup.md
-- Tested against PostgreSQL 16 with Supabase-style roles (anon / authenticated / service_role).
-- RUN IN A STAGING PROJECT FIRST. Review every statement; the live project may differ from the doc.
-- Fixes: anonymous self-approval (mass assignment), PII oracle in verify_beta_token, no throttling,
--        unbounded anonymous inserts, guessable token format, mutable search_path.
-- =====================================================================================
begin;

-- 1. Anonymous callers may only FILE a pending request: column-level INSERT + a WITH CHECK that pins the rest.
revoke all on table public.beta_access_requests from anon, authenticated;
grant insert (full_name, email, role, purpose, organization, discovery_source)
  on table public.beta_access_requests to anon, authenticated;

drop policy if exists "Allow anonymous access requests" on public.beta_access_requests;
drop policy if exists "anon can file a pending request" on public.beta_access_requests;
create policy "anon can file a pending request" on public.beta_access_requests
  for insert to anon, authenticated
  with check (status = 'pending' and generated_token is null and magic_link is null);

-- 2. Bound what anonymous callers can store (NOT VALID = enforced for new rows now; VALIDATE later after cleaning old rows).
alter table public.beta_access_requests
  drop constraint if exists beta_access_requests_role_chk,
  drop constraint if exists beta_access_requests_len_chk,
  drop constraint if exists beta_access_requests_status_chk;
alter table public.beta_access_requests
  add constraint beta_access_requests_role_chk   check (role in ('teen','parent','educator','reviewer','partner','other')) not valid,
  add constraint beta_access_requests_status_chk check (status in ('pending','approved','rejected')) not valid,
  add constraint beta_access_requests_len_chk    check (
        char_length(full_name) between 1 and 120
    and char_length(email)     between 5 and 254
    and char_length(purpose)   between 1 and 1000
    and (organization is null or char_length(organization) <= 200)
    and (discovery_source is null or char_length(discovery_source) <= 100)) not valid;

-- 3. Approval fires ONLY when a privileged role UPDATEs status; token is 80 random bits; no PII copied into the token table.
create or replace function public.on_beta_request_approved()
returns trigger language plpgsql security definer set search_path = '' as $$
declare new_token text;
begin
  new_token := 'PRN-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 20));
  new.generated_token := new_token;
  new.magic_link := 'https://harshkumarg007.github.io/PRERNA/?invite=' || new_token;
  insert into public.beta_access_tokens (token, assigned_to, role, max_uses, is_active)
  values (new_token, 'request:' || new.id::text, coalesce(new.role, 'teen'), 3, true)
  on conflict (token) do nothing;
  return new;
end $$;

drop trigger if exists trigger_auto_create_token on public.beta_access_requests;
create trigger trigger_auto_create_token
  before update of status on public.beta_access_requests
  for each row when (new.status = 'approved' and old.status is distinct from 'approved')
  execute function public.on_beta_request_approved();

-- 4. Verification RPC: keep the original logic as a private core, expose a throttled wrapper that returns only {valid, role|message}.
do $$ begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'verify_beta_token')
     and not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = '_verify_beta_token_core') then
    alter function public.verify_beta_token(text, text) rename to _verify_beta_token_core;
  end if;
end $$;
revoke all on function public._verify_beta_token_core(text, text) from public, anon, authenticated;
alter function public._verify_beta_token_core(text, text) set search_path = '';

create table if not exists public.beta_verify_attempts (
  id bigint generated always as identity primary key,
  client_key text not null,
  at timestamptz not null default now()
);
create index if not exists beta_verify_attempts_key_at on public.beta_verify_attempts (client_key, at desc);
alter table public.beta_verify_attempts enable row level security;
revoke all on table public.beta_verify_attempts from anon, authenticated;

create or replace function public.verify_beta_token(input_token text, input_device_id text default null)
returns json language plpgsql security definer set search_path = '' as $$
declare hdrs jsonb; ip text; ckey text; recent int; res json;
begin
  begin hdrs := nullif(current_setting('request.headers', true), '')::jsonb; exception when others then hdrs := null; end;
  -- Prefer the CDN-provided client IP; fall back to the first X-Forwarded-For entry. Confirm which header your project exposes.
  ip := coalesce(hdrs->>'cf-connecting-ip', nullif(split_part(coalesce(hdrs->>'x-forwarded-for',''), ',', 1), ''), 'unknown');
  ckey := 'ip:' || trim(ip);
  select count(*) into recent from public.beta_verify_attempts where client_key = ckey and at > now() - interval '10 minutes';
  if recent >= 10 then
    return json_build_object('valid', false, 'message', 'Too many attempts. Please wait a few minutes and try again.');
  end if;
  if input_token is null or char_length(input_token) > 64 then
    insert into public.beta_verify_attempts(client_key) values (ckey);
    return json_build_object('valid', false, 'message', 'Token is invalid or deactivated.');
  end if;
  res := public._verify_beta_token_core(input_token, input_device_id);
  if coalesce((res->>'valid')::boolean, false) = false then
    insert into public.beta_verify_attempts(client_key) values (ckey);
    return json_build_object('valid', false, 'message', coalesce(res->>'message', 'Token is invalid or deactivated.'));
  end if;
  -- Success: return only what the client needs. Never the holder's name/email and never the token.
  return json_build_object('valid', true, 'role', res->>'role');
end $$;
grant execute on function public.verify_beta_token(text, text) to anon, authenticated;

-- 5. Feedback: bounded, insert-only, no read path.
revoke all on table public.beta_feedback from anon, authenticated;
grant insert (category, sentiment, sus_score, title, description, role) on table public.beta_feedback to anon, authenticated;
drop policy if exists "Allow anonymous feedback inserts" on public.beta_feedback;
drop policy if exists "anon can submit bounded feedback" on public.beta_feedback;
create policy "anon can submit bounded feedback" on public.beta_feedback
  for insert to anon, authenticated
  with check (char_length(coalesce(title,'')) <= 200 and char_length(coalesce(description,'')) <= 4000
          and char_length(coalesce(category,'')) <= 40 and char_length(coalesce(sentiment,'')) <= 40
          and char_length(coalesce(role,'')) <= 40 and (sus_score is null or sus_score between 0 and 100));

-- 6. The starter tokens in the public docs are known to everyone: deactivate them (issue new ones privately).
update public.beta_access_tokens set is_active = false
 where token in ('PRERNA-FOUNDER-2026','PRERNA-H1-CLINICAL','PRERNA-H2-PRIVACY','PRERNA-H3-CULTURAL',
                 'PRERNA-H4-LEXILE','PRERNA-TEEN-COHORT-01','VIDYAPEETH-PILOT-01');
commit;
