export const proofPathRoutes = {
  achievements: '/achievements',
  newAchievement: '/achievements/new',
  importAchievements: '/achievements/import',
  achievementDetail: (id: string) => `/achievements/${id}`,
  editAchievement: (id: string) => `/achievements/${id}/edit`,
} as const
