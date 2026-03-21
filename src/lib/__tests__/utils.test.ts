import { describe, it, expect } from 'vitest'
import { formatNumber, cn } from '../utils'

describe('formatNumber', () => {
  describe('dollar unit', () => {
    it('formats millions', () => {
      expect(formatNumber(2_500_000, '$')).toBe('$2.5M')
    })
    it('formats thousands', () => {
      expect(formatNumber(150_000, '$')).toBe('$150K')
    })
    it('formats exact thousand', () => {
      expect(formatNumber(1_000, '$')).toBe('$1K')
    })
    it('formats sub-thousand', () => {
      expect(formatNumber(500, '$')).toBe('$500')
    })
    it('formats zero dollars', () => {
      expect(formatNumber(0, '$')).toBe('$0')
    })
  })

  describe('percent unit', () => {
    it('appends % sign', () => {
      expect(formatNumber(42, '%')).toBe('42%')
    })
    it('handles 100%', () => {
      expect(formatNumber(100, '%')).toBe('100%')
    })
    it('handles 0%', () => {
      expect(formatNumber(0, '%')).toBe('0%')
    })
  })

  describe('other units', () => {
    it('uses toLocaleString for count', () => {
      expect(formatNumber(1234, 'count')).toBe((1234).toLocaleString())
    })
    it('uses toLocaleString for empty unit', () => {
      expect(formatNumber(99, '')).toBe((99).toLocaleString())
    })
  })
})

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })
  it('resolves tailwind conflicts (last wins)', () => {
    expect(cn('px-4', 'px-8')).toBe('px-8')
  })
  it('ignores falsy values', () => {
    expect(cn('px-4', false, null, undefined, 'py-2')).toBe('px-4 py-2')
  })
  it('handles conditional classes', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active')
  })
})
