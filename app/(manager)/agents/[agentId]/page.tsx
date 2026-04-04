import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { REFUSAL_REASON_LABELS } from '@/lib/types/database'
import { getPhotoViewUrl } from '@/lib/actions/photos'

interface Props {
  params: Promise<{ agentId: string }>
  searchParams: Promise<{ date?: string }>
}

export default async function AgentDetailPage({ params, searchParams }: Props) {
  const { agentId } = await params
  const { date } = await searchParams
  const today = new Date().toISOString().split('T')[0]
  const targetDate = date ?? today

  const supabase = await createClient()

  // Agent profile
  const { data: agent } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .eq('id', agentId)
    .single()

  if (!agent) notFound()

  // Route for this date
  const { data: route } = await supabase
    .from('routes')
    .select(`
      id, title, status,
      route_points (
        id, name, address, sort_order,
        tasks ( id, description, requires_photo ),
        point_products ( products ( name, unit ) ),
        visits (
          id, result, submitted_at, arrived_at,
          refusal_reason, refusal_comment, agent_comment,
          visit_products ( quantity, products ( name, unit ) ),
          visit_photos ( id, storage_path, task_id )
        )
      )
    `)
    .eq('agent_id', agentId)
    .eq('route_date', targetDate)
    .single()

  const points = route
    ? [...(route.route_points ?? [])].sort((a, b) => a.sort_order - b.sort_order)
    : []

  const submittedVisits = points.filter(p => p.visits?.[0]?.submitted_at)
  const soldCount = submittedVisits.filter(p => p.visits?.[0]?.result === 'sold').length
  const notSoldCount = submittedVisits.filter(p => p.visits?.[0]?.result === 'not_sold').length

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{agent.full_name}</h1>
          {agent.phone && <p className="text-sm text-gray-500">{agent.phone}</p>}
        </div>
        <DatePicker currentDate={targetDate} agentId={agentId} />
      </div>

      {!route ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          Маршрут на {formatDate(targetDate)} не найден
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-blue-700">{submittedVisits.length}/{points.length}</p>
              <p className="text-xs text-blue-600">посещено</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-green-700">{soldCount}</p>
              <p className="text-xs text-green-600">продано</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-red-700">{notSoldCount}</p>
              <p className="text-xs text-red-600">не продано</p>
            </div>
          </div>

          {/* Points table */}
          <div className="space-y-4">
            {points.map((point, idx) => {
              const visit = point.visits?.[0]
              const isSubmitted = !!visit?.submitted_at

              return (
                <div key={point.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Point header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                    <span className="text-xs text-gray-400 font-medium w-4">{idx + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{point.name}</p>
                      <p className="text-xs text-gray-500">{point.address}</p>
                    </div>
                    {!isSubmitted ? (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {visit ? 'В процессе' : 'Не начат'}
                      </span>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        visit?.result === 'sold'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {visit?.result === 'sold' ? 'Продано' : 'Не продано'}
                      </span>
                    )}
                  </div>

                  {/* Visit details */}
                  {isSubmitted && visit && (
                    <div className="px-4 py-3 space-y-3">
                      {/* Arrival time */}
                      {visit.arrived_at && (
                        <p className="text-xs text-gray-400">
                          Прибыл: {new Date(visit.arrived_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          {visit.submitted_at && ` · Закрыт: ${new Date(visit.submitted_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                      )}

                      {/* Sold products */}
                      {visit.result === 'sold' && visit.visit_products && visit.visit_products.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Продал:</p>
                          <div className="flex flex-wrap gap-2">
                            {visit.visit_products.map((vp: { quantity: number; products: unknown }, i: number) => {
                              const prodRaw = Array.isArray(vp.products) ? vp.products[0] : vp.products
                              const prod = prodRaw as { name: string; unit: string } | null
                              return (
                                <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                                  {prod?.name} — {vp.quantity} {prod?.unit}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Refusal reason */}
                      {visit.result === 'not_sold' && visit.refusal_reason && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-0.5">Причина:</p>
                          <p className="text-sm text-red-600">
                            {REFUSAL_REASON_LABELS[visit.refusal_reason as keyof typeof REFUSAL_REASON_LABELS]}
                            {visit.refusal_comment && ` — ${visit.refusal_comment}`}
                          </p>
                        </div>
                      )}

                      {/* Agent comment */}
                      {visit.agent_comment && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-0.5">Комментарий:</p>
                          <p className="text-sm text-gray-700">{visit.agent_comment}</p>
                        </div>
                      )}

                      {/* Photos */}
                      {visit.visit_photos && visit.visit_photos.length > 0 && (
                        <PhotoGrid photos={visit.visit_photos} />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

async function PhotoGrid({
  photos,
}: {
  photos: { id: string; storage_path: string; task_id: string | null }[]
}) {
  const urls = await Promise.all(
    photos.map(async (p) => {
      try {
        const url = await getPhotoViewUrl(p.storage_path)
        return { ...p, url }
      } catch {
        return { ...p, url: '' }
      }
    })
  )

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">Фото:</p>
      <div className="flex flex-wrap gap-2">
        {urls.filter(p => p.url).map(photo => (
          <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer">
            <img
              src={photo.url}
              alt="Фото визита"
              className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity"
            />
          </a>
        ))}
      </div>
    </div>
  )
}

function DatePicker({ currentDate, agentId }: { currentDate: string; agentId: string }) {
  return (
    <form method="get">
      <input type="hidden" name="agentId" value={agentId} />
      <input
        type="date"
        name="date"
        defaultValue={currentDate}
        className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => {
          const form = e.target.closest('form') as HTMLFormElement
          if (form) form.requestSubmit()
        }}
      />
    </form>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}
