import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BarChart2, Sparkles, ShieldCheck } from "lucide-react"
import { mockKPIs } from "@/lib/mock-data"
import { evaluateKPI } from "@/lib/api"
import { TrendBadge } from "@/components/kpi/trend-badge"
import { formatNumber } from "@/lib/utils"

type Props = {
  params: Promise<{ id: string }>
}

export default async function KPIDetailPage({ params }: Props) {
  const { id } = await params
  const kpi = mockKPIs.find((k) => k.id === id)

  if (!kpi) notFound()

  let engineResult = null
  try {
    engineResult = await evaluateKPI({
      kpi: kpi.name,
      current_value: kpi.sparkline[kpi.sparkline.length - 1],
      previous_value: kpi.sparkline[0],
      threshold: 5,
      context: { region: "Global", team: kpi.category },
    })
  } catch {
    // graceful degradation — engine unavailable
  }

  return (
    <div>
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{kpi.name}</h1>
          <p className="mt-1 text-sm capitalize text-gray-500">{kpi.category}</p>
        </div>
        <TrendBadge trend={kpi.trend} changePercent={kpi.changePercent} />
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-4xl font-bold text-gray-900">{formatNumber(kpi.value, kpi.unit)}</p>
        <p className="mt-1 text-sm text-gray-400">Current value</p>
      </div>

      {/* Sparkline chart */}
      <div className="mb-6 rounded-xl border border-dashed border-gray-300 bg-white p-6">
        <div className="flex items-center gap-2 text-gray-400 mb-4">
          <BarChart2 className="h-5 w-5" />
          <span className="text-sm font-medium">Trend (last 7 periods)</span>
        </div>
        <div className="flex h-40 items-end gap-1.5">
          {kpi.sparkline.map((point, i) => {
            const max = Math.max(...kpi.sparkline)
            const height = Math.round((point / max) * 100)
            return (
              <div
                key={i}
                className="flex-1 rounded-sm bg-blue-100"
                style={{ height: `${height}%` }}
              />
            )
          })}
        </div>
      </div>

      {/* Engine insight */}
      {engineResult && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
              KPI Engine · Analysis
            </p>
          </div>

          {engineResult.insight && (
            <p className="text-sm text-blue-800">{engineResult.insight}</p>
          )}

          {engineResult.actions.length > 0 && (
            <ul className="space-y-1">
              {engineResult.actions.map((action, i) => (
                <li key={i} className="text-sm text-blue-700">
                  · {action}
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-1.5 pt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-xs text-blue-400">
              Confidence: {Math.round(engineResult.confidence * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export function generateStaticParams() {
  return mockKPIs.map((kpi) => ({ id: kpi.id }))
}
