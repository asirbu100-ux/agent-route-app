import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { openVisit } from '@/lib/actions/visits'

interface Props {
  params: Promise<{ pointId: string }>
}

export default async function PointPage({ params }: Props) {
  const { pointId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch point with all details
  const { data: point } = await supabase
    .from('route_points')
    .select(`
      id, name, address, contact_name, contact_phone,
      route_id,
      routes!inner ( status, agent_id ),
      tasks ( id, description, requires_photo ),
      point_products (
        id, target_qty,
        products ( id, name, unit )
      ),
      visits ( id, result, submitted_at, agent_comment, refusal_reason, refusal_comment,
        visit_products ( quantity, products ( name ) )
      )
    `)
    .eq('id', pointId)
    .single()

  if (!point) notFound()

  const routeRaw = Array.isArray(point.routes) ? point.routes[0] : point.routes
  const route = routeRaw as { status: string; agent_id: string } | null
  if (!route || route.agent_id !== user.id) redirect('/route')

  const visit = point.visits?.[0]
  const isSubmitted = !!visit?.submitted_at
  const isActive = route.status === 'active'

  return (
    <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
      {/* Back */}
      <Link href="/route" className="inline-flex items-center gap-1 text-sm text-blue-600">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Назад к маршруту
      </Link>

      {/* Point info */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h1 className="text-lg font-bold text-gray-900">{point.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{point.address}</p>
        {point.contact_name && (
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-medium">Контакт:</span> {point.contact_name}
            {point.contact_phone && ` — ${point.contact_phone}`}
          </p>
        )}
      </div>

      {/* Products to sell */}
      {point.point_products && point.point_products.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Товары для продажи</h2>
          <ul className="space-y-1">
            {point.point_products.map((pp) => {
              const prodRaw = Array.isArray(pp.products) ? pp.products[0] : pp.products
              const prod = prodRaw as { name: string; unit: string } | null
              return (
                <li key={pp.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-800">{prod?.name}</span>
                  {pp.target_qty && (
                    <span className="text-gray-400 text-xs">цель: {pp.target_qty} {prod?.unit}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Tasks */}
      {point.tasks && point.tasks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Задачи</h2>
          <ul className="space-y-2">
            {point.tasks.map((task) => (
              <li key={task.id} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 text-gray-400">•</span>
                <span className="text-gray-800 flex-1">{task.description}</span>
                {task.requires_photo && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    📷 фото
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Visit result (if submitted) */}
      {isSubmitted && visit && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Результат визита</h2>
          <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mb-2 ${
            visit.result === 'sold'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {visit.result === 'sold' ? 'Продано' : 'Не продано'}
          </div>
          {visit.agent_comment && (
            <p className="text-sm text-gray-600 mt-1">{visit.agent_comment}</p>
          )}
        </div>
      )}

      {/* Action button */}
      {isActive && !isSubmitted && (
        <form action={async () => {
          'use server'
          await openVisit(pointId)
          redirect(`/route/${pointId}/report`)
        }}>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            {visit ? 'Продолжить отчёт' : 'Начать визит'}
          </button>
        </form>
      )}

      {isSubmitted && (
        <Link
          href={`/route/${pointId}/report`}
          className="block w-full text-center bg-gray-100 text-gray-600 font-medium py-3 rounded-xl"
        >
          Посмотреть отчёт
        </Link>
      )}
    </div>
  )
}
