'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function requireAgent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return { supabase, user }
}

export async function startDay() {
  const { supabase, user } = await requireAgent()
  const { getTodayDate } = await import('@/lib/utils/date')
  const today = getTodayDate()

  const { data: existing } = await supabase
    .from('work_days').select('id').eq('agent_id', user.id).eq('work_date', today).single()
  if (existing) return existing.id

  const { data, error } = await supabase
    .from('work_days').insert({ agent_id: user.id, work_date: today }).select('id').single()
  if (error) throw new Error(error.message)

  // Ensure agent_stats exists
  await supabase.from('agent_stats').upsert({ agent_id: user.id }, { onConflict: 'agent_id' })

  revalidatePath('/tasks')
  return data.id
}

export async function finishDay() {
  const { supabase, user } = await requireAgent()
  const { getTodayDate } = await import('@/lib/utils/date')
  const today = getTodayDate()

  const { error } = await supabase
    .from('work_days')
    .update({ finished_at: new Date().toISOString() })
    .eq('agent_id', user.id).eq('work_date', today).is('finished_at', null)
  if (error) throw new Error(error.message)

  // Update streak and points
  const { data: stats } = await supabase
    .from('agent_stats').select('*').eq('agent_id', user.id).single()

  if (stats) {
    const lastDate = stats.last_work_date
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    // Skip weekends
    const yd = yesterday.getDay()
    if (yd === 0) yesterday.setDate(yesterday.getDate() - 2)
    if (yd === 6) yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const isConsecutive = lastDate === yesterdayStr
    const newStreak = isConsecutive ? stats.streak_days + 1 : 1
    const bestStreak = Math.max(stats.best_streak, newStreak)

    // Points: 10 per completed day + 5 per streak day bonus
    const dayPoints = 10 + (newStreak > 1 ? newStreak * 5 : 0)

    await supabase.from('agent_stats').update({
      streak_days: newStreak,
      best_streak: bestStreak,
      points: stats.points + dayPoints,
      last_work_date: today,
      updated_at: new Date().toISOString(),
    }).eq('agent_id', user.id)
  }

  revalidatePath('/tasks')
}

export async function openVisit(workDayId: string, clientId: string) {
  const { supabase } = await requireAgent()

  const { data: existing } = await supabase
    .from('client_visits').select('id').eq('work_day_id', workDayId).eq('client_id', clientId).single()
  if (existing) return existing.id

  const { data, error } = await supabase
    .from('client_visits')
    .insert({ work_day_id: workDayId, client_id: clientId })
    .select('id').single()
  if (error) throw new Error(error.message)
  revalidatePath('/tasks')
  return data.id
}

export async function startVisitWithGPS(visitId: string, lat: number | null, lng: number | null) {
  const { supabase } = await requireAgent()
  await supabase.from('client_visits').update({
    started_at: new Date().toISOString(),
    lat, lng,
  }).eq('id', visitId)
  revalidatePath('/tasks')
}

export async function markProduct(data: {
  client_visit_id: string
  client_product_id: string
  is_sold: boolean
  refusal_reason?: string
}) {
  const { supabase, user } = await requireAgent()

  const { error } = await supabase
    .from('visit_items')
    .upsert({
      client_visit_id: data.client_visit_id,
      client_product_id: data.client_product_id,
      is_sold: data.is_sold,
      refusal_reason: data.is_sold ? null : (data.refusal_reason || null),
    }, { onConflict: 'client_visit_id,client_product_id' })
  if (error) throw new Error(error.message)

  // Update agent stats
  if (data.is_sold) {
    const { data: st } = await supabase.from('agent_stats').select('total_sold').eq('agent_id', user.id).single()
    if (st) await supabase.from('agent_stats').update({ total_sold: st.total_sold + 1 }).eq('agent_id', user.id)
  }

  revalidatePath('/tasks')
}

export async function uploadVisitPhoto(visitId: string, formData: FormData) {
  const { supabase, user } = await requireAgent()
  const file = formData.get('photo') as File
  if (!file) throw new Error('Нет файла')

  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${user.id}/${visitId}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('visit-photos').upload(path, file, { upsert: true })
  if (uploadError) throw new Error(uploadError.message)

  const { error } = await supabase
    .from('client_visits').update({ photo_path: path }).eq('id', visitId)
  if (error) throw new Error(error.message)
  revalidatePath('/tasks')
}

export async function uploadBeforePhoto(visitId: string, formData: FormData) {
  const { supabase, user } = await requireAgent()
  const file = formData.get('photo') as File
  if (!file) throw new Error('Нет файла')

  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${user.id}/${visitId}_before.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('visit-photos').upload(path, file, { upsert: true })
  if (uploadError) throw new Error(uploadError.message)

  await supabase.from('client_visits').update({ photo_before: path }).eq('id', visitId)
  revalidatePath('/tasks')
}

export async function completeVisit(visitId: string) {
  const { supabase, user } = await requireAgent()

  const { data: visit } = await supabase
    .from('client_visits').select('photo_path, started_at').eq('id', visitId).single()
  if (!visit?.photo_path) throw new Error('Сначала загрузите фото')

  // Calculate duration
  let duration = null
  if (visit.started_at) {
    duration = Math.round((Date.now() - new Date(visit.started_at).getTime()) / 60000)
  }

  const { error } = await supabase
    .from('client_visits')
    .update({ completed_at: new Date().toISOString(), duration_min: duration })
    .eq('id', visitId)
  if (error) throw new Error(error.message)

  // Update agent stats
  const { data: agentStats } = await supabase.from('agent_stats').select('total_visits').eq('agent_id', user.id).single()
  if (agentStats) {
    await supabase.from('agent_stats').update({
      total_visits: agentStats.total_visits + 1,
      updated_at: new Date().toISOString(),
    }).eq('agent_id', user.id)
  }

  revalidatePath('/tasks')
}
