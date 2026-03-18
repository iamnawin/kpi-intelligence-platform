# KPI Intelligence Platform

An AI-powered KPI dashboard that helps managers track KPIs, understand changes, and take action.

## Problem

Most tools show numbers but do not explain why they changed or what to do next.

## Solution

A platform that displays KPI dashboards, provides trend analysis, explains changes using AI, and suggests actions.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Dashboard (KPI overview)
│   ├── alerts/             # Alerts list
│   ├── insights/           # AI Insights (coming in Step 4)
│   └── kpis/[id]/          # KPI drill-down detail
├── components/
│   ├── layout/             # AppShell, Sidebar, FilterBar
│   └── kpi/                # KPICard, KPIGrid, TrendBadge
└── lib/
    ├── mock-data.ts         # Mock KPI + Alert data
    └── utils.ts             # cn(), formatNumber()
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features (Current: Step 1 — UI Skeleton)

- [x] KPI dashboard with card grid
- [x] Sidebar navigation
- [x] Date / Region / Team filters
- [x] KPI drill-down pages
- [x] Alerts page
- [x] Responsive layout

## Roadmap

| Step | Feature | Status |
|------|---------|--------|
| 1 | UI Skeleton | ✅ Done |
| 2 | One KPI end-to-end (charts + real drill-down) | 🔜 Next |
| 3 | Backend API | ⬜ Planned |
| 4 | AI Insights | ⬜ Planned |
