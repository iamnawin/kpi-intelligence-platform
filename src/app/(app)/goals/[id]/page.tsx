import { redirect } from 'next/navigation'
import { proofPathRoutes } from '@/lib/proofpath-routes'

type Props = { params: Promise<{ id: string }> }

export default async function GoalDetailPage({ params }: Props) {
  const { id } = await params
  redirect(proofPathRoutes.achievementDetail(id))
}
