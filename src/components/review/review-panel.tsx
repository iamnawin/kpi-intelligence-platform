'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, MessageSquare } from 'lucide-react'
import { approveAchievement, requestChanges } from '@/app/actions/review-actions'

type ReviewMode = 'idle' | 'approve' | 'request_changes'

type Props = {
  achievementId: string
}

export function ReviewPanel({ achievementId }: Props) {
  const [mode, setMode] = useState<ReviewMode>('idle')
  const [pending, setPending] = useState(false)

  const boundApprove = approveAchievement.bind(null, achievementId)
  const boundRequestChanges = requestChanges.bind(null, achievementId)

  async function handleSubmit(action: typeof boundApprove, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    try {
      await action(new FormData(e.currentTarget))
    } finally {
      setPending(false)
    }
  }

  if (mode === 'idle') {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
          Manager Review
        </h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setMode('approve')}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve & Lock Proof
          </button>
          <button
            onClick={() => setMode('request_changes')}
            className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800"
          >
            <XCircle className="h-4 w-4" />
            Request Changes
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'approve') {
    return (
      <div className="rounded-xl border border-emerald-800/50 bg-gray-900 p-5">
        <h3 className="mb-1 text-sm font-semibold text-emerald-400">Approve Achievement</h3>
        <p className="mb-4 text-xs text-gray-500">
          This will lock the proof at its current state and elevate trust to{' '}
          <span className="text-purple-400">Locked Proof</span>.
        </p>
        <form onSubmit={e => handleSubmit(boundApprove, e)} className="flex flex-col gap-3">
          <textarea
            name="note"
            rows={3}
            placeholder="Optional review note…"
            className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-emerald-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
            >
              {pending ? 'Approving…' : 'Confirm Approval'}
            </button>
            <button
              type="button"
              onClick={() => setMode('idle')}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  // mode === 'request_changes'
  return (
    <div className="rounded-xl border border-amber-800/50 bg-gray-900 p-5">
      <h3 className="mb-1 text-sm font-semibold text-amber-400">Request Changes</h3>
      <p className="mb-4 text-xs text-gray-500">
        Your note will be added as evidence on this achievement so the owner can act on it.
      </p>
      <form onSubmit={e => handleSubmit(boundRequestChanges, e)} className="flex flex-col gap-3">
        <textarea
          name="note"
          rows={4}
          required
          placeholder="Describe what needs to change…"
          className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-amber-500 focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="flex-1 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500 disabled:opacity-50"
          >
            {pending ? 'Sending…' : 'Send Feedback'}
          </button>
          <button
            type="button"
            onClick={() => setMode('idle')}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
