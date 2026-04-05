import Link from 'next/link'
import { headers } from 'next/headers'
import { getAuthDiagnostics } from '@/lib/auth-diagnostics'

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        ok
          ? 'border border-green-500/20 bg-green-500/10 text-green-400'
          : 'border border-red-500/20 bg-red-500/10 text-red-400',
      ].join(' ')}
    >
      {ok ? 'OK' : 'Missing'}
    </span>
  )
}

export default async function AuthStatusPage() {
  const headerStore = await headers()
  const protocol = headerStore.get('x-forwarded-proto') ?? 'https'
  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host')
  const requestUrl = host ? `${protocol}://${host}/auth-status` : undefined
  const diagnostics = await getAuthDiagnostics(requestUrl)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Auth diagnostics</h1>
        <p className="mt-1.5 text-sm text-gray-400">
          Deployment-safe checks for the current Vercel environment and Supabase auth reachability.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Browser auth prerequisites</h2>
            <p className="mt-1 text-xs text-gray-500">
              Login and signup need the public Supabase URL and anon key in Production.
            </p>
          </div>
          <StatusBadge
            ok={
              diagnostics.env.nextPublicSupabaseUrl &&
              diagnostics.env.nextPublicSupabaseAnonKey
            }
          />
        </div>

        <div className="mt-4 grid gap-3 text-sm text-gray-300">
          <div className="flex items-center justify-between rounded-xl border border-gray-800 px-4 py-3">
            <span>NEXT_PUBLIC_SUPABASE_URL</span>
            <StatusBadge ok={diagnostics.env.nextPublicSupabaseUrl} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-gray-800 px-4 py-3">
            <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
            <StatusBadge ok={diagnostics.env.nextPublicSupabaseAnonKey} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-gray-800 px-4 py-3">
            <span>SUPABASE_SERVICE_ROLE_KEY</span>
            <StatusBadge ok={diagnostics.env.supabaseServiceRoleKey} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-gray-800 px-4 py-3">
            <span>NEXT_PUBLIC_APP_URL</span>
            <StatusBadge ok={diagnostics.env.nextPublicAppUrl} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <h2 className="text-sm font-semibold text-white">Derived URLs</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div className="rounded-xl border border-gray-800 px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-gray-500">Request origin</div>
            <div className="mt-1 break-all text-gray-300">{diagnostics.requestOrigin ?? 'Unavailable'}</div>
          </div>
          <div className="rounded-xl border border-gray-800 px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-gray-500">Auth callback</div>
            <div className="mt-1 break-all text-gray-300">{diagnostics.derived.callbackUrl ?? 'Unavailable'}</div>
          </div>
          <div className="rounded-xl border border-gray-800 px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-gray-500">Supabase host</div>
            <div className="mt-1 break-all text-gray-300">{diagnostics.derived.supabaseHost ?? 'Unavailable'}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Supabase auth reachability</h2>
            <p className="mt-1 text-xs text-gray-500">
              Server-side probe to the project's auth settings endpoint.
            </p>
          </div>
          <StatusBadge ok={diagnostics.checks.authSettingsReachable.ok} />
        </div>

        <div className="mt-4 rounded-xl border border-gray-800 px-4 py-3 text-sm text-gray-300">
          <div>Status: {diagnostics.checks.authSettingsReachable.status ?? 'No response'}</div>
          <div className="mt-1">
            Status text: {diagnostics.checks.authSettingsReachable.statusText ?? 'Unavailable'}
          </div>
          <div className="mt-1 break-all">
            Error: {diagnostics.checks.authSettingsReachable.error ?? 'None'}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
        <h2 className="text-sm font-semibold text-amber-300">Warnings</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-amber-100/90">
          {diagnostics.warnings.length > 0 ? (
            diagnostics.warnings.map(warning => <li key={warning}>{warning}</li>)
          ) : (
            <li>No deployment warnings detected by this page.</li>
          )}
        </ul>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm">
        <Link href="/login" className="text-blue-400 transition-colors hover:text-blue-300">
          Back to sign in
        </Link>
        <Link href="/api/diagnostics/auth" className="text-blue-400 transition-colors hover:text-blue-300">
          Raw JSON
        </Link>
      </div>
    </div>
  )
}
