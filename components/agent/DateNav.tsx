'use client'

import Link from 'next/link'

interface DateNavProps {
  currentDate: string
  today: string
  basePath?: string
}

export default function DateNav({ currentDate, today, basePath = '/route' }: DateNavProps) {
  const cur = new Date(currentDate)

  const prev = new Date(cur)
  prev.setDate(prev.getDate() - 1)
  if (prev.getDay() === 0) prev.setDate(prev.getDate() - 2)
  if (prev.getDay() === 6) prev.setDate(prev.getDate() - 1)

  const next = new Date(cur)
  next.setDate(next.getDate() + 1)
  if (next.getDay() === 6) next.setDate(next.getDate() + 2)
  if (next.getDay() === 0) next.setDate(next.getDate() + 1)

  const prevStr = prev.toISOString().split('T')[0]
  const nextStr = next.toISOString().split('T')[0]
  const isToday = currentDate === today

  return (
    <div className="flex items-center justify-between mb-4">
      <Link
        href={`${basePath}?date=${prevStr}`}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
      >
        ← {new Date(prevStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
      </Link>

      <div className="flex flex-col items-center">
        <input
          type="date"
          value={currentDate}
          onChange={(e) => {
            if (e.target.value) {
              window.location.href = `${basePath}?date=${e.target.value}`
            }
          }}
          className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isToday && (
          <span className="text-xs text-blue-600 font-medium mt-0.5">Сегодня</span>
        )}
      </div>

      <Link
        href={`${basePath}?date=${nextStr}`}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
      >
        {new Date(nextStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} →
      </Link>
    </div>
  )
}
