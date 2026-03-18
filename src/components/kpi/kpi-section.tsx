import { KPICard } from "./kpi-card"
import type { KPI } from "@/lib/mock-data"

type Props = {
  title: string
  kpis: KPI[]
}

export function KPISection({ title, kpis }: Props) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </section>
  )
}
