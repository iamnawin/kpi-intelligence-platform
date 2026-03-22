'use client'

import { useState } from 'react'
import { Download, Loader2, Check, AlertCircle, Plug } from 'lucide-react'
import Link from 'next/link'
import { importEvidenceFromProvider } from '@/app/actions/integration-actions'
import type { IntegrationProvider } from '@/lib/integrations/types'

const PROVIDER_META: Record<IntegrationProvider, { label: string; color: string }> = {
  github: { label: 'GitHub',  color: 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/60' },
  jira:   { label: 'Jira',    color: 'border-blue-800/50 hover:border-blue-600/50 hover:bg-blue-900/20' },
  linear: { label: 'Linear',  color: 'border-purple-800/50 hover:border-purple-600/50 hover:bg-purple-900/20' },
  asana:  { label: 'Asana',   color: 'border-orange-800/50 hover:border-orange-600/50 hover:bg-orange-900/20' },
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
        [provider]: { status: 'done', message: result.skipped > 0 ? 'All already imported' : 'No completed items found' },
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
            Connect GitHub, Jira, or Linear
          </Link>{' '}
          to import evidence automatically.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
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
              {state.status === 'loading' && `Importing…`}
              {state.status === 'done' && (state.message ?? 'Done')}
              {state.status === 'error' && (state.message ?? 'Failed')}
            </span>
          </button>
        )
      })}
    </div>
  )
}
