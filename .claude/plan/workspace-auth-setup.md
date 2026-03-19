# 📋 실시 계획：Workspace + Auth Setup (ProofPath)

## Task Type
- [x] 全栈 (Frontend auth UI + Backend DB migration)

---

## Auth Flow

```
[Visitor]
    │
    ├─ hits any protected route (/  /onboarding /alerts etc.)
    │         ↓  middleware detects no session
    │    → redirect /login
    │
    ├─ /signup  →  supabase.auth.signUp()
    │              → Supabase sends confirmation email
    │              → "Check your email" screen
    │              → user clicks link → /auth/callback
    │              → redirect /onboarding  (first time, no workspace)
    │
    ├─ /login   →  supabase.auth.signInWithPassword()
    │              → success: check if user has workspace_member row
    │                  YES → redirect /  (dashboard)
    │                  NO  → redirect /onboarding
    │
    └─ /onboarding  →  user enters company/workspace name
                       →  calls supabase.rpc('create_workspace', { name, slug })
                       →  RPC creates workspace + inserts user as admin  (SECURITY DEFINER)
                       →  redirect /  (dashboard, now has workspace)
```

---

## Workspace Bootstrap Flow

```
create_workspace(p_name, p_slug)   ← Postgres RPC, SECURITY DEFINER
    │
    ├── INSERT INTO workspaces (name, slug) → returns workspace row
    └── INSERT INTO workspace_members
            (workspace_id, user_id=auth.uid(), role='admin', display_name=auth.email())
```

**Why RPC instead of Express?**
- User JWT is available in browser → can call Supabase directly
- SECURITY DEFINER bypasses RLS only for this atomic operation
- No round-trip through Express → simpler, fewer hops
- Express remains focused on KPI engine only (clean separation)

---

## Frontend vs Backend Responsibilities

| Concern | Owner | Why |
|---------|-------|-----|
| Auth UI (login/signup forms) | Next.js (client) | User interaction, Supabase Auth SDK |
| Session management | Next.js middleware | Cookie-based via @supabase/ssr |
| Route protection | Next.js middleware | Runs on edge before page renders |
| Workspace creation | Supabase RPC (from client) | SECURITY DEFINER, atomic, no Express needed |
| Workspace membership check | Next.js server component | Reads session + queries DB server-side |
| KPI engine calls | Express | Unchanged, separate concern |

---

## Required Migration

### Migration 005: create_workspace RPC

```sql
-- Postgres function called from browser with user's JWT
CREATE OR REPLACE FUNCTION create_workspace(p_name TEXT, p_slug TEXT)
RETURNS workspaces
LANGUAGE plpgsql
SECURITY DEFINER   -- runs as DB owner, bypasses RLS
AS $$
DECLARE
  v_workspace workspaces;
BEGIN
  -- Require authenticated caller
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Prevent duplicate slug
  IF EXISTS (SELECT 1 FROM workspaces WHERE slug = p_slug) THEN
    RAISE EXCEPTION 'Workspace slug already taken';
  END IF;

  INSERT INTO workspaces (name, slug)
  VALUES (p_name, p_slug)
  RETURNING * INTO v_workspace;

  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace.id, auth.uid(), 'admin');

  RETURN v_workspace;
END;
$$;
```

---

## Route Structure (after refactor)

```
src/app/
  layout.tsx                     MODIFY  root layout — remove AppShell, keep minimal HTML
  (auth)/                        CREATE  route group — no AppShell, centered card layout
    layout.tsx                   CREATE  simple centered layout
    login/page.tsx               CREATE  login form (Client Component)
    signup/page.tsx              CREATE  signup form (Client Component)
  (app)/                         CREATE  route group — protected, has AppShell
    layout.tsx                   CREATE  checks auth → redirect /login if no session
    page.tsx                     MOVE    existing dashboard page
    alerts/page.tsx              MOVE    existing alerts page
    insights/page.tsx            MOVE    existing insights page
    kpis/[id]/page.tsx           MOVE    existing KPI detail page
    onboarding/page.tsx          CREATE  workspace creation form (Client Component)
  auth/
    callback/route.ts            CREATE  Supabase email confirmation handler
  middleware.ts                  CREATE  @ src/middleware.ts (Next.js edge middleware)
```

---

## Files to Add / Modify

| File | Operation | Description |
|------|-----------|-------------|
| `supabase/migrations/005_create_workspace_rpc.sql` | CREATE | RPC function |
| `src/middleware.ts` | CREATE | Route protection — redirects unauthenticated users |
| `src/lib/supabase.ts` | MODIFY | Replace with `createBrowserClient` from @supabase/ssr |
| `src/lib/supabase-server.ts` | CREATE | `createServerClient` factory for Server Components |
| `src/app/layout.tsx` | MODIFY | Remove AppShell — now lives in (app)/layout.tsx |
| `src/app/(auth)/layout.tsx` | CREATE | Centered auth card layout, no sidebar |
| `src/app/(auth)/login/page.tsx` | CREATE | Email+password login form |
| `src/app/(auth)/signup/page.tsx` | CREATE | Email+password signup form |
| `src/app/auth/callback/route.ts` | CREATE | Supabase auth callback (email confirm) |
| `src/app/(app)/layout.tsx` | CREATE | Auth guard + AppShell |
| `src/app/(app)/page.tsx` | CREATE | Move existing dashboard here |
| `src/app/(app)/alerts/page.tsx` | CREATE | Move existing alerts here |
| `src/app/(app)/insights/page.tsx` | CREATE | Move existing insights here |
| `src/app/(app)/kpis/[id]/page.tsx` | CREATE | Move existing KPI detail here |
| `src/app/(app)/onboarding/page.tsx` | CREATE | Workspace name form → calls create_workspace RPC |
| `package.json` | MODIFY | Add @supabase/ssr |

---

## Implementation Steps

### Step 1 — Install @supabase/ssr
```bash
npm install @supabase/ssr
```

### Step 2 — Apply Migration 005 (RPC)
Via Supabase MCP: `apply_migration` with the `create_workspace` function SQL.

### Step 3 — Update Supabase clients
**`src/lib/supabase.ts`** (browser):
```ts
import { createBrowserClient } from '@supabase/ssr';
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

**`src/lib/supabase-server.ts`** (server components + middleware):
```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: { getAll: () => cookieStore.getAll(), setAll: (...) => { ... } }
  });
};
```

### Step 4 — Middleware (route protection)
**`src/middleware.ts`**:
```ts
// Protect all (app) routes
// Public: /login /signup /auth/callback
// Protected: everything else → if no session → redirect /login
// After login: if no workspace_member row → redirect /onboarding
```

### Step 5 — Auth pages
**`src/app/(auth)/login/page.tsx`** — Client Component:
```tsx
'use client'
// email + password form
// supabase.auth.signInWithPassword()
// on success: check workspace membership → redirect / or /onboarding
// shows error inline on failure
```

**`src/app/(auth)/signup/page.tsx`** — Client Component:
```tsx
'use client'
// email + password + confirm password form
// supabase.auth.signUp({ emailRedirectTo: '/auth/callback' })
// on success: show "Check your email" message
```

### Step 6 — Auth callback
**`src/app/auth/callback/route.ts`** — Route Handler:
```ts
// GET /auth/callback?code=xxx
// supabase.auth.exchangeCodeForSession(code)
// redirect /onboarding (first time) or / (returning user)
```

### Step 7 — Onboarding page
**`src/app/(app)/onboarding/page.tsx`** — Client Component:
```tsx
'use client'
// workspace name input → auto-generate slug
// supabase.rpc('create_workspace', { p_name, p_slug })
// on success: redirect /
// on duplicate slug error: show inline error
```

### Step 8 — App layout (auth guard)
**`src/app/(app)/layout.tsx`** — Server Component:
```tsx
// createServerSupabaseClient()
// const { data: { user } } = await supabase.auth.getUser()
// if (!user) redirect('/login')
// check workspace_members for this user
// if no workspace → redirect('/onboarding')
// render <AppShell>{children}</AppShell>
```

### Step 9 — Move existing pages into (app)/
Move: page.tsx, alerts/, insights/, kpis/[id]/ → under (app)/
No logic changes needed — they inherit auth from (app)/layout.tsx.

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Email confirmation required → delays testing | Disable email confirm in Supabase Auth settings for dev (Authentication → Settings → "Confirm email" off) |
| RPC slug collision gives ugly error | Catch SQLSTATE P0001 in onboarding form, show "Name taken, try another" |
| `(app)/layout.tsx` server redirect creates infinite loop | Middleware and layout redirects must be consistent — middleware handles login, layout handles onboarding redirect |
| Moving pages to (app)/ breaks existing `generateStaticParams` | No impact — route groups are transparent to URL structure |
| `createBrowserClient` called in Server Components | Keep strict separation: `supabase.ts` for client, `supabase-server.ts` for server |

---

## Acceptance Criteria
- [ ] `/signup` creates a user in Supabase Auth
- [ ] Email confirmation redirects to `/onboarding`
- [ ] `/onboarding` creates workspace + admin membership in one RPC call
- [ ] `/login` with valid creds → redirects to `/` (with workspace) or `/onboarding` (no workspace)
- [ ] Visiting `/` without session → redirects to `/login`
- [ ] RLS verified: `SELECT * FROM workspaces` returns only the user's workspace
- [ ] KPI dashboard still works after route restructure

---

## SESSION_ID（供 /ccg:execute 使用）
- CODEX_SESSION: N/A
- GEMINI_SESSION: N/A
