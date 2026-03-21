import { AlertTriangle, Info, XCircle } from "lucide-react"
import { mockAlerts } from "@/lib/mock-data"
import type { AlertSeverity } from "@/lib/mock-data"

const SEVERITY_CONFIG: Record<AlertSeverity, { icon: React.ElementType; className: string; label: string }> = {
  critical: { icon: XCircle, className: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-900", label: "Critical" },
  warning: { icon: AlertTriangle, className: "text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-900", label: "Warning" },
  info: { icon: Info, className: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-900", label: "Info" },
}

export default function AlertsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Alerts</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          KPI thresholds and anomalies that need your attention.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {mockAlerts.map((alert) => {
          const { icon: Icon, className, label } = SEVERITY_CONFIG[alert.severity]
          return (
            <div
              key={alert.id}
              className={`flex items-start gap-3 rounded-xl border p-4 ${className}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</span>
                  <span className="text-xs opacity-50">·</span>
                  <span className="text-xs opacity-60 font-medium">{alert.kpiName}</span>
                </div>
                <p className="text-sm font-medium">{alert.message}</p>
                <p className="mt-0.5 text-xs opacity-50">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
