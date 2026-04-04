'use client'

import { useState, useTransition } from 'react'
import { createProduct, updateProduct } from '@/lib/actions/products'
import type { Product } from '@/lib/types/database'

const UNITS = ['pcs', 'kg', 'box', 'л', 'уп']

export default function ProductsClient({ products }: { products: Product[] }) {
  const [list, setList] = useState(products)
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [unit, setUnit] = useState('pcs')
  const [error, setError] = useState('')

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setError('')

    startTransition(async () => {
      try {
        await createProduct({ name: name.trim(), sku: sku.trim() || undefined, unit })
        setName('')
        setSku('')
        setUnit('pcs')
        setShowForm(false)
        // Refresh by reloading the page products
        window.location.reload()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка')
      }
    })
  }

  async function toggleActive(product: Product) {
    await updateProduct(product.id, { is_active: !product.is_active })
    setList(prev => prev.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p))
  }

  return (
    <div>
      {/* Add button */}
      <div className="mb-4">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Добавить товар
          </button>
        ) : (
          <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 max-w-md">
            <h3 className="font-semibold text-gray-800 text-sm">Новый товар</h3>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Название *"
              required
              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="Артикул (SKU)"
                className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-blue-600 text-white text-sm py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? 'Сохраняем...' : 'Добавить'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-300 text-gray-600 text-sm py-1.5 rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Products table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Название</th>
              <th className="px-4 py-3 text-left font-medium">Артикул</th>
              <th className="px-4 py-3 text-left font-medium">Ед. изм.</th>
              <th className="px-4 py-3 text-left font-medium">Статус</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map(product => (
              <tr key={product.id} className={`hover:bg-gray-50 ${!product.is_active ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                <td className="px-4 py-3 text-gray-500">{product.sku ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{product.unit}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {product.is_active ? 'Активен' : 'Отключён'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleActive(product)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    {product.is_active ? 'Отключить' : 'Включить'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
