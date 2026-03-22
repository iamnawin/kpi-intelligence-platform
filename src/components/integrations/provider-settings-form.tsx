'use client'

import { useState } from 'react'
import { Settings, ChevronDown, ChevronUp, Check, Loader2 } from 'lucide-react'
import { saveIntegrationSettings } from '@/app/actions/settings-actions'
import type { IntegrationProvider, IntegrationSettings } from '@/lib/integrations/types'

type ProviderSettings = IntegrationSettings[IntegrationProvider]

type Props = {
  provider: IntegrationProvider
  currentSettings: Record<string, string>
}

const FIELDS: Record<IntegrationProvider, { name: string; label: string; placeholder: string; hint?: string }[]> = {
  github: [
    { name: 'owner', label: 'Owner / Org', placeholder: 'acme-corp', hint: 'GitHub username or organization' },
    { name: 'repo',  label: 'Repository',  placeholder: 'my-project', hint: 'Repository name (without owner)' },
  ],
  jira: [
    { name: 'baseUrl',    label: 'Jira URL',     placeholder: 'https://your-org.atlassian.net', hint: 'Your Atlassian domain' },
    { name: 'projectKey', label: 'Project Key',  placeholder: 'PROJ', hint: 'E.g. PROJ, ENG, BACK' },
    { name: 'email',      label: 'Email',        placeholder: 'you@company.com', hint: 'Atlassian account email' },
  ],
  linear: [
    { name: 'teamId', label: 'Team ID', placeholder: 'abc123', hint: 'Found in Linear → Settings → API' },
  ],
  asana: [
    { name: 'projectGid', label: 'Project GID', placeholder: '1234567890', hint: 'Found in the project URL' },
  ],
}

export function ProviderSettingsForm({ provider, currentSettings }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fields = FIELDS[provider]
  const hasSettings = fields.some(f => currentSettings[f.name])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setSaved(false)
    setError(null)

    const result = await saveIntegrationSettings(provider, new FormData(e.currentTarget))

    setPending(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <div className="border-t border-gray-800">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between px-1 py-2 text-xs text-gray-500 hover:text-gray-400"
      >
        <span className="flex items-center gap-1.5">
          <Settings className="h-3 w-3" />
          Configure settings
          {hasSettings && (
            <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400">Configured</span>
          )}
        </span>
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-1 flex flex-col gap-3 pb-2">
          {fields.map(field => (
            <div key={field.name}>
              <label className="mb-1 block text-xs font-medium text-gray-400">
                {field.label}
              </label>
              <input
                name={field.name}
                type="text"
                defaultValue={currentSettings[field.name] ?? ''}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
              />
              {field.hint && (
                <p className="mt-0.5 text-xs text-gray-600">{field.hint}</p>
              )}
            </div>
          ))}

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {pending && <Loader2 className="h-3 w-3 animate-spin" />}
            {saved   && <Check   className="h-3 w-3 text-emerald-300" />}
            {saved ? 'Saved!' : pending ? 'Saving…' : 'Save Settings'}
          </button>
        </form>
      )}
    </div>
  )
}
