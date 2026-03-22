import { Sparkles, ArrowRight } from "lucide-react"

const INSIGHTS = [
  { text: "Revenue is up 12.5% — growth driven by EMEA expansion in Q1.", tag: "Revenue" },
  { text: "Churn rate is improving steadily. Likely linked to recent onboarding changes.", tag: "Retention" },
  { text: "Support ticket volume is down 15% this week — engineering fixes are working.", tag: "Ops" },
]

export function AIInsightStrip() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/60 to-violet-950/40 p-5">
      <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />

      <div className="relative flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/20">
          <Sparkles className="h-4 w-4 text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">AI Insights</span>
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
              Preview
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {INSIGHTS.map((insight, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 rounded border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
                  {insight.tag}
                </span>
                <p className="text-sm leading-relaxed text-blue-100/80">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
        <a href="/insights" className="shrink-0 flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          View all
          <ArrowRight className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
