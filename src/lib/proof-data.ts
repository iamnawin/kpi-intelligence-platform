import {
  fetchLockedProofAchievements,
  fetchWorkspaceAchievements,
} from './achievement-data'
import { summarizeProofProfile } from './proof-metrics'

export async function fetchProofProfileData() {
  const [achievements, lockedRecords] = await Promise.all([
    fetchWorkspaceAchievements(),
    fetchLockedProofAchievements(),
  ])

  return {
    achievements,
    lockedRecords,
    summary: summarizeProofProfile(achievements, lockedRecords),
  }
}
