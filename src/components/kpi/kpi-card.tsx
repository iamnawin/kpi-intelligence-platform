import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { TrendBadge } from "./trend-badge"
import { formatNumber } from "@/lib/utils"
import type { KPI } from "@/lib/mock-data"

const CATEGORY_ACCENT: Record<string, string> = {
  revenue:    "from-blue-500/20 to-blue-500/5 border-blue-500/20",
  growth:     "from-violet-500/20 to-violet-500/5 border-violet-500/20",
  customer:   "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
  operations: "from-amber-500/20 to-amber-500/5 border-amber-500/20",
}

const SPARKLINE_COLOR: Record<string, string> = {
  revenue:    "bg-blue-500",
  growth:     "bg-violet-500",
  customer:   "bg-emerald-500",
  operations: "bg-amber-500",
}

export function KPICard({ kpi }: { kpi: KPI }) {
  const accent = CATEGORY_ACCENT[kpi.category] ?? "from-gray-800/40 to-gray-800/10 border-gray-700/40"
  const sparkColor = SPARKLINE_COLOR[kpi.category] ?? "bg-blue-500"

  return (
    <Link
      href={`/kpis/${kpi.id}`}
      className={`group relative block overflow-hidden rounded-2xl border bg-gradient-to-b p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${accent}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 group-hover:text-gray-400 transition-colors">
          {kpi.name}
        </p>
        <ArrowUpRight className="h-3.5 w-3.5 text-gray-600 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <p className="mb-1 text-3xl font-bold tracking-tight text-white">
        {formatNumber(kpi.value, kpi.unit)}
      </p>

      <div className="mb-4">
        <TrendBadge trend={kpi.trend} changePercent={kpi.changePercent} />
      </div>

      {/* Sparkline */}
      <div className="flex items-end gap-0.5" aria-hidden="true">
        {kpi.sparkline.map((point, i) => {
          const max = Math.max(...kpi.sparkline)
          const height = Math.round((point / max) * 28)
          const isLast = i === kpi.sparkline.length - 1
          return (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-opacity ${sparkColor} ${isLast ? 'opacity-100' : 'opacity-30 group-hover:opacity-50'}`}
              style={{ height: `${height}px` }}
            />
          )
        })}
      </div>
    </Link>
  )
}
