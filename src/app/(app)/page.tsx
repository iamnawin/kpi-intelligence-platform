import { Suspense } from 'react'
import { GoalCard } from '@/components/goal/goal-card'
import { ViewSelector } from '@/components/dashboard/view-selector'
import { PersonalView } from '@/components/dashboard/personal-view'
import { TeamView } from '@/components/dashboard/team-view'
import { ExecutiveStrip } from '@/components/dashboard/executive-strip'
import { getSession } from '@/lib/auth'
import { fetchDashboardData, type DashboardView } from '@/lib/dashboard-data'

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

  const companyData = session
    ? await fetchDashboardData('company', session.userId)
    : {
        goals: [],
        kpis: [],
        totalGoals: 0,
        completedGoals: 0,
        atRiskGoals: 0,
        verifiedAchievements: 0,
        lockedProofCount: 0,
      }

  const activeAchievements = companyData.goals
    .filter(achievement => achievement.status === 'in_progress' || achievement.status === 'at_risk')
    .slice(0, 6)

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

      {activeAchievements.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-600">
            Active Achievements
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeAchievements.map(achievement => (
              <GoalCard key={achievement.id} goal={achievement} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
