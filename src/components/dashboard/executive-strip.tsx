import type { DashboardData } from '@/lib/dashboard-data'

type Props = {
  data: DashboardData
}

export function ExecutiveStrip({ data }: Props) {
  const { totalGoals, completedGoals, atRiskGoals, verifiedAchievements, lockedProofCount } = data
  const inProgressGoals = data.goals.filter(g => g.status === 'in_progress').length

  const stats = [
    { label: 'Total Achievements', value: totalGoals },
    { label: 'In Progress',     value: inProgressGoals },
    { label: 'Completed',       value: completedGoals },
    { label: 'Verified',        value: verifiedAchievements },
    { label: 'Locked Proof',    value: lockedProofCount },
    { label: 'At Risk',         value: atRiskGoals,    danger: atRiskGoals > 0 },
  ]

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-400">
        ProofPath Executive Summary
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map(stat => (
          <div key={stat.label} className="flex flex-col gap-0.5">
            <span className={`text-xl font-bold ${
              stat.danger ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-50'
            }`}>
              {stat.value}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
