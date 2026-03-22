'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Building2, BarChart2, Target, Shield, ArrowRight, CheckCircle2 } from 'lucide-react'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const STEPS = [
  {
    icon: BarChart2,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    title: 'Connect your KPIs',
    desc: 'Link live metrics from your data sources — revenue, churn, NPS, anything that matters.',
  },
  {
    icon: Target,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
    title: 'Set OKR goals',
    desc: 'Turn KPIs into Objectives with typed Key Results. Track progress from 0% to done.',
  },
  {
    icon: Shield,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    title: 'Build proof',
    desc: 'Every goal builds an evidence chain — from self-reported to system-verified to locked proof.',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const slug = toSlug(name)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!slug) {
      setError('Please enter a valid workspace name')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: rpcError } = await supabase.rpc('create_workspace', {
      p_name: name.trim(),
      p_slug: slug,
    })

    if (rpcError) {
      setError(
        rpcError.message.includes('already taken')
          ? 'That workspace name is taken — try a different one'
          : rpcError.message
      )
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30">
          <Building2 className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white">Create your workspace</h1>
        <p className="mt-2 text-gray-400">
          Your workspace is where your team&apos;s KPIs, goals, and evidence live together.
        </p>
      </div>

      {/* What you'll get */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={i} className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border ${step.bg}`}>
              <step.icon className={`h-4.5 w-4.5 ${step.color}`} />
            </div>
            <p className="mb-1 text-sm font-semibold text-white">{step.title}</p>
            <p className="text-xs leading-relaxed text-gray-500">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-1 text-base font-bold text-white">Name your workspace</h2>
        <p className="mb-5 text-sm text-gray-500">
          This is usually your company or team name. You can change it later.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Workspace name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-700/80 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Acme Inc."
              autoFocus
            />
            {slug && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                URL handle: <span className="font-mono text-gray-400">{slug}</span>
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? 'Creating workspace…' : (
              <>
                Create workspace & get started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
