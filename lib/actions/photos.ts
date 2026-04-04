'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'

const BUCKET = 'visit-photos'

export async function getPhotoUploadUrl(visitId: string, taskId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify visit belongs to user
  const { data: visit } = await supabase
    .from('visits')
    .select('id')
    .eq('id', visitId)
    .eq('agent_id', user.id)
    .single()
  if (!visit) throw new Error('Visit not found')

  const timestamp = Date.now()
  const segment = taskId ?? 'general'
  const storagePath = `${user.id}/${visitId}/${segment}/${timestamp}.jpg`

  const service = await createServiceClient()
  const { data, error } = await service.storage
    .from(BUCKET)
    .createSignedUploadUrl(storagePath)

  if (error) throw new Error(error.message)

  return { signedUrl: data.signedUrl, storagePath }
}

export async function confirmPhotoUpload(
  visitId: string,
  storagePath: string,
  taskId?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('visit_photos').insert({
    visit_id: visitId,
    task_id: taskId ?? null,
    storage_path: storagePath,
  })

  if (error) throw new Error(error.message)
}

export async function getPhotoViewUrl(storagePath: string) {
  const service = await createServiceClient()
  const { data, error } = await service.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600) // 1 hour

  if (error) throw new Error(error.message)
  return data.signedUrl
}

export async function deletePhoto(photoId: string, storagePath: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Delete from DB (RLS enforces ownership)
  await supabase.from('visit_photos').delete().eq('id', photoId)

  // Delete from storage
  const service = await createServiceClient()
  await service.storage.from(BUCKET).remove([storagePath])
}
