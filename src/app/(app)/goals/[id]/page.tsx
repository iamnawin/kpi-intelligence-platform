import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BarChart2, Lock } from "lucide-react"
import { fetchGoalById } from "@/lib/goal-data"
import { GoalStatusBadge } from "@/components/goal/goal-status-badge"
import { TrustBadge } from "@/components/goal/trust-badge"
import { EvidenceCard } from "@/components/goal/evidence-card"
import { TrendBadge } from "@/components/kpi/trend-badge"
import { formatNumber } from "@/lib/utils"

type Props = { params: Promise<{ id: string }> }

export default async function GoalDetailPage({ params }: Props) {
  const { id } = await params
  const data = await fetchGoalById(id)
  if (!data) notFound()

  const { goal, kpis, evidence } = data

  return (
    <div>
      <Link
        href="/goals"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Goals
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{goal.title}</h1>
          {goal.description && (
            <p className="mt-1 text-sm text-gray-500">{goal.description}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <GoalStatusBadge status={goal.status} />
          <TrustBadge level={goal.trust_level} />
        </div>
      </div>

      {/* Progress card */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Progress</p>
          <p className="text-2xl font-bold text-gray-900">{goal.progress_pct}%</p>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-blue-400 transition-all"
            style={{ width: `${goal.progress_pct}%` }}
          />
        </div>
        {(goal.start_date || goal.end_date) && (
          <p className="mt-3 text-xs text-gray-400">
            {goal.start_date ?? '—'} → {goal.end_date ?? 'ongoing'}
          </p>
        )}
      </div>

      {/* Linked KPIs */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Linked KPIs ({kpis.length})
        </h2>

        {kpis.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
            <BarChart2 className="mx-auto mb-2 h-6 w-6 text-gray-300" />
            <p className="text-sm text-gray-400">No KPIs linked to this goal yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kpis.map(kpi => (
              <Link
                key={kpi.id}
                href={`/kpis/${kpi.id}`}
                className="group block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <p className="mb-3 text-sm font-medium text-gray-500 group-hover:text-gray-700">
                  {kpi.name}
                </p>
                <p className="mb-1 text-3xl font-bold tracking-tight text-gray-900">
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
                          className={`flex-1 rounded-sm ${isLast ? 'bg-blue-400' : 'bg-blue-100 group-hover:bg-blue-200'}`}
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
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Evidence ({evidence.length})
        </h2>

        {evidence.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
            <Lock className="mx-auto mb-2 h-6 w-6 text-gray-300" />
            <p className="text-sm text-gray-400">No evidence attached to this goal yet.</p>
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
