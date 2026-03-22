"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Bell, Sparkles, Target, CircleDot,
  Settings, ChevronRight, Building2, User2,
} from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = { href: string; label: string; icon: React.ElementType; badge?: string }

const NAV_MAIN: NavItem[] = [
  { href: "/",           label: "Dashboard",   icon: LayoutDashboard },
  { href: "/objectives", label: "Objectives",  icon: CircleDot },
  { href: "/goals",      label: "Goals",       icon: Target },
]

const NAV_ANALYTICS: NavItem[] = [
  { href: "/alerts",     label: "Alerts",      icon: Bell },
  { href: "/insights",   label: "AI Insights", icon: Sparkles },
]

const NAV_SETTINGS: NavItem[] = [
  { href: "/settings/integrations", label: "Integrations", icon: Settings },
]

type Props = {
  workspaceName: string | null
  userEmail: string
  displayName: string
}

function NavGroup({ label, items, pathname }: { label: string; items: NavItem[]; pathname: string }) {
  return (
    <div>
      <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
        {label}
      </p>
      {items.map(({ href, label: itemLabel, icon: Icon }) => {
        const active = href === "/" ? pathname === href : pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-blue-600/15 text-blue-400"
                : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-100"
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300")} />
            <span className="flex-1">{itemLabel}</span>
            {active && <ChevronRight className="h-3 w-3 text-blue-500 opacity-70" />}
          </Link>
        )
      })}
    </div>
  )
}

export function Sidebar({ workspaceName, userEmail, displayName }: Props) {
  const pathname = usePathname()
  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : (userEmail?.[0] ?? 'U').toUpperCase()

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col border-r border-gray-800/60 bg-gray-900/50 backdrop-blur-sm">

      {/* Logo + workspace */}
      <div className="border-b border-gray-800/60 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shadow-sm shadow-blue-500/20">
            <span className="text-xs font-bold text-white">P</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-tight text-white">ProofPath</p>
          </div>
        </div>

        {workspaceName && (
          <div className="mt-3 flex items-center gap-1.5 rounded-md border border-gray-800 bg-gray-800/40 px-2.5 py-1.5">
            <Building2 className="h-3 w-3 shrink-0 text-gray-500" />
            <span className="truncate text-xs font-medium text-gray-400">{workspaceName}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
        <NavGroup label="Overview" items={NAV_MAIN} pathname={pathname} />
        <NavGroup label="Analytics" items={NAV_ANALYTICS} pathname={pathname} />
        <NavGroup label="Settings" items={NAV_SETTINGS} pathname={pathname} />
      </nav>

      {/* User profile */}
      <div className="border-t border-gray-800/60 px-3 py-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-gray-800/60 cursor-pointer">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-600 to-gray-700 text-xs font-semibold text-white shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-gray-300">{displayName || 'User'}</p>
            <p className="truncate text-[10px] text-gray-600">{userEmail}</p>
          </div>
          <User2 className="h-3.5 w-3.5 shrink-0 text-gray-600" />
        </div>
      </div>
    </aside>
  )
}
