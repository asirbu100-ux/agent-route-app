// Data for the manager's period report (page preview + Excel export).
import type { SupabaseClient } from '@supabase/supabase-js'

export type ReportFilters = { from: string; to: string; agentId?: string }

export type ReportItem = {
  date: string
  agent: string
  client: string
  address: string
  product: string
  sku: string
  sold: boolean
  reason: string
}

export type ReportVisit = {
  date: string
  agentId: string
  agent: string
  client: string
  address: string
  startedAt: string | null
  completedAt: string | null
  durationMin: number | null
  sold: number
  refused: number
  hasPhoto: boolean
}

export type ReportAgentRow = {
  agentId: string
  agent: string
  workDays: number
  visits: number
  sold: number
  refused: number
  soldPct: number
  avgDurationMin: number | null
}

export type Report = {
  filters: ReportFilters
  agents: { id: string; full_name: string }[]
  summary: ReportAgentRow[]
  visits: ReportVisit[]
  items: ReportItem[]
  reasons: { reason: string; count: number }[]
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const MAX_DAYS = 366

/** Validate query params; fall back to "1st of this month → today". */
export function parseFilters(params: { from?: string; to?: string; agent?: string }, today: string): ReportFilters {
  const monthStart = today.slice(0, 8) + '01'
  let from = params.from && DATE_RE.test(params.from) ? params.from : monthStart
  let to = params.to && DATE_RE.test(params.to) ? params.to : today
  if (from > to) [from, to] = [to, from]
  // Keep the range bounded so a typo can't pull years of data
  const spanDays = (Date.parse(to) - Date.parse(from)) / 86400000
  if (spanDays > MAX_DAYS) from = new Date(Date.parse(to) - MAX_DAYS * 86400000).toISOString().slice(0, 10)
  const agentId = params.agent && /^[0-9a-f-]{36}$/i.test(params.agent) ? params.agent : undefined
  return { from, to, agentId }
}

function one<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : (v ?? null)
}

type VisitRow = {
  work_day_id: string
  started_at: string | null
  completed_at: string | null
  duration_min: number | null
  photo_path: string | null
  client: { name: string; address: string | null } | { name: string; address: string | null }[] | null
  visit_items: {
    is_sold: boolean
    refusal_reason: string | null
    client_product: { product: { name: string; sku: string | null } | { name: string; sku: string | null }[] | null } | { product: unknown }[] | null
  }[] | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadReport(supabase: SupabaseClient<any, any, any>, filters: ReportFilters): Promise<Report> {
  const { data: agents } = await supabase
    .from('profiles').select('id, full_name').eq('role', 'agent').order('full_name')
  const agentName = new Map((agents ?? []).map(a => [a.id as string, a.full_name as string]))

  let wdQuery = supabase
    .from('work_days').select('id, agent_id, work_date')
    .gte('work_date', filters.from).lte('work_date', filters.to)
  if (filters.agentId) wdQuery = wdQuery.eq('agent_id', filters.agentId)
  const { data: workDays } = await wdQuery
  const wdById = new Map((workDays ?? []).map(w => [w.id as string, w as { id: string; agent_id: string; work_date: string }]))

  // Fetch visits in chunks to keep request URLs short
  const ids = [...wdById.keys()]
  const visitRows: VisitRow[] = []
  for (let i = 0; i < ids.length; i += 100) {
    const { data } = await supabase
      .from('client_visits')
      .select(`
        work_day_id, started_at, completed_at, duration_min, photo_path,
        client:clients (name, address),
        visit_items (is_sold, refusal_reason, client_product:client_products (product:products (name, sku)))
      `)
      .in('work_day_id', ids.slice(i, i + 100))
      .not('completed_at', 'is', null)
    visitRows.push(...((data ?? []) as unknown as VisitRow[]))
  }

  const visits: ReportVisit[] = []
  const items: ReportItem[] = []
  const reasonCount = new Map<string, number>()

  for (const v of visitRows) {
    const wd = wdById.get(v.work_day_id)
    if (!wd) continue
    const client = one(v.client)
    const agent = agentName.get(wd.agent_id) ?? '—'
    let sold = 0, refused = 0
    for (const it of v.visit_items ?? []) {
      const cp = one(it.client_product as { product: unknown } | null)
      const product = one(cp?.product as { name: string; sku: string | null } | null)
      if (it.is_sold) sold++
      else {
        refused++
        const r = it.refusal_reason || 'Без причины'
        reasonCount.set(r, (reasonCount.get(r) ?? 0) + 1)
      }
      items.push({
        date: wd.work_date, agent, client: client?.name ?? '—', address: client?.address ?? '',
        product: product?.name ?? '—', sku: product?.sku ?? '', sold: it.is_sold,
        reason: it.is_sold ? '' : (it.refusal_reason ?? ''),
      })
    }
    visits.push({
      date: wd.work_date, agentId: wd.agent_id, agent, client: client?.name ?? '—', address: client?.address ?? '',
      startedAt: v.started_at, completedAt: v.completed_at, durationMin: v.duration_min,
      sold, refused, hasPhoto: !!v.photo_path,
    })
  }

  const byDate = (a: { date: string; agent: string; client: string }, b: typeof a) =>
    a.date.localeCompare(b.date) || a.agent.localeCompare(b.agent, 'ru') || a.client.localeCompare(b.client, 'ru')
  visits.sort((a, b) => byDate(a, b) || (a.completedAt ?? '').localeCompare(b.completedAt ?? ''))
  items.sort(byDate)

  const summary: ReportAgentRow[] = []
  for (const [id, name] of agentName) {
    if (filters.agentId && id !== filters.agentId) continue
    const days = (workDays ?? []).filter(w => w.agent_id === id).length
    const av = visits.filter(v => v.agentId === id)
    const sold = av.reduce((s, v) => s + v.sold, 0)
    const refused = av.reduce((s, v) => s + v.refused, 0)
    const durations = av.map(v => v.durationMin).filter((d): d is number => d != null)
    summary.push({
      agentId: id, agent: name, workDays: days, visits: av.length, sold, refused,
      soldPct: sold + refused > 0 ? Math.round((sold / (sold + refused)) * 100) : 0,
      avgDurationMin: durations.length ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : null,
    })
  }

  const reasons = [...reasonCount].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count)

  return { filters, agents: (agents ?? []) as { id: string; full_name: string }[], summary, visits, items, reasons }
}
