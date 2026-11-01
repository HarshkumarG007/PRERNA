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

-- 1. Create Beta Access Tokens Table
create table if not exists public.beta_access_tokens (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  assigned_to text not null,
  role text default 'teen', -- 'teen' | 'adult' | 'parent' | 'educator' | 'reviewer'
  max_uses int default 1,
  times_used int default 0,
  is_active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Enable Row-Level Security (Prevents public token enumeration)
alter table public.beta_access_tokens enable row level security;

-- 2. Create the Atomic Verification Stored Procedure (RPC)
create or replace function public.verify_beta_token(input_token text)
returns json
language plpgsql
security definer
as $$
declare
  token_record record;
begin
  select * into token_record
  from public.beta_access_tokens
  where upper(token) = upper(trim(input_token))
    and is_active = true
    and (expires_at is null or expires_at > now())
    and (max_uses is null or times_used < max_uses);

  if not found then
    return json_build_object(
      'valid', false, 
      'message', 'Token is invalid, expired, or depleted.'
    );
  end if;

  -- Atomically increment usage
  update public.beta_access_tokens
  set times_used = times_used + 1
  where id = token_record.id;

  return json_build_object(
    'valid', true,
    'assigned_to', token_record.assigned_to,
    'role', token_record.role,
    'token', token_record.token
  );
end;
$$;

-- Allow public execution of the verifier function
grant execute on function public.verify_beta_token(text) to anon, authenticated;

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

-- Allow anonymous inserts for feedback
create policy "Allow anonymous feedback inserts" on public.beta_feedback
  for insert with check (true);

-- 4. Insert Starter Pilot Tokens
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
