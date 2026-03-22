import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Lock, Pencil, CheckSquare, FileText } from "lucide-react"
import { fetchGoalById } from "@/lib/goal-data"
import { GoalStatusBadge } from "@/components/goal/goal-status-badge"
import { TrustBadge } from "@/components/goal/trust-badge"
import { EvidenceCard } from "@/components/goal/evidence-card"
import { TaskRow } from "@/components/goal/task-row"
import { TaskForm } from "@/components/forms/task-form"
import { createTask } from "@/app/actions/task-actions"

type Props = { params: Promise<{ id: string }> }

export default async function AchievementDetailPage({ params }: Props) {
  const { id } = await params
  const data = await fetchGoalById(id)
  if (!data) notFound()

  const { goal, evidence, tasks } = data

  const PROGRESS_COLOR =
    goal.status === "at_risk"   ? "bg-red-500" :
    goal.status === "completed" ? "bg-emerald-500" :
    "bg-blue-500"

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
          <Link
            href={`/achievements/${goal.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-800"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        </div>
      </div>

      {/* Progress card */}
      <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
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

      {/* Tasks */}
      <div className="mt-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
          Tasks ({tasks.length})
          {tasks.length > 0 && (
            <span className="ml-2 font-normal normal-case text-gray-600">
              — {tasks.filter(t => t.status === 'done').length} of {tasks.length} done
            </span>
          )}
        </h2>

        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-700 p-8 text-center">
            <CheckSquare className="mx-auto mb-2 h-6 w-6 text-gray-700" />
            <p className="text-sm text-gray-600">No tasks linked to this achievement yet.</p>
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

      {/* Evidence */}
      <div className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
          Evidence ({evidence.length})
        </h2>

        {evidence.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-700 p-8 text-center">
            <Lock className="mx-auto mb-2 h-6 w-6 text-gray-700" />
            <p className="mb-1 text-sm text-gray-500">No evidence attached yet.</p>
            <p className="text-xs text-gray-600">
              Attach links, documents, or data exports to raise your trust level.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {evidence.map(record => (
              <EvidenceCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </div>

      {/* Outcome summary (if set) */}
      {(goal as any).outcome_summary && (
        <div className="mt-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Outcome Summary
          </h2>
          <div className="flex gap-3 rounded-xl border border-gray-800 bg-gray-900 p-5">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
            <p className="text-sm leading-relaxed text-gray-300">{(goal as any).outcome_summary}</p>
          </div>
        </div>
      )}
    </div>
  )
}
