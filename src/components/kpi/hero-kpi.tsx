import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { TrendBadge } from "./trend-badge"
import { formatNumber } from "@/lib/utils"
import type { KPI } from "@/lib/mock-data"

export function HeroKPI({ kpi }: { kpi: KPI }) {
  return (
    <Link
      href={`/kpis/${kpi.id}`}
      className="group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-600 to-violet-700 p-6 text-white shadow-xl shadow-blue-900/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-900/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-950"
    >
      {/* Texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* Top-right glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

      <div className="relative">
        <div className="mb-2 flex items-start justify-between">
          <p className="text-sm font-semibold text-blue-100">{kpi.name}</p>
          <ArrowUpRight className="h-4 w-4 text-blue-200 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        <p className="mb-2 text-5xl font-bold tracking-tight tabular-nums">
          {formatNumber(kpi.value, kpi.unit)}
        </p>

        <div className="mb-6 flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
            {kpi.changePercent > 0 ? "+" : ""}{kpi.changePercent}% vs last period
          </span>
        </div>

        {/* Sparkline */}
        <div className="flex items-end gap-0.5" aria-hidden="true">
          {kpi.sparkline.map((point, i) => {
            const max = Math.max(...kpi.sparkline)
            const height = Math.round((point / max) * 44)
            const isLast = i === kpi.sparkline.length - 1
            return (
              <div
                key={i}
                className={`flex-1 rounded-sm transition-opacity ${isLast ? 'bg-white/80' : 'bg-white/25 group-hover:bg-white/35'}`}
                style={{ height: `${height}px` }}
              />
            )
          })}
        </div>
      </div>
    </Link>
  )
}
