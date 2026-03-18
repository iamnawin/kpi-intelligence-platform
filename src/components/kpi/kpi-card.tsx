import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { TrendBadge } from "./trend-badge"
import { formatNumber } from "@/lib/utils"
import type { KPI } from "@/lib/mock-data"

export function KPICard({ kpi }: { kpi: KPI }) {
  return (
    <Link
      href={`/kpis/${kpi.id}`}
      className="group block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div className="mb-3 flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
          {kpi.name}
        </p>
        <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
      </div>

      <p className="mb-1 text-3xl font-bold tracking-tight text-gray-900">
        {formatNumber(kpi.value, kpi.unit)}
      </p>

      <div className="mb-4">
        <TrendBadge trend={kpi.trend} changePercent={kpi.changePercent} />
      </div>

      {/* Sparkline bars */}
      <div className="flex items-end gap-0.5" aria-hidden="true" role="presentation">
        {kpi.sparkline.map((point, i) => {
          const max = Math.max(...kpi.sparkline)
          const height = Math.round((point / max) * 32)
          const isLast = i === kpi.sparkline.length - 1
          return (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-colors ${
                isLast ? "bg-blue-400" : "bg-blue-100 group-hover:bg-blue-200"
              }`}
              style={{ height: `${height}px` }}
            />
          )
        })}
      </div>
    </Link>
  )
}
