'use server'

import { createClient } from '@/lib/supabase/server'
import { visitSubmitSchema, type VisitSubmitPayload } from '@/lib/validations/visit'
import { revalidatePath } from 'next/cache'

export async function openVisit(routePointId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Check visit doesn't already exist
  const { data: existing } = await supabase
    .from('visits')
    .select('id')
    .eq('route_point_id', routePointId)
    .single()

  if (existing) return existing

  const { data, error } = await supabase
    .from('visits')
    .insert({
      route_point_id: routePointId,
      agent_id: user.id,
      arrived_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/route')
  return data
}

export async function submitVisit(visitId: string, payload: VisitSubmitPayload) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Validate with Zod
  const parsed = visitSubmitSchema.safeParse(payload)
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors }
  }

  const data = parsed.data

  // Load visit to get route_point_id
  const { data: visit } = await supabase
    .from('visits')
    .select('route_point_id, submitted_at')
    .eq('id', visitId)
    .eq('agent_id', user.id)
    .single()

  if (!visit) return { success: false, error: 'Визит не найден' }
  if (visit.submitted_at) return { success: false, error: 'Визит уже закрыт' }

  // Check required photos coverage
  const { data: requiredTasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('route_point_id', visit.route_point_id)
    .eq('requires_photo', true)

  if (requiredTasks && requiredTasks.length > 0) {
    const { data: uploadedPhotos } = await supabase
      .from('visit_photos')
      .select('task_id')
      .eq('visit_id', visitId)
      .not('task_id', 'is', null)

    const coveredTaskIds = new Set((uploadedPhotos ?? []).map(p => p.task_id))
    const missing = requiredTasks.filter(t => !coveredTaskIds.has(t.id))

    if (missing.length > 0) {
      return { success: false, error: `Необходимо прикрепить фото для ${missing.length} задач` }
    }
  }

  // Check route is active
  const { data: routeCheck } = await supabase
    .from('route_points')
    .select('route_id, routes!inner(status)')
    .eq('id', visit.route_point_id)
    .single()

  const routesRaw = routeCheck?.routes
  const routes = (Array.isArray(routesRaw) ? routesRaw[0] : routesRaw) as { status: string } | null
  if (routes?.status !== 'active') {
    return { success: false, error: 'Маршрут не активен' }
  }

  // Call atomic DB function
  const products = data.result === 'sold'
    ? data.products.map(p => ({ product_id: p.productId, quantity: p.quantity }))
    : []

  const { error: rpcError } = await supabase.rpc('submit_visit', {
    p_visit_id: visitId,
    p_result: data.result,
    p_refusal_reason: data.result === 'not_sold' ? data.refusalReason : null,
    p_refusal_comment: data.result === 'not_sold' && data.refusalReason === 'other'
      ? data.refusalComment ?? null
      : null,
    p_agent_comment: data.agentComment,
    p_products: JSON.stringify(products),
  })

  if (rpcError) return { success: false, error: rpcError.message }

  revalidatePath('/route')
  return { success: true }
}
