type AuthProbe = {
  ok: boolean
  status: number | null
  statusText: string | null
  error: string | null
}

export type AuthDiagnostics = {
  timestamp: string
  requestOrigin: string | null
  env: {
    nextPublicSupabaseUrl: boolean
    nextPublicSupabaseAnonKey: boolean
    supabaseServiceRoleKey: boolean
    nextPublicAppUrl: boolean
  }
  derived: {
    supabaseHost: string | null
    callbackUrl: string | null
  }
  checks: {
    authSettingsReachable: AuthProbe
  }
  warnings: string[]
}

function hasEnv(name: keyof NodeJS.ProcessEnv) {
  return Boolean(process.env[name]?.trim())
}

function safeOrigin(input?: string | null) {
  if (!input) return null

  try {
    return new URL(input).origin
  } catch {
    return null
  }
}

function safeHost(input?: string | null) {
  if (!input) return null

  try {
    return new URL(input).host
  } catch {
    return null
  }
}

async function probeAuthSettings(url?: string, anonKey?: string): Promise<AuthProbe> {
  if (!url || !anonKey) {
    return {
      ok: false,
      status: null,
      statusText: null,
      error: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
    }
  }

  try {
    const response = await fetch(new URL('/auth/v1/settings', url), {
      method: 'GET',
      headers: { apikey: anonKey },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      error: null,
    }
  } catch (error) {
    return {
      ok: false,
      status: null,
      statusText: null,
      error: error instanceof Error ? error.message : 'Unknown fetch failure',
    }
  }
}

export async function getAuthDiagnostics(requestUrl?: string): Promise<AuthDiagnostics> {
  const requestOrigin =
    safeOrigin(requestUrl) ?? safeOrigin(process.env.NEXT_PUBLIC_APP_URL ?? null)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const diagnostics: AuthDiagnostics = {
    timestamp: new Date().toISOString(),
    requestOrigin,
    env: {
      nextPublicSupabaseUrl: hasEnv('NEXT_PUBLIC_SUPABASE_URL'),
      nextPublicSupabaseAnonKey: hasEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      supabaseServiceRoleKey: hasEnv('SUPABASE_SERVICE_ROLE_KEY'),
      nextPublicAppUrl: hasEnv('NEXT_PUBLIC_APP_URL'),
    },
    derived: {
      supabaseHost: safeHost(supabaseUrl),
      callbackUrl: requestOrigin ? `${requestOrigin}/auth/callback` : null,
    },
    checks: {
      authSettingsReachable: await probeAuthSettings(supabaseUrl, anonKey),
    },
    warnings: [],
  }

  if (!diagnostics.env.nextPublicSupabaseUrl) {
    diagnostics.warnings.push('NEXT_PUBLIC_SUPABASE_URL is missing in the current deployment environment.')
  }

  if (!diagnostics.env.nextPublicSupabaseAnonKey) {
    diagnostics.warnings.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing in the current deployment environment.')
  }

  if (!diagnostics.env.nextPublicAppUrl) {
    diagnostics.warnings.push('NEXT_PUBLIC_APP_URL is not set. OAuth integration callbacks will rely on the request origin instead.')
  }

  if (!diagnostics.checks.authSettingsReachable.ok) {
    diagnostics.warnings.push(
      'Supabase Auth settings endpoint is not reachable from this deployment. Verify the Supabase project is active and the project URL/anon key are correct.'
    )
  }

  if (!diagnostics.requestOrigin) {
    diagnostics.warnings.push('The app could not derive a request origin for the callback URL.')
  }

  return diagnostics
}
