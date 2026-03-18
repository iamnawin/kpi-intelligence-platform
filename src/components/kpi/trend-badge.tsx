import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { KPITrend } from "@/lib/mock-data"

type Props = {
  trend: KPITrend
  changePercent: number
}

export function TrendBadge({ trend, changePercent }: Props) {
  const isPositive = changePercent > 0
  const label = `${isPositive ? "+" : ""}${changePercent}%`

  if (trend === "up") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-sm font-medium", isPositive ? "text-green-600" : "text-red-600")}>
        <TrendingUp className="h-4 w-4" />
        {label}
      </span>
    )
  }

  if (trend === "down") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-sm font-medium", isPositive ? "text-green-600" : "text-red-600")}>
        <TrendingDown className="h-4 w-4" />
        {label}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-500">
      <Minus className="h-4 w-4" />
      {label}
    </span>
  )
}
