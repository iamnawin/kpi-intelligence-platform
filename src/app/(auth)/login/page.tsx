'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  getAuthClientConfigError,
  normalizeAuthClientErrorMessage,
} from '@/lib/auth-client-errors'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const configError = getAuthClientConfigError()
    if (configError) {
      setError(configError)
      return
    }
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        setError(normalizeAuthClientErrorMessage(signInError.message))
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: member } = user
        ? await supabase
            .from('workspace_members')
            .select('workspace_id')
            .eq('user_id', user.id)
            .limit(1)
            .single()
        : { data: null }

      router.push(member ? '/' : '/onboarding')
    } catch {
      setError(normalizeAuthClientErrorMessage('Failed to fetch'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1.5 text-sm text-gray-400">Sign in to your ProofPath workspace</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Email address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-700/80 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="you@company.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Password
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-700/80 bg-gray-800/50 px-4 py-3 pr-11 text-sm text-white placeholder-gray-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <p>{error}</p>
            <Link
              href="/auth-status"
              className="mt-2 inline-block font-medium text-red-300 underline underline-offset-4 transition-colors hover:text-red-200"
            >
              Open auth diagnostics
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-800" />
        <span className="text-xs text-gray-600">or</span>
        <div className="h-px flex-1 bg-gray-800" />
      </div>

      <p className="mt-4 text-center text-sm text-gray-500">
        New to ProofPath?{' '}
        <Link href="/signup" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          Create a free account
        </Link>
      </p>
    </div>
  )
}
