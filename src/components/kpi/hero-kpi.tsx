import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { TrendBadge } from "./trend-badge"
import { formatNumber } from "@/lib/utils"
import type { KPI } from "@/lib/mock-data"

export function HeroKPI({ kpi }: { kpi: KPI }) {
  return (
    <Link
      href={`/kpis/${kpi.id}`}
      className="group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-lg transition-shadow hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
    >
      <div className="mb-1 flex items-start justify-between">
        <p className="text-sm font-medium text-blue-200">{kpi.name}</p>
        <ArrowUpRight className="h-4 w-4 text-blue-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>

      <p className="mb-1 text-5xl font-bold tracking-tight">
        {formatNumber(kpi.value, kpi.unit)}
      </p>

      <div className="mb-5 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-sm font-medium text-white">
          {kpi.changePercent > 0 ? "+" : ""}{kpi.changePercent}% vs last period
        </span>
      </div>

      {/* Sparkline */}
      <div className="flex items-end gap-0.5" aria-hidden="true">
        {kpi.sparkline.map((point, i) => {
          const max = Math.max(...kpi.sparkline)
          const height = Math.round((point / max) * 40)
          return (
            <div
              key={i}
              className="flex-1 rounded-sm bg-white/30"
              style={{ height: `${height}px` }}
            />
          )
        })}
      </div>

      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
    </Link>
  )
}
