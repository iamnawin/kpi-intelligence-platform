import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { fetchJiraIssues } from '@/lib/integrations/jira'
import { fetchLinearIssues } from '@/lib/integrations/linear'
import { fetchAsanaTasks } from '@/lib/integrations/asana'
import { fetchGitHubIssues } from '@/lib/integrations/github'
import type { IntegrationProvider, ExternalTask } from '@/lib/integrations/types'

const SYNC_COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const validProviders: IntegrationProvider[] = ['jira', 'linear', 'asana', 'github']
  if (!validProviders.includes(provider as IntegrationProvider)) {
    return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const p = provider as IntegrationProvider

  // Resolve workspace
  const { data: memberRow } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!memberRow?.workspace_id) {
    return NextResponse.json({ error: 'No workspace' }, { status: 400 })
  }

  const workspaceId = memberRow.workspace_id

  // Load integration record
  const { data: integration } = await supabase
    .from('workspace_integrations')
    .select('access_token, settings, synced_at')
    .eq('workspace_id', workspaceId)
    .eq('provider', p)
    .single()

  if (!integration?.access_token) {
    return NextResponse.json({ error: 'Not connected' }, { status: 400 })
  }

  // Enforce sync cooldown
  if (integration.synced_at) {
    const elapsed = Date.now() - new Date(integration.synced_at).getTime()
    if (elapsed < SYNC_COOLDOWN_MS) {
      const waitSec = Math.ceil((SYNC_COOLDOWN_MS - elapsed) / 1000)
      return NextResponse.json(
        { error: `Sync cooldown active. Try again in ${waitSec}s.` },
        { status: 429 }
      )
    }
  }

  // Fetch issues from provider
  let externalTasks: ExternalTask[]
  const settings = (integration.settings ?? {}) as Record<string, unknown>

  try {
    switch (p) {
      case 'jira':
        externalTasks = await fetchJiraIssues(integration.access_token, settings as Parameters<typeof fetchJiraIssues>[1])
        break
      case 'linear':
        externalTasks = await fetchLinearIssues(integration.access_token, settings as Parameters<typeof fetchLinearIssues>[1])
        break
      case 'asana':
        externalTasks = await fetchAsanaTasks(integration.access_token, settings as Parameters<typeof fetchAsanaTasks>[1])
        break
      case 'github':
        externalTasks = await fetchGitHubIssues(integration.access_token, settings as Parameters<typeof fetchGitHubIssues>[1])
        break
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Fetch failed' },
      { status: 502 }
    )
  }

  // Upsert tasks (dedup on external_id + source)
  const records = externalTasks.map(t => ({
    workspace_id: workspaceId,
    title:        t.title,
    status:       mapStatus(t.status),
    external_id:  t.externalId,
    source:       p,
    external_url: t.url,
    due_date:     t.dueDate ?? null,
  }))

  const { data: upserted, error } = await supabase
    .from('tasks')
    .upsert(records, { onConflict: 'workspace_id,source,external_id', ignoreDuplicates: false })
    .select('id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update synced_at
  await supabase
    .from('workspace_integrations')
    .update({ synced_at: new Date().toISOString() })
    .eq('workspace_id', workspaceId)
    .eq('provider', p)

  return NextResponse.json({ synced: upserted?.length ?? 0 })
}

function mapStatus(externalStatus: string): string {
  const s = externalStatus.toLowerCase()
  if (s.includes('done') || s.includes('complet') || s.includes('closed') || s.includes('merged')) return 'done'
  if (s.includes('progress') || s.includes('active') || s.includes('open')) return 'in_progress'
  if (s.includes('cancel') || s.includes('won\'t')) return 'cancelled'
  return 'todo'
}
