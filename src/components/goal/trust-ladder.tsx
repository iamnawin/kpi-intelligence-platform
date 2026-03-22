import { CheckCircle2, Circle, Lock } from "lucide-react"
import type { TrustLevel } from "@/lib/goal-data"

const STEPS: { level: TrustLevel; label: string; hint: string }[] = [
  { level: 'draft',             label: 'Draft',             hint: 'No evidence yet' },
  { level: 'self_reported',     label: 'Self Reported',     hint: 'Add at least 1 manual evidence item' },
  { level: 'imported',          label: 'Imported',          hint: 'Add 3+ manual items or 1 connected source' },
  { level: 'reviewer_approved', label: 'Reviewer Approved', hint: 'Ask your manager to approve this achievement' },
  { level: 'system_verified',   label: 'System Verified',   hint: '2+ connected tool sources (GitHub, Jira, etc.)' },
  { level: 'locked_proof',      label: 'Locked Proof',      hint: 'Manager has locked this as portable proof' },
]

const ORDER: Record<TrustLevel, number> = {
  draft: 0, self_reported: 1, imported: 2,
  reviewer_approved: 3, system_verified: 4, locked_proof: 5,
}

const STEP_COLOR: Record<TrustLevel, string> = {
  draft:             'text-gray-500',
  self_reported:     'text-yellow-400',
  imported:          'text-blue-400',
  reviewer_approved: 'text-green-400',
  system_verified:   'text-emerald-400',
  locked_proof:      'text-purple-400',
}

type Props = { current: TrustLevel }

export function TrustLadder({ current }: Props) {
  const currentIdx = ORDER[current]

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
        Trust Level
      </p>

      <div className="flex flex-col gap-0">
        {STEPS.map((step, i) => {
          const done   = i < currentIdx
          const active = i === currentIdx
          const future = i > currentIdx
          const isLast = i === STEPS.length - 1

          return (
            <div key={step.level} className="flex items-start gap-3">
              {/* Track line */}
              <div className="flex flex-col items-center">
                {done ? (
                  <CheckCircle2 className={`h-4 w-4 shrink-0 ${STEP_COLOR[step.level]}`} />
                ) : active ? (
                  <div className={`h-4 w-4 shrink-0 rounded-full border-2 ${STEP_COLOR[step.level].replace('text-', 'border-')} bg-transparent`} />
                ) : step.level === 'locked_proof' ? (
                  <Lock className="h-4 w-4 shrink-0 text-gray-700" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-gray-700" />
                )}
                {!isLast && (
                  <div className={`my-0.5 h-5 w-px ${done ? 'bg-gray-600' : 'bg-gray-800'}`} />
                )}
              </div>

              {/* Label */}
              <div className="pb-4">
                <p className={`text-xs font-semibold ${active ? STEP_COLOR[step.level] : done ? 'text-gray-400' : 'text-gray-700'}`}>
                  {step.label}
                </p>
                {(active || future) && !done && (
                  <p className={`text-[11px] leading-relaxed ${active ? 'text-gray-400' : 'text-gray-700'}`}>
                    {step.hint}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
