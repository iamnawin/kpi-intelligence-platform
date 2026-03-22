'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getSession } from '@/lib/auth'
import { fetchGitHubIssues } from '@/lib/integrations/github'
import { fetchJiraIssues } from '@/lib/integrations/jira'
import { fetchLinearIssues } from '@/lib/integrations/linear'
import { fetchAsanaTasks } from '@/lib/integrations/asana'
import type { IntegrationProvider } from '@/lib/integrations/types'

type ImportResult = { imported: number; skipped: number; error?: string }

export async function importEvidenceFromProvider(
  achievementId: string,
  provider: IntegrationProvider
): Promise<ImportResult> {
  const session = await getSession()
  if (!session) return { imported: 0, skipped: 0, error: 'Unauthorized' }

  const supabase = await createServerSupabaseClient()

  // Load integration credentials
  const { data: integration } = await supabase
    .from('workspace_integrations')
    .select('access_token, settings')
    .eq('workspace_id', session.workspaceId)
    .eq('provider', provider)
    .single()

  if (!integration?.access_token) {
    return { imported: 0, skipped: 0, error: `${provider} is not connected` }
  }

  // Fetch external items from provider
  const settings = (integration.settings ?? {}) as Record<string, unknown>
  let externalItems

  try {
    switch (provider) {
      case 'github':
        externalItems = await fetchGitHubIssues(integration.access_token, settings as Parameters<typeof fetchGitHubIssues>[1])
        break
      case 'jira':
        externalItems = await fetchJiraIssues(integration.access_token, settings as Parameters<typeof fetchJiraIssues>[1])
        break
      case 'linear':
        externalItems = await fetchLinearIssues(integration.access_token, settings as Parameters<typeof fetchLinearIssues>[1])
        break
      case 'asana':
        externalItems = await fetchAsanaTasks(integration.access_token, settings as Parameters<typeof fetchAsanaTasks>[1])
        break
      default:
        return { imported: 0, skipped: 0, error: 'Unknown provider' }
    }
  } catch (err) {
    return { imported: 0, skipped: 0, error: err instanceof Error ? err.message : 'Fetch failed' }
  }

  // Only import completed/closed items — these represent work done
  const DONE_STATUSES = ['done', 'completed', 'closed', 'merged', 'cancelled']
  const doneItems = externalItems.filter(item =>
    DONE_STATUSES.some(s => item.status.toLowerCase().includes(s))
  )

  if (doneItems.length === 0) {
    return { imported: 0, skipped: externalItems.length }
  }

  // Dedup: fetch existing evidence URLs for this achievement
  const { data: existing } = await supabase
    .from('evidence')
    .select('source_url')
    .eq('goal_id', achievementId)
    .not('source_url', 'is', null)

  const existingUrls = new Set((existing ?? []).map(e => e.source_url).filter(Boolean))

  const newItems = doneItems.filter(item => !existingUrls.has(item.url))

  if (newItems.length === 0) {
    return { imported: 0, skipped: doneItems.length }
  }

  // Insert evidence rows
  const evidenceRows = newItems.map(item => ({
    goal_id:       achievementId,
    title:         item.title,
    description:   item.assignee ? `Assigned to: ${item.assignee}` : null,
    evidence_type: 'link' as const,
    source_url:    item.url,
    source_type:   provider,
    trust_level:   'imported' as const,
    uploaded_by:   session.userId,
  }))

  const { error } = await supabase.from('evidence').insert(evidenceRows)
  if (error) return { imported: 0, skipped: doneItems.length, error: error.message }

  // Recompute achievement trust after new evidence
  await recomputeTrustAfterImport(achievementId)

  revalidatePath(`/achievements/${achievementId}`)

  return { imported: newItems.length, skipped: doneItems.length - newItems.length }
}

// Mirrors the logic in evidence-actions.ts — recomputes trust from all evidence
async function recomputeTrustAfterImport(achievementId: string): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const { data: items } = await supabase
    .from('evidence')
    .select('source_type')
    .eq('goal_id', achievementId)

  const { data: goal } = await supabase
    .from('goals')
    .select('trust_level')
    .eq('id', achievementId)
    .single()

  if (!goal) return

  const PROTECTED = ['reviewer_approved', 'system_verified', 'locked_proof']
  if (PROTECTED.includes(goal.trust_level)) return

  const evidenceList = items ?? []
  const SYSTEM_SOURCES = ['github', 'jira', 'linear', 'asana']

  const total = evidenceList.length
  const systemCount = evidenceList.filter(e => SYSTEM_SOURCES.includes(e.source_type ?? '')).length

  let level = 'draft'
  if (total === 0) level = 'draft'
  else if (systemCount >= 2) level = 'system_verified'
  else if (systemCount >= 1 || total >= 3) level = 'imported'
  else level = 'self_reported'

  await supabase.from('goals').update({ trust_level: level }).eq('id', achievementId)
}

export async function fetchConnectedProviders(workspaceId: string): Promise<IntegrationProvider[]> {
  const supabase = await createServerSupabaseClient()

  const { data } = await supabase
    .from('workspace_integrations')
    .select('provider')
    .eq('workspace_id', workspaceId)
    .not('access_token', 'is', null)

  return (data ?? []).map(r => r.provider as IntegrationProvider)
}
