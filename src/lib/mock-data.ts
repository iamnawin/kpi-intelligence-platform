export type KPITrend = "up" | "down" | "stable"
export type KPICategory = "revenue" | "operations" | "customer" | "growth"
export type AlertSeverity = "critical" | "warning" | "info"

export type KPI = {
  id: string
  name: string
  value: number
  unit: string
  trend: KPITrend
  changePercent: number
  category: KPICategory
  sparkline: number[]
}

export type Alert = {
  id: string
  kpiId: string
  kpiName: string
  message: string
  severity: AlertSeverity
  timestamp: string
}

export const mockKPIs: KPI[] = [
  {
    id: "revenue",
    name: "Monthly Revenue",
    value: 2400000,
    unit: "$",
    trend: "up",
    changePercent: 12.5,
    category: "revenue",
    sparkline: [180, 190, 210, 205, 220, 235, 240],
  },
  {
    id: "churn",
    name: "Churn Rate",
    value: 3.2,
    unit: "%",
    trend: "down",
    changePercent: -0.8,
    category: "customer",
    sparkline: [4.0, 3.9, 3.8, 3.6, 3.4, 3.3, 3.2],
  },
  {
    id: "nps",
    name: "NPS Score",
    value: 68,
    unit: "",
    trend: "up",
    changePercent: 5,
    category: "customer",
    sparkline: [60, 61, 63, 64, 65, 67, 68],
  },
  {
    id: "cac",
    name: "Customer Acquisition Cost",
    value: 420,
    unit: "$",
    trend: "stable",
    changePercent: 0.5,
    category: "growth",
    sparkline: [415, 418, 422, 419, 421, 420, 420],
  },
  {
    id: "mrr-growth",
    name: "MRR Growth",
    value: 8.4,
    unit: "%",
    trend: "up",
    changePercent: 1.2,
    category: "revenue",
    sparkline: [6, 6.5, 7, 7.2, 7.8, 8.1, 8.4],
  },
  {
    id: "support-tickets",
    name: "Open Support Tickets",
    value: 134,
    unit: "",
    trend: "down",
    changePercent: -15,
    category: "operations",
    sparkline: [180, 170, 160, 155, 145, 140, 134],
  },
]

export const mockAlerts: Alert[] = [
  {
    id: "a1",
    kpiId: "churn",
    kpiName: "Churn Rate",
    message: "Churn rate increased by 0.3% in APAC region",
    severity: "warning",
    timestamp: "2026-03-18T08:00:00Z",
  },
  {
    id: "a2",
    kpiId: "support-tickets",
    kpiName: "Open Support Tickets",
    message: "Ticket backlog above 130 for 3 consecutive days",
    severity: "critical",
    timestamp: "2026-03-17T14:00:00Z",
  },
  {
    id: "a3",
    kpiId: "revenue",
    kpiName: "Monthly Revenue",
    message: "Revenue target on track — 94% of monthly goal reached",
    severity: "info",
    timestamp: "2026-03-16T09:00:00Z",
  },
]
