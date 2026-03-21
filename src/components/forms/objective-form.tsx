'use client'

import type { ObjectiveWithKRs } from '@/lib/objective-data'
import type { GoalType } from '@/lib/goal-data'

type ObjectiveFormProps = {
  mode: 'create' | 'edit'
  objective?: ObjectiveWithKRs
  action: (formData: FormData) => Promise<void>
}

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'at_risk',     label: 'At Risk' },
  { value: 'completed',   label: 'Completed' },
  { value: 'cancelled',   label: 'Cancelled' },
]

const GOAL_TYPE_OPTIONS: { value: GoalType; label: string }[] = [
  { value: 'strategic',   label: 'Strategic' },
  { value: 'operational', label: 'Operational' },
  { value: 'team',        label: 'Team' },
  { value: 'personal',    label: 'Personal' },
  { value: 'standard',    label: 'Standard' },
]

const PERIOD_PRESETS = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'H1 2026', 'H2 2026', 'FY2026']

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500'
const labelCls = 'mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'

export function ObjectiveForm({ mode, objective, action }: ObjectiveFormProps) {
  const cancelHref = mode === 'edit' && objective ? `/objectives/${objective.id}` : '/objectives'

  return (
    <form action={action} className="flex max-w-xl flex-col gap-5">
      {/* Title */}
      <div>
        <label htmlFor="title" className={labelCls}>
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={objective?.title ?? ''}
          placeholder="e.g. Dominate the APAC market"
          className={inputCls}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelCls}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={objective?.description ?? ''}
          placeholder="What does success look like?"
          className={inputCls}
        />
      </div>

      {/* Type + Period */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="goal_type" className={labelCls}>
            Type
          </label>
          <select
            id="goal_type"
            name="goal_type"
            defaultValue={objective?.goal_type ?? 'strategic'}
            className={inputCls}
          >
            {GOAL_TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="period" className={labelCls}>
            Period
          </label>
          <input
            id="period"
            name="period"
            type="text"
            list="period-presets"
            defaultValue={objective?.period ?? ''}
            placeholder="Q1 2026"
            className={inputCls}
          />
          <datalist id="period-presets">
            {PERIOD_PRESETS.map(p => <option key={p} value={p} />)}
          </datalist>
        </div>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className={labelCls}>
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={objective?.status ?? 'not_started'}
          className={inputCls}
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {mode === 'create' ? 'Create Objective' : 'Save Changes'}
        </button>
        <a
          href={cancelHref}
          className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
