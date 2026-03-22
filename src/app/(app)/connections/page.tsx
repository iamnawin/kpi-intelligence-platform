import { createServerSupabaseClient } from '@/lib/supabase-server'
import { IntegrationCard } from '@/components/integrations/integration-card'
import { Plug } from 'lucide-react'

export const dynamic = 'force-dynamic'

const PROVIDERS = [
  {
    id: 'github' as const,
    name: 'GitHub',
    description: 'Link GitHub issues and PRs as evidence for your achievements.',
    logo: '⚫',
  },
  {
    id: 'jira' as const,
    name: 'Jira',
    description: 'Sync Jira issues as tasks and evidence linked to achievements.',
    logo: '🔵',
  },
  {
    id: 'linear' as const,
    name: 'Linear',
    description: 'Import Linear issues and track their progress as evidence.',
    logo: '🟣',
  },
  {
    id: 'asana' as const,
    name: 'Asana',
    description: 'Pull Asana tasks into your achievements as work evidence.',
    logo: '🟠',
  },
]

export default async function ConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>
}) {
  const { connected, error } = await searchParams
  const supabase = await createServerSupabaseClient()

  const { data: memberRow } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .limit(1)
    .single()

  const workspaceId = memberRow?.workspace_id ?? null

  const connected_providers = new Set<string>()
  const synced_at: Record<string, string | null> = {}
  const provider_settings: Record<string, Record<string, string>> = {}

  if (workspaceId) {
    const { data: integrations } = await supabase
      .from('workspace_integrations')
      .select('provider, synced_at, settings')
      .eq('workspace_id', workspaceId)

    for (const row of integrations ?? []) {
      connected_providers.add(row.provider)
      synced_at[row.provider] = row.synced_at
      provider_settings[row.provider] = (row.settings ?? {}) as Record<string, string>
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-800 bg-gray-900">
          <Plug className="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-50">Connections</h1>
          <p className="mt-1 text-sm text-gray-500">
            Connect your existing tools. Work signals flow in automatically as evidence.
          </p>
        </div>
      </div>

      {connected && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          Successfully connected <strong className="capitalize">{connected}</strong>.
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Connection failed: <strong>{error.replace(/_/g, ' ')}</strong>. Please try again.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PROVIDERS.map(p => (
          <IntegrationCard
            key={p.id}
            provider={p.id}
            name={p.name}
            description={p.description}
            logo={p.logo}
            isConnected={connected_providers.has(p.id)}
            syncedAt={synced_at[p.id] ?? null}
            currentSettings={provider_settings[p.id] ?? {}}
          />
        ))}
      </div>
    </div>
  )
}
