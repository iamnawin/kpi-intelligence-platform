import type { Metadata } from "next"
import { AppShell } from "@/components/layout/app-shell"
import "./globals.css"

export const metadata: Metadata = {
  title: "KPI Intelligence Platform",
  description: "Track KPIs, understand changes, and take action.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
