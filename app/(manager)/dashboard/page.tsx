import { createClient } from '@/lib/supabase/server'
import { DAY_NAMES } from '@/lib/types/database'
import { getTodayDate, getTodayDayOfWeek } from '@/lib/utils/date'
import Link from 'next/link'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ agent?: string }>
}) {
  const { agent: selectedAgentId } = await searchParams
  const supabase = await createClient()
  const today = getTodayDate()
  const visitDay = getTodayDayOfWeek()

  // Get all agents
  const { data: agents } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'agent')
    .eq('is_active', true)
    .order('full_name')

  // Get today's work days
  const { data: workDays } = await supabase
    .from('work_days')
    .select('id, agent_id, started_at, finished_at')
    .eq('work_date', today)

  const wdMap = new Map((workDays ?? []).map(wd => [wd.agent_id, wd]))

  // Get all visits for today with items
  const workDayIds = (workDays ?? []).map(wd => wd.id)
  let allVisits: { work_day_id: string; client_id: string; completed_at: string | null; photo_path: string | null; client: { name: string } | null; visit_items: { is_sold: boolean; refusal_reason: string | null; client_product: { product: { name: string } | null } | null }[] }[] = []

  if (workDayIds.length > 0) {
    const { data } = await supabase
      .from('client_visits')
      .select(`
        work_day_id, client_id, completed_at, photo_path,
        client:clients (name),
        visit_items (
          is_sold, refusal_reason,
          client_product:client_products (product:products (name))
        )
      `)
      .in('work_day_id', workDayIds)
      .order('completed_at')

    allVisits = (data ?? []) as unknown as typeof allVisits
  }

  // Client counts per agent
  const { data: clientCounts } = await supabase
    .from('clients')
    .select('agent_id')
    .eq('visit_day', visitDay)
    .eq('is_active', true)

  const clientCountMap: Record<string, number> = {}
  for (const c of clientCounts ?? []) {
    clientCountMap[c.agent_id] = (clientCountMap[c.agent_id] || 0) + 1
  }

  // Build summaries
  const agentSummary = (agents ?? []).map(agent => {
    const wd = wdMap.get(agent.id)
    const agentVisits = allVisits.filter(v => v.work_day_id === wd?.id)
    const completed = agentVisits.filter(v => v.completed_at).length
    const total = clientCountMap[agent.id] || 0
    let sold = 0, notSold = 0
    for (const v of agentVisits) {
      for (const item of v.visit_items ?? []) {
        if (item.is_sold) sold++; else notSold++
      }
    }
    return { ...agent, wd, total, completed, sold, notSold, visits: agentVisits }
  })

  // Selected agent details
  const selectedAgent = selectedAgentId ? agentSummary.find(a => a.id === selectedAgentId) : null

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Обзор на сегодня</h1>
      <p className="text-sm text-gray-500 mb-6">
        {DAY_NAMES[visitDay]} &middot; {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
      </p>

      {/* Agent cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {agentSummary.map(agent => {
          const pct = agent.total > 0 ? Math.round((agent.completed / agent.total) * 100) : 0
          return (
            <Link
              key={agent.id}
              href={`/dashboard?agent=${agent.id}`}
              className={`bg-white rounded-xl border p-4 hover:border-blue-300 transition-colors ${
                selectedAgentId === agent.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">{agent.full_name}</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  agent.wd?.finished_at ? 'bg-green-100 text-green-700'
                  : agent.wd ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-500'
                }`}>
                  {agent.wd?.finished_at ? 'Завершил' : agent.wd ? 'Работает' : 'Не начал'}
                </span>
              </div>

              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>{agent.completed}/{agent.total} визитов</span>
                <span className="text-green-600">{agent.sold} прод.</span>
                <span className="text-red-500">{agent.notSold} отк.</span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Selected agent details */}
      {selectedAgent && selectedAgent.visits.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Визиты: {selectedAgent.full_name}
          </h2>
          <div className="space-y-3">
            {selectedAgent.visits.filter(v => v.completed_at).map((visit, idx) => {
              const clientRaw = visit.client
              const client = (Array.isArray(clientRaw) ? clientRaw[0] : clientRaw) as { name: string } | null
              const items = visit.visit_items ?? []
              const sold = items.filter(i => i.is_sold).length
              const notSold = items.filter(i => !i.is_sold).length

              return (
                <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900">{client?.name}</h3>
                    <div className="flex gap-1.5">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{sold} прод.</span>
                      {notSold > 0 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{notSold} отк.</span>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-1 mb-3">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {items.map((item: any, i: number) => {
                      const cp = Array.isArray(item.client_product) ? item.client_product[0] : item.client_product
                      const prod = cp ? (Array.isArray(cp.product) ? cp.product[0] : cp.product) : null
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className={item.is_sold ? 'text-green-600' : 'text-red-500'}>
                            {item.is_sold ? '✓' : '✗'}
                          </span>
                          <span className="text-gray-600 flex-1">{prod?.name ?? '—'}</span>
                          {!item.is_sold && item.refusal_reason && (
                            <span className="text-gray-400">{item.refusal_reason}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Photo indicator */}
                  {visit.photo_path && (
                    <div className="text-xs text-green-600 flex items-center gap-1">
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
      )}

      {selectedAgent && selectedAgent.visits.filter(v => v.completed_at).length === 0 && (
        <p className="text-gray-400 text-center py-8">Нет завершённых визитов</p>
      )}
    </div>
  )
}
