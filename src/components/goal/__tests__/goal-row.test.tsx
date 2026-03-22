import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GoalRow } from '../goal-row'
import type { GoalWithCounts } from '@/lib/goal-data'

const baseGoal: GoalWithCounts = {
  id: 'goal-2',
  workspace_id: 'ws-1',
  title: 'Reduce Churn Below 2%',
  description: null,
  status: 'at_risk',
  progress_pct: 30,
  trust_level: 'imported',
  start_date: null,
  end_date: '2026-12-31',
  parent_goal_id: null,
  objective_id: null,
  goal_type: 'standard',
  kr_type: null,
  target_value: null,
  current_value: null,
  unit: null,
  owner_name: 'Bob',
  kpi_count: 2,
  sub_goal_count: 0,
  task_count: 4,
  task_done_count: 1,
}

describe('GoalRow', () => {
  it('renders the goal title', () => {
    render(<GoalRow goal={baseGoal} />)
    expect(screen.getByText('Reduce Churn Below 2%')).toBeInTheDocument()
  })

  it('links to the goal detail page', () => {
    render(<GoalRow goal={baseGoal} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/goals/goal-2')
  })

  it('renders status badge', () => {
    render(<GoalRow goal={baseGoal} />)
    expect(screen.getByText('At Risk')).toBeInTheDocument()
  })

  it('renders trust badge', () => {
    render(<GoalRow goal={baseGoal} />)
    expect(screen.getByText('Imported')).toBeInTheDocument()
  })

  it('renders owner name', () => {
    render(<GoalRow goal={baseGoal} />)
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders task progress', () => {
    render(<GoalRow goal={baseGoal} />)
    expect(screen.getByText('1/4 tasks')).toBeInTheDocument()
  })

  it('renders KPI count', () => {
    render(<GoalRow goal={baseGoal} />)
    expect(screen.getByText('2 KPIs')).toBeInTheDocument()
  })

  it('renders singular KPI label', () => {
    render(<GoalRow goal={{ ...baseGoal, kpi_count: 1 }} />)
    expect(screen.getByText('1 KPI')).toBeInTheDocument()
  })

  it('renders progress bar when progress > 0', () => {
    render(<GoalRow goal={baseGoal} />)
    expect(screen.getByText('30%')).toBeInTheDocument()
  })

  it('does not render progress bar when 0%', () => {
    render(<GoalRow goal={{ ...baseGoal, progress_pct: 0 }} />)
    expect(screen.queryByText('0%')).not.toBeInTheDocument()
  })

  it('applies indentation class at depth > 0', () => {
    render(<GoalRow goal={baseGoal} depth={1} />)
    const link = screen.getByRole('link')
    expect(link.className).toContain('pl-12')
  })

  it('does not apply indentation at depth 0', () => {
    render(<GoalRow goal={baseGoal} depth={0} />)
    const link = screen.getByRole('link')
    expect(link.className).not.toContain('pl-10')
  })
})
