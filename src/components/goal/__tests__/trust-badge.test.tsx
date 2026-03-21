import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrustBadge } from '../trust-badge'
import type { TrustLevel } from '@/lib/goal-data'

const ALL_LEVELS: { level: TrustLevel; label: string }[] = [
  { level: 'draft',              label: 'Draft' },
  { level: 'self_reported',      label: 'Self Reported' },
  { level: 'imported',           label: 'Imported' },
  { level: 'reviewer_approved',  label: 'Reviewer Approved' },
  { level: 'system_verified',    label: 'System Verified' },
  { level: 'locked_proof',       label: 'Locked Proof' },
]

describe('TrustBadge', () => {
  it.each(ALL_LEVELS)('renders "$label" for level "$level"', ({ level, label }) => {
    render(<TrustBadge level={level} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('falls back to Draft for unknown level', () => {
    // @ts-expect-error testing invalid input
    render(<TrustBadge level="unknown_level" />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders a span element', () => {
    render(<TrustBadge level="imported" />)
    expect(screen.getByText('Imported').tagName).toBe('SPAN')
  })
})
