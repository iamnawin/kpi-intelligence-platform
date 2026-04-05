'use client'

import { useState } from 'react'
import { RefreshCw, Link2, Link2Off } from 'lucide-react'
import type { IntegrationProvider } from '@/lib/integrations/types'
import { ProviderSettingsForm } from './provider-settings-form'

type Props = {
  provider: IntegrationProvider
  name: string
  description: string
  logo: string
  isConnected: boolean
  syncedAt: string | null
  currentSettings: Record<string, string>
}

export function IntegrationCard({ provider, name, description, logo, isConnected, syncedAt, currentSettings }: Props) {
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)

  async function handleSync() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch(`/api/integrations/${provider}/sync`, { method: 'POST' })
      const data = await res.json() as { synced?: number; error?: string }
      if (!res.ok) {
        setSyncResult(`Error: ${data.error}`)
      } else {
        setSyncResult(`Synced ${data.synced} workspace task${data.synced !== 1 ? 's' : ''}`)
      }
    } catch {
      setSyncResult('Network error')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">{logo}</span>
          <div>
            <p className="text-sm font-semibold text-gray-50">{name}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
          isConnected ? 'bg-green-950 text-green-400' : 'bg-gray-800 text-gray-500'
        }`}>
          {isConnected ? 'Connected' : 'Not connected'}
        </span>
      </div>

      <div className="space-y-1">
        {syncedAt && (
          <p className="text-xs text-gray-600">
            Last synced: {new Date(syncedAt).toLocaleString()}
          </p>
        )}
        <p className="text-xs text-gray-600">
          Sync updates workspace tasks first. Achievement evidence is attached later from the relevant record.
        </p>
      </div>

      {syncResult && (
        <p className={`text-xs ${syncResult.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
          {syncResult}
        </p>
      )}

      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
            <a
              href={`/api/integrations/${provider}/authorize`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800"
            >
              <Link2 className="h-3 w-3" />
              Reconnect
            </a>
          </>
        ) : (
          <a
            href={`/api/integrations/${provider}/authorize`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500"
          >
            <Link2Off className="h-3 w-3" />
            Connect
          </a>
        )}
      </div>

      {isConnected && (
        <ProviderSettingsForm provider={provider} currentSettings={currentSettings} />
      )}
    </div>
  )
}
