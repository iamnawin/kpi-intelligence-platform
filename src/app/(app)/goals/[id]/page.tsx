import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BarChart2, Lock, Pencil, CheckSquare } from "lucide-react"
import { fetchGoalById } from "@/lib/goal-data"
import { GoalStatusBadge } from "@/components/goal/goal-status-badge"
import { TrustBadge } from "@/components/goal/trust-badge"
import { EvidenceCard } from "@/components/goal/evidence-card"
import { TaskRow } from "@/components/goal/task-row"
import { TaskForm } from "@/components/forms/task-form"
import { TrendBadge } from "@/components/kpi/trend-badge"
import { formatNumber } from "@/lib/utils"
import { createTask } from "@/app/actions/task-actions"

type Props = { params: Promise<{ id: string }> }

export default async function GoalDetailPage({ params }: Props) {
  const { id } = await params
  const data = await fetchGoalById(id)
  if (!data) notFound()

  const { goal, kpis, evidence, tasks } = data

  return (
    <div>
      <Link
        href="/goals"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Goals
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">{goal.title}</h1>
          {goal.description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{goal.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex flex-col items-end gap-2">
            <GoalStatusBadge status={goal.status} />
            <TrustBadge level={goal.trust_level} />
          </div>
          <Link
            href={`/goals/${goal.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        </div>
      </div>

      {/* Progress card */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{goal.progress_pct}%</p>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className="h-2 rounded-full bg-blue-400 transition-all"
            style={{ width: `${goal.progress_pct}%` }}
          />
        </div>
        {(goal.start_date || goal.end_date) && (
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
            {goal.start_date ?? '—'} → {goal.end_date ?? 'ongoing'}
          </p>
        )}
      </div>

      {/* Tasks */}
      <div className="mt-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Tasks ({tasks.length})
          {tasks.length > 0 && (
            <span className="ml-2 font-normal normal-case text-gray-400 dark:text-gray-500">
              — {tasks.filter(t => t.status === 'done').length} of {tasks.length} done
            </span>
          )}
        </h2>

        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
            <CheckSquare className="mx-auto mb-2 h-6 w-6 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400 dark:text-gray-500">No tasks linked to this goal yet.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {tasks.map(task => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}
        <TaskForm action={createTask.bind(null, goal.id)} />
      </div>

      {/* Linked KPIs */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Linked KPIs ({kpis.length})
        </h2>

        {kpis.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
            <BarChart2 className="mx-auto mb-2 h-6 w-6 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400 dark:text-gray-500">No KPIs linked to this goal yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kpis.map(kpi => (
              <Link
                key={kpi.id}
                href={`/kpis/${kpi.id}`}
                className="group block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900"
              >
                <p className="mb-3 text-sm font-medium text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200">
                  {kpi.name}
                </p>
                <p className="mb-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                  {formatNumber(kpi.value, kpi.unit)}
                </p>
                <div className="mb-4">
                  <TrendBadge trend={kpi.trend} changePercent={kpi.changePercent} />
                </div>
                {kpi.sparkline.length > 0 && (
                  <div className="flex items-end gap-0.5" aria-hidden="true">
                    {kpi.sparkline.map((point, i) => {
                      const max = Math.max(...kpi.sparkline)
                      const height = max > 0 ? Math.round((point / max) * 32) : 0
                      const isLast = i === kpi.sparkline.length - 1
                      return (
                        <div
                          key={i}
                          className={`flex-1 rounded-sm ${isLast ? 'bg-blue-400' : 'bg-blue-100 group-hover:bg-blue-200 dark:bg-blue-900 dark:group-hover:bg-blue-800'}`}
                          style={{ height: `${height}px` }}
                        />
                      )
                    })}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Evidence */}
      <div className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Evidence ({evidence.length})
        </h2>

        {evidence.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
            <Lock className="mx-auto mb-2 h-6 w-6 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400 dark:text-gray-500">No evidence attached to this goal yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {evidence.map(record => (
              <EvidenceCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
