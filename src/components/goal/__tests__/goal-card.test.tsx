import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GoalCard } from '../goal-card'
import type { GoalWithCounts } from '@/lib/goal-data'

const baseGoal: GoalWithCounts = {
  id: 'goal-1',
  workspace_id: 'ws-1',
  title: 'Grow MRR to $300k',
  description: 'Increase revenue through upsell',
  status: 'in_progress',
  progress_pct: 45,
  trust_level: 'self_reported',
  start_date: '2026-01-01',
  end_date: '2026-06-30',
  parent_goal_id: null,
  objective_id: null,
  goal_type: 'standard',
  kr_type: null,
  target_value: null,
  current_value: null,
  unit: null,
  owner_name: 'Alice',
  kpi_count: 3,
  sub_goal_count: 1,
  task_count: 5,
  task_done_count: 2,
}

describe('GoalCard', () => {
  it('renders the goal title', () => {
    render(<GoalCard goal={baseGoal} />)
    expect(screen.getByText('Grow MRR to $300k')).toBeInTheDocument()
  })

  it('links to the goal detail page', () => {
    render(<GoalCard goal={baseGoal} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/goals/goal-1')
  })

  it('renders the status badge', () => {
    render(<GoalCard goal={baseGoal} />)
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('renders the trust badge', () => {
    render(<GoalCard goal={baseGoal} />)
    expect(screen.getByText('Self Reported')).toBeInTheDocument()
  })

  it('renders the progress percentage', () => {
    render(<GoalCard goal={baseGoal} />)
    expect(screen.getByText('45%')).toBeInTheDocument()
  })

  it('renders KPI count when > 0', () => {
    render(<GoalCard goal={baseGoal} />)
    expect(screen.getByText('3 KPIs linked')).toBeInTheDocument()
  })

  it('renders singular KPI when count is 1', () => {
    render(<GoalCard goal={{ ...baseGoal, kpi_count: 1 }} />)
    expect(screen.getByText('1 KPI linked')).toBeInTheDocument()
  })

  it('hides KPI count when 0', () => {
    render(<GoalCard goal={{ ...baseGoal, kpi_count: 0 }} />)
    expect(screen.queryByText(/KPI/)).not.toBeInTheDocument()
  })
})
