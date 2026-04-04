'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitVisit } from '@/lib/actions/visits'
import type { Product, Task, VisitPhoto } from '@/lib/types/database'
import { REFUSAL_REASON_LABELS } from '@/lib/types/database'
import PhotoUploader from './PhotoUploader'

interface Props {
  visitId: string
  pointId: string
  products: Product[]
  tasks: Task[]
  initialPhotos: { id: string; storage_path: string; task_id: string | null }[]
  isSubmitted: boolean
  initialData?: {
    result: string | null
    refusal_reason: string | null
    refusal_comment: string | null
    agent_comment: string | null
  }
}

interface SelectedProduct {
  productId: string
  name: string
  unit: string
  quantity: number
}

const REFUSAL_REASONS = Object.entries(REFUSAL_REASON_LABELS) as [string, string][]

export default function ReportForm({
  visitId,
  pointId,
  products,
  tasks,
  initialPhotos,
  isSubmitted,
  initialData,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [result, setResult] = useState<'sold' | 'not_sold' | null>(
    (initialData?.result as 'sold' | 'not_sold') ?? null
  )
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [refusalReason, setRefusalReason] = useState<string>(initialData?.refusal_reason ?? '')
  const [refusalComment, setRefusalComment] = useState(initialData?.refusal_comment ?? '')
  const [agentComment, setAgentComment] = useState(initialData?.agent_comment ?? '')
  const [error, setError] = useState('')

  // Track which tasks have photos uploaded
  const requiredTaskIds = tasks.filter(t => t.requires_photo).map(t => t.id)
  const [coveredTasks, setCoveredTasks] = useState<Set<string>>(
    new Set(
      initialPhotos
        .filter(p => p.task_id && requiredTaskIds.includes(p.task_id))
        .map(p => p.task_id!)
    )
  )

  function handlePhotoAdded(taskId?: string) {
    if (taskId && requiredTaskIds.includes(taskId)) {
      setCoveredTasks(prev => new Set([...prev, taskId]))
    }
  }

  function handlePhotoRemoved(taskId?: string) {
    if (taskId) {
      setCoveredTasks(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }
  }

  function toggleProduct(product: Product) {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.productId === product.id)
      if (exists) return prev.filter(p => p.productId !== product.id)
      return [...prev, { productId: product.id, name: product.name, unit: product.unit, quantity: 1 }]
    })
  }

  function updateQuantity(productId: string, qty: number) {
    setSelectedProducts(prev =>
      prev.map(p => p.productId === productId ? { ...p, quantity: Math.max(1, qty) } : p)
    )
  }

  // Validation
  const allPhotosOk = requiredTaskIds.every(id => coveredTasks.has(id))
  const isValid =
    result !== null &&
    agentComment.trim().length > 0 &&
    allPhotosOk &&
    (result === 'sold'
      ? selectedProducts.length > 0
      : refusalReason.length > 0 &&
        (refusalReason !== 'other' || refusalComment.trim().length > 0))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || !result) return
    setError('')

    const payload =
      result === 'sold'
        ? { result: 'sold' as const, products: selectedProducts, agentComment }
        : {
            result: 'not_sold' as const,
            refusalReason: refusalReason as Parameters<typeof submitVisit>[1] extends { refusalReason: infer R } ? R : never,
            refusalComment,
            agentComment,
          }

    startTransition(async () => {
      const res = await submitVisit(visitId, payload as Parameters<typeof submitVisit>[1])
      if (res.success) {
        router.push(`/route/${pointId}`)
        router.refresh()
      } else {
        setError(typeof res.error === 'string' ? res.error : 'Ошибка при сохранении')
      }
    })
  }

  if (isSubmitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <div className="text-2xl mb-1">✓</div>
        <p className="text-green-800 font-medium">Визит закрыт</p>
        <p className="text-sm text-green-600 mt-1">Отчёт успешно отправлен</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Result selector */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Результат визита *</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setResult('sold')}
            className={`py-3 rounded-xl border-2 font-medium text-sm transition-colors ${
              result === 'sold'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            ✓ Продал
          </button>
          <button
            type="button"
            onClick={() => setResult('not_sold')}
            className={`py-3 rounded-xl border-2 font-medium text-sm transition-colors ${
              result === 'not_sold'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            ✗ Не продал
          </button>
        </div>
      </div>

      {/* Sold: product selection */}
      {result === 'sold' && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Что продал *</p>
          <div className="space-y-2">
            {products.map(product => {
              const selected = selectedProducts.find(p => p.productId === product.id)
              return (
                <div
                  key={product.id}
                  className={`border-2 rounded-xl p-3 transition-colors ${
                    selected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleProduct(product)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      <span className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
                        selected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300'
                      }`}>
                        {selected ? '✓' : ''}
                      </span>
                      <span className="text-sm font-medium text-gray-800">{product.name}</span>
                    </button>

                    {selected && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, selected.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-gray-300 text-gray-600 flex items-center justify-center"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{selected.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, selected.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-gray-300 text-gray-600 flex items-center justify-center"
                        >
                          +
                        </button>
                        <span className="text-xs text-gray-400">{product.unit}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Not sold: refusal reason */}
      {result === 'not_sold' && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Причина отказа *</p>
          <div className="space-y-1.5">
            {REFUSAL_REASONS.map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="refusalReason"
                  value={value}
                  checked={refusalReason === value}
                  onChange={e => setRefusalReason(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          {refusalReason === 'other' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Опишите причину *
              </label>
              <textarea
                value={refusalComment}
                onChange={e => setRefusalComment(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Укажите причину..."
              />
            </div>
          )}
        </div>
      )}

      {/* Agent comment */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Комментарий агента *
        </label>
        <textarea
          value={agentComment}
          onChange={e => setAgentComment(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Что сказал клиент, что сделали, что нужно в следующий раз..."
        />
      </div>

      {/* Photos */}
      {tasks.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Фотофиксация</p>
          <div className="space-y-3">
            {tasks
              .filter(t => t.requires_photo)
              .map(task => (
                <div key={task.id} className="bg-white border border-gray-200 rounded-xl p-3">
                  <PhotoUploader
                    visitId={visitId}
                    taskId={task.id}
                    taskDescription={task.description}
                    required={true}
                    initialPhotos={initialPhotos
                      .filter(p => p.task_id === task.id)
                      .map(p => ({ id: p.id, storage_path: p.storage_path }))}
                    onPhotoAdded={handlePhotoAdded}
                    onPhotoRemoved={handlePhotoRemoved}
                  />
                </div>
              ))}

            {/* General photo (optional) */}
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <p className="text-sm text-gray-600 mb-2">Дополнительное фото (необязательно)</p>
              <PhotoUploader
                visitId={visitId}
                initialPhotos={initialPhotos
                  .filter(p => p.task_id === null)
                  .map(p => ({ id: p.id, storage_path: p.storage_path }))}
                onPhotoAdded={handlePhotoAdded}
                onPhotoRemoved={handlePhotoRemoved}
              />
            </div>
          </div>
        </div>
      )}

      {/* Required photos reminder */}
      {!allPhotosOk && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 text-sm text-orange-700">
          Прикрепите обязательные фото для всех задач с 📷
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid || isPending}
        className="w-full bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors"
      >
        {isPending ? 'Сохраняем...' : 'Закрыть визит'}
      </button>
    </form>
  )
}
