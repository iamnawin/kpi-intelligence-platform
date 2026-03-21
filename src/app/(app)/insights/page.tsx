import { Sparkles } from "lucide-react"

export default function InsightsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">AI Insights</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          AI-powered analysis of your KPI trends and recommendations.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center dark:border-gray-700 dark:bg-gray-900">
        <Sparkles className="mb-4 h-10 w-10 text-gray-300 dark:text-gray-600" />
        <p className="text-base font-medium text-gray-500 dark:text-gray-400">AI Insights coming in Step 4</p>
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
          This panel will surface automated analysis and action suggestions.
        </p>
      </div>
    </div>
  )
}
