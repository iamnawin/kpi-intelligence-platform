import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { IntegrationProvider } from '@/lib/integrations/types'

type TokenResponse = {
  access_token: string
  refresh_token?: string
}

const TOKEN_ENDPOINTS: Record<IntegrationProvider, string> = {
  jira:   'https://auth.atlassian.com/oauth/token',
  linear: 'https://api.linear.app/oauth/token',
  asana:  'https://app.asana.com/-/oauth_token',
  github: 'https://github.com/login/oauth/access_token',
}

const CLIENT_IDS: Record<IntegrationProvider, string | undefined> = {
  jira:   process.env.JIRA_CLIENT_ID,
  linear: process.env.LINEAR_CLIENT_ID,
  asana:  process.env.ASANA_CLIENT_ID,
  github: process.env.GITHUB_CLIENT_ID,
}

const CLIENT_SECRETS: Record<IntegrationProvider, string | undefined> = {
  jira:   process.env.JIRA_CLIENT_SECRET,
  linear: process.env.LINEAR_CLIENT_SECRET,
  asana:  process.env.ASANA_CLIENT_SECRET,
  github: process.env.GITHUB_CLIENT_SECRET,
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const validProviders: IntegrationProvider[] = ['jira', 'linear', 'asana', 'github']
  if (!validProviders.includes(provider as IntegrationProvider)) {
    return NextResponse.redirect(new URL('/settings/integrations?error=unknown_provider', req.url))
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/settings/integrations?error=missing_params', req.url))
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const p = provider as IntegrationProvider
  const clientId = CLIENT_IDS[p]
  const clientSecret = CLIENT_SECRETS[p]

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/settings/integrations?error=not_configured', req.url))
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const redirectUri = `${baseUrl}/api/integrations/${provider}/callback`

  // Exchange code for token
  const tokenRes = await fetch(TOKEN_ENDPOINTS[p], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/settings/integrations?error=token_exchange', req.url))
  }

  const tokens = (await tokenRes.json()) as TokenResponse

  // Resolve workspace
  const { data: memberRow } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .limit(1)
    .single()

  if (!memberRow?.workspace_id) {
    return NextResponse.redirect(new URL('/settings/integrations?error=no_workspace', req.url))
  }

  // Upsert integration record
  await supabase.from('workspace_integrations').upsert(
    {
      workspace_id:  memberRow.workspace_id,
      provider:      p,
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
    },
    { onConflict: 'workspace_id,provider' }
  )

  return NextResponse.redirect(new URL('/settings/integrations?connected=' + provider, req.url))
}
