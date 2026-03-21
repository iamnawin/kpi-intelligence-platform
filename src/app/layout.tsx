import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "KPI Intelligence Platform",
  description: "Track KPIs, understand changes, and take action.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}
