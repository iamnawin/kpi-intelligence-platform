'use client'

import { useState } from 'react'
import { Download, Loader2, Check, AlertCircle, Plug, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { importEvidenceFromProvider } from '@/app/actions/integration-actions'
import type { IntegrationProvider } from '@/lib/integrations/types'

const PROVIDER_META: Record<IntegrationProvider, { label: string; color: string }> = {
  github: { label: 'GitHub', color: 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/60' },
  jira: { label: 'Jira', color: 'border-blue-800/50 hover:border-blue-600/50 hover:bg-blue-900/20' },
  linear: { label: 'Linear', color: 'border-purple-800/50 hover:border-purple-600/50 hover:bg-purple-900/20' },
  asana: { label: 'Asana', color: 'border-orange-800/50 hover:border-orange-600/50 hover:bg-orange-900/20' },
}

type ProviderState = { status: 'idle' | 'loading' | 'done' | 'error'; message?: string }

type Props = {
  achievementId: string
  connectedProviders: IntegrationProvider[]
}

export function EvidenceImportPanel({ achievementId, connectedProviders }: Props) {
  const [states, setStates] = useState<Record<string, ProviderState>>(
    Object.fromEntries(connectedProviders.map(p => [p, { status: 'idle' }]))
  )

  async function handleImport(provider: IntegrationProvider) {
    setStates(prev => ({ ...prev, [provider]: { status: 'loading' } }))

    const result = await importEvidenceFromProvider(achievementId, provider)

    if (result.error) {
      setStates(prev => ({ ...prev, [provider]: { status: 'error', message: result.error } }))
    } else if (result.imported === 0) {
      setStates(prev => ({
        ...prev,
        [provider]: {
          status: 'done',
          message: result.skipped > 0 ? 'All already imported' : 'No completed items found',
        },
      }))
    } else {
      setStates(prev => ({
        ...prev,
        [provider]: { status: 'done', message: `${result.imported} item${result.imported !== 1 ? 's' : ''} imported` },
      }))
    }
  }

  if (connectedProviders.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-700 px-4 py-3">
        <Plug className="h-4 w-4 shrink-0 text-gray-600" />
        <p className="text-xs text-gray-600">
          No tools connected.{' '}
          <Link href="/connections" className="text-blue-500 hover:underline">
            Connect GitHub, Jira, Linear, or Asana
          </Link>{' '}
          to import evidence automatically.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/70 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Import connected evidence</h3>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            Use this step after connecting and syncing tools in Connections. ProofPath imports completed items
            from the connected provider into this specific achievement as evidence.
          </p>
        </div>
        <Link
          href="/connections"
          className="inline-flex items-center gap-1 rounded-lg border border-gray-700 px-2.5 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800"
        >
          Connections
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-3 rounded-lg border border-gray-800 bg-gray-950/70 px-3 py-2 text-xs text-gray-600">
        Step order: connect tool, configure scope, sync workspace tasks, then import the relevant completed
        items into this achievement.
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {connectedProviders.map(provider => {
          const meta = PROVIDER_META[provider]
          const state = states[provider] ?? { status: 'idle' }

          return (
            <button
              key={provider}
              onClick={() => handleImport(provider)}
              disabled={state.status === 'loading' || state.status === 'done'}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors disabled:cursor-default disabled:opacity-70 ${meta.color}`}
            >
              {state.status === 'loading' && <Loader2 className="h-3 w-3 animate-spin" />}
              {state.status === 'done' && <Check className="h-3 w-3 text-emerald-400" />}
              {state.status === 'error' && <AlertCircle className="h-3 w-3 text-red-400" />}
              {state.status === 'idle' && <Download className="h-3 w-3" />}

              <span>
                {state.status === 'idle' && `Import from ${meta.label}`}
                {state.status === 'loading' && 'Importing...'}
                {state.status === 'done' && (state.message ?? 'Done')}
                {state.status === 'error' && (state.message ?? 'Failed')}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
