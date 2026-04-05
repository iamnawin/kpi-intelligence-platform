import { UserCircle2, Trophy, Lock, Shield, Star, ChevronRight } from "lucide-react"
import Link from "next/link"
import { fetchProofProfileData } from "@/lib/proof-data"
import { getSession } from "@/lib/auth"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { TrustBadge } from "@/components/goal/trust-badge"
import { GoalStatusBadge } from "@/components/goal/goal-status-badge"
import { AchievementRecordCard } from "@/components/profile/achievement-record-card"
import { ProfileEditForm } from "@/components/profile/profile-edit-form"

export default async function ProofProfilePage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const [session, proofData] = await Promise.all([
    getSession(),
    fetchProofProfileData(),
  ])
  const { achievements, lockedRecords, summary } = proofData

  // Fetch role_title + bio from workspace_members
  let roleTitle: string | null = null
  let bio: string | null = null
  if (session) {
    const supabase = await createServerSupabaseClient()
    const { data: memberRow } = await supabase
      .from('workspace_members')
      .select('role_title, bio')
      .eq('user_id', session.userId)
      .single()
    roleTitle = memberRow?.role_title ?? null
    bio       = memberRow?.bio ?? null
  }

  const displayName = session?.displayName ?? 'You'

  return (
    <div className="flex flex-col gap-8">

      {/* ── Profile card ── */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-900 to-violet-950/30 p-6">
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-violet-600/8 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-500/20 bg-gradient-to-br from-blue-600/20 to-violet-600/20">
            <UserCircle2 className="h-7 w-7 text-violet-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-50">{displayName}</h1>
            {roleTitle && (
              <p className="text-sm font-medium text-blue-400">{roleTitle}</p>
            )}
            <p className="text-sm text-gray-500">{session?.email ?? ''}</p>
          </div>
          {/* Trust score ring */}
          <div className="shrink-0 text-center">
            <p className="text-3xl font-bold text-violet-400">{summary.trustScore}</p>
            <p className="text-xs text-gray-600">Trust Score</p>
          </div>
        </div>

        {bio && (
          <p className="relative mt-3 text-sm leading-relaxed text-gray-400">{bio}</p>
        )}

        <div className="relative mt-3 flex items-center justify-between">
          <ProfileEditForm currentRoleTitle={roleTitle} currentBio={bio} />
        </div>

        {/* Trust bar */}
        <div className="relative mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs text-gray-600">Proof Strength</p>
            <p className="text-xs text-gray-500">{summary.trustScore} / 100</p>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-800">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
              style={{ width: `${summary.trustScore}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-5">
        <h2 className="text-sm font-semibold text-white">What this page is for</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-400">
          This page is the proof output of the app. Achievements start in the Achievements area, gain trust
          through evidence and review, and then show up here as stronger records. Locked proof is the
          portable version you can share outside the workspace.
        </p>
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total",     value: summary.totalAchievements, color: "text-gray-100",    accent: "border-gray-800 bg-gray-900" },
          { label: "Completed", value: summary.completedAchievements, color: "text-emerald-400", accent: "border-emerald-500/20 bg-emerald-500/5" },
          { label: "Verified",  value: summary.verifiedAchievements, color: "text-blue-400",    accent: "border-blue-500/20 bg-blue-500/5" },
          { label: "Locked",    value: summary.lockedProofCount, color: "text-purple-400", accent: "border-purple-500/20 bg-purple-500/5" },
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
            Start in Achievements. As records gain evidence and move through review, this page becomes your
            proof summary and export surface.
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
        <>
          {/* ── Locked Proof Records ── */}
          {lockedRecords.length > 0 && (
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-purple-400" />
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Locked Proof Records
                </h2>
                <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs text-purple-400">
                  {lockedRecords.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {lockedRecords.map(record => (
                  <AchievementRecordCard key={record.id} record={record} appUrl={appUrl} />
                ))}
              </div>
            </section>
          )}

          {/* ── In Progress / Other Achievements ── */}
          {summary.activeAchievements.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                In Progress
              </h2>

              <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
                <div className="divide-y divide-gray-800/80">
                  {summary.activeAchievements.map(a => (
                    <Link
                      key={a.id}
                      href={`/achievements/${a.id}`}
                      className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-800/40"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-200 group-hover:text-white">
                          {a.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <GoalStatusBadge status={a.status} />
                          {a.end_date && (
                            <span className="text-xs text-gray-600">{a.end_date}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <TrustBadge level={a.trust_level} />
                        {a.trust_level === 'system_verified' && (
                          <Shield className="h-4 w-4 text-emerald-400" />
                        )}
                        {a.trust_level === 'reviewer_approved' && (
                          <Star className="h-4 w-4 text-amber-400" />
                        )}
                        <ChevronRight className="h-4 w-4 text-gray-700 group-hover:text-gray-500" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {summary.verifiedAchievements === 0 && (
                <p className="text-center text-xs text-gray-600">
                  None of your achievements are manager-approved yet.{' '}
                  <Link href="/achievements" className="text-blue-500 hover:underline">
                    Submit one for review.
                  </Link>
                </p>
              )}
            </section>
          )}
        </>
      )}
    </div>
  )
}
