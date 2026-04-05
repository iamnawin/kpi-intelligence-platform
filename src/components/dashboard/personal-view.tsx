import { GoalCard } from '@/components/goal/goal-card'
import { KPICard } from '@/components/kpi/kpi-card'
import type { DashboardData } from '@/lib/dashboard-data'
import { proofPathRoutes } from '@/lib/proofpath-routes'

type Props = {
  data: DashboardData
  displayName: string
}

export function PersonalView({ data, displayName }: Props) {
  const { goals, kpis } = data

  const myGoals = goals.filter(g => g.status === 'in_progress' || g.status === 'at_risk')
  const myKpis = kpis.slice(0, 4)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
          Good to see you, {displayName}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Here&apos;s what&apos;s on your plate today.
        </p>
      </div>

      {/* My Achievements */}
      {myGoals.length > 0 ? (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            My Active Achievements
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myGoals.slice(0, 6).map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 py-10 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">No active achievements assigned to you.</p>
          <a href={proofPathRoutes.newAchievement} className="mt-2 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400">
            Create your first achievement →
          </a>
        </div>
      )}

      {/* My KPIs */}
      {myKpis.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            KPI Snapshot
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {myKpis.map(kpi => (
              <KPICard key={kpi.id} kpi={kpi} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
