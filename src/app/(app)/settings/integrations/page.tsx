import { createServerSupabaseClient } from '@/lib/supabase-server'
import { IntegrationCard } from '@/components/integrations/integration-card'
import { Settings } from 'lucide-react'

export const dynamic = 'force-dynamic'

const PROVIDERS = [
  {
    id: 'jira' as const,
    name: 'Jira',
    description: 'Sync issues from your Jira project as tasks.',
    logo: '🔵',
  },
  {
    id: 'linear' as const,
    name: 'Linear',
    description: 'Import Linear issues and track their progress.',
    logo: '🟣',
  },
  {
    id: 'asana' as const,
    name: 'Asana',
    description: 'Pull Asana tasks into your goals.',
    logo: '🟠',
  },
  {
    id: 'github' as const,
    name: 'GitHub',
    description: 'Link GitHub issues to goals as evidence.',
    logo: '⚫',
  },
]

export default async function IntegrationsPage({
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

  if (workspaceId) {
    const { data: integrations } = await supabase
      .from('workspace_integrations')
      .select('provider, synced_at')
      .eq('workspace_id', workspaceId)

    for (const row of integrations ?? []) {
      connected_providers.add(row.provider)
      synced_at[row.provider] = row.synced_at
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start gap-3">
        <Settings className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Integrations</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Connect external tools to sync tasks and evidence into your workspace.
          </p>
        </div>
      </div>

      {/* Status banners */}
      {connected && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
          Successfully connected <strong className="capitalize">{connected}</strong>.
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
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
          />
        ))}
      </div>
    </div>
  )
}
