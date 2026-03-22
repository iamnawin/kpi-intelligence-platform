import { UserCircle2, Trophy, Lock, Shield } from "lucide-react"
import { fetchWorkspaceGoals } from "@/lib/goal-data"
import { TrustBadge } from "@/components/goal/trust-badge"
import { GoalStatusBadge } from "@/components/goal/goal-status-badge"
import Link from "next/link"

export default async function ProofProfilePage() {
  const achievements = await fetchWorkspaceGoals()

  const completed = achievements.filter(a => a.status === 'completed')
  const approved  = achievements.filter(a =>
    a.trust_level === 'reviewer_approved' ||
    a.trust_level === 'system_verified' ||
    a.trust_level === 'locked_proof'
  )

  // Simple trust score: average based on trust level weights
  const TRUST_WEIGHT: Record<string, number> = {
    draft: 0, self_reported: 20, imported: 40,
    reviewer_approved: 70, system_verified: 85, locked_proof: 100,
  }
  const trustScore = achievements.length === 0 ? 0 : Math.round(
    achievements.reduce((sum, a) => sum + (TRUST_WEIGHT[a.trust_level] ?? 0), 0) / achievements.length
  )

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20">
          <UserCircle2 className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-50">Proof Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your verified achievement record — ready to carry forward.
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total",       value: achievements.length, color: "text-gray-100",    accent: "border-gray-800 bg-gray-900" },
          { label: "Completed",   value: completed.length,    color: "text-emerald-400", accent: "border-emerald-500/20 bg-emerald-500/5" },
          { label: "Verified",    value: approved.length,     color: "text-blue-400",    accent: "border-blue-500/20 bg-blue-500/5" },
          { label: "Trust Score", value: `${trustScore}%`,    color: "text-violet-400",  accent: "border-violet-500/20 bg-violet-500/5" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.accent}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {achievements.length === 0 ? (
        /* ── Empty state ── */
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">
          <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-600/20 to-blue-600/20">
            <Trophy className="h-7 w-7 text-violet-400" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">No achievements yet</h2>
          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-gray-400">
            Start recording achievements to build your proof profile.
            Once manager-approved, they appear here as locked proof.
          </p>
          <Link
            href="/achievements/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <Trophy className="h-4 w-4" />
            Create first achievement
          </Link>
        </div>
      ) : (
        /* ── Achievement records ── */
        <div className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Achievement Records
          </h2>

          <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
            <div className="divide-y divide-gray-800/80">
              {achievements.map(a => (
                <Link
                  key={a.id}
                  href={`/achievements/${a.id}`}
                  className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-800/40"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-200 group-hover:text-white truncate">
                      {a.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <GoalStatusBadge status={a.status} />
                      {a.end_date && (
                        <span className="text-xs text-gray-600">{a.end_date}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <TrustBadge level={a.trust_level} />
                    {a.trust_level === 'locked_proof' && (
                      <Lock className="h-4 w-4 text-purple-400" />
                    )}
                    {a.trust_level === 'system_verified' && (
                      <Shield className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {approved.length === 0 && (
            <p className="text-center text-xs text-gray-600">
              None of your achievements are manager-approved yet.
              Ask your manager to review completed achievements to unlock portability.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
