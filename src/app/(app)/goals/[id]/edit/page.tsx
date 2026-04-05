import { redirect } from 'next/navigation'
import { proofPathRoutes } from '@/lib/proofpath-routes'

type Props = { params: Promise<{ id: string }> }

export default async function EditGoalPage({ params }: Props) {
  const { id } = await params
  redirect(proofPathRoutes.editAchievement(id))
}
