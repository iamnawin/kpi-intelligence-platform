import { fetchWorkspaceKPIs } from "@/lib/kpi-data"
import { fetchWorkspaceGoals } from "@/lib/goal-data"
import { HeroKPI } from "@/components/kpi/hero-kpi"
import { KPICard } from "@/components/kpi/kpi-card"
import { KPISection } from "@/components/kpi/kpi-section"
import { AIInsightStrip } from "@/components/dashboard/ai-insight-strip"
import { GoalCard } from "@/components/goal/goal-card"

export default async function DashboardPage() {
  const [kpis, goals] = await Promise.all([
    fetchWorkspaceKPIs(),
    fetchWorkspaceGoals(),
  ])

  const activeGoals = goals
    .filter(g => g.status === 'in_progress' || g.status === 'at_risk')
    .slice(0, 3)

  // Hero: first revenue KPI, or first KPI overall
  const heroKPI = kpis.find(k => k.category === 'revenue') ?? kpis[0]

  // Primary (headline row): up to 2 non-hero revenue/growth KPIs
  const primary = kpis
    .filter(k => k !== heroKPI && (k.category === 'revenue' || k.category === 'growth'))
    .slice(0, 2)

  // Customer section
  const customer = kpis.filter(k => k.category === 'customer')

  // Operational section
  const operational = kpis.filter(k => k.category === 'operations')

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">KPI Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of key performance indicators across your business.
        </p>
      </div>

      <AIInsightStrip />

      {heroKPI && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Headline
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <HeroKPI kpi={heroKPI} />
            {primary.length > 0 && (
              <div className="flex flex-col gap-4 lg:col-span-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {primary.map(kpi => (
                    <KPICard key={kpi.id} kpi={kpi} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {customer.length > 0 && <KPISection title="Customer" kpis={customer} />}

      {operational.length > 0 && <KPISection title="Operational" kpis={operational} />}

      {activeGoals.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Active Goals
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
