'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const slug = toSlug(name);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!slug) {
      setError('Please enter a valid workspace name');
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: rpcError } = await supabase.rpc('create_workspace', {
      p_name: name.trim(),
      p_slug: slug,
    });

    if (rpcError) {
      setError(
        rpcError.message.includes('already taken')
          ? 'That workspace name is taken — try a different one'
          : rpcError.message
      );
      setLoading(false);
      return;
    }

    router.push('/');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Create your workspace</h1>
          <p className="mt-1 text-sm text-gray-500">
            This is where your team&apos;s KPIs and goals will live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Workspace name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Acme Inc."
            />
            {slug && (
              <p className="mt-1 text-xs text-gray-400">
                URL: <span className="font-mono">{slug}</span>
              </p>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}
