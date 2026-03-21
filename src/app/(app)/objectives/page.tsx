import Link from 'next/link'
import { Target, Plus } from 'lucide-react'
import { fetchWorkspaceObjectives } from '@/lib/objective-data'
import { ObjectiveRow } from '@/components/okr/objective-row'
import { GoalTypeBadge } from '@/components/okr/goal-type-badge'

export default async function ObjectivesPage() {
  const objectives = await fetchWorkspaceObjectives()

  // Group by period
  const byPeriod: Record<string, typeof objectives> = {}
  const noPeriod: typeof objectives = []

  for (const obj of objectives) {
    if (obj.period) {
      ;(byPeriod[obj.period] ??= []).push(obj)
    } else {
      noPeriod.push(obj)
    }
  }

  const periods = Object.keys(byPeriod).sort().reverse()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Objectives</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            High-level goals structured as OKRs with measurable Key Results.
          </p>
        </div>
        <Link
          href="/objectives/new"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          New Objective
        </Link>
      </div>

      {objectives.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
          <Target className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No objectives yet</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Create an objective, then link goals as Key Results.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {periods.map(period => (
            <section key={period}>
              <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {period}
                <span className="font-normal normal-case text-gray-300 dark:text-gray-600">
                  — {byPeriod[period].length} objective{byPeriod[period].length !== 1 ? 's' : ''}
                </span>
              </h2>
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {byPeriod[period].map(obj => (
                    <ObjectiveRow key={obj.id} objective={obj} />
                  ))}
                </div>
              </div>
            </section>
          ))}

          {noPeriod.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                No Period
              </h2>
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {noPeriod.map(obj => (
                    <ObjectiveRow key={obj.id} objective={obj} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
