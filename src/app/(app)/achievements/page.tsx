import Link from "next/link"
import { Trophy, Plus, Upload, ArrowRight, TrendingUp, Shield, CheckCircle2 } from "lucide-react"
import { fetchWorkspaceAchievements, type AchievementWithCounts } from "@/lib/achievement-data"
import { GoalRow } from "@/components/goal/goal-row"

export default async function AchievementsPage() {
  const achievements = await fetchWorkspaceAchievements()

  const idSet = new Set(achievements.map(a => a.id))
  const topLevel: AchievementWithCounts[] = []
  const byParent: Record<string, AchievementWithCounts[]> = {}

  for (const a of achievements) {
    const parentInSet = a.parent_goal_id && idSet.has(a.parent_goal_id)
    if (parentInSet) {
      ;(byParent[a.parent_goal_id!] ??= []).push(a)
    } else {
      topLevel.push(a)
    }
  }

  const STATUS_ORDER: Record<string, number> = {
    in_progress: 0, at_risk: 1, not_started: 2, completed: 3, cancelled: 4,
  }
  const sortByStatus = (a: AchievementWithCounts, b: AchievementWithCounts) =>
    (STATUS_ORDER[a.status] ?? 5) - (STATUS_ORDER[b.status] ?? 5)

  topLevel.sort(sortByStatus)
  for (const children of Object.values(byParent)) children.sort(sortByStatus)

  const inProgress = achievements.filter(a => a.status === 'in_progress').length
  const atRisk = achievements.filter(a => a.status === 'at_risk').length
  const completed = achievements.filter(a => a.status === 'completed').length

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-50">Achievements</h1>
          <p className="mt-1 text-sm text-gray-500">
            Capture outcomes first, then strengthen them with evidence until they become trusted proof.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/achievements/import"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-gray-600 hover:bg-gray-800/60 hover:text-white"
          >
            <Upload className="h-3.5 w-3.5" />
            Import
          </Link>
          <Link
            href="/achievements/new"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            <Plus className="h-3.5 w-3.5" />
            New Achievement
          </Link>
        </div>
      </div>

      {achievements.length === 0 ? (
        <div className="flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">
            <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />
            <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/20 to-violet-600/20">
              <Trophy className="h-7 w-7 text-blue-400" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Record your first achievement</h2>
            <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-gray-400">
              Start with the outcome that mattered. Connections, imports, and reviews support this record later,
              but the achievement itself is the center of the workflow.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/achievements/new"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                <Plus className="h-4 w-4" />
                Create first achievement
              </Link>
              <Link
                href="/achievements/import"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:border-gray-600 hover:bg-gray-800/60"
              >
                <Upload className="h-4 w-4" />
                Import from CSV
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: TrendingUp,
                color: "text-blue-400",
                bg: "bg-blue-500/10 border-blue-500/20",
                title: "1. Capture the outcome",
                desc: "Create the record for what you delivered, led, improved, or contributed to.",
              },
              {
                icon: Shield,
                color: "text-violet-400",
                bg: "bg-violet-500/10 border-violet-500/20",
                title: "2. Attach evidence",
                desc: "Add notes, links, exports, and connected-tool signals to raise trust in the record.",
              },
              {
                icon: CheckCircle2,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10 border-emerald-500/20",
                title: "3. Lock proof",
                desc: "After review, the strongest records can become portable proof on your profile.",
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

          <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-5">
            <h3 className="text-sm font-semibold text-white">How this page fits the product</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              Achievements are the core unit in ProofPath. Connections and imports supply supporting signals,
              but this is the place where work becomes a trusted contribution record.
            </p>
          </div>

          <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
            <span>Or review the proof output</span>
            <Link href="/profile" className="flex items-center gap-1 font-medium text-blue-500 hover:text-blue-400">
              Proof Profile <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "In Progress", value: inProgress, color: "text-blue-400", accent: "bg-blue-500/10 border-blue-500/20" },
              { label: "At Risk", value: atRisk, color: "text-red-400", accent: "bg-red-500/10 border-red-500/20" },
              { label: "Completed", value: completed, color: "text-emerald-400", accent: "bg-emerald-500/10 border-emerald-500/20" },
            ].map(s => (
              <div key={s.label} className={`rounded-xl border p-3 ${s.accent}`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-5">
            <h2 className="text-sm font-semibold text-white">Workflow</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              Keep achievements here, add evidence over time, and use the review flow to move strong records
              into locked proof. Connections support this workflow; they do not replace it.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
            <div className="divide-y divide-gray-800/80">
              {topLevel.map(a => (
                <div key={a.id}>
                  <GoalRow goal={a} depth={0} />
                  {byParent[a.id]?.map(sub => (
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
