import { describe, expect, it } from 'vitest'
import { proofPathRoutes } from '@/lib/proofpath-routes'

describe('proofPathRoutes', () => {
  it('exposes the canonical achievement routes', () => {
    expect(proofPathRoutes.achievements).toBe('/achievements')
    expect(proofPathRoutes.newAchievement).toBe('/achievements/new')
    expect(proofPathRoutes.importAchievements).toBe('/achievements/import')
  })

  it('builds detail and edit routes from the achievement id', () => {
    expect(proofPathRoutes.achievementDetail('abc123')).toBe('/achievements/abc123')
    expect(proofPathRoutes.editAchievement('abc123')).toBe('/achievements/abc123/edit')
  })
})
