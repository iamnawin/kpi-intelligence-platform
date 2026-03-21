"use client"

const DATE_RANGES = ["Last 7 days", "Last 30 days", "Last 90 days", "Year to date"]
const REGIONS = ["All Regions", "APAC", "EMEA", "Americas"]
const TEAMS = ["All Teams", "Sales", "Engineering", "Support", "Marketing"]

export function FilterBar() {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-800 dark:bg-gray-900">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Filters:</span>
      <select
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        defaultValue={DATE_RANGES[1]}
        aria-label="Date range"
      >
        {DATE_RANGES.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>
      <select
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        defaultValue={REGIONS[0]}
        aria-label="Region"
      >
        {REGIONS.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>
      <select
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        defaultValue={TEAMS[0]}
        aria-label="Team"
      >
        {TEAMS.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
    </div>
  )
}
