import { Lock, FileText, Calendar, Tag, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { LockedProofRecord } from '@/lib/goal-data'

const TYPE_LABEL: Record<string, string> = {
  delivered: 'Delivered',
  led: 'Led',
  contributed: 'Contributed',
  improved: 'Improved',
}

const TYPE_COLOR: Record<string, string> = {
  delivered: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  led: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  contributed: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  improved: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
}

type Props = {
  record: LockedProofRecord
}

export function AchievementRecordCard({ record }: Props) {
  const formattedDate = record.approvedAt
    ? new Date(record.approvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  const typeColor = record.achievementType
    ? (TYPE_COLOR[record.achievementType] ?? 'text-gray-400 bg-gray-500/10 border-gray-500/20')
    : null

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-purple-800/30 bg-gradient-to-b from-purple-950/20 to-gray-900 p-5 transition-colors hover:border-purple-700/50">
      {/* Glow accent */}
      <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-purple-600/5 blur-2xl" />

      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 shrink-0 text-purple-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-purple-400">
              Locked Proof
            </span>
          </div>
          <h3 className="text-base font-semibold text-gray-100 leading-snug group-hover:text-white">
            {record.title}
          </h3>
        </div>
        <Link
          href={`/achievements/${record.achievementId}`}
          className="shrink-0 rounded-lg border border-gray-700 p-1.5 text-gray-500 transition-colors hover:border-gray-600 hover:text-gray-300"
          title="View achievement"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Meta chips */}
      <div className="mb-3 flex flex-wrap gap-2">
        {record.achievementType && typeColor && (
          <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${typeColor}`}>
            <Tag className="h-3 w-3" />
            {TYPE_LABEL[record.achievementType] ?? record.achievementType}
          </span>
        )}
        {record.periodLabel && (
          <span className="inline-flex items-center gap-1 rounded-md border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
            <Calendar className="h-3 w-3" />
            {record.periodLabel}
          </span>
        )}
      </div>

      {/* Outcome summary */}
      {record.outcomeSupport && (
        <div className="mb-3 flex gap-2 rounded-lg border border-gray-800 bg-gray-900/60 px-3 py-2.5">
          <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-500" />
          <p className="text-xs leading-relaxed text-gray-400 line-clamp-3">
            {record.outcomeSupport}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">
          {record.evidenceCount} piece{record.evidenceCount !== 1 ? 's' : ''} of evidence
        </span>
        {formattedDate && (
          <span className="text-xs text-gray-600">
            Approved {formattedDate}
          </span>
        )}
      </div>
    </div>
  )
}
