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

export async function createProduct(data: { name: string; sku?: string; unit: string }) {
  const { supabase } = await requireManager()
  const { error } = await supabase.from('products').insert({
    name: data.name,
    sku: data.sku || null,
    unit: data.unit,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/products')
}

export async function updateProduct(
  id: string,
  data: { name?: string; sku?: string; unit?: string; is_active?: boolean }
) {
  const { supabase } = await requireManager()
  const { error } = await supabase.from('products').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/products')
}
