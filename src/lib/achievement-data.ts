// ProofPath Phase 1: Achievement data layer
// Re-exports goal-data.ts with ProofPath-semantic aliases.
// The underlying DB table remains 'goals' — migration 009 will rename it.

export * from './goal-data'

// Semantic type aliases for ProofPath terminology
export type {
  GoalWithCounts  as AchievementWithCounts,
  GoalDetailData  as AchievementDetailData,
  GoalStatus      as AchievementStatus,
  GoalType        as AchievementType,
  TrustLevel,
  EvidenceRecord,
  TaskRecord,
  LinkedKPI,
} from './goal-data'

// Semantic function aliases
export {
  fetchWorkspaceGoals as fetchWorkspaceAchievements,
  fetchGoalById       as fetchAchievementById,
} from './goal-data'
