'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import type { DashboardView } from '@/lib/dashboard-data'

const VIEWS: { id: DashboardView; label: string }[] = [
  { id: 'personal', label: 'Personal' },
  { id: 'team',     label: 'Team' },
  { id: 'company',  label: 'Company' },
]

const LS_KEY = 'dashboard_view'

type Props = {
  current: DashboardView
  isAdmin: boolean
}

export function ViewSelector({ current, isAdmin }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Persist selection to localStorage
  useEffect(() => {
    localStorage.setItem(LS_KEY, current)
  }, [current])

  function select(view: DashboardView) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', view)
    router.push(`${pathname}?${params.toString()}`)
  }

  const visibleViews = isAdmin ? VIEWS : VIEWS.filter(v => v.id === 'personal')

  if (visibleViews.length === 1) return null

  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
      {visibleViews.map(v => (
        <button
          key={v.id}
          type="button"
          onClick={() => select(v.id)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            current === v.id
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
        >
          {v.label}
        </button>
      ))}
    </div>
  )
}
