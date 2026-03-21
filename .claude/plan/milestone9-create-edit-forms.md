# 📋 Implementation Plan: M9 — Create/Edit Forms

## Task Type
- [x] Full-stack (Server Actions + Client Components)

---

## Enhanced Requirements

Allow authenticated workspace members to create and edit Goals, KPIs, and Tasks directly from the browser UI. Currently all data must be inserted manually in Supabase.

**Technical constraints:**
- Use Next.js 15 Server Actions (`'use server'`) for DB mutations
- Form UI components must be Client Components (`'use client'`)
- Reuse `createServerSupabaseClient` from `src/lib/supabase-server.ts`
- RLS enforces write restrictions: manager/executive/admin → goals & KPIs; all members → tasks
- After mutation: `revalidatePath()` refreshes Server Component data

---

## Technical Approach

**Pattern:** Dedicated form pages (not modals) — simplest, works without JS, no extra libraries.

```
/goals/new           → Create new goal
/goals/[id]/edit     → Edit existing goal
/goals/[id]          → "Add Task" inline form (toggled by button)
```

---

## Implementation Steps

### Step 1 — Server Actions: `src/app/actions/goal-actions.ts`

```ts
'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

async function getWorkspaceId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .limit(1)
    .single()
  return data?.workspace_id ?? null
}

export async function createGoal(formData: FormData): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const workspaceId = await getWorkspaceId()
  if (!workspaceId) throw new Error('No workspace found')

  const title = formData.get('title') as string
  const description = (formData.get('description') as string) || null
  const status = (formData.get('status') as string) || 'not_started'
  const progress_pct = Number(formData.get('progress_pct')) || 0
  const start_date = (formData.get('start_date') as string) || null
  const end_date = (formData.get('end_date') as string) || null

  if (!title?.trim()) throw new Error('Title is required')

  await supabase.from('goals').insert({
    workspace_id: workspaceId,
    title: title.trim(),
    description,
    status,
    progress_pct,
    start_date,
    end_date,
  })

  revalidatePath('/goals')
  redirect('/goals')
}

export async function updateGoal(id: string, formData: FormData): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const title = formData.get('title') as string
  const description = (formData.get('description') as string) || null
  const status = formData.get('status') as string
  const progress_pct = Number(formData.get('progress_pct')) || 0
  const start_date = (formData.get('start_date') as string) || null
  const end_date = (formData.get('end_date') as string) || null

  if (!title?.trim()) throw new Error('Title is required')

  await supabase.from('goals').update({
    title: title.trim(),
    description,
    status,
    progress_pct,
    start_date,
    end_date,
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  revalidatePath('/goals')
  revalidatePath(`/goals/${id}`)
  redirect(`/goals/${id}`)
}
```

### Step 2 — Server Actions: `src/app/actions/task-actions.ts`

```ts
'use server'
import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'

async function getWorkspaceId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .limit(1)
    .single()
  return data?.workspace_id ?? null
}

export async function createTask(goalId: string, formData: FormData): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const workspaceId = await getWorkspaceId()
  if (!workspaceId) throw new Error('No workspace found')

  const title = formData.get('title') as string
  const due_date = (formData.get('due_date') as string) || null

  if (!title?.trim()) throw new Error('Task title is required')

  await supabase.from('tasks').insert({
    workspace_id: workspaceId,
    goal_id: goalId,
    title: title.trim(),
    due_date,
    status: 'todo',
  })

  revalidatePath(`/goals/${goalId}`)
}
```

### Step 3 — Shared Goal Form: `src/components/forms/goal-form.tsx`

```tsx
'use client'
import { useActionState } from 'react'
import type { GoalWithCounts } from '@/lib/goal-data'

type GoalFormProps = {
  mode: 'create' | 'edit'
  goal?: GoalWithCounts
  action: (formData: FormData) => Promise<void>
}

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function GoalForm({ mode, goal, action }: GoalFormProps) {
  return (
    <form action={action} className="flex flex-col gap-5 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          defaultValue={goal?.title ?? ''}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="e.g. Grow MRR to $300k"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          defaultValue={goal?.description ?? ''}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          placeholder="Optional context or outcome..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            defaultValue={goal?.status ?? 'not_started'}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
          <input
            type="number"
            name="progress_pct"
            defaultValue={goal?.progress_pct ?? 0}
            min={0}
            max={100}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            name="start_date"
            defaultValue={goal?.start_date ?? ''}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            name="end_date"
            defaultValue={goal?.end_date ?? ''}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {mode === 'create' ? 'Create Goal' : 'Save Changes'}
        </button>
        <a
          href={mode === 'edit' && goal ? `/goals/${goal.id}` : '/goals'}
          className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
```

### Step 4 — New Goal Page: `src/app/(app)/goals/new/page.tsx`

```tsx
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { GoalForm } from "@/components/forms/goal-form"
import { createGoal } from "@/app/actions/goal-actions"

export default function NewGoalPage() {
  return (
    <div>
      <Link href="/goals" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" />
        Back to Goals
      </Link>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">New Goal</h1>
      <GoalForm mode="create" action={createGoal} />
    </div>
  )
}
```

### Step 5 — Edit Goal Page: `src/app/(app)/goals/[id]/edit/page.tsx`

```tsx
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { fetchGoalById } from "@/lib/goal-data"
import { GoalForm } from "@/components/forms/goal-form"
import { updateGoal } from "@/app/actions/goal-actions"

type Props = { params: Promise<{ id: string }> }

export default async function EditGoalPage({ params }: Props) {
  const { id } = await params
  const data = await fetchGoalById(id)
  if (!data) notFound()

  const boundUpdateGoal = updateGoal.bind(null, id)

  return (
    <div>
      <Link href={`/goals/${id}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" />
        Back to Goal
      </Link>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Edit Goal</h1>
      <GoalForm mode="edit" goal={data.goal} action={boundUpdateGoal} />
    </div>
  )
}
```

### Step 6 — Inline Task Form: `src/components/forms/task-form.tsx`

```tsx
'use client'
import { useState } from 'react'
import { Plus, X } from 'lucide-react'

type TaskFormProps = {
  action: (formData: FormData) => Promise<void>
}

export function TaskForm({ action }: TaskFormProps) {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    await action(formData)
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
      >
        <Plus className="h-4 w-4" />
        Add Task
      </button>
    )
  }

  return (
    <form action={handleSubmit} className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center gap-3 mb-3">
        <input
          name="title"
          required
          autoFocus
          placeholder="Task title..."
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <input
          type="date"
          name="due_date"
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
          Add
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  )
}
```

### Step 7 — Update `src/app/(app)/goals/page.tsx`

Add "New Goal" button in header:
```tsx
import Link from "next/link"
import { Plus, Target } from "lucide-react"
// In the header div, add:
<Link href="/goals/new" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
  <Plus className="h-4 w-4" />
  New Goal
</Link>
```

### Step 8 — Update `src/app/(app)/goals/[id]/page.tsx`

Add "Edit" button + TaskForm:
```tsx
import Link from "next/link"
import { Pencil } from "lucide-react"
import { TaskForm } from "@/components/forms/task-form"
import { createTask } from "@/app/actions/task-actions"

// In header, add Edit button:
<Link href={`/goals/${goal.id}/edit`} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
  <Pencil className="h-3.5 w-3.5" />
  Edit
</Link>

// After tasks list (before closing div), add:
<TaskForm action={createTask.bind(null, goal.id)} />
```

---

## Key Files

| File | Operation | Description |
|------|-----------|-------------|
| `src/app/actions/goal-actions.ts` | CREATE | createGoal, updateGoal Server Actions |
| `src/app/actions/task-actions.ts` | CREATE | createTask Server Action |
| `src/components/forms/goal-form.tsx` | CREATE | Client form: create + edit modes |
| `src/components/forms/task-form.tsx` | CREATE | Client inline task form |
| `src/app/(app)/goals/new/page.tsx` | CREATE | New goal page |
| `src/app/(app)/goals/[id]/edit/page.tsx` | CREATE | Edit goal page |
| `src/app/(app)/goals/page.tsx` | MODIFY | Add "New Goal" button |
| `src/app/(app)/goals/[id]/page.tsx` | MODIFY | Add "Edit" button + TaskForm |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| RLS blocks writes for employee role | Server action returns error state; show "permission denied" message |
| Form submission with no workspace | `getWorkspaceId()` returns null → throw error, show message |
| `revalidatePath` + `redirect` order | Call `revalidatePath` before `redirect` — this is the correct Next.js 15 pattern |
| Server Action loses type safety on `formData` | Explicit `formData.get()` with type coercion + required field validation |
| `bind(null, id)` on Server Action in Server Component | Valid pattern in Next.js 15 App Router |

---

## Acceptance Criteria

- [ ] `/goals/new` renders form; submitting creates goal and redirects to `/goals`
- [ ] `/goals/[id]/edit` renders pre-filled form; submitting updates goal and redirects to `/goals/[id]`
- [ ] "Add Task" button on goal detail shows inline form; submitting adds task to the list
- [ ] Required field (title) prevents submission if blank
- [ ] TypeScript `npm run typecheck` passes with 0 errors
- [ ] No mock data fallback needed — all writes go directly to Supabase

---

## SESSION_ID (for /ccg:execute)
- CODEX_SESSION: N/A
- GEMINI_SESSION: N/A
