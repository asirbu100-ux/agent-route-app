'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/tasks',
    label: 'Задачи',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    match: (path: string) => path === '/tasks' || (path.startsWith('/tasks/') && !path.includes('leaderboard') && !path.includes('report')),
  },
  {
    href: '/tasks/leaderboard',
    label: 'Рейтинг',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    match: (path: string) => path.includes('leaderboard'),
  },
  {
    href: '/tasks/report',
    label: 'Отчёт',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    match: (path: string) => path.includes('report'),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex pb-safe z-50">
      {tabs.map(tab => {
        const isActive = tab.match(pathname)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center py-3 text-xs font-bold transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div className={`mb-0.5 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
              {tab.icon}
            </div>
            {tab.label}
            {isActive && (
              <div className="w-1 h-1 bg-blue-600 rounded-full mt-0.5" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
