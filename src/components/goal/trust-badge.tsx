import type { TrustLevel } from "@/lib/goal-data"

const TRUST_CONFIG: Record<TrustLevel, { label: string; className: string }> = {
  draft:              { label: 'Draft',             className: 'bg-gray-100 text-gray-500' },
  self_reported:      { label: 'Self Reported',     className: 'bg-yellow-100 text-yellow-700' },
  imported:           { label: 'Imported',          className: 'bg-blue-100 text-blue-700' },
  reviewer_approved:  { label: 'Reviewer Approved', className: 'bg-green-100 text-green-700' },
  system_verified:    { label: 'System Verified',   className: 'bg-emerald-100 text-emerald-800' },
  locked_proof:       { label: 'Locked Proof',      className: 'bg-purple-100 text-purple-700' },
}

export function TrustBadge({ level }: { level: TrustLevel }) {
  const config = TRUST_CONFIG[level] ?? TRUST_CONFIG.draft
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
