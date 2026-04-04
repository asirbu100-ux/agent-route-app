import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DateNav from '@/components/agent/DateNav'

interface Props {
  searchParams: Promise<{ date?: string }>
}

export default async function RoutePage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const today = new Date().toISOString().split('T')[0]
  const { date } = await searchParams
  const targetDate = date ?? today

  // Fetch route for selected date with points and visit statuses
  const { data: route } = await supabase
    .from('routes')
    .select(`
      id, title, route_date, status,
      route_points (
        id, name, address, sort_order,
        visits ( id, result, submitted_at )
      )
    `)
    .eq('agent_id', user.id)
    .eq('route_date', targetDate)
    .single()

  if (!route) {
    return (
      <div className="px-4 py-4">
        <DateNav currentDate={targetDate} today={today} />
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="text-4xl mb-3">📋</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Маршрут не назначен</h2>
          <p className="text-sm text-gray-500">На {formatDate(targetDate)} маршрут не задан.</p>
        </div>
      </div>
    )
  }

  const points = [...(route.route_points ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  const total = points.length
  const done = points.filter(p => p.visits?.[0]?.submitted_at).length

  return (
    <div className="px-4 py-4">
      <DateNav currentDate={targetDate} today={today} />

      {/* Route header */}
      <div className="mb-4">
        <h1 className="text-lg font-bold text-gray-900">
          {formatDate(route.route_date)}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{done} из {total} точек выполнено</p>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: total > 0 ? `${(done / total) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Points list */}
      <div className="space-y-2">
        {points.map((point, idx) => {
          const visit = point.visits?.[0]
          const status = getStatus(visit)
          return (
            <Link
              key={point.id}
              href={`/route/${point.id}`}
              className="block bg-white rounded-xl border border-gray-200 px-4 py-3 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">{idx + 1}</span>
                    <span className="font-medium text-gray-900 text-sm truncate">{point.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 ml-5 truncate">{point.address}</p>
                </div>
                <StatusBadge status={status} />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function getStatus(visit: { result: string | null; submitted_at: string | null } | undefined) {
  if (!visit) return 'pending'
  if (!visit.submitted_at) return 'open'
  if (visit.result === 'sold') return 'sold'
  return 'not_sold'
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    pending: { label: 'Не начата', className: 'bg-gray-100 text-gray-500' },
    open: { label: 'В процессе', className: 'bg-yellow-100 text-yellow-700' },
    sold: { label: 'Продано', className: 'bg-green-100 text-green-700' },
    not_sold: { label: 'Не продано', className: 'bg-red-100 text-red-700' },
  }[status] ?? { label: status, className: 'bg-gray-100 text-gray-500' }

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${config.className}`}>
      {config.label}
    </span>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  })
}

