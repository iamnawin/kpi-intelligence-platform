'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getSession } from '@/lib/auth'
import type { IntegrationProvider } from '@/lib/integrations/types'

export async function saveIntegrationSettings(
  provider: IntegrationProvider,
  formData: FormData
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const supabase = await createServerSupabaseClient()

  let settings: Record<string, string> = {}

  switch (provider) {
    case 'github':
      settings = {
        owner: (formData.get('owner') as string ?? '').trim(),
        repo:  (formData.get('repo')  as string ?? '').trim(),
      }
      if (!settings.owner || !settings.repo) return { error: 'Owner and repo are required' }
      break

    case 'jira':
      settings = {
        baseUrl:    (formData.get('baseUrl')    as string ?? '').trim(),
        projectKey: (formData.get('projectKey') as string ?? '').trim(),
        email:      (formData.get('email')      as string ?? '').trim(),
      }
      if (!settings.baseUrl || !settings.projectKey || !settings.email)
        return { error: 'All Jira fields are required' }
      break

    case 'linear':
      settings = {
        teamId: (formData.get('teamId') as string ?? '').trim(),
      }
      break

    case 'asana':
      settings = {
        projectGid: (formData.get('projectGid') as string ?? '').trim(),
      }
      if (!settings.projectGid) return { error: 'Project GID is required' }
      break
  }

  const { error } = await supabase
    .from('workspace_integrations')
    .update({ settings })
    .eq('workspace_id', session.workspaceId)
    .eq('provider', provider)

  if (error) return { error: error.message }

  revalidatePath('/connections')
  return {}
}

export async function saveProfileDetails(formData: FormData): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const roleTitle = (formData.get('role_title') as string ?? '').trim()
  const bio       = (formData.get('bio')        as string ?? '').trim()

  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('workspace_members')
    .update({ role_title: roleTitle || null, bio: bio || null })
    .eq('user_id', session.userId)

  if (error) return { error: error.message }

  revalidatePath('/profile')
  return {}
}
