import { ExternalLink, FileText, StickyNote, BarChart2, Link2 } from "lucide-react"
import { TrustBadge } from "./trust-badge"
import type { EvidenceRecord, EvidenceType } from "@/lib/goal-data"

const TYPE_CONFIG: Record<EvidenceType, { label: string; icon: React.ElementType; className: string }> = {
  note:   { label: 'Note',   icon: StickyNote, className: 'bg-slate-800 text-slate-300' },
  link:   { label: 'Link',   icon: Link2,      className: 'bg-blue-900/50 text-blue-300' },
  file:   { label: 'File',   icon: FileText,   className: 'bg-amber-900/50 text-amber-300' },
  metric: { label: 'Metric', icon: BarChart2,  className: 'bg-purple-900/50 text-purple-300' },
}

const SOURCE_LABEL: Record<string, string> = {
  manual: '', import: 'Imported', github: 'GitHub',
  jira: 'Jira', linear: 'Linear', asana: 'Asana',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function EvidenceCard({ record }: { record: EvidenceRecord }) {
  const typeConfig = TYPE_CONFIG[record.evidence_type] ?? TYPE_CONFIG.note
  const TypeIcon   = typeConfig.icon
  const sourceTag  = SOURCE_LABEL[record.source_type ?? 'manual']

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${typeConfig.className}`}>
            <TypeIcon className="h-3 w-3" aria-hidden="true" />
            {typeConfig.label}
          </span>
          {sourceTag && (
            <span className="inline-flex items-center rounded-full border border-gray-700 px-2 py-0.5 text-xs text-gray-500">
              {sourceTag}
            </span>
          )}
        </div>
        <TrustBadge level={record.trust_level} />
      </div>

      <p className="mb-1 text-sm font-medium text-gray-200">{record.title}</p>

      {record.description && (
        <p className="mb-3 text-sm text-gray-500 line-clamp-2">{record.description}</p>
      )}

      {record.evidence_type === 'link' && record.source_url && (
        <a
          href={record.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 flex items-center gap-1 text-xs text-blue-400 hover:underline"
        >
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
          <span className="truncate">{record.source_url}</span>
        </a>
      )}

      <div className="flex items-center gap-1.5 text-xs text-gray-600">
        {record.uploader_name && (
          <>
            <span>{record.uploader_name}</span>
            <span>·</span>
          </>
        )}
        <span>{formatDate(record.created_at)}</span>
      </div>
    </div>
  )
}
