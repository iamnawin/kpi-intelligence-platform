import { createServerSupabaseClient } from '@/lib/supabase-server'
import { IntegrationCard } from '@/components/integrations/integration-card'
import { Plug } from 'lucide-react'
import { getWorkspaceMember } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const PROVIDERS = [
  {
    id: 'github' as const,
    name: 'GitHub',
    description: 'Sync GitHub work signals that can later support achievement evidence.',
    logo: 'G',
  },
  {
    id: 'jira' as const,
    name: 'Jira',
    description: 'Sync Jira work into the workspace so relevant items can support achievements.',
    logo: 'J',
  },
  {
    id: 'linear' as const,
    name: 'Linear',
    description: 'Pull Linear issues into the workspace task layer before linking them to outcomes.',
    logo: 'L',
  },
  {
    id: 'asana' as const,
    name: 'Asana',
    description: 'Bring Asana tasks into ProofPath as source material for achievement evidence.',
    logo: 'A',
  },
]

export default async function ConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>
}) {
  const { connected, error } = await searchParams
  const supabase = await createServerSupabaseClient()
  const member = await getWorkspaceMember()
  const workspaceId = member?.workspaceId ?? null

  const connectedProviders = new Set<string>()
  const syncedAt: Record<string, string | null> = {}
  const providerSettings: Record<string, Record<string, string>> = {}

  if (workspaceId) {
    const { data: integrations } = await supabase
      .from('workspace_integrations')
      .select('provider, synced_at, settings')
      .eq('workspace_id', workspaceId)

    for (const row of integrations ?? []) {
      connectedProviders.add(row.provider)
      syncedAt[row.provider] = row.synced_at
      providerSettings[row.provider] = (row.settings ?? {}) as Record<string, string>
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
            Connect external tools to bring work signals into ProofPath. Connections support achievements;
            they do not replace them.
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Step 1</p>
          <h2 className="mt-2 text-sm font-semibold text-white">Connect a tool</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">
            Authorize Jira, GitHub, Linear, or Asana for the workspace.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Step 2</p>
          <h2 className="mt-2 text-sm font-semibold text-white">Sync work signals</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">
            Sync pulls matching external work into the workspace task layer. It does not automatically prove
            an achievement by itself.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Step 3</p>
          <h2 className="mt-2 text-sm font-semibold text-white">Attach the relevant evidence</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">
            Use the best matching work signals to strengthen an achievement and raise trust through review.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-5">
        <h2 className="text-sm font-semibold text-white">What sync actually does</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-400">
          Sync does not mirror your entire external tool into ProofPath and it does not automatically create proof.
          It pulls matching external work into the workspace task layer first. Later, from an achievement page,
          you import the most relevant completed items as evidence for that record.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PROVIDERS.map(provider => (
          <IntegrationCard
            key={provider.id}
            provider={provider.id}
            name={provider.name}
            description={provider.description}
            logo={provider.logo}
            isConnected={connectedProviders.has(provider.id)}
            syncedAt={syncedAt[provider.id] ?? null}
            currentSettings={providerSettings[provider.id] ?? {}}
          />
        ))}
      </div>
    </div>
  )
}
