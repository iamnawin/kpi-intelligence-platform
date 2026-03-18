import { Sparkles } from "lucide-react"

const INSIGHTS = [
  "Revenue is up 12.5% — growth driven by EMEA expansion in Q1.",
  "Churn rate is improving steadily. Likely linked to recent onboarding changes.",
  "Support ticket volume is down 15% this week — engineering fixes are working.",
]

export function AIInsightStrip() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-5 py-3.5">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-500">
          AI Insight · Preview
        </p>
        <ul className="flex flex-col gap-0.5">
          {INSIGHTS.map((insight, i) => (
            <li key={i} className="text-sm text-blue-800">
              {insight}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
