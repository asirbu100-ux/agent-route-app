'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface RoutePointInput {
  id?: string // existing point id for updates
  name: string
  address: string
  contact_name?: string
  contact_phone?: string
  sort_order: number
  products: { product_id: string; target_qty?: number }[]
  tasks: { description: string; requires_photo: boolean }[]
}

export interface CreateRouteInput {
  agent_id: string
  route_date: string
  title?: string
  points: RoutePointInput[]
}

async function requireManager() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'manager') throw new Error('Только для менеджеров')
  return { supabase, user }
}

export async function createRoute(input: CreateRouteInput) {
  const { supabase, user } = await requireManager()

  // Create route
  const { data: route, error: routeError } = await supabase
    .from('routes')
    .insert({
      agent_id: input.agent_id,
      manager_id: user.id,
      route_date: input.route_date,
      title: input.title ?? null,
      status: 'draft',
    })
    .select()
    .single()

  if (routeError) throw new Error(routeError.message)

  await upsertRoutePoints(supabase, route.id, input.points)
  revalidatePath('/routes')
  return route
}

export async function updateRoute(routeId: string, input: Partial<CreateRouteInput> & { status?: string }) {
  const { supabase } = await requireManager()

  const { error } = await supabase
    .from('routes')
    .update({
      ...(input.agent_id && { agent_id: input.agent_id }),
      ...(input.route_date && { route_date: input.route_date }),
      ...(input.title !== undefined && { title: input.title }),
      ...(input.status && { status: input.status }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', routeId)

  if (error) throw new Error(error.message)

  if (input.points) {
    // Delete existing points and recreate
    await supabase.from('route_points').delete().eq('route_id', routeId)
    await upsertRoutePoints(supabase, routeId, input.points)
  }

  revalidatePath('/routes')
  revalidatePath(`/routes/${routeId}`)
}

export async function publishRoute(routeId: string) {
  const { supabase } = await requireManager()
  const { error } = await supabase
    .from('routes')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', routeId)

  if (error) throw new Error(error.message)
  revalidatePath('/routes')
  revalidatePath('/dashboard')
}

export async function deleteRoute(routeId: string) {
  const { supabase } = await requireManager()
  await supabase.from('routes').delete().eq('id', routeId)
  revalidatePath('/routes')
  redirect('/routes')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertRoutePoints(supabase: any, routeId: string, points: RoutePointInput[]) {
  for (const point of points) {
    const { data: rp, error: rpError } = await supabase
      .from('route_points')
      .insert({
        route_id: routeId,
        name: point.name,
        address: point.address,
        contact_name: point.contact_name ?? null,
        contact_phone: point.contact_phone ?? null,
        sort_order: point.sort_order,
      })
      .select()
      .single()

    if (rpError) throw new Error(rpError.message)

    if (point.products.length > 0) {
      await supabase.from('point_products').insert(
        point.products.map(p => ({
          route_point_id: rp.id,
          product_id: p.product_id,
          target_qty: p.target_qty ?? null,
        }))
      )
    }

    if (point.tasks.length > 0) {
      await supabase.from('tasks').insert(
        point.tasks.map(t => ({
          route_point_id: rp.id,
          description: t.description,
          requires_photo: t.requires_photo,
        }))
      )
    }
  }
}
