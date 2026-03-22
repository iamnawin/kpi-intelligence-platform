import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EvidenceCard } from '../evidence-card'
import type { EvidenceRecord } from '@/lib/goal-data'

const baseRecord: EvidenceRecord = {
  id: 'ev-1',
  title: 'Q1 Revenue Screenshot',
  description: 'Screenshot from Stripe dashboard',
  evidence_type: 'file',
  source_url: null,
  source_type: 'manual',
  trust_level: 'imported',
  uploader_name: 'Alice',
  created_at: '2026-03-15T10:00:00Z',
}

describe('EvidenceCard', () => {
  it('renders the evidence title', () => {
    render(<EvidenceCard record={baseRecord} />)
    expect(screen.getByText('Q1 Revenue Screenshot')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<EvidenceCard record={baseRecord} />)
    expect(screen.getByText('Screenshot from Stripe dashboard')).toBeInTheDocument()
  })

  it('renders the evidence type label', () => {
    render(<EvidenceCard record={baseRecord} />)
    expect(screen.getByText('File')).toBeInTheDocument()
  })

  it('renders the trust badge', () => {
    render(<EvidenceCard record={baseRecord} />)
    expect(screen.getByText('Imported')).toBeInTheDocument()
  })

  it('renders uploader name', () => {
    render(<EvidenceCard record={baseRecord} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders formatted date', () => {
    render(<EvidenceCard record={baseRecord} />)
    expect(screen.getByText('Mar 15, 2026')).toBeInTheDocument()
  })

  it('renders link type with anchor tag', () => {
    render(<EvidenceCard record={{
      ...baseRecord,
      evidence_type: 'link',
      source_url: 'https://stripe.com/dashboard',
    }} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://stripe.com/dashboard')
  })

  it('does not render anchor for non-link types', () => {
    render(<EvidenceCard record={baseRecord} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders Note label for note type', () => {
    render(<EvidenceCard record={{ ...baseRecord, evidence_type: 'note' }} />)
    expect(screen.getByText('Note')).toBeInTheDocument()
  })

  it('renders Metric label for metric type', () => {
    render(<EvidenceCard record={{ ...baseRecord, evidence_type: 'metric' }} />)
    expect(screen.getByText('Metric')).toBeInTheDocument()
  })

  it('hides description when null', () => {
    render(<EvidenceCard record={{ ...baseRecord, description: null }} />)
    expect(screen.queryByText('Screenshot from Stripe dashboard')).not.toBeInTheDocument()
  })

  it('hides uploader when null', () => {
    render(<EvidenceCard record={{ ...baseRecord, uploader_name: null }} />)
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
  })

  it('opens link in new tab with noopener', () => {
    render(<EvidenceCard record={{
      ...baseRecord,
      evidence_type: 'link',
      source_url: 'https://example.com',
    }} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
