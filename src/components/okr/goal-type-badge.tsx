import type { GoalType } from '@/lib/goal-data'

const TYPE_CONFIG: Record<GoalType, { label: string; className: string }> = {
  standard:    { label: 'Standard',    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' },
  strategic:   { label: 'Strategic',   className: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400' },
  operational: { label: 'Operational', className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400' },
  personal:    { label: 'Personal',    className: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400' },
  team:        { label: 'Team',        className: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' },
}

export function GoalTypeBadge({ type }: { type: GoalType }) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.standard
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
