'use client'

import { useState } from 'react'
import { Pencil, Check, Loader2, X } from 'lucide-react'
import { saveProfileDetails } from '@/app/actions/settings-actions'

type Props = {
  currentRoleTitle: string | null
  currentBio: string | null
}

export function ProfileEditForm({ currentRoleTitle, currentBio }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setSaved(false)
    setError(null)

    const result = await saveProfileDetails(new FormData(e.currentTarget))

    setPending(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => { setSaved(false); setOpen(false) }, 1500)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-gray-600 hover:text-gray-200"
      >
        <Pencil className="h-3 w-3" />
        Edit Profile
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 rounded-xl border border-gray-700 bg-gray-800/40 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400">Edit Profile</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-gray-600 hover:text-gray-400"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Role Title</label>
        <input
          name="role_title"
          type="text"
          defaultValue={currentRoleTitle ?? ''}
          placeholder="e.g. Senior Engineer, Product Manager"
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">Bio</label>
        <textarea
          name="bio"
          rows={3}
          defaultValue={currentBio ?? ''}
          placeholder="A short summary of what you do and what you're proud of…"
          className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
      >
        {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {saved   && <Check   className="h-3.5 w-3.5 text-emerald-300" />}
        {saved ? 'Saved!' : pending ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
