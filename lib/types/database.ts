export type Role = 'agent' | 'manager'
export type RouteStatus = 'draft' | 'active' | 'completed'
export type VisitResult = 'sold' | 'not_sold'
export type RefusalReason =
  | 'expensive'
  | 'not_needed'
  | 'no_space'
  | 'competitor'
  | 'no_decision_maker'
  | 'no_stock'
  | 'other'

export interface Profile {
  id: string
  full_name: string
  role: Role
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  sku: string | null
  unit: string
  is_active: boolean
  created_at: string
}

export interface Route {
  id: string
  agent_id: string
  manager_id: string
  route_date: string
  title: string | null
  status: RouteStatus
  created_at: string
  updated_at: string
}

export interface RoutePoint {
  id: string
  route_id: string
  name: string
  address: string
  contact_name: string | null
  contact_phone: string | null
  sort_order: number
  created_at: string
}

export interface PointProduct {
  id: string
  route_point_id: string
  product_id: string
  target_qty: number | null
  product?: Product
}

export interface Task {
  id: string
  route_point_id: string
  description: string
  requires_photo: boolean
  created_at: string
}

export interface Visit {
  id: string
  route_point_id: string
  agent_id: string
  result: VisitResult | null
  refusal_reason: RefusalReason | null
  refusal_comment: string | null
  agent_comment: string | null
  arrived_at: string | null
  submitted_at: string | null
  created_at: string
  updated_at: string
}

export interface VisitProduct {
  id: string
  visit_id: string
  product_id: string
  quantity: number
  product?: Product
}

export interface VisitPhoto {
  id: string
  visit_id: string
  task_id: string | null
  storage_path: string
  uploaded_at: string
}

// ── Composite types for page queries ──────────────────────────

export interface RoutePointWithDetails extends RoutePoint {
  tasks: Task[]
  point_products: PointProduct[]
  visit: Visit | null
}

export interface RouteWithPoints extends Route {
  route_points: RoutePointWithDetails[]
  agent?: Profile
}

export interface VisitWithDetails extends Visit {
  visit_products: VisitProduct[]
  visit_photos: VisitPhoto[]
  route_point: RoutePoint
}

export const REFUSAL_REASON_LABELS: Record<RefusalReason, string> = {
  expensive: 'Дорого',
  not_needed: 'Не нужно',
  no_space: 'Нет места',
  competitor: 'Есть конкурент',
  no_decision_maker: 'Нет ЛПР',
  no_stock: 'Нет товара',
  other: 'Другое',
}
