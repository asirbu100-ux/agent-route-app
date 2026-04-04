import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const revalidate = 60 // Auto-refresh every 60s via ISR

export default async function DashboardPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // Fetch all routes for today with full visit data
  const { data: routes } = await supabase
    .from('routes')
    .select(`
      id, title, status, route_date,
      profiles!routes_agent_id_fkey ( id, full_name ),
      route_points (
        id,
        visits ( id, result, submitted_at )
      )
    `)
    .eq('route_date', today)
    .order('created_at')

  if (!routes || routes.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-6">Обзор на сегодня</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          Маршрутов на сегодня не создано
        </div>
      </div>
    )
  }

  // Aggregate totals
  let totalPoints = 0, totalDone = 0, totalSold = 0, totalNotSold = 0
  for (const route of routes) {
    for (const rp of route.route_points ?? []) {
      totalPoints++
      const visit = rp.visits?.[0]
      if (visit?.submitted_at) {
        totalDone++
        if (visit.result === 'sold') totalSold++
        else totalNotSold++
      }
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Обзор на сегодня</h1>
      <p className="text-sm text-gray-500 mb-6">{formatDate(today)}</p>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Агентов" value={routes.length} color="blue" />
        <StatCard label="Точек всего" value={totalPoints} color="gray" />
        <StatCard label="Посещено" value={totalDone} color="indigo" />
        <StatCard label="Продано / Не продано" value={`${totalSold} / ${totalNotSold}`} color="green" />
      </div>

      {/* Per-agent cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map(route => {
          const agentRaw = Array.isArray(route.profiles) ? route.profiles[0] : route.profiles
          const agent = agentRaw as { id: string; full_name: string } | null
          const points = route.route_points ?? []
          const done = points.filter(p => p.visits?.[0]?.submitted_at).length
          const sold = points.filter(p => p.visits?.[0]?.result === 'sold').length
          const notSold = points.filter(
            p => p.visits?.[0]?.submitted_at && p.visits?.[0]?.result === 'not_sold'
          ).length

          return (
            <Link
              key={route.id}
              href={`/agents/${agent?.id}?date=${today}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{agent?.full_name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{route.title ?? 'Маршрут'}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  route.status === 'active' ? 'bg-green-100 text-green-700' :
                  route.status === 'completed' ? 'bg-gray-100 text-gray-500' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {route.status === 'active' ? 'Активен' :
                   route.status === 'completed' ? 'Завершён' : 'Черновик'}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{done} из {points.length} точек</span>
                  <span>{points.length > 0 ? Math.round((done / points.length) * 100) : 0}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: points.length > 0 ? `${(done / points.length) * 100}%` : '0%' }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-3 text-xs">
                <span className="text-green-600 font-medium">✓ {sold} продано</span>
                <span className="text-red-500 font-medium">✗ {notSold} не продано</span>
                <span className="text-gray-400">{points.length - done} осталось</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    gray: 'bg-gray-50 text-gray-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-green-50 text-green-700',
  }[color] ?? 'bg-gray-50 text-gray-700'

  return (
    <div className={`rounded-xl p-4 ${colors}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-0.5 opacity-75">{label}</p>
    </div>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', weekday: 'long',
  })
}
