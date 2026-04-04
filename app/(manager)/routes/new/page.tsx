import { createClient } from '@/lib/supabase/server'
import RouteBuilder from '@/components/manager/RouteBuilder'

export default async function NewRoutePage() {
  const supabase = await createClient()

  const [{ data: agents }, { data: products }] = await Promise.all([
    supabase.from('profiles').select('*').eq('role', 'agent').eq('is_active', true).order('full_name'),
    supabase.from('products').select('*').eq('is_active', true).order('name'),
  ])

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Новый маршрут</h1>
      <RouteBuilder
        agents={agents ?? []}
        products={products ?? []}
      />
    </div>
  )
}
