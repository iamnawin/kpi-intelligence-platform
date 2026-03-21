import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GoalStatusBadge } from '../goal-status-badge'
import type { GoalStatus } from '@/lib/goal-data'

const ALL_STATUSES: { status: GoalStatus; label: string }[] = [
  { status: 'not_started', label: 'Not Started' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'at_risk',     label: 'At Risk' },
  { status: 'completed',   label: 'Completed' },
  { status: 'cancelled',   label: 'Cancelled' },
]

describe('GoalStatusBadge', () => {
  it.each(ALL_STATUSES)('renders "$label" for status "$status"', ({ status, label }) => {
    render(<GoalStatusBadge status={status} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('falls back to Not Started for unknown status', () => {
    // @ts-expect-error testing invalid input
    render(<GoalStatusBadge status="unknown" />)
    expect(screen.getByText('Not Started')).toBeInTheDocument()
  })

  it('applies red class for at_risk', () => {
    render(<GoalStatusBadge status="at_risk" />)
    const badge = screen.getByText('At Risk')
    expect(badge.className).toContain('red')
  })

  it('applies green class for completed', () => {
    render(<GoalStatusBadge status="completed" />)
    const badge = screen.getByText('Completed')
    expect(badge.className).toContain('green')
  })

  it('applies blue class for in_progress', () => {
    render(<GoalStatusBadge status="in_progress" />)
    const badge = screen.getByText('In Progress')
    expect(badge.className).toContain('blue')
  })
})
