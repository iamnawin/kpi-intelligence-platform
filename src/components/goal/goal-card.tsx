import Link from "next/link"
import { ArrowUpRight, BarChart2, Lock, Users, Zap, Star, Target } from "lucide-react"
import { GoalStatusBadge } from "./goal-status-badge"
import { TrustBadge } from "./trust-badge"
import type { GoalWithCounts } from "@/lib/goal-data"

const STATUS_ACCENT: Record<string, string> = {
  in_progress: "bg-blue-500",
  at_risk:     "bg-red-500",
  completed:   "bg-emerald-500",
  not_started: "bg-gray-700",
  cancelled:   "bg-gray-800",
}

const TYPE_ICON: Record<string, React.ElementType> = {
  strategic:   Star,
  operational: Zap,
  personal:    Target,
  team:        Users,
  standard:    Target,
}

const TRUST_ICON: Record<string, { icon: React.ElementType; color: string }> = {
  locked_proof:      { icon: Lock, color: "text-purple-400" },
  system_verified:   { icon: Lock, color: "text-emerald-400" },
  reviewer_approved: { icon: Lock, color: "text-green-400" },
  imported:          { icon: Lock, color: "text-blue-400" },
  self_reported:     { icon: Lock, color: "text-yellow-400" },
  draft:             { icon: Lock, color: "text-gray-600" },
}

export function GoalCard({ goal }: { goal: GoalWithCounts }) {
  const accent = STATUS_ACCENT[goal.status] ?? "bg-gray-700"
  const TypeIcon = TYPE_ICON[goal.goal_type] ?? Target
  const trustConfig = TRUST_ICON[goal.trust_level]
  const TrustIcon = trustConfig?.icon ?? Lock

  const progressColor =
    goal.status === "at_risk"   ? "bg-red-500" :
    goal.status === "completed" ? "bg-emerald-500" :
    "bg-blue-500"

  return (
    <Link
      href={`/achievements/${goal.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-800/80 bg-gray-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-700 hover:shadow-xl hover:shadow-black/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
    >
      {/* Status accent bar */}
      <div className={`h-0.5 w-full ${accent}`} />

      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gray-800">
              <TypeIcon className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-100 group-hover:text-white">
              {goal.title}
            </p>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-gray-600 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <GoalStatusBadge status={goal.status} />
          <TrustBadge level={goal.trust_level} />
        </div>

        {/* Progress */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-500">Progress</span>
            <span className={`text-[11px] font-bold ${
              goal.status === "at_risk"   ? "text-red-400" :
              goal.status === "completed" ? "text-emerald-400" :
              "text-gray-300"
            }`}>
              {goal.progress_pct}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
            <div
              className={`h-full rounded-full transition-all ${progressColor}`}
              style={{ width: `${goal.progress_pct}%` }}
            />
          </div>
        </div>

        {/* Footer meta */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {goal.kpi_count > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <BarChart2 className="h-3 w-3" />
                {goal.kpi_count} KPI{goal.kpi_count !== 1 ? 's' : ''}
              </span>
            )}
            {goal.task_count > 0 && (
              <span className="text-[11px] text-gray-500">
                {goal.task_done_count}/{goal.task_count} tasks
              </span>
            )}
          </div>
          <TrustIcon className={`h-3.5 w-3.5 ${trustConfig?.color ?? 'text-gray-600'}`} />
        </div>
      </div>
    </Link>
  )
}
