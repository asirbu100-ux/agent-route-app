import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function RoutesPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: routes } = await supabase
    .from('routes')
    .select(`
      id, title, route_date, status,
      profiles!routes_agent_id_fkey ( full_name ),
      route_points ( id )
    `)
    .order('route_date', { ascending: false })
    .limit(50)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Маршруты</h1>
        <Link
          href="/routes/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Новый маршрут
        </Link>
      </div>

      {(!routes || routes.length === 0) ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          Маршрутов пока нет
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Агент</th>
                <th className="px-4 py-3 text-left font-medium">Дата</th>
                <th className="px-4 py-3 text-left font-medium">Название</th>
                <th className="px-4 py-3 text-left font-medium">Точек</th>
                <th className="px-4 py-3 text-left font-medium">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {routes.map(route => {
                const agentRaw = Array.isArray(route.profiles) ? route.profiles[0] : route.profiles
                const agent = agentRaw as { full_name: string } | null
                const isToday = route.route_date === today
                return (
                  <tr key={route.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{agent?.full_name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(route.route_date)}
                      {isToday && <span className="ml-1 text-xs text-blue-600">(сегодня)</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{route.title ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{route.route_points?.length ?? 0}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={route.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/routes/${route.id}`}
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                      >
                        Открыть →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    draft: { label: 'Черновик', cls: 'bg-yellow-100 text-yellow-700' },
    active: { label: 'Активен', cls: 'bg-green-100 text-green-700' },
    completed: { label: 'Завершён', cls: 'bg-gray-100 text-gray-600' },
  }[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' }

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.cls}`}>
      {config.label}
    </span>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
