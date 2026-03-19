import type { GoalStatus } from "@/lib/goal-data"

const STATUS_CONFIG: Record<GoalStatus, { label: string; className: string }> = {
  not_started: { label: 'Not Started', className: 'bg-gray-100 text-gray-500' },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  at_risk:     { label: 'At Risk',     className: 'bg-red-100 text-red-700' },
  completed:   { label: 'Completed',   className: 'bg-green-100 text-green-700' },
  cancelled:   { label: 'Cancelled',   className: 'bg-gray-100 text-gray-400' },
}

export function GoalStatusBadge({ status }: { status: GoalStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_started
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
