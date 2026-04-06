'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function requireManager() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'manager') throw new Error('Только для менеджеров')
  return { supabase, user }
}

export async function createClientAction(data: { name: string; address?: string; phone?: string }) {
  const { supabase } = await requireManager()
  const { error } = await supabase.from('clients').insert({
    name: data.name,
    address: data.address || null,
    phone: data.phone || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/clients')
}

export async function updateClient(
  id: string,
  data: { name?: string; address?: string; phone?: string; is_active?: boolean }
) {
  const { supabase } = await requireManager()
  const { error } = await supabase.from('clients').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/clients')
}
