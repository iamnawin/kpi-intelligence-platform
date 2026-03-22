import Link from "next/link"
import { Target, Plus, Upload, ArrowRight, TrendingUp, Shield, CheckCircle2 } from "lucide-react"
import { fetchWorkspaceGoals } from "@/lib/goal-data"
import { GoalRow } from "@/components/goal/goal-row"
import type { GoalWithCounts } from "@/lib/goal-data"

export default async function GoalsPage() {
  const goals = await fetchWorkspaceGoals()

  // Build hierarchy tree in one pass
  const goalSet = new Set(goals.map(g => g.id))
  const topLevel: GoalWithCounts[] = []
  const byParent: Record<string, GoalWithCounts[]> = {}

  for (const goal of goals) {
    const parentInSet = goal.parent_goal_id && goalSet.has(goal.parent_goal_id)
    if (parentInSet) {
      ;(byParent[goal.parent_goal_id!] ??= []).push(goal)
    } else {
      topLevel.push(goal)
    }
  }

  const STATUS_ORDER: Record<string, number> = {
    in_progress: 0, at_risk: 1, not_started: 2, completed: 3, cancelled: 4,
  }
  const sortByStatus = (a: GoalWithCounts, b: GoalWithCounts) =>
    (STATUS_ORDER[a.status] ?? 5) - (STATUS_ORDER[b.status] ?? 5)

  topLevel.sort(sortByStatus)
  for (const children of Object.values(byParent)) children.sort(sortByStatus)

  // Stats
  const inProgress  = goals.filter(g => g.status === 'in_progress').length
  const atRisk      = goals.filter(g => g.status === 'at_risk').length
  const completed   = goals.filter(g => g.status === 'completed').length

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-50">Goals</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track business outcomes with verifiable progress and evidence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/goals/import"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-gray-600 hover:bg-gray-800/60 hover:text-white"
          >
            <Upload className="h-3.5 w-3.5" />
            Import
          </Link>
          <Link
            href="/goals/new"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            <Plus className="h-3.5 w-3.5" />
            New Goal
          </Link>
        </div>
      </div>

      {goals.length === 0 ? (
        /* ── Beautiful empty state ── */
        <div className="flex flex-col gap-6">
          {/* Hero empty state */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />

            <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20">
              <Target className="h-7 w-7 text-blue-400" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Set your first goal</h2>
            <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-gray-400">
              Goals are the backbone of ProofPath. Each goal tracks progress, links to KPIs,
              and builds an evidence trail — so every outcome is provable.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/goals/new"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                <Plus className="h-4 w-4" />
                Create your first goal
              </Link>
              <Link
                href="/goals/import"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:border-gray-600 hover:bg-gray-800/60"
              >
                <Upload className="h-4 w-4" />
                Import from CSV
              </Link>
            </div>
          </div>

          {/* How it works */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: TrendingUp,
                color: "text-blue-400",
                bg: "bg-blue-500/10 border-blue-500/20",
                title: "Track Progress",
                desc: "Set a target, log progress, and watch your % tick up as the team delivers.",
              },
              {
                icon: Shield,
                color: "text-violet-400",
                bg: "bg-violet-500/10 border-violet-500/20",
                title: "Build Evidence",
                desc: "Attach reports, screenshots, and data exports. Each piece raises your trust level.",
              },
              {
                icon: CheckCircle2,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10 border-emerald-500/20",
                title: "Prove Impact",
                desc: "Once system-verified or locked, your outcomes become indisputable proof.",
              },
            ].map(card => (
              <div key={card.title} className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
                <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border ${card.bg}`}>
                  <card.icon className={`h-4.5 w-4.5 ${card.color}`} />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-white">{card.title}</h3>
                <p className="text-xs leading-relaxed text-gray-500">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
            <span>Or start with Objectives</span>
            <Link href="/objectives" className="flex items-center gap-1 font-medium text-blue-500 hover:text-blue-400">
              → Go to Objectives <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

      ) : (
        /* ── Goals list ── */
        <div className="flex flex-col gap-6">
          {/* Quick stats */}
          {goals.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "In Progress", value: inProgress, color: "text-blue-400", accent: "bg-blue-500/10 border-blue-500/20" },
                { label: "At Risk",     value: atRisk,     color: "text-red-400",  accent: "bg-red-500/10 border-red-500/20" },
                { label: "Completed",   value: completed,  color: "text-emerald-400", accent: "bg-emerald-500/10 border-emerald-500/20" },
              ].map(s => (
                <div key={s.label} className={`rounded-xl border p-3 ${s.accent}`}>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
            <div className="divide-y divide-gray-800/80">
              {topLevel.map(goal => (
                <div key={goal.id}>
                  <GoalRow goal={goal} depth={0} />
                  {byParent[goal.id]?.map(sub => (
                    <GoalRow key={sub.id} goal={sub} depth={1} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
