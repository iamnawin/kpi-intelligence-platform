import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { IntegrationProvider } from '@/lib/integrations/types'

// OAuth authorization URLs and config per provider
const OAUTH_CONFIG: Record<
  IntegrationProvider,
  (clientId: string, redirectUri: string, state: string) => string
> = {
  jira: (clientId, redirectUri, state) =>
    `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=read%3Ajira-work&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&response_type=code&prompt=consent`,

  linear: (clientId, redirectUri, state) =>
    `https://linear.app/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=read&state=${state}&prompt=consent`,

  asana: (clientId, redirectUri, state) =>
    `https://app.asana.com/-/oauth_authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=default&state=${state}`,

  github: (clientId, redirectUri, state) =>
    `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo&state=${state}`,
}

const CLIENT_IDS: Record<IntegrationProvider, string | undefined> = {
  jira:   process.env.JIRA_CLIENT_ID,
  linear: process.env.LINEAR_CLIENT_ID,
  asana:  process.env.ASANA_CLIENT_ID,
  github: process.env.GITHUB_CLIENT_ID,
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const validProviders: IntegrationProvider[] = ['jira', 'linear', 'asana', 'github']
  if (!validProviders.includes(provider as IntegrationProvider)) {
    return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
  }

  const p = provider as IntegrationProvider
  const clientId = CLIENT_IDS[p]
  if (!clientId) {
    return NextResponse.json(
      { error: `${provider} integration not configured` },
      { status: 503 }
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const redirectUri = `${baseUrl}/api/integrations/${provider}/callback`
  const state = Buffer.from(JSON.stringify({ userId: user.id, provider })).toString('base64url')

  const authUrl = OAUTH_CONFIG[p](clientId, redirectUri, state)
  return NextResponse.redirect(authUrl)
}
