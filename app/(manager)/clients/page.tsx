import { createClient } from '@/lib/supabase/server'
import { DAY_NAMES } from '@/lib/types/database'
import ClientsClient from './ClientsClient'

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('clients')
    .select(`
      id, name, address, phone, visit_day, is_active, agent_id,
      profiles!clients_agent_id_fkey (full_name)
    `)
    .order('name')

  const { data: agents } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'agent')
    .eq('is_active', true)
    .order('full_name')

  const clientsWithAgent = (clients ?? []).map(c => {
    const profileRaw = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
    const profile = profileRaw as { full_name: string } | null
    return {
      ...c,
      agent_name: profile?.full_name ?? '—',
      day_name: DAY_NAMES[c.visit_day] ?? `День ${c.visit_day}`,
    }
  })

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Клиенты</h1>
      <ClientsClient clients={clientsWithAgent} agents={agents ?? []} />
    </div>
  )
}
