# 📋 实施计划：UI 骨架 (Step 1)

## 任务类型
- [x] 前端 (Next.js App Router + TypeScript + Tailwind + shadcn/ui)
- [ ] 后端
- [ ] 全栈

---

## Prompt 增强后的需求

**目标**：为 KPI Intelligence Platform 搭建完整的 Next.js UI 骨架，包含所有页面路由、共享布局、核心 UI 组件占位符，以及 mock 数据结构。不涉及真实后端或 AI 能力。

**技术约束**：
- Next.js 14+ App Router（`app/` 目录）
- TypeScript 严格模式
- Tailwind CSS + shadcn/ui 组件库
- Mock 数据（静态 TypeScript 文件，不调用 API）
- 组件可复用、单一职责

**验收标准**：
- `npm run dev` 可正常运行，所有页面可导航
- 侧边栏导航到所有主要页面
- Dashboard 显示 KPI 卡片网格（mock 数据）
- 过滤栏（日期/地区/团队）渲染到位（无逻辑）
- 图表区域显示占位符
- 移动端响应式布局

---

## 技术方案

### 技术栈
| 层 | 选型 | 理由 |
|----|------|------|
| 框架 | Next.js 14 App Router | CLAUDE.md 指定 |
| 样式 | Tailwind CSS | 快速布局，无运行时开销 |
| UI 组件 | shadcn/ui | 可复制、可定制，非黑盒依赖 |
| 图标 | lucide-react | shadcn/ui 默认图标库 |
| 图表占位 | 空 `<div>` with Recharts skeleton | Step 2 再完整实现 |

### 信息架构
```
/ (Dashboard)         ← 主 KPI 概览，卡片网格
/kpis/[id]            ← 单个 KPI 下探视图
/alerts               ← 告警列表
/insights             ← AI 洞察面板（占位）
```

### 布局结构
```
AppShell
├── Sidebar (固定左侧，宽 240px)
│   ├── Logo / Brand
│   ├── NavItem: Dashboard
│   ├── NavItem: Alerts
│   └── NavItem: AI Insights
└── Main Content
    ├── PageHeader (标题 + 面包屑)
    ├── FilterBar (日期范围 | 地区 | 团队)
    └── <children> (页面内容)
```

---

## 实施步骤

### Step 1 — 初始化 Next.js 项目
**产物**：可运行的 Next.js 14 项目

```bash
cd kpi-intelligence-platform
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --yes
```

安装额外依赖：
```bash
npx shadcn@latest init
npx shadcn@latest add button card badge separator skeleton
npm install lucide-react recharts
```

---

### Step 2 — Mock 数据层
**产物**：`src/lib/mock-data.ts`

```typescript
// src/lib/mock-data.ts
export type KPI = {
  id: string
  name: string
  value: number
  unit: string          // "$", "%", "units"
  trend: "up" | "down" | "stable"
  changePercent: number
  category: "revenue" | "operations" | "customer" | "growth"
  sparkline: number[]   // 7 数据点供迷你图用
}

export type Alert = {
  id: string
  kpiId: string
  kpiName: string
  message: string
  severity: "critical" | "warning" | "info"
  timestamp: string
}

export const mockKPIs: KPI[] = [
  { id: "revenue", name: "Monthly Revenue", value: 2400000, unit: "$", trend: "up", changePercent: 12.5, category: "revenue", sparkline: [180, 190, 210, 205, 220, 235, 240] },
  { id: "churn", name: "Churn Rate", value: 3.2, unit: "%", trend: "down", changePercent: -0.8, category: "customer", sparkline: [4.0, 3.9, 3.8, 3.6, 3.4, 3.3, 3.2] },
  { id: "nps", name: "NPS Score", value: 68, unit: "", trend: "up", changePercent: 5, category: "customer", sparkline: [60, 61, 63, 64, 65, 67, 68] },
  { id: "cac", name: "Customer Acquisition Cost", value: 420, unit: "$", trend: "stable", changePercent: 0.5, category: "growth", sparkline: [415, 418, 422, 419, 421, 420, 420] },
  { id: "mrr-growth", name: "MRR Growth", value: 8.4, unit: "%", trend: "up", changePercent: 1.2, category: "revenue", sparkline: [6, 6.5, 7, 7.2, 7.8, 8.1, 8.4] },
  { id: "support-tickets", name: "Open Support Tickets", value: 134, unit: "", trend: "down", changePercent: -15, category: "operations", sparkline: [180, 170, 160, 155, 145, 140, 134] },
]

export const mockAlerts: Alert[] = [
  { id: "a1", kpiId: "churn", kpiName: "Churn Rate", message: "Churn rate increased by 0.3% in APAC region", severity: "warning", timestamp: "2026-03-18T08:00:00Z" },
  { id: "a2", kpiId: "support-tickets", kpiName: "Open Support Tickets", message: "Ticket backlog above 130 for 3 consecutive days", severity: "critical", timestamp: "2026-03-17T14:00:00Z" },
]
```

---

### Step 3 — 共享布局组件
**产物**：`src/components/layout/`

```
src/components/layout/
├── app-shell.tsx       ← 整体外壳（sidebar + main）
├── sidebar.tsx         ← 侧边栏导航
├── page-header.tsx     ← 页面标题栏
└── filter-bar.tsx      ← 过滤栏（日期/地区/团队）
```

**`app-shell.tsx` 伪代码**：
```tsx
export function AppShell({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />                            // 固定 240px 左侧边栏
      <main className="flex-1 overflow-auto">
        <PageHeader />
        <FilterBar />
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
```

**`sidebar.tsx` 伪代码**：
```tsx
const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/insights", label: "AI Insights", icon: Sparkles },
]

export function Sidebar() {
  // 使用 usePathname() 高亮当前路由
  // 响应式：md 以下折叠为图标模式
}
```

**`filter-bar.tsx` 伪代码**：
```tsx
// 三个 shadcn Select 组件
// DateRange | Region (All / APAC / EMEA / Americas) | Team (All / Sales / Engineering / Support)
// 此阶段仅渲染，不联动数据
```

---

### Step 4 — KPI 卡片组件
**产物**：`src/components/kpi/`

```
src/components/kpi/
├── kpi-card.tsx        ← 单个 KPI 卡片
├── kpi-grid.tsx        ← 卡片网格容器
└── trend-badge.tsx     ← 趋势标识（↑12.5%）
```

**`kpi-card.tsx` 伪代码**：
```tsx
export function KPICard({ kpi }: { kpi: KPI }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{kpi.name}</CardTitle>
        <TrendBadge trend={kpi.trend} change={kpi.changePercent} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {kpi.unit === "$" ? "$" : ""}{formatNumber(kpi.value)}{kpi.unit === "%" ? "%" : ""}
        </div>
        {/* Sparkline 占位区域 — Step 2 完整实现 */}
        <div className="h-12 bg-muted rounded mt-2" />
      </CardContent>
    </Card>
  )
}
```

---

### Step 5 — 页面路由
**产物**：`src/app/` 目录下各页面

```
src/app/
├── layout.tsx              ← Root layout（含 AppShell）
├── page.tsx                ← Dashboard: KPIGrid + mockKPIs
├── alerts/
│   └── page.tsx            ← Alert 列表页
├── insights/
│   └── page.tsx            ← AI 洞察占位页
└── kpis/
    └── [id]/
        └── page.tsx        ← 单 KPI 下探页（含图表占位）
```

**`app/page.tsx` 伪代码**：
```tsx
import { mockKPIs } from "@/lib/mock-data"
import { KPIGrid } from "@/components/kpi/kpi-grid"

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">KPI Dashboard</h1>
      <KPIGrid kpis={mockKPIs} />
    </div>
  )
}
```

---

### Step 6 — 响应式验证与收尾
**产物**：所有页面在 375px / 768px / 1280px 下正常渲染

- Sidebar 在 `md` 以下折叠为图标条或汉堡菜单
- KPI 卡片网格：`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- FilterBar 在小屏竖向排列

---

## 关键文件一览

| 文件 | 操作 | 说明 |
|------|------|------|
| `package.json` | 新建 | Next.js 14 + shadcn/ui + Tailwind |
| `src/lib/mock-data.ts` | 新建 | KPI + Alert mock 数据 |
| `src/components/layout/app-shell.tsx` | 新建 | 主布局外壳 |
| `src/components/layout/sidebar.tsx` | 新建 | 侧边栏导航 |
| `src/components/layout/filter-bar.tsx` | 新建 | 过滤栏 |
| `src/components/kpi/kpi-card.tsx` | 新建 | KPI 卡片 |
| `src/components/kpi/kpi-grid.tsx` | 新建 | 卡片网格 |
| `src/app/layout.tsx` | 新建 | Root layout |
| `src/app/page.tsx` | 新建 | Dashboard 页 |
| `src/app/alerts/page.tsx` | 新建 | 告警页 |
| `src/app/insights/page.tsx` | 新建 | AI 洞察占位页 |
| `src/app/kpis/[id]/page.tsx` | 新建 | KPI 下探页 |

---

## 风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| shadcn/ui 初始化配置错误 | 先运行 `npx shadcn@latest init`，检查 `components.json` |
| Next.js 版本与 shadcn 不兼容 | 使用 `npx create-next-app@latest`（自动最新稳定版）|
| Mock 数据结构与 Step 2 不兼容 | KPI type 设计时预留 `sparkline`、`drilldown` 字段 |
| Tailwind 配置丢失 | `create-next-app --tailwind` 自动配置，无需手动 |

---

## SESSION_ID（供 /ccg:execute 使用）
- CODEX_SESSION: N/A（Codex 不可用，由 Claude 直接规划）
- GEMINI_SESSION: N/A（Gemini 不可用，由 Claude 直接规划）
