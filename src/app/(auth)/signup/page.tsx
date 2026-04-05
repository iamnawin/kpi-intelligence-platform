'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  getAuthClientConfigError,
  normalizeAuthClientErrorMessage,
} from '@/lib/auth-client-errors'
import { ArrowRight, CheckCircle2, Mail } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    const configError = getAuthClientConfigError()
    if (configError) {
      setError(configError)
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })

      if (signUpError) {
        setError(normalizeAuthClientErrorMessage(signUpError.message))
        return
      }

      setSent(true)
    } catch {
      setError(normalizeAuthClientErrorMessage('Failed to fetch'))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10">
          <Mail className="h-7 w-7 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Check your inbox</h2>
        <p className="mt-2 text-sm text-gray-400">
          We sent a confirmation link to{' '}
          <span className="font-medium text-white">{email}</span>
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Click the link to activate your account and set up your workspace.
        </p>
        <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
            <p className="text-xs text-gray-400">
              After confirming your email, you&apos;ll be guided through setting up your first workspace and connecting your KPIs.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Start for free</h1>
        <p className="mt-1.5 text-sm text-gray-400">
          Create your ProofPath workspace in 2 minutes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Work email
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
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-700/80 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Confirm password
          </label>
          <input
            type="password"
            required
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="w-full rounded-xl border border-gray-700/80 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            autoComplete="new-password"
          />
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
          {loading ? 'Creating account…' : (
            <>
              Create account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-gray-600">
        By signing up, you agree to our{' '}
        <span className="text-gray-500">Terms of Service</span> and{' '}
        <span className="text-gray-500">Privacy Policy</span>.
      </p>

      <p className="mt-3 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
