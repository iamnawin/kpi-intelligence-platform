import { describe, expect, it } from 'vitest'
import {
  calculateTrustScore,
  isVerifiedTrustLevel,
  summarizeProofProfile,
} from '@/lib/proof-metrics'
import type { AchievementWithCounts, LockedProofRecord } from '@/lib/achievement-data'

const achievements: AchievementWithCounts[] = [
  {
    id: 'a1',
    workspace_id: 'w1',
    title: 'Launch onboarding rewrite',
    description: null,
    status: 'completed',
    progress_pct: 100,
    trust_level: 'locked_proof',
    start_date: null,
    end_date: null,
    parent_goal_id: null,
    objective_id: null,
    goal_type: 'team',
    kr_type: null,
    target_value: null,
    current_value: null,
    unit: null,
    owner_name: 'Naveen',
    kpi_count: 0,
    sub_goal_count: 0,
    task_count: 2,
    task_done_count: 2,
  },
  {
    id: 'a2',
    workspace_id: 'w1',
    title: 'Import historical evidence',
    description: null,
    status: 'in_progress',
    progress_pct: 40,
    trust_level: 'imported',
    start_date: null,
    end_date: null,
    parent_goal_id: null,
    objective_id: null,
    goal_type: 'operational',
    kr_type: null,
    target_value: null,
    current_value: null,
    unit: null,
    owner_name: 'Naveen',
    kpi_count: 0,
    sub_goal_count: 0,
    task_count: 1,
    task_done_count: 0,
  },
]

const lockedRecords: LockedProofRecord[] = [
  {
    id: 'r1',
    achievementId: 'a1',
    title: 'Launch onboarding rewrite',
    description: null,
    outcomeSupport: 'Delivered and approved',
    periodLabel: 'Q2 2026',
    achievementType: 'delivered',
    evidenceCount: 3,
    approvedAt: '2026-04-01T00:00:00Z',
    exportToken: 'proof_a1',
    isPortable: true,
  },
]

describe('proof-metrics', () => {
  it('recognizes verified trust levels', () => {
    expect(isVerifiedTrustLevel('reviewer_approved')).toBe(true)
    expect(isVerifiedTrustLevel('system_verified')).toBe(true)
    expect(isVerifiedTrustLevel('locked_proof')).toBe(true)
    expect(isVerifiedTrustLevel('imported')).toBe(false)
  })

  it('calculates trust score from achievement trust levels', () => {
    expect(calculateTrustScore(achievements)).toBe(70)
  })

  it('summarizes proof profile metrics', () => {
    expect(summarizeProofProfile(achievements, lockedRecords)).toEqual({
      totalAchievements: 2,
      completedAchievements: 1,
      verifiedAchievements: 1,
      lockedProofCount: 1,
      trustScore: 70,
      activeAchievements: [achievements[1]],
    })
  })
})
