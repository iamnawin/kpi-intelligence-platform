import { Sparkles } from "lucide-react"

export default function InsightsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">AI Insights</h1>
        <p className="mt-1 text-sm text-gray-500">
          AI-powered analysis of your KPI trends and recommendations.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
        <Sparkles className="mb-4 h-10 w-10 text-gray-300" />
        <p className="text-base font-medium text-gray-500">AI Insights coming in Step 4</p>
        <p className="mt-1 text-sm text-gray-400">
          This panel will surface automated analysis and action suggestions.
        </p>
      </div>
    </div>
  )
}
