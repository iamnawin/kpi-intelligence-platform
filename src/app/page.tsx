import { KPIGrid } from "@/components/kpi/kpi-grid"
import { mockKPIs } from "@/lib/mock-data"

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">KPI Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of key performance indicators across your business.
        </p>
      </div>
      <KPIGrid kpis={mockKPIs} />
    </div>
  )
}
