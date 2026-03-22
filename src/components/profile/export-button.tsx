'use client'

import { useState } from 'react'
import { Share2, Copy, Check, EyeOff, Loader2 } from 'lucide-react'
import { enableExport, disableExport } from '@/app/actions/export-actions'

type Props = {
  achievementId: string
  isPortable: boolean
  exportToken: string | null
  appUrl: string
}

export function ExportButton({ achievementId, isPortable, exportToken, appUrl }: Props) {
  const [portable, setPortable] = useState(isPortable)
  const [token, setToken] = useState(exportToken)
  const [copied, setCopied] = useState(false)
  const [pending, setPending] = useState(false)

  const proofUrl = token ? `${appUrl}/proof/${token}` : null

  async function handleEnable() {
    setPending(true)
    try {
      const result = await enableExport(achievementId)
      if ('exportToken' in result) {
        setToken(result.exportToken)
        setPortable(true)
      }
    } finally {
      setPending(false)
    }
  }

  async function handleDisable() {
    setPending(true)
    try {
      await disableExport(achievementId)
      setPortable(false)
    } finally {
      setPending(false)
    }
  }

  async function handleCopy() {
    if (!proofUrl) return
    await navigator.clipboard.writeText(proofUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!portable) {
    return (
      <button
        onClick={handleEnable}
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:border-violet-700/50 hover:bg-violet-900/20 hover:text-violet-300 disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Share2 className="h-3.5 w-3.5" />
        )}
        {pending ? 'Enabling…' : 'Make Portable'}
      </button>
    )
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleCopy}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-violet-700/50 bg-violet-900/20 px-3 py-2 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-900/40"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Copy Proof Link
          </>
        )}
      </button>
      <button
        onClick={handleDisable}
        disabled={pending}
        title="Revoke public access"
        className="rounded-lg border border-gray-700 px-2.5 py-2 text-gray-600 transition-colors hover:border-red-800/50 hover:bg-red-900/20 hover:text-red-400 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <EyeOff className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
