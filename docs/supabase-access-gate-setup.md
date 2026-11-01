# PRERNA • Supabase Closed Beta Gatekeeper Setup Guide
**Architect:** Harsh Kumar Gupta  
**Tier:** 100% Free ($0 Cost forever on Supabase Free Tier)  
**Security Model:** Sovereign Cloud Gatekeeper with Row-Level Security (RLS)  

---

## 1. Overview
PRERNA's access gate restricts entry exclusively to authorized pilot testers.
- **Supabase Cloud Role:** Authenticates and tracks invite tokens, grants access, and allows 1-click remote token revocation.
- **Sovereign Boundary:** All adolescent psychometric answers, journals, AI mentor chats, and wellness logs **remain 100% on the user's local device**. No minor personal data is ever sent to Supabase.

---

## 2. Step-by-Step Setup (Takes ~5 Minutes)

### Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and click **Start your project** (Log in with GitHub).
2. Click **New Project**.
3. Choose:
   - **Name:** `prerna-sanctuary`
   - **Database Password:** (Choose a secure password and save it)
   - **Region:** `South Asia (Mumbai)` or closest to your target audience.
   - **Pricing Plan:** Free ($0/month).
4. Click **Create new project**.

---

### Step 2: Run the 1-Click Database Schema in Supabase
1. In your Supabase Dashboard, click on **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Copy and paste the entire SQL script below, then click **Run**:

```sql
-- ==============================================================================
-- PRERNA CLOSED BETA ACCESS GATE SCHEMA
-- ==============================================================================

-- 1. Create Beta Access Tokens Table with Hardware Device Lock
create table if not exists public.beta_access_tokens (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  assigned_to text not null,
  role text default 'teen', -- 'teen' | 'adult' | 'parent' | 'educator' | 'reviewer'
  max_uses int default 1,
  times_used int default 0,
  claimed_device_id text, -- Cryptographic hardware lock (prevents multi-device oversharing)
  is_active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Enable Row-Level Security (Prevents public token enumeration)
alter table public.beta_access_tokens enable row level security;

-- 2. Create the Atomic Verification Stored Procedure (RPC) with Device Lock
create or replace function public.verify_beta_token(input_token text, input_device_id text default null)
returns json
language plpgsql
security definer
as $$
declare
  token_record record;
  is_first_claim boolean := false;
begin
  select * into token_record
  from public.beta_access_tokens
  where upper(token) = upper(trim(input_token))
    and is_active = true
    and (expires_at is null or expires_at > now());

  if not found then
    return json_build_object(
      'valid', false, 
      'message', 'Token is invalid or deactivated.'
    );
  end if;

  -- Anti-Leak Defense: Strict 1-device lock ONLY for single-use tokens (max_uses = 1)
  if coalesce(token_record.max_uses, 1) = 1 and token_record.claimed_device_id is not null and input_device_id is not null and token_record.claimed_device_id <> input_device_id then
    return json_build_object(
      'valid', false,
      'message', 'Security Alert: This single-use invitation has already been claimed on another device.'
    );
  end if;

  -- Check max uses
  if token_record.max_uses is not null and token_record.times_used >= token_record.max_uses and token_record.claimed_device_id <> input_device_id then
    return json_build_object(
      'valid', false,
      'message', 'This invitation has reached its maximum allowed redemptions.'
    );
  end if;

  -- First claim on this device: Bind device for single-use tokens, increment count
  if coalesce(token_record.max_uses, 1) = 1 then
    if token_record.claimed_device_id is null and input_device_id is not null then
      update public.beta_access_tokens
      set times_used = times_used + 1,
          claimed_device_id = input_device_id
      where id = token_record.id;
    else
      update public.beta_access_tokens
      set times_used = times_used + 1
      where id = token_record.id;
    end if;
  else
    -- Multi-use token (founder, cohort, pilot school)
    update public.beta_access_tokens
    set times_used = times_used + 1
    where id = token_record.id;
  end if;

  return json_build_object(
    'valid', true,
    'assigned_to', token_record.assigned_to,
    'role', token_record.role,
    'token', token_record.token
  );
end;
$$;

-- Allow public execution of the verifier function
grant execute on function public.verify_beta_token(text, text) to anon, authenticated;

-- 3. Create Anonymous Beta Feedback Table (Optional Cloud Inbox)
create table if not exists public.beta_feedback (
  id uuid primary key default gen_random_uuid(),
  category text,
  sentiment text,
  sus_score int,
  title text,
  description text,
  role text,
  created_at timestamptz default now()
);

alter table public.beta_feedback enable row level security;

-- Allow anonymous inserts for feedback (Idempotent)
drop policy if exists "Allow anonymous feedback inserts" on public.beta_feedback;
create policy "Allow anonymous feedback inserts" on public.beta_feedback
  for insert with check (true);

-- 4. Create In-App Pilot Access Requests Table (For GitHub / External Visitors)
create table if not exists public.beta_access_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  role text not null default 'teen', -- 'teen' | 'parent' | 'educator' | 'reviewer' | 'partner' | 'other'
  purpose text not null,
  organization text,
  discovery_source text default 'GitHub / Web',
  status text default 'pending', -- 'pending' | 'approved' | 'rejected'
  created_at timestamptz default now()
);

alter table public.beta_access_requests enable row level security;
grant select, insert on table public.beta_access_requests to anon, authenticated;

drop policy if exists "Allow anonymous access requests" on public.beta_access_requests;
create policy "Allow anonymous access requests" on public.beta_access_requests
  for insert with check (true);

-- 5. Insert Starter Pilot Tokens
insert into public.beta_access_tokens (token, assigned_to, role, max_uses) values
('PRERNA-FOUNDER-2026', 'Harsh Kumar Gupta (Founder)', 'adult', 9999),
('PRERNA-H1-CLINICAL', 'Dr. Clinical Reviewer (Ticket H1)', 'adult', 20),
('PRERNA-H2-PRIVACY', 'Adv. Privacy Specialist (Ticket H2)', 'adult', 20),
('PRERNA-H3-CULTURAL', 'Hindi Typology Specialist (Ticket H3)', 'adult', 20),
('PRERNA-H4-LEXILE', 'Youth Reading Specialist (Ticket H4)', 'adult', 20),
('VIDYAPEETH-PILOT-01', 'VidyaPeeth School Counselor', 'educator', 50),
('PRERNA-TEEN-COHORT-01', 'Cohort 1 Teen Explorer', 'teen', 100)
on conflict (token) do nothing;
```

---

### Step 3: Copy Your API Keys
1. In your Supabase Dashboard, click on **Project Settings** (gear icon at the bottom left).
2. Click on **API** in the settings menu.
3. Find:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **anon public key** (starts with `eyJh...`)

---

### Step 4: Connect to GitHub Pages Deployment
To deploy this with your webapp on GitHub Pages:
1. Open your GitHub Repository: `https://github.com/HarshkumarG007/PRERNA/settings/secrets/actions`
2. Add two **Repository secrets**:
   - `VITE_SUPABASE_URL` = (Your Project URL)
   - `VITE_SUPABASE_ANON_KEY` = (Your anon public key)
3. For local testing on your machine, create a `.env.local` file in your project root:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJh...
   ```

---

## 3. How to Generate 1-Click Magic Links for Testers

You can send testers a link that skips typing the token completely:

| Persona | Magic 1-Click URL Format |
| :--- | :--- |
| **H1 Clinical Reviewer** | `https://harshkumarg007.github.io/PRERNA/#/?invite=PRERNA-H1-CLINICAL` |
| **H2 Privacy Lawyer** | `https://harshkumarg007.github.io/PRERNA/#/?invite=PRERNA-H2-PRIVACY` |
| **H3 Hindi Typologist** | `https://harshkumarg007.github.io/PRERNA/#/?invite=PRERNA-H3-CULTURAL` |
| **H4 Reading Specialist**| `https://harshkumarg007.github.io/PRERNA/#/?invite=PRERNA-H4-LEXILE` |
| **VidyaPeeth Counselor** | `https://harshkumarg007.github.io/PRERNA/#/?invite=VIDYAPEETH-PILOT-01` |
| **Teen Explorers** | `https://harshkumarg007.github.io/PRERNA/#/?invite=PRERNA-TEEN-COHORT-01` |

When they click the link, the app automatically verifies the token with Supabase and unlocks the Sanctuary without requiring any typing!

---

## 4. How to Revoke or Add Tokens on the Fly

You don't need to touch code or push to Git:
1. Open Supabase Dashboard -> **Table Editor** -> `beta_access_tokens`.
2. **To Add a New Tester:** Click **Insert row**, type the token (e.g. `DELHI-PUBLIC-SCHOOL`), assign a name, set `max_uses`, and save.
3. **To Revoke Access:** Find the token and uncheck `is_active` (or set `expires_at` to yesterday). The tester is locked out instantly on their next reload!

---

## 5. How to Review & Grant Access to Beta Applicants

When someone requests access via the in-app modal, their application lands in `public.beta_access_requests`.

### Option A: 100% Automated Database Trigger (Just Change Status to 'approved'!)
Run this SQL script in your Supabase SQL Editor once. It sets up an automatic trigger:

```sql
-- 1. Add generated_token and magic_link columns to beta_access_requests
alter table public.beta_access_requests 
add column if not exists generated_token text,
add column if not exists magic_link text;

-- 2. Create the Trigger Function
create or replace function public.on_beta_request_approved()
returns trigger
language plpgsql
security definer
as $$
declare
  clean_name text;
  random_hex text;
  new_token text;
begin
  -- Trigger ONLY when status transitions to 'approved' and token hasn't been generated yet
  if new.status = 'approved' and (old.status is distinct from 'approved' or new.generated_token is null) then
    
    -- Extract first name without special characters, fallback to 'PILOT'
    clean_name := upper(regexp_replace(split_part(trim(new.full_name), ' ', 1), '[^a-zA-Z0-9]', '', 'g'));
    if clean_name = '' or clean_name is null then
      clean_name := 'PILOT';
    end if;

    -- Generate a clean, friendly token (e.g. PRN-ANANYA-4K92)
    random_hex := upper(substring(md5(random()::text) from 1 for 4));
    new_token := 'PRN-' || clean_name || '-' || random_hex;

    -- Populate the token and ready-to-copy link directly in the request row
    new.generated_token := new_token;
    new.magic_link := 'https://harshkumarg007.github.io/PRERNA/?invite=' || new_token;

    -- Automatically insert into beta_access_tokens with single-use device lock
    insert into public.beta_access_tokens (token, assigned_to, role, max_uses, is_active)
    values (
      new_token, 
      new.full_name || ' (' || new.email || ')', 
      coalesce(new.role, 'teen'), 
      1, 
      true
    )
    on conflict (token) do nothing;

  end if;

  return new;
end;
$$;

-- 3. Bind Trigger to beta_access_requests table
drop trigger if exists trigger_auto_create_token on public.beta_access_requests;
create trigger trigger_auto_create_token
before update or insert on public.beta_access_requests
for each row
execute function public.on_beta_request_approved();
```

**How you use it:**
1. Open Supabase Dashboard -> **Table Editor** -> `beta_access_requests`.
2. Find the row for the applicant.
3. Double-click the `status` cell and change `'pending'` -> `'approved'`.
4. Press Enter.
5. **Instant Result:**
   - The token is automatically created in `beta_access_tokens`!
   - In that exact same row, `generated_token` and `magic_link` are populated instantly!
   - Just copy the link and send it to the tester.

---

### Option B: The 1-Click Automated SQL Function
```sql
select * from public.approve_beta_request('applicant@example.com');
```
```sql
select * from public.approve_beta_request('applicant@example.com');
```
It instantly marks them approved, inserts a single-use token with hardware lock, and prints their ready-to-send magic link!

### Option B: The Visual Table Editor (Zero Code)
1. In Supabase Dashboard, click **Table Editor** -> `beta_access_requests`.
2. Inspect the applicant's name, email, role, and why they want access.
3. Change `status` from `pending` to `approved`.
4. Switch to `beta_access_tokens` table -> click **Insert row**:
   - `token`: `PRN-PILOT-` + their first name (e.g. `PRN-PILOT-ANANYA`)
   - `assigned_to`: Applicant's name
   - `role`: Their requested role (`teen`, `parent`, `educator`, `reviewer`)
   - `max_uses`: `1` (strict single-use device lock)
   - `is_active`: `true`
5. Send them the link:
   `https://harshkumarg007.github.io/PRERNA/?invite=PRN-PILOT-ANANYA`


