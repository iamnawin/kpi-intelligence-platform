import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, CheckSquare, FileText, ClipboardCheck, Send } from "lucide-react"
import { fetchAchievementById, type TrustLevel } from "@/lib/achievement-data"
import { getSession } from "@/lib/auth"
import { GoalStatusBadge } from "@/components/goal/goal-status-badge"
import { TrustBadge } from "@/components/goal/trust-badge"
import { TrustLadder } from "@/components/goal/trust-ladder"
import { EvidenceCard } from "@/components/goal/evidence-card"
import { EvidenceDeleteButton } from "@/components/goal/evidence-delete-button"
import { EvidenceForm } from "@/components/forms/evidence-form"
import { TaskRow } from "@/components/goal/task-row"
import { TaskForm } from "@/components/forms/task-form"
import { createTask } from "@/app/actions/task-actions"
import { createEvidence } from "@/app/actions/evidence-actions"
import { submitForReview } from "@/app/actions/review-actions"
import { fetchConnectedProviders } from "@/app/actions/integration-actions"
import { EvidenceImportPanel } from "@/components/goal/evidence-import-panel"

type Props = { params: Promise<{ id: string }> }

export default async function AchievementDetailPage({ params }: Props) {
  const { id } = await params
  const [data, session] = await Promise.all([fetchAchievementById(id), getSession()])
  if (!data) notFound()

  const { goal, evidence, tasks } = data

  const PROGRESS_COLOR =
    goal.status === "at_risk"   ? "bg-red-500" :
    goal.status === "completed" ? "bg-emerald-500" :
    "bg-blue-500"

  const boundCreateEvidence = createEvidence.bind(null, goal.id)
  const boundSubmitForReview = submitForReview.bind(null, goal.id)
  const connectedProviders = session ? await fetchConnectedProviders(session.workspaceId) : []

  const isAdmin = session?.role === 'admin'
  const canSubmitForReview = (['self_reported', 'imported'] as TrustLevel[]).includes(goal.trust_level)
  const isPendingReview = goal.trust_level === 'reviewer_approved'
  const isLocked = goal.trust_level === 'locked_proof'

  return (
    <div>
      <Link
        href="/achievements"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Achievements
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-50">{goal.title}</h1>
          {goal.description && (
            <p className="mt-1 text-sm text-gray-400">{goal.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex flex-col items-end gap-2">
            <GoalStatusBadge status={goal.status} />
            <TrustBadge level={goal.trust_level} />
          </div>
          {/* Admin: Review button */}
          {isAdmin && !isLocked && (
            <Link
              href={`/achievements/${goal.id}/review`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-700 bg-violet-900/30 px-3 py-1.5 text-sm text-violet-300 transition-colors hover:bg-violet-900/50"
            >
              <ClipboardCheck className="h-3.5 w-3.5" />
              Review
            </Link>
          )}
          {/* Member: Submit for review */}
          {!isAdmin && canSubmitForReview && (
            <form action={boundSubmitForReview}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-700 bg-blue-900/30 px-3 py-1.5 text-sm text-blue-300 transition-colors hover:bg-blue-900/50"
              >
                <Send className="h-3.5 w-3.5" />
                Submit for Review
              </button>
            </form>
          )}
          {isPendingReview && !isAdmin && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-700/50 bg-amber-900/20 px-3 py-1.5 text-sm text-amber-400">
              Awaiting Review
            </span>
          )}
          {!isLocked && (
            <Link
              href={`/achievements/${goal.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-800"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Two-column layout: main content + trust sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
        <div className="flex flex-col gap-6">

          {/* Progress */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-400">Progress</p>
              <p className="text-2xl font-bold text-gray-50">{goal.progress_pct}%</p>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-800">
              <div
                className={`h-2 rounded-full transition-all ${PROGRESS_COLOR}`}
                style={{ width: `${goal.progress_pct}%` }}
              />
            </div>
            {(goal.start_date || goal.end_date) && (
              <p className="mt-3 text-xs text-gray-600">
                {goal.start_date ?? '—'} → {goal.end_date ?? 'ongoing'}
              </p>
            )}
          </div>

          {/* Outcome summary (if set) */}
          {(goal as any).outcome_summary && (
            <div className="flex gap-3 rounded-xl border border-gray-800 bg-gray-900 p-5">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-500">Outcome</p>
                <p className="text-sm leading-relaxed text-gray-300">{(goal as any).outcome_summary}</p>
              </div>
            </div>
          )}

          {/* Evidence */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Evidence ({evidence.length})
            </h2>

            {evidence.length > 0 && (
              <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {evidence.map(record => (
                  <div key={record.id} className="group relative">
                    <EvidenceCard record={record} />
                    <EvidenceDeleteButton evidenceId={record.id} achievementId={goal.id} />
                  </div>
                ))}
              </div>
            )}

            {!isLocked && connectedProviders.length > 0 && (
              <div className="mb-3">
                <EvidenceImportPanel achievementId={goal.id} connectedProviders={connectedProviders} />
              </div>
            )}
            <EvidenceForm action={boundCreateEvidence} />
          </div>

          {/* Tasks */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Tasks ({tasks.length})
              {tasks.length > 0 && (
                <span className="ml-2 font-normal normal-case text-gray-600">
                  — {tasks.filter(t => t.status === 'done').length} of {tasks.length} done
                </span>
              )}
            </h2>

            {tasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-700 p-6 text-center">
                <CheckSquare className="mx-auto mb-2 h-5 w-5 text-gray-700" />
                <p className="text-sm text-gray-600">No tasks yet.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-800 bg-gray-900">
                <div className="divide-y divide-gray-800">
                  {tasks.map(task => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}
            <TaskForm action={createTask.bind(null, goal.id)} />
          </div>

        </div>

        {/* Trust sidebar */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <TrustLadder current={goal.trust_level} />
        </div>
      </div>
    </div>
  )
}
