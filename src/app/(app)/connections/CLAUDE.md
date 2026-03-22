[Root](../../../../CLAUDE.md) > [src/app/(app)](../) > **connections**

# Module: Connections

Tool integration hub. Displays OAuth connection status for GitHub, Jira, Linear, and Asana.
Connected tools automatically surface work items as Evidence attached to achievements.

---

## Module Responsibility

- Show connection status for all supported providers (GitHub, Jira, Linear, Asana)
- Initiate OAuth authorization flow via `/api/integrations/[provider]/authorize`
- Display `synced_at` timestamp per connected provider
- Surface success/error feedback via `searchParams` (passed back from OAuth callback)

---

## Key Files

| File | Entry | Responsibility |
|------|-------|----------------|
| `page.tsx` | line 34 `ConnectionsPage` | Async Server Component — reads `workspace_integrations` table |

---

## Supported Providers

| Provider | OAuth URL | Required Env Var |
|----------|-----------|-----------------|
| GitHub | `github.com/login/oauth/authorize` | `GITHUB_CLIENT_ID` |
| Jira | `auth.atlassian.com/authorize` | `JIRA_CLIENT_ID` |
| Linear | `linear.app/oauth/authorize` | `LINEAR_CLIENT_ID` |
| Asana | `app.asana.com/-/oauth_authorize` | `ASANA_CLIENT_ID` |

---

## Data Flow

```
ConnectionsPage
  └── Supabase: workspace_members -> workspace_id
  └── Supabase: workspace_integrations (provider, synced_at)
  └── Renders: IntegrationCard per PROVIDERS array
        └── IntegrationCard links to GET /api/integrations/[provider]/authorize
```

---

## OAuth Flow (for each provider)

```
1. User clicks "Connect" on IntegrationCard
2. GET /api/integrations/[provider]/authorize
   └── Validates provider, resolves clientId from env
   └── Builds OAuth URL with state (userId + provider base64-encoded)
   └── Redirects to provider OAuth consent screen
3. Provider redirects to GET /api/integrations/[provider]/callback
   └── Exchanges code for access_token
   └── Upserts workspace_integrations row
   └── Redirects to /connections?connected=[provider]
4. ConnectionsPage re-renders with success banner
```

---

## Sync Flow

After a provider is connected, sync is triggered by:
- `POST /api/integrations/[provider]/sync`
- 5-minute cooldown enforced (`SYNC_COOLDOWN_MS = 5 * 60 * 1000`)
- Fetches external tasks from provider API
- Upserts into `tasks` table with `source` and `external_id` (dedup key)
- Updates `workspace_integrations.synced_at`

The sync endpoint lives at `src/app/api/integrations/[provider]/sync/route.ts`.

---

## Components Used

| Component | Source |
|-----------|--------|
| `IntegrationCard` | `src/components/integrations/integration-card.tsx` |

---

## Environment Variables Required

```
NEXT_PUBLIC_APP_URL           # Used to construct OAuth redirect_uri
GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET
JIRA_CLIENT_ID / JIRA_CLIENT_SECRET
LINEAR_CLIENT_ID / LINEAR_CLIENT_SECRET
ASANA_CLIENT_ID / ASANA_CLIENT_SECRET
```

If a `CLIENT_ID` is not set, the authorize route returns HTTP 503
(`integration not configured`) rather than silently failing.

---

## Integration Data Layer

Provider-specific fetch functions live in `src/lib/integrations/`:

| File | Exported function | Provider |
|------|------------------|---------|
| `github.ts` | `fetchGitHubIssues(token, settings)` | GitHub |
| `jira.ts` | `fetchJiraIssues(token, settings)` | Jira |
| `linear.ts` | `fetchLinearIssues(token, settings)` | Linear |
| `asana.ts` | `fetchAsanaTasks(token, settings)` | Asana |

All return `ExternalTask[]` as defined in `src/lib/integrations/types.ts`.

---

## Known Gaps / Next Steps

- No UI to manually trigger sync — `POST /sync` is only callable via API; a "Sync Now" button is needed in `IntegrationCard`
- `IntegrationSettings` type in `integrations/types.ts` has provider-specific config fields (projectKey, teamId, etc.) — the UI to configure these settings does not exist yet
- No tests exist for OAuth routes or the Connections page
- All 4 integrations are scaffolded; per the architecture doc, only GitHub needs to be fully validated first (Phase 6 priority)

---

## Related Files

- `src/components/integrations/integration-card.tsx`
- `src/app/api/integrations/[provider]/authorize/route.ts`
- `src/app/api/integrations/[provider]/callback/route.ts`
- `src/app/api/integrations/[provider]/sync/route.ts`
- `src/lib/integrations/types.ts`
- `src/lib/integrations/github.ts`, `jira.ts`, `linear.ts`, `asana.ts`
- `supabase/migrations/007_integrations.sql`
