import { RouteLoading } from '@/components/layout/route-loading'

export default function AppLoading() {
  return (
    <RouteLoading
      title="Loading your workspace"
      message="Fetching your achievements, proof signals, and workspace context."
    />
  )
}
