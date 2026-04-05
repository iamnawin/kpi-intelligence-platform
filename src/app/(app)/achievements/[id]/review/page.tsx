import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock } from 'lucide-react'
import { fetchAchievementById } from '@/lib/achievement-data'
import { getSession } from '@/lib/auth'
import { GoalStatusBadge } from '@/components/goal/goal-status-badge'
import { TrustBadge } from '@/components/goal/trust-badge'
import { TrustLadder } from '@/components/goal/trust-ladder'
import { EvidenceCard } from '@/components/goal/evidence-card'
import { ReviewPanel } from '@/components/review/review-panel'

type Props = { params: Promise<{ id: string }> }

export default async function AchievementReviewPage({ params }: Props) {
  const { id } = await params

  const [session, data] = await Promise.all([
    getSession(),
    fetchAchievementById(id),
  ])

  if (!data) notFound()

  // Only admins can access the review page
  if (!session || session.role !== 'admin') {
    redirect(`/achievements/${id}`)
  }

  const { goal, evidence, tasks } = data

  // Already locked — nothing to review
  const isLocked = goal.trust_level === 'locked_proof'

  return (
    <div>
      <Link
        href={`/achievements/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Achievement
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Manager Review
          </p>
          <h1 className="text-2xl font-semibold text-gray-50">{goal.title}</h1>
          {goal.description && (
            <p className="mt-1 text-sm text-gray-400">{goal.description}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <GoalStatusBadge status={goal.status} />
          <TrustBadge level={goal.trust_level} />
        </div>
      </div>

      {isLocked && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-purple-800/50 bg-purple-950/30 px-5 py-4">
          <Lock className="h-5 w-5 shrink-0 text-purple-400" />
          <p className="text-sm text-purple-300">
            This achievement is already locked as <strong>Locked Proof</strong>. No further review actions are available.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-6">

          {/* Progress */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-400">Progress</p>
              <p className="text-xl font-bold text-gray-50">{goal.progress_pct}%</p>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-800">
              <div
                className="h-1.5 rounded-full bg-blue-500 transition-all"
                style={{ width: `${goal.progress_pct}%` }}
              />
            </div>
            {(goal.start_date || goal.end_date) && (
              <p className="mt-2 text-xs text-gray-600">
                {goal.start_date ?? '—'} → {goal.end_date ?? 'ongoing'}
              </p>
            )}
          </div>

          {/* Evidence */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Evidence ({evidence.length})
            </h2>
            {evidence.length === 0 ? (
              <p className="text-sm text-gray-600">No evidence attached.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {evidence.map(record => (
                  <EvidenceCard key={record.id} record={record} />
                ))}
              </div>
            )}
          </div>

          {/* Tasks */}
          {tasks.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
                Tasks ({tasks.filter(t => t.status === 'done').length}/{tasks.length} done)
              </h2>
              <div className="rounded-xl border border-gray-800 bg-gray-900">
                <div className="divide-y divide-gray-800">
                  {tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-gray-200">{task.title}</span>
                      <span className={`text-xs ${task.status === 'done' ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
          <TrustLadder current={goal.trust_level} />
          {!isLocked && <ReviewPanel achievementId={goal.id} />}
        </div>
      </div>
    </div>
  )
}
