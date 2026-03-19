import { fetchKPIs } from "@/lib/api"
import { HeroKPI } from "@/components/kpi/hero-kpi"
import { KPICard } from "@/components/kpi/kpi-card"
import { KPISection } from "@/components/kpi/kpi-section"
import { AIInsightStrip } from "@/components/dashboard/ai-insight-strip"

export default async function DashboardPage() {
  const kpis = await fetchKPIs()

  const heroKPI = kpis.find((k) => k.id === "revenue")!
  const primary = kpis.filter((k) => ["mrr-growth", "nps"].includes(k.id))
  const customer = kpis.filter((k) => ["churn", "cac"].includes(k.id))
  const operational = kpis.filter((k) => ["support-tickets"].includes(k.id))
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">KPI Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of key performance indicators across your business.
        </p>
      </div>

      {/* AI Insight strip */}
      <AIInsightStrip />

      {/* Headline section: Hero + 2 primary cards */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Headline
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <HeroKPI kpi={heroKPI} />
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {primary.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Customer KPIs */}
      <KPISection title="Customer" kpis={customer} />

      {/* Operational KPIs */}
      <KPISection title="Operational" kpis={operational} />
    </div>
  )
}
