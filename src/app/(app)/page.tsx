import { Suspense } from 'react'
import { fetchWorkspaceKPIs } from '@/lib/kpi-data'
import { HeroKPI } from '@/components/kpi/hero-kpi'
import { KPICard } from '@/components/kpi/kpi-card'
import { KPISection } from '@/components/kpi/kpi-section'
import { AIInsightStrip } from '@/components/dashboard/ai-insight-strip'
import { GoalCard } from '@/components/goal/goal-card'
import { ViewSelector } from '@/components/dashboard/view-selector'
import { PersonalView } from '@/components/dashboard/personal-view'
import { TeamView } from '@/components/dashboard/team-view'
import { ExecutiveStrip } from '@/components/dashboard/executive-strip'
import { getSession } from '@/lib/auth'
import { fetchDashboardData, type DashboardView } from '@/lib/dashboard-data'
import { fetchWorkspaceGoals } from '@/lib/goal-data'

type Props = {
  searchParams: Promise<{ view?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const { view: viewParam } = await searchParams
  const session = await getSession()

  const isAdmin = session?.role === 'admin'

  // Determine view — default to 'personal' for members, 'company' for admins
  const defaultView: DashboardView = isAdmin ? 'company' : 'personal'
  const rawView = viewParam ?? defaultView
  const view: DashboardView =
    rawView === 'personal' || rawView === 'team' || rawView === 'company'
      ? rawView
      : defaultView

  // Non-admin users are locked to personal view
  const effectiveView: DashboardView = !isAdmin ? 'personal' : view

  if (session && (effectiveView === 'personal' || effectiveView === 'team')) {
    const data = await fetchDashboardData(effectiveView, session.userId)
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1" />
          <Suspense>
            <ViewSelector current={effectiveView} isAdmin={isAdmin} />
          </Suspense>
        </div>

        {effectiveView === 'personal' ? (
          <PersonalView data={data} displayName={session.displayName} />
        ) : (
          <TeamView data={data} />
        )}
      </div>
    )
  }

  // Company / fallback view — original dashboard layout
  const [kpis, goals] = await Promise.all([
    fetchWorkspaceKPIs(),
    fetchWorkspaceGoals(),
  ])

  const activeGoals = goals
    .filter(g => g.status === 'in_progress' || g.status === 'at_risk')
    .slice(0, 3)

  const heroKPI = kpis.find(k => k.category === 'revenue') ?? kpis[0]
  const primary = kpis
    .filter(k => k !== heroKPI && (k.category === 'revenue' || k.category === 'growth'))
    .slice(0, 2)
  const customer = kpis.filter(k => k.category === 'customer')
  const operational = kpis.filter(k => k.category === 'operations')

  const companyData = {
    goals: activeGoals,
    kpis,
    totalGoals: goals.length,
    completedGoals: goals.filter(g => g.status === 'completed').length,
    atRiskGoals: goals.filter(g => g.status === 'at_risk').length,
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-50">Proof Feed</h1>
          <p className="mt-1 text-sm text-gray-500">
            Active achievements, trust signals, and evidence — all in one place.
          </p>
        </div>
        <Suspense>
          <ViewSelector current={effectiveView} isAdmin={isAdmin} />
        </Suspense>
      </div>

      {isAdmin && <ExecutiveStrip data={companyData} />}

      <AIInsightStrip />

      {heroKPI && (
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-600">
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
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-600">
            Active Achievements
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
