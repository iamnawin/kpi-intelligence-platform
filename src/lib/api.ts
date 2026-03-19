import { KPI, mockKPIs } from "./mock-data";

// In server components, go directly to Express. In browser, use Next.js rewrites.
const API_BASE =
  typeof window === "undefined"
    ? (process.env.KPI_API_URL ?? "http://localhost:3001")
    : "";

export type EngineResult = {
  insight: string | null;
  actions: string[];
  confidence: number;
  metrics?: { percentageChange: number };
  explanation?: string;
  error?: string;
};

export type EvaluatePayload = {
  kpi: string;
  current_value: number;
  previous_value: number;
  threshold?: number;
  context?: { region?: string; team?: string; timeframe?: string };
};

export async function evaluateKPI(
  payload: EvaluatePayload
): Promise<EngineResult> {
  const res = await fetch(`${API_BASE}/api/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`evaluate failed: ${res.status}`);
  return res.json();
}

export async function fetchKPIs(): Promise<KPI[]> {
  try {
    const res = await fetch(`${API_BASE}/api/kpis`, { cache: "no-store" });
    if (!res.ok) throw new Error(`fetchKPIs failed: ${res.status}`);
    return res.json();
  } catch {
    return mockKPIs;
  }
}
