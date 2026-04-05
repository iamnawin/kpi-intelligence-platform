import { getAuthDiagnostics } from '@/lib/auth-diagnostics'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const diagnostics = await getAuthDiagnostics(request.url)
  return Response.json(diagnostics)
}
