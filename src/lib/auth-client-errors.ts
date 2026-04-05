const AUTH_CONNECTIVITY_MESSAGE =
  'Authentication service is unreachable. Verify NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and the Supabase project/Auth URL settings for this Vercel deployment.'

export function getAuthClientConfigError(): string | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return AUTH_CONNECTIVITY_MESSAGE
  }

  return null
}

export function normalizeAuthClientErrorMessage(message: string): string {
  if (message.trim().toLowerCase() === 'failed to fetch') {
    return AUTH_CONNECTIVITY_MESSAGE
  }

  return message
}
