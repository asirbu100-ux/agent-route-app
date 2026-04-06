import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DAY_NAMES } from '@/lib/types/database'
import { getTodayDate, getTodayDayOfWeek } from '@/lib/utils/date'
import StartDayButton from './StartDayButton'
import FinishDayButton from './FinishDayButton'
import Link from 'next/link'

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>
}) {
  const { day: dayParam } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const today = getTodayDate()
  const todayDay = getTodayDayOfWeek()
  const visitDay = dayParam ? Math.max(1, Math.min(5, parseInt(dayParam))) : todayDay
  const isToday = visitDay === todayDay

  // Check if work day started
  const { data: workDay } = await supabase
    .from('work_days')
    .select('id, started_at, finished_at')
    .eq('agent_id', user.id)
    .eq('work_date', today)
    .single()

  // Agent stats for header
  const { data: myStats } = await supabase
    .from('agent_stats')
    .select('points, streak_days, total_sold, total_visits')
    .eq('agent_id', user.id)
    .single()

  // Day tabs
  const dayTabs = (
    <div className="flex gap-1.5 mb-4">
      {[1, 2, 3, 4, 5].map(d => (
        <Link
          key={d}
          href={`/tasks?day=${d}`}
          className={`flex-1 text-center py-2.5 text-sm font-bold rounded-xl transition-all ${
            d === visitDay
              ? 'bg-blue-600 text-white shadow-md'
              : d === todayDay
              ? 'bg-blue-50 text-blue-700 border-2 border-blue-300'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {DAY_NAMES[d]?.slice(0, 2)}
        </Link>
      ))}
    </div>
  )

  // Mini stats bar (always visible)
  const statsBar = myStats && (
    <div className="flex gap-2 mb-4 text-xs">
      <span className="bg-yellow-50 text-yellow-700 font-bold px-2.5 py-1 rounded-full">
        ⭐ {myStats.points} очков
      </span>
      {myStats.streak_days > 0 && (
        <span className="bg-orange-50 text-orange-700 font-bold px-2.5 py-1 rounded-full">
          🔥 {myStats.streak_days} дней
        </span>
      )}
      <span className="bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded-full">
        ✓ {myStats.total_sold} продаж
      </span>
    </div>
  )

  // Day finished and viewing today
  if (workDay?.finished_at && isToday) {
    return (
      <div className="p-4">
        {dayTabs}
        {statsBar}
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">День завершён</h1>
          <Link href="/tasks/report"
            className="mt-4 bg-blue-600 text-white font-bold py-4 px-10 rounded-2xl text-base shadow-lg active:scale-95">
            Посмотреть отчёт
          </Link>
        </div>
      </div>
    )
  }

  // Day not started and viewing today
  if (!workDay && isToday) {
    return (
      <div className="p-4">
        {dayTabs}
        {statsBar}
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <p className="text-lg text-gray-500 mb-2">
            {DAY_NAMES[visitDay]}, {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', timeZone: 'Europe/Chisinau' })}
          </p>
          <h1 className="text-2xl font-black text-gray-900 mb-8">Доброе утро!</h1>
          <StartDayButton />
        </div>
      </div>
    )
  }

  // Load clients for selected day
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, address, client_products (id)')
    .eq('agent_id', user.id)
    .eq('visit_day', visitDay)
    .eq('is_active', true)
    .order('name')

  // Visits for today only
  let visitMap = new Map<string, { completed_at: string | null }>()
  if (isToday && workDay) {
    const { data: visits } = await supabase
      .from('client_visits')
      .select('id, client_id, completed_at')
      .eq('work_day_id', workDay.id)
    visitMap = new Map((visits ?? []).map(v => [v.client_id, v]))
  }

  // Carryover (works for all days)
  const clientIds = (clients ?? []).map(c => c.id)
  const carryoverMap = new Map<string, number>()
  if (clientIds.length > 0) {
    const { data: prevVisits } = await supabase
      .from('client_visits')
      .select('client_id, visit_items (is_sold)')
      .in('client_id', clientIds)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })

    const seen = new Set<string>()
    for (const v of prevVisits ?? []) {
      if (seen.has(v.client_id)) continue
      seen.add(v.client_id)
      const unsold = (v.visit_items ?? []).filter((i: { is_sold: boolean }) => !i.is_sold).length
      if (unsold > 0) carryoverMap.set(v.client_id, unsold)
    }
  }

  const allClients = clients ?? []
  const completedCount = allClients.filter(c => visitMap.get(c.id)?.completed_at).length
  const allDone = completedCount === allClients.length && allClients.length > 0 && isToday
  const progressPct = allClients.length > 0 ? Math.round((completedCount / allClients.length) * 100) : 0
  const totalProducts = allClients.reduce((sum, c) => sum + (c.client_products?.length ?? 0), 0)

  return (
    <div className="p-4">
      {dayTabs}
      {statsBar}

      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900">
            {isToday ? 'Маршрут' : `${DAY_NAMES[visitDay]}`}
          </h1>
          {!isToday && (
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              Просмотр
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex gap-2 mt-3">
          {isToday && workDay ? (
            <>
              <div className="flex-1 bg-blue-50 rounded-xl p-2.5 text-center">
                <p className="text-lg font-black text-blue-700">{completedCount}/{allClients.length}</p>
                <p className="text-xs text-blue-500">визитов</p>
              </div>
              <div className="flex-1 bg-green-50 rounded-xl p-2.5 text-center">
                <p className="text-lg font-black text-green-700">{progressPct}%</p>
                <p className="text-xs text-green-500">выполнено</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 bg-blue-50 rounded-xl p-2.5 text-center">
                <p className="text-lg font-black text-blue-700">{allClients.length}</p>
                <p className="text-xs text-blue-500">клиентов</p>
              </div>
              <div className="flex-1 bg-indigo-50 rounded-xl p-2.5 text-center">
                <p className="text-lg font-black text-indigo-700">{totalProducts}</p>
                <p className="text-xs text-indigo-500">товаров</p>
              </div>
            </>
          )}
          {carryoverMap.size > 0 && (
            <div className="flex-1 bg-orange-50 rounded-xl p-2.5 text-center">
              <p className="text-lg font-black text-orange-700">{carryoverMap.size}</p>
              <p className="text-xs text-orange-500">с долгами</p>
            </div>
          )}
        </div>

        {/* Progress bar (today only) */}
        {isToday && workDay && (
          <div className="mt-3 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${progressPct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${progressPct}%` }} />
          </div>
        )}
      </div>

      {/* Client list */}
      {allClients.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-10 text-center text-gray-400 text-base">
          Нет клиентов на {DAY_NAMES[visitDay]?.toLowerCase()}
        </div>
      ) : (
        <div className="space-y-3">
          {allClients.map(client => {
            const visit = visitMap.get(client.id)
            const isCompleted = !!visit?.completed_at
            const isStarted = !!visit && !isCompleted
            const productsCount = client.client_products?.length ?? 0
            const carryover = carryoverMap.get(client.id) ?? 0

            const href = isToday && workDay
              ? `/tasks/${client.id}?wd=${workDay.id}`
              : `/tasks/${client.id}?view=1&day=${visitDay}`

            return (
              <Link
                key={client.id}
                href={href}
                className={`block rounded-2xl border-2 p-4 transition-all active:scale-[0.98] ${
                  isCompleted ? 'bg-green-50 border-green-300'
                  : isStarted ? 'bg-yellow-50 border-yellow-300'
                  : carryover > 0 ? 'bg-orange-50 border-orange-300'
                  : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Status circle */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isCompleted ? 'bg-green-500' : isStarted ? 'bg-yellow-400'
                    : carryover > 0 ? 'bg-orange-400' : 'bg-gray-200'
                  }`}>
                    {isCompleted ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className={`text-sm font-black ${carryover > 0 ? 'text-white' : 'text-gray-500'}`}>{productsCount}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{client.name}</h3>
                    {client.address && <p className="text-xs text-gray-400 truncate mt-0.5">{client.address}</p>}
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-gray-400">{productsCount} товаров</span>
                      {carryover > 0 && (
                        <span className="text-xs font-bold text-orange-600">{carryover} долг</span>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="shrink-0">
                    {isCompleted ? (
                      <span className="text-xs font-bold text-green-600">✓ Готово</span>
                    ) : isStarted ? (
                      <span className="text-xs font-bold text-yellow-600">В работе</span>
                    ) : isToday && workDay ? (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-600 text-white">Начать</span>
                    ) : (
                      <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Finish day */}
      {allDone && (
        <div className="mt-6">
          <FinishDayButton />
        </div>
      )}
    </div>
  )
}
