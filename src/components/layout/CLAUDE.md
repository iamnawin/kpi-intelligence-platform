[Root](../../../CLAUDE.md) > [src/components](../) > **layout**

# Module: Layout Components

The application shell — sidebar navigation, outer layout wrapper, and filter bar.
These are the persistent UI chrome that wraps all authenticated app routes.

---

## Module Responsibility

- Provide the fixed sidebar with navigation items for all primary ProofPath routes
- Wrap app content in a full-height flex layout with overflow scrolling
- Render workspace name and user identity in the sidebar

---

## Component Inventory

### `AppShell` (`app-shell.tsx`)

Outermost layout wrapper used by `src/app/(app)/layout.tsx`.

- Props: `{ children: ReactNode; workspaceName?: string | null; userEmail?: string; displayName?: string }`
- Renders: `<aside>` Sidebar + `<main>` content area
- Content area: `max-w-6xl mx-auto px-6 py-8` inside `overflow-y-auto`
- Background: `bg-gray-950` (root) — enforces dark theme base

---

### `Sidebar` (`sidebar.tsx`)

Client component (`'use client'`) — uses `usePathname()` for active state detection.

- Props: `{ workspaceName: string | null; userEmail: string; displayName: string }`
- Width: `w-[220px]` fixed, `h-screen`
- Background: `bg-gray-900/50 backdrop-blur-sm` with right border

**Navigation groups:**

| Group | Items |
|-------|-------|
| Overview | Proof Feed (`/`), Achievements (`/achievements`), Proof Profile (`/profile`) |
| Analytics | Alerts (`/alerts`), AI Insights (`/insights`) |
| Settings | Connections (`/connections`) |

Active detection: exact match for `/`, prefix match for all others.
Active style: `bg-blue-600/15 text-blue-400`

**Logo:** "P" in gradient square (`from-blue-500 to-violet-600`) + "ProofPath" text
**Workspace:** Building2 icon + workspace name (if set)
**User footer:** Initials avatar + display name + email

---

### `FilterBar` (`filter-bar.tsx`)

Filter controls for list views. Used by goals/achievements list.

---

## Route Map (Sidebar Nav)

```
/              -> Proof Feed (dashboard)
/achievements  -> Achievement list
/profile       -> Proof Profile
/alerts        -> Alerts (legacy KPI)
/insights      -> AI Insights (legacy)
/connections   -> Tool connections
```

---

## Tests

No tests exist for layout components. The Sidebar uses `usePathname()` which requires
a Next.js router context in tests.

---

## Known Gaps / Next Steps

- `/alerts` and `/insights` are legacy KPI routes — navigation items should eventually be removed or repurposed for ProofPath analytics
- No mobile sidebar / responsive navigation exists
- The `FilterBar` component usage is not yet integrated into the achievements list page

---

## Related Files

- `src/app/(app)/layout.tsx` — instantiates `AppShell` with auth context
- `src/lib/utils.ts` — `cn()` utility used by Sidebar for conditional class merging
