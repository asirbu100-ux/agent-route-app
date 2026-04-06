import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ClientVisitForm from './ClientVisitForm'

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>
  searchParams: Promise<{ wd?: string; view?: string; day?: string }>
}) {
  const { clientId } = await params
  const { wd: workDayId, view, day } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const isViewOnly = view === '1' || !workDayId
  const backUrl = day ? `/tasks?day=${day}` : '/tasks'

  // Get client with products
  const { data: client } = await supabase
    .from('clients')
    .select(`
      id, name, address, phone,
      client_products (
        id, product_id,
        product:products (id, name, sku, unit)
      )
    `)
    .eq('id', clientId)
    .eq('agent_id', user.id)
    .single()

  if (!client) redirect('/tasks')

  // Get previous visit data (last completed visit to this client)
  const { data: prevVisits } = await supabase
    .from('client_visits')
    .select(`
      completed_at,
      visit_items (client_product_id, is_sold, refusal_reason)
    `)
    .eq('client_id', clientId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)

  const prevUnsold = new Map<string, string | null>()
  let lastVisitStats: { sold: number; notSold: number; date: string | null } | null = null

  if (prevVisits?.[0]) {
    const pv = prevVisits[0]
    let sold = 0, notSold = 0
    for (const item of (pv.visit_items ?? []) as { client_product_id: string; is_sold: boolean; refusal_reason: string | null }[]) {
      if (item.is_sold) { sold++ } else {
        notSold++
        prevUnsold.set(item.client_product_id, item.refusal_reason)
      }
    }
    lastVisitStats = { sold, notSold, date: pv.completed_at }
  }

  // View-only mode
  if (isViewOnly) {
    const products = (client.client_products ?? []).map((cp: Record<string, unknown>) => {
      const cpId = cp.id as string
      const wasUnsold = prevUnsold.has(cpId)
      return {
        client_product_id: cpId,
        product: cp.product as { id: string; name: string; sku: string | null; unit: string },
        wasUnsold,
        refusalReason: wasUnsold ? prevUnsold.get(cpId) : null,
      }
    })

    // Sort: unsold first
    products.sort((a, b) => (a.wasUnsold === b.wasUnsold ? 0 : a.wasUnsold ? -1 : 1))

    const unsoldCount = products.filter(p => p.wasUnsold).length

    return (
      <div className="p-4">
        <div className="mb-4">
          <Link href={backUrl} className="text-sm font-bold text-blue-600 mb-2 inline-block">&larr; Назад</Link>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-gray-900">{client.name}</h1>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Просмотр</span>
          </div>
          {client.address && <p className="text-sm text-gray-500 mt-1">{client.address}</p>}
          {client.phone && <p className="text-sm text-gray-500">{client.phone}</p>}
        </div>

        {/* Stats */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-indigo-50 rounded-xl p-2.5 text-center">
            <p className="text-lg font-black text-indigo-700">{products.length}</p>
            <p className="text-xs text-indigo-500">товаров</p>
          </div>
          {lastVisitStats && (
            <>
              <div className="flex-1 bg-green-50 rounded-xl p-2.5 text-center">
                <p className="text-lg font-black text-green-700">{lastVisitStats.sold}</p>
                <p className="text-xs text-green-500">продано</p>
              </div>
              <div className="flex-1 bg-red-50 rounded-xl p-2.5 text-center">
                <p className="text-lg font-black text-red-600">{lastVisitStats.notSold}</p>
                <p className="text-xs text-red-500">отказов</p>
              </div>
            </>
          )}
          {unsoldCount > 0 && (
            <div className="flex-1 bg-orange-50 rounded-xl p-2.5 text-center">
              <p className="text-lg font-black text-orange-700">{unsoldCount}</p>
              <p className="text-xs text-orange-500">долг</p>
            </div>
          )}
        </div>

        {/* Products */}
        <h2 className="text-xs font-bold text-gray-400 uppercase mb-2">Товары</h2>
        <div className="space-y-2">
          {products.map(p => (
            <div key={p.client_product_id} className={`rounded-2xl border-2 p-3 ${
              p.wasUnsold ? 'bg-orange-50 border-orange-300' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-start justify-between">
                <p className="text-sm font-bold text-gray-900 flex-1">{p.product.name}</p>
                {p.wasUnsold && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white shrink-0 ml-2">долг</span>
                )}
              </div>
              {p.wasUnsold && p.refusalReason && (
                <p className="text-xs text-orange-700 mt-1">Причина: {p.refusalReason}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Active mode
  let { data: visit } = await supabase
    .from('client_visits')
    .select('id, photo_path, photo_before, completed_at, started_at')
    .eq('work_day_id', workDayId)
    .eq('client_id', clientId)
    .single()

  if (!visit) {
    const { data: newVisit } = await supabase
      .from('client_visits')
      .insert({ work_day_id: workDayId, client_id: clientId })
      .select('id, photo_path, photo_before, completed_at, started_at')
      .single()
    visit = newVisit
  }
  if (!visit) redirect('/tasks')

  const { data: visitItems } = await supabase
    .from('visit_items')
    .select('client_product_id, is_sold, refusal_reason')
    .eq('client_visit_id', visit.id)

  const itemsMap: Record<string, { is_sold: boolean; refusal_reason: string | null }> = {}
  for (const item of visitItems ?? []) {
    itemsMap[item.client_product_id] = { is_sold: item.is_sold, refusal_reason: item.refusal_reason }
  }

  const products = (client.client_products ?? []).map((cp: Record<string, unknown>) => ({
    client_product_id: cp.id as string,
    product: cp.product as { id: string; name: string; sku: string | null; unit: string },
    result: itemsMap[cp.id as string] ?? null,
    wasUnsoldLastTime: prevUnsold.has(cp.id as string),
    lastRefusalReason: prevUnsold.get(cp.id as string) ?? null,
    priority: (cp as { priority?: string }).priority ?? 'normal',
  }))

  let photoUrl: string | null = null
  if (visit.photo_path) {
    const { data } = await supabase.storage.from('visit-photos').createSignedUrl(visit.photo_path, 3600)
    photoUrl = data?.signedUrl ?? null
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-4">
        <Link href={backUrl} className="text-sm font-bold text-blue-600 mb-2 inline-block">&larr; Назад</Link>
        <h1 className="text-xl font-black text-gray-900">{client.name}</h1>
        {client.address && <p className="text-sm text-gray-500">{client.address}</p>}
      </div>

      <ClientVisitForm
        visitId={visit.id}
        products={products}
        photoUrl={photoUrl}
        photoBefore={(visit as { photo_before?: string }).photo_before ?? null}
        isCompleted={!!visit.completed_at}
        lastVisitStats={lastVisitStats}
        visitStartedAt={(visit as { started_at?: string }).started_at ?? null}
      />
    </div>
  )
}
