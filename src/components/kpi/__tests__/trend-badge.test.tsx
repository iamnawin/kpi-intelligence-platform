import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrendBadge } from '../trend-badge'

describe('TrendBadge', () => {
  describe('up trend', () => {
    it('shows positive change in green', () => {
      render(<TrendBadge trend="up" changePercent={12.5} />)
      const badge = screen.getByText('+12.5%')
      expect(badge.className).toContain('green')
    })

    it('shows negative change in red (up trend but falling value)', () => {
      render(<TrendBadge trend="up" changePercent={-5} />)
      const badge = screen.getByText('-5%')
      expect(badge.className).toContain('red')
    })
  })

  describe('down trend', () => {
    it('shows negative change in red', () => {
      render(<TrendBadge trend="down" changePercent={-8.3} />)
      const badge = screen.getByText('-8.3%')
      expect(badge.className).toContain('red')
    })

    it('shows positive change in green (down trend but value recovered)', () => {
      render(<TrendBadge trend="down" changePercent={3} />)
      const badge = screen.getByText('+3%')
      expect(badge.className).toContain('green')
    })
  })

  describe('stable trend', () => {
    it('renders gray for stable', () => {
      render(<TrendBadge trend="stable" changePercent={0} />)
      const badge = screen.getByText('0%')
      expect(badge.className).toContain('gray')
    })

    it('shows the correct percentage for stable', () => {
      render(<TrendBadge trend="stable" changePercent={0.2} />)
      expect(screen.getByText('+0.2%')).toBeInTheDocument()
    })
  })

  it('prepends + for positive values', () => {
    render(<TrendBadge trend="up" changePercent={7} />)
    expect(screen.getByText('+7%')).toBeInTheDocument()
  })

  it('does not prepend + for negative values', () => {
    render(<TrendBadge trend="down" changePercent={-3} />)
    expect(screen.getByText('-3%')).toBeInTheDocument()
  })
})
