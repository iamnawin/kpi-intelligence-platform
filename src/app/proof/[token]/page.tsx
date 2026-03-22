import { notFound } from 'next/navigation'
import { Lock, Shield, FileText, Calendar, Tag, Trophy, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { EvidenceType } from '@/lib/goal-data'

type Props = { params: Promise<{ token: string }> }

const TYPE_LABEL: Record<string, string> = {
  delivered: 'Delivered', led: 'Led', contributed: 'Contributed', improved: 'Improved',
}

const EVIDENCE_LABEL: Record<EvidenceType, string> = {
  note: 'Note', link: 'Link', file: 'File', metric: 'Metric',
}

export default async function PublicProofPage({ params }: Props) {
  const { token } = await params
  const supabase = await createServerSupabaseClient()

  const { data: record } = await supabase
    .from('achievement_records')
    .select('id, snapshot_data, approved_at, export_token, is_portable, goals(title, description)')
    .eq('export_token', token)
    .eq('is_portable', true)
    .single()

  if (!record) notFound()

  const snapshot = (record.snapshot_data ?? {}) as Record<string, any>
  const goal = snapshot.goal ?? {}
  const evidence: any[] = Array.isArray(snapshot.evidence) ? snapshot.evidence : []
  const liveGoal = record.goals as unknown as { title: string; description: string | null } | null

  const title = liveGoal?.title ?? goal.title ?? 'Achievement'
  const description = liveGoal?.description ?? goal.description ?? null
  const outcomeSupport = goal.outcome_summary ?? null
  const periodLabel = goal.period_label ?? null
  const achievementType = goal.achievement_type ?? null

  const approvedDate = record.approved_at
    ? new Date(record.approved_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12">
      <div className="mx-auto max-w-2xl">

        {/* ProofPath branding */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600">
              <Trophy className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-400">ProofPath</span>
          </div>
          <span className="rounded-full border border-purple-700/40 bg-purple-950/40 px-3 py-1 text-xs font-medium text-purple-300">
            Verified Proof Record
          </span>
        </div>

        {/* Main card */}
        <div className="overflow-hidden rounded-2xl border border-purple-800/30 bg-gradient-to-b from-purple-950/20 to-gray-900">

          {/* Header section */}
          <div className="border-b border-gray-800 p-6">
            <div className="mb-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-purple-400">
                Locked Proof
              </span>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-50">{title}</h1>
            {description && (
              <p className="text-sm text-gray-400">{description}</p>
            )}

            {/* Meta */}
            <div className="mt-4 flex flex-wrap gap-2">
              {achievementType && (
                <span className="inline-flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
                  <Tag className="h-3 w-3" />
                  {TYPE_LABEL[achievementType] ?? achievementType}
                </span>
              )}
              {periodLabel && (
                <span className="inline-flex items-center gap-1 rounded-md border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  {periodLabel}
                </span>
              )}
            </div>
          </div>

          {/* Outcome */}
          {outcomeSupport && (
            <div className="border-b border-gray-800 p-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                Outcome
              </p>
              <div className="flex gap-3">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                <p className="text-sm leading-relaxed text-gray-300">{outcomeSupport}</p>
              </div>
            </div>
          )}

          {/* Evidence */}
          <div className="p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Evidence ({evidence.length})
            </p>
            {evidence.length === 0 ? (
              <p className="text-sm text-gray-600">No evidence attached to this record.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {evidence.map((ev: any, i: number) => (
                  <div
                    key={ev.id ?? i}
                    className="rounded-xl border border-gray-800 bg-gray-900/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200">{ev.title}</p>
                        {ev.description && (
                          <p className="mt-1 text-xs text-gray-500">{ev.description}</p>
                        )}
                      </div>
                      <span className="shrink-0 rounded-md border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs text-gray-500">
                        {EVIDENCE_LABEL[ev.evidence_type as EvidenceType] ?? ev.evidence_type}
                      </span>
                    </div>
                    {ev.source_url && ev.evidence_type === 'link' && (
                      <a
                        href={ev.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {ev.source_url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verification footer */}
          <div className="flex items-center justify-between border-t border-gray-800 bg-gray-900/40 px-6 py-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              Manager-approved proof record
            </div>
            {approvedDate && (
              <span className="text-xs text-gray-600">
                Approved {approvedDate}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-700">
          Verified by{' '}
          <Link href="/" className="text-gray-600 hover:text-gray-400">
            ProofPath
          </Link>
          {' '}· This record is tamper-evident and frozen at the time of approval.
        </p>

      </div>
    </div>
  )
}
