'use client'

import { useState, useTransition } from 'react'
import { createClientAction } from '@/lib/actions/clients'
import { DAY_NAMES } from '@/lib/types/database'

interface ClientRow {
  id: string
  name: string
  address: string | null
  phone: string | null
  visit_day: number
  is_active: boolean
  agent_id: string
  agent_name: string
  day_name: string
}

interface Agent {
  id: string
  full_name: string
}

export default function ClientsClient({
  clients,
  agents,
}: {
  clients: ClientRow[]
  agents: Agent[]
}) {
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [agentId, setAgentId] = useState('')
  const [visitDay, setVisitDay] = useState('1')
  const [error, setError] = useState('')
  const [filterAgent, setFilterAgent] = useState('')

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !agentId) return
    setError('')

    startTransition(async () => {
      try {
        await createClientAction({
          name: name.trim(),
          address: address.trim() || undefined,
          phone: phone.trim() || undefined,
        })
        setName('')
        setAddress('')
        setPhone('')
        setShowForm(false)
        window.location.reload()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка')
      }
    })
  }

  const filtered = filterAgent
    ? clients.filter(c => c.agent_id === filterAgent)
    : clients

  return (
    <div>
      {/* Actions */}
      <div className="flex gap-3 mb-4 items-center">
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Добавить клиента
          </button>
        )}

        <select
          value={filterAgent}
          onChange={e => setFilterAgent(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Все агенты</option>
          {agents.map(a => (
            <option key={a.id} value={a.id}>{a.full_name}</option>
          ))}
        </select>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 max-w-md mb-4">
          <h3 className="font-semibold text-gray-800 text-sm">Новый клиент</h3>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Название *" required
            className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text" value={address} onChange={e => setAddress(e.target.value)}
            placeholder="Адрес"
            className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="Телефон"
            className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <select value={agentId} onChange={e => setAgentId(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Агент *</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.full_name}</option>)}
            </select>
            <select value={visitDay} onChange={e => setVisitDay(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {[1, 2, 3, 4, 5].map(d => (
                <option key={d} value={d}>{DAY_NAMES[d]}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={isPending}
              className="flex-1 bg-blue-600 text-white text-sm py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {isPending ? 'Сохраняем...' : 'Добавить'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 border border-gray-300 text-gray-600 text-sm py-1.5 rounded-lg hover:bg-gray-50">
              Отмена
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Клиент</th>
              <th className="px-4 py-3 text-left font-medium">Агент</th>
              <th className="px-4 py-3 text-left font-medium">День</th>
              <th className="px-4 py-3 text-left font-medium">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(client => (
              <tr key={client.id} className={`hover:bg-gray-50 ${!client.is_active ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{client.name}</div>
                  {client.address && <div className="text-xs text-gray-400">{client.address}</div>}
                </td>
                <td className="px-4 py-3 text-gray-500">{client.agent_name}</td>
                <td className="px-4 py-3 text-gray-500">{client.day_name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    client.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {client.is_active ? 'Активен' : 'Отключён'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">Нет клиентов</p>
        )}
      </div>
    </div>
  )
}
