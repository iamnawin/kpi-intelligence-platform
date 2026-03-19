import { ExternalLink, FileText, StickyNote, BarChart2 } from "lucide-react"
import { TrustBadge } from "./trust-badge"
import type { EvidenceRecord, EvidenceType } from "@/lib/goal-data"

const TYPE_CONFIG: Record<EvidenceType, { label: string; icon: React.ElementType; className: string }> = {
  note:   { label: 'Note',   icon: StickyNote,    className: 'bg-slate-100 text-slate-600' },
  link:   { label: 'Link',   icon: ExternalLink,  className: 'bg-blue-100 text-blue-600' },
  file:   { label: 'File',   icon: FileText,      className: 'bg-amber-100 text-amber-700' },
  metric: { label: 'Metric', icon: BarChart2,     className: 'bg-purple-100 text-purple-700' },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function EvidenceCard({ record }: { record: EvidenceRecord }) {
  const typeConfig = TYPE_CONFIG[record.evidence_type] ?? TYPE_CONFIG.note
  const TypeIcon = typeConfig.icon

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${typeConfig.className}`}>
            <TypeIcon className="h-3 w-3" aria-hidden="true" />
            {typeConfig.label}
          </span>
        </div>
        <TrustBadge level={record.trust_level} />
      </div>

      <p className="mb-1 text-sm font-medium text-gray-800">{record.title}</p>

      {record.description && (
        <p className="mb-3 text-sm text-gray-500 line-clamp-2">{record.description}</p>
      )}

      {record.evidence_type === 'link' && record.source_url && (
        <a
          href={record.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
          <span className="truncate">{record.source_url}</span>
        </a>
      )}

      <div className="flex items-center gap-1.5 text-xs text-gray-400">
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
