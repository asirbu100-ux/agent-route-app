import { createClient } from '@/lib/supabase/server'
import { loadReport, parseFilters } from '@/lib/reports'
import { getTodayDate } from '@/lib/utils/date'

const fmtDate = (d: string) =>
  new Date(d + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; agent?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const today = getTodayDate()
  const filters = parseFilters(params, today)
  const report = await loadReport(supabase, filters)

  const qs = new URLSearchParams({ from: filters.from, to: filters.to, ...(filters.agentId ? { agent: filters.agentId } : {}) })
  const totals = report.summary.reduce(
    (t, r) => ({ visits: t.visits + r.visits, sold: t.sold + r.sold, refused: t.refused + r.refused }),
    { visits: 0, sold: 0, refused: 0 },
  )
  const maxReason = Math.max(1, ...report.reasons.map(r => r.count))

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Отчёт за период</h1>
      <p className="text-sm text-gray-500 mb-6">
        {fmtDate(filters.from)} — {fmtDate(filters.to)}
      </p>

      {/* Filters */}
      <form method="get" className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
          С
          <input id="report-from" type="date" name="from" defaultValue={filters.from} max={today}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
          По
          <input id="report-to" type="date" name="to" defaultValue={filters.to} max={today}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-500 min-w-48">
          Агент
          <select id="report-agent" name="agent" defaultValue={filters.agentId ?? ''}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white">
            <option value="">Все агенты</option>
            {report.agents.map(a => <option key={a.id} value={a.id}>{a.full_name}</option>)}
          </select>
        </label>
        <button type="submit" className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold hover:bg-gray-700">
          Показать
        </button>
        <a href={`/reports/export?${qs}`}
          className="ml-auto px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Скачать Excel
        </a>
      </form>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-2xl font-black text-blue-700 tabular-nums">{totals.visits}</p>
          <p className="text-xs text-blue-600">визитов</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-2xl font-black text-green-700 tabular-nums">{totals.sold}</p>
          <p className="text-xs text-green-600">продано позиций</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-2xl font-black text-red-700 tabular-nums">{totals.refused}</p>
          <p className="text-xs text-red-600">отказов</p>
        </div>
      </div>

      {/* Per agent */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
              <th className="px-4 py-3 font-medium">Агент</th>
              <th className="px-4 py-3 font-medium text-right">Раб. дней</th>
              <th className="px-4 py-3 font-medium text-right">Визитов</th>
              <th className="px-4 py-3 font-medium text-right">Продано</th>
              <th className="px-4 py-3 font-medium text-right">Отказов</th>
              <th className="px-4 py-3 font-medium text-right">% продаж</th>
              <th className="px-4 py-3 font-medium text-right">Ср. визит</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {report.summary.map(r => (
              <tr key={r.agentId} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900">{r.agent}</td>
                <td className="px-4 py-3 text-right text-gray-700">{r.workDays}</td>
                <td className="px-4 py-3 text-right text-gray-700">{r.visits}</td>
                <td className="px-4 py-3 text-right text-green-700">{r.sold}</td>
                <td className="px-4 py-3 text-right text-red-600">{r.refused}</td>
                <td className="px-4 py-3 text-right text-gray-700">{r.sold + r.refused > 0 ? `${r.soldPct}%` : '—'}</td>
                <td className="px-4 py-3 text-right text-gray-700">{r.avgDurationMin != null ? `${r.avgDurationMin} мин` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Refusal reasons */}
      {report.reasons.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Причины отказов</h2>
          <div className="space-y-2">
            {report.reasons.map(r => (
              <div key={r.reason} className="flex items-center gap-3 text-sm">
                <span className="w-32 shrink-0 text-gray-600">{r.reason}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: `${(r.count / maxReason) * 100}%` }} />
                </div>
                <span className="w-10 text-right tabular-nums text-gray-900 font-medium">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totals.visits === 0 && (
        <p className="text-gray-400 text-center py-8">За этот период завершённых визитов нет</p>
      )}

      <p className="text-xs text-gray-400 mt-6">
        В Excel 4 листа: сводка по агентам, все визиты, все товары с результатом и причины отказов.
      </p>
    </div>
  )
}
