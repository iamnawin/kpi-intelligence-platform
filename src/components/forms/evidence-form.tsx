'use client'

import { useState, useRef } from 'react'
import { Plus, Link2, FileText, StickyNote, BarChart2 } from 'lucide-react'

type EvidenceFormProps = {
  action: (formData: FormData) => Promise<void>
}

const TYPES = [
  { value: 'note',   label: 'Note',   icon: StickyNote },
  { value: 'link',   label: 'Link',   icon: Link2 },
  { value: 'file',   label: 'File',   icon: FileText },
  { value: 'metric', label: 'Metric', icon: BarChart2 },
] as const

export function EvidenceForm({ action }: EvidenceFormProps) {
  const [open, setOpen]       = useState(false)
  const [pending, setPending] = useState(false)
  const [type, setType]       = useState<'note' | 'link' | 'file' | 'metric'>('note')
  const formRef               = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    try {
      await action(formData)
      formRef.current?.reset()
      setType('note')
      setOpen(false)
    } finally {
      setPending(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-700 px-4 py-2 text-sm text-gray-500 transition-colors hover:border-violet-500 hover:text-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Evidence
      </button>
    )
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="mt-3 rounded-xl border border-violet-500/30 bg-violet-500/5 p-4"
    >
      <input type="hidden" name="source_type" value="manual" />

      {/* Type selector */}
      <div className="mb-3 flex items-center gap-1.5">
        {TYPES.map(t => {
          const Icon = t.icon
          const active = type === t.value
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? 'bg-violet-600 text-white'
                  : 'border border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400'
              }`}
            >
              <Icon className="h-3 w-3" />
              {t.label}
            </button>
          )
        })}
      </div>
      <input type="hidden" name="evidence_type" value={type} />

      {/* Title */}
      <input
        name="title"
        type="text"
        required
        autoFocus
        placeholder={
          type === 'note'   ? 'What did you observe or record?' :
          type === 'link'   ? 'Short name for this link (e.g. "Q1 Review Doc")' :
          type === 'file'   ? 'File name or short description' :
          'Metric name (e.g. "Churn dropped to 1.8%")'
        }
        className="mb-2 w-full rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
      />

      {/* URL — shown only for link type */}
      {type === 'link' && (
        <input
          name="source_url"
          type="url"
          placeholder="https://..."
          className="mb-2 w-full rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
        />
      )}

      {/* Description */}
      <textarea
        name="description"
        rows={2}
        placeholder="Optional: add more context…"
        className="mb-3 w-full resize-none rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
      />

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          {pending ? 'Saving…' : 'Add Evidence'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-gray-700 px-4 py-1.5 text-sm text-gray-400 transition-colors hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
