import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DAY_NAMES } from '@/lib/types/database'
import Link from 'next/link'

export default async function ReportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const today = new Date().toISOString().split('T')[0]
  const jsDay = new Date().getDay()
  const visitDay = jsDay === 0 ? 1 : jsDay === 6 ? 5 : jsDay

  // Get work day
  const { data: workDay } = await supabase
    .from('work_days')
    .select('id, started_at, finished_at')
    .eq('agent_id', user.id)
    .eq('work_date', today)
    .single()

  if (!workDay) redirect('/tasks')

  // Get all visits with details
  const { data: visits } = await supabase
    .from('client_visits')
    .select(`
      id, photo_path, completed_at,
      client:clients (id, name, address),
      visit_items (
        is_sold, refusal_reason,
        client_product:client_products (
          product:products (name)
        )
      )
    `)
    .eq('work_day_id', workDay.id)
    .order('completed_at')

  // Summary stats
  let totalProducts = 0
  let totalSold = 0
  let totalNotSold = 0
  const refusalCounts: Record<string, number> = {}

  for (const visit of visits ?? []) {
    for (const item of visit.visit_items ?? []) {
      totalProducts++
      if (item.is_sold) {
        totalSold++
      } else {
        totalNotSold++
        const reason = item.refusal_reason || 'Без причины'
        refusalCounts[reason] = (refusalCounts[reason] || 0) + 1
      }
    }
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <Link href="/tasks" className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block">
          &larr; Назад
        </Link>
        <h1 className="text-lg font-bold text-gray-900">Отчёт за день</h1>
        <p className="text-sm text-gray-500">
          {DAY_NAMES[visitDay]}, {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-blue-700">{visits?.length ?? 0}</p>
          <p className="text-xs text-blue-500">Клиентов</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-green-700">{totalSold}</p>
          <p className="text-xs text-green-500">Продано</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-red-700">{totalNotSold}</p>
          <p className="text-xs text-red-500">Не продано</p>
        </div>
      </div>

      {/* Refusal reasons */}
      {totalNotSold > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <h2 className="text-sm font-bold text-gray-700 mb-2">Причины отказов</h2>
          {Object.entries(refusalCounts).sort((a, b) => b[1] - a[1]).map(([reason, count]) => (
            <div key={reason} className="flex justify-between text-sm py-1">
              <span className="text-gray-600">{reason}</span>
              <span className="font-medium text-gray-900">{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Per-client details */}
      <h2 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">По клиентам</h2>
      <div className="space-y-3">
        {(visits ?? []).map(visit => {
          const clientRaw = visit.client
          const client = (Array.isArray(clientRaw) ? clientRaw[0] : clientRaw) as { id: string; name: string; address: string | null } | null
          const items = visit.visit_items ?? []
          const sold = items.filter((i: { is_sold: boolean }) => i.is_sold).length
          const notSold = items.filter((i: { is_sold: boolean }) => !i.is_sold).length

          return (
            <div key={visit.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{client?.name}</h3>
                  {client?.address && <p className="text-xs text-gray-400">{client.address}</p>}
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{sold} прод.</span>
                  {notSold > 0 && (
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{notSold} отк.</span>
                  )}
                </div>
              </div>

              {/* Products list */}
              <div className="space-y-1 mb-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {items.map((item: any, i: number) => {
                  const cp = Array.isArray(item.client_product) ? item.client_product[0] : item.client_product
                  const prod = cp ? (Array.isArray(cp.product) ? cp.product[0] : cp.product) : null
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {item.is_sold ? (
                        <span className="text-green-600">&#10003;</span>
                      ) : (
                        <span className="text-red-500">&#10007;</span>
                      )}
                      <span className="text-gray-600 flex-1">{prod?.name ?? '—'}</span>
                      {!item.is_sold && item.refusal_reason && (
                        <span className="text-gray-400">{item.refusal_reason}</span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Photo thumbnail */}
              {visit.photo_path && (
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  Фото загружено
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
