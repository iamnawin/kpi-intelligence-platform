"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Bell, Sparkles, Target, CircleDot, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/",                      label: "Dashboard",    icon: LayoutDashboard },
  { href: "/objectives",            label: "Objectives",   icon: CircleDot },
  { href: "/goals",                 label: "Goals",        icon: Target },
  { href: "/alerts",                label: "Alerts",       icon: Bell },
  { href: "/insights",              label: "AI Insights",  icon: Sparkles },
  { href: "/settings/integrations", label: "Integrations", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-800">
        <span className="text-lg font-semibold text-gray-900 dark:text-gray-50">KPI Intel</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              (href === "/" ? pathname === href : pathname === href || pathname.startsWith(href + "/"))
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
