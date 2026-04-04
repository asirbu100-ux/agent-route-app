import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import RouteBuilder from '@/components/manager/RouteBuilder'
import { publishRoute, deleteRoute } from '@/lib/actions/routes'

interface Props {
  params: Promise<{ routeId: string }>
}

export default async function RouteDetailPage({ params }: Props) {
  const { routeId } = await params
  const supabase = await createClient()

  const [{ data: route }, { data: agents }, { data: products }] = await Promise.all([
    supabase
      .from('routes')
      .select(`
        id, title, route_date, status, agent_id,
        profiles!routes_agent_id_fkey ( full_name ),
        route_points (
          id, name, address, contact_name, contact_phone, sort_order,
          tasks ( description, requires_photo ),
          point_products ( product_id, target_qty )
        )
      `)
      .eq('id', routeId)
      .single(),
    supabase.from('profiles').select('*').eq('role', 'agent').eq('is_active', true).order('full_name'),
    supabase.from('products').select('*').eq('is_active', true).order('name'),
  ])

  if (!route) notFound()

  const isActive = route.status === 'active'
  const isCompleted = route.status === 'completed'

  const sortedPoints = [...(route.route_points ?? [])].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/routes" className="text-sm text-blue-600 hover:text-blue-700">
          ← Маршруты
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">
          {route.title ?? `Маршрут ${formatDate(route.route_date)}`}
        </h1>
        <StatusBadge status={route.status} />
      </div>

      {isCompleted ? (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center text-gray-500">
          Маршрут завершён — редактирование недоступно
        </div>
      ) : (
        <RouteBuilder
          routeId={routeId}
          agents={agents ?? []}
          products={products ?? []}
          initialData={{
            agent_id: route.agent_id,
            route_date: route.route_date,
            title: route.title ?? '',
            points: sortedPoints.map(p => ({
              _key: p.id,
              name: p.name,
              address: p.address,
              contact_name: p.contact_name ?? '',
              contact_phone: p.contact_phone ?? '',
              products: p.point_products ?? [],
              tasks: p.tasks ?? [],
            })),
          }}
        />
      )}

      {/* Danger zone */}
      {!isCompleted && (
        <div className="mt-8 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-medium text-red-700 mb-2">Удалить маршрут</p>
          <form action={async () => {
            'use server'
            await deleteRoute(routeId)
          }}>
            <button
              type="submit"
              className="text-sm text-red-600 border border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
            >
              Удалить
            </button>
          </form>
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
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}
