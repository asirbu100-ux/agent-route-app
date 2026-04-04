'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createRoute, updateRoute } from '@/lib/actions/routes'
import type { Product, Profile } from '@/lib/types/database'

interface TaskInput {
  description: string
  requires_photo: boolean
}

interface ProductInput {
  product_id: string
  target_qty?: number
}

interface PointInput {
  _key: string
  name: string
  address: string
  contact_name: string
  contact_phone: string
  products: ProductInput[]
  tasks: TaskInput[]
}

interface Props {
  agents: Profile[]
  products: Product[]
  routeId?: string
  initialData?: {
    agent_id: string
    route_date: string
    title: string
    points: PointInput[]
  }
}

function makeKey() {
  return Math.random().toString(36).slice(2)
}

function emptyPoint(): PointInput {
  return {
    _key: makeKey(),
    name: '',
    address: '',
    contact_name: '',
    contact_phone: '',
    products: [],
    tasks: [],
  }
}

export default function RouteBuilder({ agents, products, routeId, initialData }: Props) {
  const router = useRouter()
  const [agentId, setAgentId] = useState(initialData?.agent_id ?? '')
  const [routeDate, setRouteDate] = useState(
    initialData?.route_date ?? new Date().toISOString().split('T')[0]
  )
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [points, setPoints] = useState<PointInput[]>(
    initialData?.points?.length ? initialData.points : [emptyPoint()]
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setPoints(prev => {
        const oldIdx = prev.findIndex(p => p._key === active.id)
        const newIdx = prev.findIndex(p => p._key === over.id)
        return arrayMove(prev, oldIdx, newIdx)
      })
    }
  }

  function updatePoint(key: string, patch: Partial<PointInput>) {
    setPoints(prev => prev.map(p => p._key === key ? { ...p, ...patch } : p))
  }

  function removePoint(key: string) {
    setPoints(prev => prev.filter(p => p._key !== key))
  }

  function addTask(pointKey: string) {
    updatePoint(pointKey, {
      tasks: [
        ...(points.find(p => p._key === pointKey)?.tasks ?? []),
        { description: '', requires_photo: false },
      ],
    })
  }

  function updateTask(pointKey: string, idx: number, patch: Partial<TaskInput>) {
    const point = points.find(p => p._key === pointKey)!
    const tasks = point.tasks.map((t, i) => i === idx ? { ...t, ...patch } : t)
    updatePoint(pointKey, { tasks })
  }

  function removeTask(pointKey: string, idx: number) {
    const point = points.find(p => p._key === pointKey)!
    updatePoint(pointKey, { tasks: point.tasks.filter((_, i) => i !== idx) })
  }

  function toggleProduct(pointKey: string, productId: string) {
    const point = points.find(p => p._key === pointKey)!
    const exists = point.products.find(p => p.product_id === productId)
    if (exists) {
      updatePoint(pointKey, { products: point.products.filter(p => p.product_id !== productId) })
    } else {
      updatePoint(pointKey, { products: [...point.products, { product_id: productId }] })
    }
  }

  async function handleSave(publish = false) {
    setError('')
    if (!agentId) { setError('Выберите агента'); return }
    if (!routeDate) { setError('Укажите дату'); return }
    if (points.some(p => !p.name || !p.address)) {
      setError('Заполните название и адрес для всех точек')
      return
    }

    setSaving(true)
    try {
      const payload = {
        agent_id: agentId,
        route_date: routeDate,
        title: title || undefined,
        points: points.map((p, i) => ({
          name: p.name,
          address: p.address,
          contact_name: p.contact_name || undefined,
          contact_phone: p.contact_phone || undefined,
          sort_order: i,
          products: p.products,
          tasks: p.tasks.filter(t => t.description.trim()),
        })),
      }

      if (routeId) {
        await updateRoute(routeId, { ...payload, ...(publish ? { status: 'active' } : {}) })
      } else {
        const route = await createRoute(payload)
        if (publish) await updateRoute(route.id, { status: 'active' })
        router.push(`/routes/${route.id}`)
        return
      }

      if (publish) router.push('/routes')
      else router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Route metadata */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h2 className="font-semibold text-gray-800">Параметры маршрута</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Агент *</label>
            <select
              value={agentId}
              onChange={e => setAgentId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Выберите агента</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Дата *</label>
            <input
              type="date"
              value={routeDate}
              onChange={e => setRouteDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Название (необязательно)</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Маршрут на понедельник..."
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Points */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Точки маршрута</h2>
          <button
            type="button"
            onClick={() => setPoints(prev => [...prev, emptyPoint()])}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Добавить точку
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={points.map(p => p._key)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {points.map((point, idx) => (
                <SortablePoint
                  key={point._key}
                  point={point}
                  idx={idx}
                  products={products}
                  onChange={patch => updatePoint(point._key, patch)}
                  onRemove={() => removePoint(point._key)}
                  onAddTask={() => addTask(point._key)}
                  onUpdateTask={(i, patch) => updateTask(point._key, i, patch)}
                  onRemoveTask={(i) => removeTask(point._key, i)}
                  onToggleProduct={(id) => toggleProduct(point._key, id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={saving}
          className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {saving ? 'Сохраняем...' : 'Сохранить черновик'}
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={saving}
          className="flex-1 bg-blue-600 text-white font-medium py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Публикуем...' : 'Опубликовать'}
        </button>
      </div>
    </div>
  )
}

function SortablePoint({
  point, idx, products, onChange, onRemove, onAddTask, onUpdateTask, onRemoveTask, onToggleProduct,
}: {
  point: PointInput
  idx: number
  products: Product[]
  onChange: (patch: Partial<PointInput>) => void
  onRemove: () => void
  onAddTask: () => void
  onUpdateTask: (i: number, patch: Partial<TaskInput>) => void
  onRemoveTask: (i: number) => void
  onToggleProduct: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: point._key })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl border border-gray-200">
      {/* Point header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
        <button type="button" {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
          ⠿
        </button>
        <span className="text-xs text-gray-400 font-medium">{idx + 1}</span>
        <div className="flex-1">
          <input
            type="text"
            value={point.name}
            onChange={e => onChange({ name: e.target.value })}
            placeholder="Название точки *"
            className="w-full text-sm font-medium text-gray-900 focus:outline-none placeholder-gray-400"
          />
        </div>
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="text-gray-400 hover:text-gray-600 text-xs"
        >
          {expanded ? '▲' : '▼'}
        </button>
        <button type="button" onClick={onRemove} className="text-red-400 hover:text-red-600 text-xs">
          ✕
        </button>
      </div>

      {expanded && (
        <div className="p-3 space-y-3">
          <input
            type="text"
            value={point.address}
            onChange={e => onChange({ address: e.target.value })}
            placeholder="Адрес *"
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={point.contact_name}
              onChange={e => onChange({ contact_name: e.target.value })}
              placeholder="Контактное лицо"
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={point.contact_phone}
              onChange={e => onChange({ contact_phone: e.target.value })}
              placeholder="Телефон"
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Products */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Товары для продажи</p>
            <div className="flex flex-wrap gap-1.5">
              {products.filter(p => p.is_active).map(prod => {
                const selected = point.products.some(p => p.product_id === prod.id)
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => onToggleProduct(prod.id)}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      selected
                        ? 'bg-blue-100 border-blue-400 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {selected ? '✓ ' : ''}{prod.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tasks */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-medium text-gray-500">Задачи</p>
              <button
                type="button"
                onClick={onAddTask}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                + задача
              </button>
            </div>
            <div className="space-y-1.5">
              {point.tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={task.description}
                    onChange={e => onUpdateTask(i, { description: e.target.value })}
                    placeholder="Описание задачи"
                    className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={task.requires_photo}
                      onChange={e => onUpdateTask(i, { requires_photo: e.target.checked })}
                      className="w-3 h-3"
                    />
                    📷
                  </label>
                  <button
                    type="button"
                    onClick={() => onRemoveTask(i)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
