import { GoalCard } from '@/components/goal/goal-card'
import { KPISection } from '@/components/kpi/kpi-section'
import type { DashboardData } from '@/lib/dashboard-data'

type Props = {
  data: DashboardData
}

export function TeamView({ data }: Props) {
  const { goals, kpis, totalGoals, completedGoals, atRiskGoals } = data

  const inProgressPct = totalGoals > 0
    ? Math.round((completedGoals / totalGoals) * 100)
    : 0

  const teamGoals = goals.filter(g => g.status !== 'cancelled').slice(0, 6)
  const teamKpis = kpis.filter(k => k.category === 'operations' || k.category === 'customer')

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Team Feed</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Progress across team achievements, evidence, and supporting signals.
        </p>
      </div>

      {/* Rollup stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Achievements',  value: totalGoals },
          { label: 'Completed',    value: completedGoals },
          { label: 'At Risk',      value: atRiskGoals },
        ].map(stat => (
          <div
            key={stat.label}
            className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</span>
            <span className="text-2xl font-semibold text-gray-900 dark:text-gray-50">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Team completion</span>
          <span className="font-medium text-gray-900 dark:text-gray-50">{inProgressPct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${inProgressPct}%` }}
          />
        </div>
      </div>

      {teamGoals.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Team Achievements
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teamGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
      )}

      {teamKpis.length > 0 && (
        <KPISection title="Team KPIs" kpis={teamKpis} />
      )}
    </div>
  )
}
