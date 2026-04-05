import { RouteLoading } from '@/components/layout/route-loading'

export default function AuthLoading() {
  return (
    <RouteLoading
      title="Preparing authentication"
      message="Connecting to ProofPath and verifying your sign-in state."
    />
  )
}
