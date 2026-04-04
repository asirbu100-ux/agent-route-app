import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ReportForm from '@/components/agent/ReportForm'
import { openVisit } from '@/lib/actions/visits'
import type { Task, Product } from '@/lib/types/database'

interface Props {
  params: Promise<{ pointId: string }>
}

export default async function ReportPage({ params }: Props) {
  const { pointId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: point } = await supabase
    .from('route_points')
    .select(`
      id, name, route_id,
      routes!inner ( status, agent_id ),
      tasks ( id, description, requires_photo, route_point_id, created_at ),
      point_products (
        product_id,
        products ( id, name, sku, unit, is_active, created_at )
      )
    `)
    .eq('id', pointId)
    .single()

  if (!point) notFound()

  const routeRaw = Array.isArray(point.routes) ? point.routes[0] : point.routes
  const route = routeRaw as { status: string; agent_id: string } | null
  if (!route || route.agent_id !== user.id) redirect('/route')

  // Ensure visit exists
  let visit = await supabase
    .from('visits')
    .select(`
      id, result, submitted_at, refusal_reason, refusal_comment, agent_comment,
      visit_photos ( id, storage_path, task_id )
    `)
    .eq('route_point_id', pointId)
    .eq('agent_id', user.id)
    .single()
    .then(r => r.data)

  if (!visit) {
    const created = await openVisit(pointId)
    visit = { ...created, visit_photos: [] }
  }

  if (!visit) redirect('/route')

  // Extract products from nested join result
  const products: Product[] = point.point_products
    .flatMap((pp) => {
      const raw = pp.products
      const items = Array.isArray(raw) ? raw : raw ? [raw] : []
      return items as Product[]
    })
    .filter((p) => p.is_active)

  // Extract tasks
  const tasks: Task[] = (point.tasks ?? []) as unknown as Task[]

  return (
    <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
      <Link href={`/route/${pointId}`} className="inline-flex items-center gap-1 text-sm text-blue-600">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {point.name}
      </Link>

      <h1 className="text-lg font-bold text-gray-900">Отчёт о визите</h1>

      <ReportForm
        visitId={visit.id}
        pointId={pointId}
        products={products}
        tasks={tasks}
        initialPhotos={(visit.visit_photos ?? []) as { id: string; storage_path: string; task_id: string | null }[]}
        isSubmitted={!!visit.submitted_at}
        initialData={{
          result: visit.result,
          refusal_reason: visit.refusal_reason,
          refusal_comment: visit.refusal_comment,
          agent_comment: visit.agent_comment,
        }}
      />
    </div>
  )
}
