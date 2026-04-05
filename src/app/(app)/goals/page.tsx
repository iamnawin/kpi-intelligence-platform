import { redirect } from 'next/navigation'
import { proofPathRoutes } from '@/lib/proofpath-routes'

export default function GoalsPage() {
  redirect(proofPathRoutes.achievements)
}
