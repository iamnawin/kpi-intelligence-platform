import type {
  AchievementWithCounts,
  LockedProofRecord,
  TrustLevel,
} from './achievement-data'

const TRUST_WEIGHT: Record<TrustLevel, number> = {
  draft: 0,
  self_reported: 20,
  imported: 40,
  reviewer_approved: 70,
  system_verified: 85,
  locked_proof: 100,
}

export type ProofProfileMetrics = {
  totalAchievements: number
  completedAchievements: number
  verifiedAchievements: number
  lockedProofCount: number
  trustScore: number
  activeAchievements: AchievementWithCounts[]
}

export function isVerifiedTrustLevel(level: TrustLevel): boolean {
  return (
    level === 'reviewer_approved' ||
    level === 'system_verified' ||
    level === 'locked_proof'
  )
}

export function calculateTrustScore(achievements: AchievementWithCounts[]): number {
  if (achievements.length === 0) return 0

  const total = achievements.reduce(
    (sum, achievement) => sum + (TRUST_WEIGHT[achievement.trust_level] ?? 0),
    0
  )

  return Math.round(total / achievements.length)
}

export function summarizeProofProfile(
  achievements: AchievementWithCounts[],
  lockedRecords: LockedProofRecord[]
): ProofProfileMetrics {
  return {
    totalAchievements: achievements.length,
    completedAchievements: achievements.filter(a => a.status === 'completed').length,
    verifiedAchievements: achievements.filter(a => isVerifiedTrustLevel(a.trust_level)).length,
    lockedProofCount: lockedRecords.length,
    trustScore: calculateTrustScore(achievements),
    activeAchievements: achievements.filter(a => a.trust_level !== 'locked_proof'),
  }
}
