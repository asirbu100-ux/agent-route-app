import type { NextRequest } from 'next/server'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/server'
import { loadReport, parseFilters } from '@/lib/reports'
import { getTodayDate } from '@/lib/utils/date'

const TZ = 'Europe/Chisinau'
const time = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('ru-RU', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }) : ''

function sheet(rows: (string | number | null)[][], widths: number[]) {
  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = widths.map(wch => ({ wch }))
  ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(rows.length - 1, 0), c: widths.length - 1 } }) }
  return ws
}

// GET /reports/export?from=YYYY-MM-DD&to=YYYY-MM-DD&agent=<uuid> → .xlsx
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'manager') return new Response('Forbidden', { status: 403 })

  const sp = request.nextUrl.searchParams
  const filters = parseFilters(
    { from: sp.get('from') ?? undefined, to: sp.get('to') ?? undefined, agent: sp.get('agent') ?? undefined },
    getTodayDate(),
  )
  const report = await loadReport(supabase, filters)

  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(wb, sheet([
    ['Агент', 'Рабочих дней', 'Визитов', 'Продано позиций', 'Отказов', '% продаж', 'Ср. визит, мин'],
    ...report.summary.map(r => [r.agent, r.workDays, r.visits, r.sold, r.refused, r.soldPct, r.avgDurationMin]),
    ...(report.summary.length > 1 ? [[
      'Итого',
      report.summary.reduce((s, r) => s + r.workDays, 0),
      report.summary.reduce((s, r) => s + r.visits, 0),
      report.summary.reduce((s, r) => s + r.sold, 0),
      report.summary.reduce((s, r) => s + r.refused, 0),
      null, null,
    ]] : []),
  ], [26, 14, 10, 16, 10, 10, 14]), 'Сводка')

  XLSX.utils.book_append_sheet(wb, sheet([
    ['Дата', 'Агент', 'Клиент', 'Адрес', 'Начало', 'Конец', 'Минут', 'Продано', 'Отказов', 'Фото'],
    ...report.visits.map(v => [v.date, v.agent, v.client, v.address, time(v.startedAt), time(v.completedAt), v.durationMin, v.sold, v.refused, v.hasPhoto ? 'да' : 'нет']),
  ], [12, 22, 28, 36, 8, 8, 8, 10, 10, 6]), 'Визиты')

  XLSX.utils.book_append_sheet(wb, sheet([
    ['Дата', 'Агент', 'Клиент', 'Товар', 'Артикул', 'Результат', 'Причина отказа'],
    ...report.items.map(i => [i.date, i.agent, i.client, i.product, i.sku, i.sold ? 'Продано' : 'Не продано', i.reason]),
  ], [12, 22, 28, 30, 12, 12, 20]), 'Товары')

  XLSX.utils.book_append_sheet(wb, sheet([
    ['Причина отказа', 'Количество'],
    ...report.reasons.map(r => [r.reason, r.count]),
  ], [24, 12]), 'Причины отказов')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
  const agentPart = filters.agentId
    ? '_' + (report.agents.find(a => a.id === filters.agentId)?.full_name ?? 'agent').replace(/\s+/g, '_')
    : ''
  const name = `Отчёт_${filters.from}_${filters.to}${agentPart}.xlsx`

  return new Response(new Uint8Array(buf), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="report.xlsx"; filename*=UTF-8''${encodeURIComponent(name)}`,
      'Cache-Control': 'no-store',
    },
  })
}
