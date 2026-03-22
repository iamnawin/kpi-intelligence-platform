'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteEvidence } from '@/app/actions/evidence-actions'

type Props = { evidenceId: string; achievementId: string }

export function EvidenceDeleteButton({ evidenceId, achievementId }: Props) {
  const [pending, setPending] = useState(false)

  async function handleDelete() {
    if (!confirm('Remove this evidence?')) return
    setPending(true)
    try {
      await deleteEvidence(evidenceId, achievementId)
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      aria-label="Delete evidence"
      className="absolute right-3 top-3 hidden rounded-md p-1 text-gray-600 transition-colors hover:bg-red-500/10 hover:text-red-400 group-hover:flex disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}
