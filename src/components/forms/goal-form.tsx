'use client'

import { useState } from 'react'
import type { GoalWithCounts, GoalStatus, GoalType, KRType } from '@/lib/goal-data'
import { proofPathRoutes } from '@/lib/proofpath-routes'

type GoalFormProps = {
  mode: 'create' | 'edit'
  goal?: GoalWithCounts
  action: (formData: FormData) => Promise<void>
  objectiveId?: string
}

const STATUS_OPTIONS: { value: GoalStatus; label: string }[] = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'at_risk',     label: 'At Risk' },
  { value: 'completed',   label: 'Completed' },
  { value: 'cancelled',   label: 'Cancelled' },
]

const GOAL_TYPE_OPTIONS: { value: GoalType; label: string }[] = [
  { value: 'standard',    label: 'Standard' },
  { value: 'strategic',   label: 'Strategic' },
  { value: 'operational', label: 'Operational' },
  { value: 'team',        label: 'Team' },
  { value: 'personal',    label: 'Personal' },
]

const KR_TYPE_OPTIONS: { value: KRType; label: string; hint: string }[] = [
  { value: 'metric',    label: 'Metric',    hint: 'Numeric target (e.g. revenue, users)' },
  { value: 'milestone', label: 'Milestone', hint: 'Binary done / not done' },
  { value: 'activity',  label: 'Activity',  hint: 'Effort-based (e.g. run 3 sprints)' },
]

const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500'
const labelCls = 'mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'

export function GoalForm({ mode, goal, action, objectiveId }: GoalFormProps) {
  const cancelHref =
    mode === 'edit' && goal
      ? proofPathRoutes.achievementDetail(goal.id)
      : proofPathRoutes.achievements

  const defaultObjId = goal?.objective_id ?? objectiveId ?? ''
  const defaultGoalType = goal?.goal_type ?? (objectiveId ? 'strategic' : 'standard')
  const defaultKRType = goal?.kr_type ?? ''

  const [isKR, setIsKR] = useState(!!defaultObjId)
  const [krType, setKrType] = useState<string>(defaultKRType)

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
          defaultValue={goal?.title ?? ''}
          placeholder="e.g. Grow MRR to $300k"
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
          defaultValue={goal?.description ?? ''}
          placeholder="Optional context or outcome..."
          className={inputCls}
        />
      </div>

      {/* Goal Type */}
      <div>
        <label htmlFor="goal_type" className={labelCls}>
          Goal Type
        </label>
        <select
          id="goal_type"
          name="goal_type"
          defaultValue={defaultGoalType}
          className={inputCls}
        >
          {GOAL_TYPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Objective / Key Result section */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={isKR}
            onChange={e => setIsKR(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
          />
          Link to an Objective (make this a Key Result)
        </label>

        {isKR && (
          <div className="mt-4 flex flex-col gap-4">
            {/* Objective ID */}
            <div>
              <label htmlFor="objective_id" className={labelCls}>
                Objective ID
              </label>
              <input
                id="objective_id"
                name="objective_id"
                type="text"
                defaultValue={defaultObjId}
                placeholder="Paste objective UUID"
                className={inputCls}
              />
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Copy the ID from the objective&apos;s detail page URL.
              </p>
            </div>

            {/* KR Type */}
            <div>
              <label htmlFor="kr_type" className={labelCls}>
                Key Result Type
              </label>
              <select
                id="kr_type"
                name="kr_type"
                value={krType}
                onChange={e => setKrType(e.target.value)}
                className={inputCls}
              >
                <option value="">— select type —</option>
                {KR_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label} — {opt.hint}</option>
                ))}
              </select>
            </div>

            {/* Metric fields */}
            {krType === 'metric' && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="target_value" className={labelCls}>Target</label>
                  <input
                    id="target_value"
                    name="target_value"
                    type="number"
                    defaultValue={goal?.target_value ?? ''}
                    placeholder="100"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="current_value" className={labelCls}>Current</label>
                  <input
                    id="current_value"
                    name="current_value"
                    type="number"
                    defaultValue={goal?.current_value ?? ''}
                    placeholder="42"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="unit" className={labelCls}>Unit</label>
                  <input
                    id="unit"
                    name="unit"
                    type="text"
                    defaultValue={goal?.unit ?? ''}
                    placeholder="%"
                    className={inputCls}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status + Progress */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className={labelCls}>
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={goal?.status ?? 'not_started'}
            className={inputCls}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="progress_pct" className={labelCls}>
            Progress (%)
          </label>
          <input
            id="progress_pct"
            name="progress_pct"
            type="number"
            min={0}
            max={100}
            defaultValue={goal?.progress_pct ?? 0}
            className={inputCls}
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className={labelCls}>
            Start Date
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={goal?.start_date ?? ''}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="end_date" className={labelCls}>
            End Date
          </label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            defaultValue={goal?.end_date ?? ''}
            className={inputCls}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {mode === 'create' ? 'Create Achievement' : 'Save Achievement'}
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
