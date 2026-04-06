'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { markProduct, uploadVisitPhoto, uploadBeforePhoto, completeVisit, startVisitWithGPS } from '@/lib/actions/workday'
import { REFUSAL_REASONS, OBJECTION_TIPS } from '@/lib/types/database'

interface ProductItem {
  client_product_id: string
  product: { id: string; name: string; sku: string | null; unit: string }
  result: { is_sold: boolean; refusal_reason: string | null } | null
  wasUnsoldLastTime: boolean
  lastRefusalReason: string | null
  priority: string
}

type Tab = 'sales' | 'merch'

function vibrate() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50)
}

export default function ClientVisitForm({
  visitId,
  products,
  photoUrl,
  photoBefore,
  isCompleted,
  lastVisitStats,
  visitStartedAt,
}: {
  visitId: string
  products: ProductItem[]
  photoUrl: string | null
  photoBefore: string | null
  isCompleted: boolean
  lastVisitStats: { sold: number; notSold: number; date: string | null } | null
  visitStartedAt: string | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = useState<Tab>('sales')
  const [results, setResults] = useState<Record<string, { is_sold: boolean; refusal_reason: string | null }>>(
    Object.fromEntries(products.filter(p => p.result).map(p => [p.client_product_id, p.result!]))
  )
  const [showReasonFor, setShowReasonFor] = useState<string | null>(null)
  const [showTipFor, setShowTipFor] = useState<string | null>(null)
  const [photoAfter, setPhotoAfter] = useState<string | null>(photoUrl)
  const [photoBeforeState, setPhotoBeforeState] = useState<string | null>(photoBefore)
  const [merchDone, setMerchDone] = useState<Record<string, boolean>>({})
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(0)
  const [gpsStarted, setGpsStarted] = useState(!!visitStartedAt)

  // Timer
  useEffect(() => {
    if (isCompleted || !visitStartedAt) return
    const start = new Date(visitStartedAt).getTime()
    const interval = setInterval(() => {
      setTimer(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [visitStartedAt, isCompleted])

  // GPS start on mount
  const startGPS = useCallback(() => {
    if (gpsStarted) return
    setGpsStarted(true)
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          startVisitWithGPS(visitId, pos.coords.latitude, pos.coords.longitude)
        },
        () => { startVisitWithGPS(visitId, null, null) },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      startVisitWithGPS(visitId, null, null)
    }
  }, [visitId, gpsStarted])

  useEffect(() => { if (!isCompleted) startGPS() }, [startGPS, isCompleted])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const markedCount = Object.keys(results).length
  const totalCount = products.length
  const soldCount = Object.values(results).filter(r => r.is_sold).length
  const mustProducts = products.filter(p => p.priority === 'must')
  const mustSold = mustProducts.filter(p => results[p.client_product_id]?.is_sold).length
  const allMarked = markedCount === totalCount
  const hasPhotoAfter = !!photoAfter
  const canComplete = allMarked && hasPhotoAfter && !isCompleted

  const MERCH_TASKS = [
    { id: 'facing', label: 'Выкладка на полке (фейсинг)', emoji: '📦' },
    { id: 'display', label: 'Доп. место продажи найдено', emoji: '🏷️' },
    { id: 'posm', label: 'POSM материалы размещены', emoji: '📋' },
    { id: 'price', label: 'Ценники актуальны', emoji: '💰' },
    { id: 'clean', label: 'Товар чистый, без повреждений', emoji: '✨' },
    { id: 'competitor', label: 'Фото конкурентов сделано', emoji: '👀' },
  ]
  const merchCompleted = MERCH_TASKS.filter(t => merchDone[t.id]).length
  const merchScore = totalCount > 0 ? Math.round((merchCompleted / MERCH_TASKS.length) * 100) : 0

  const sortedProducts = [...products].sort((a, b) => {
    const aR = results[a.client_product_id], bR = results[b.client_product_id]
    if (!aR && bR) return -1; if (aR && !bR) return 1
    if (!aR && !bR) {
      if (a.priority === 'must' && b.priority !== 'must') return -1
      if (a.priority !== 'must' && b.priority === 'must') return 1
      if (a.wasUnsoldLastTime && !b.wasUnsoldLastTime) return -1
      if (!a.wasUnsoldLastTime && b.wasUnsoldLastTime) return 1
    }
    return 0
  })

  function handleSold(cpId: string) {
    if (isCompleted) return; vibrate()
    setResults(prev => ({ ...prev, [cpId]: { is_sold: true, refusal_reason: null } }))
    setShowReasonFor(null); setShowTipFor(null)
    startTransition(() => markProduct({ client_visit_id: visitId, client_product_id: cpId, is_sold: true }))
  }

  function handleNotSold(cpId: string) {
    if (isCompleted) return; vibrate()
    setShowReasonFor(showReasonFor === cpId ? null : cpId); setShowTipFor(null)
  }

  function handleSelectReason(cpId: string, reason: string) {
    vibrate()
    setResults(prev => ({ ...prev, [cpId]: { is_sold: false, refusal_reason: reason } }))
    setShowReasonFor(null)
    if (OBJECTION_TIPS[reason]) { setShowTipFor(cpId); setTimeout(() => setShowTipFor(null), 8000) }
    startTransition(() => markProduct({ client_visit_id: visitId, client_product_id: cpId, is_sold: false, refusal_reason: reason }))
  }

  function handleReset(cpId: string) {
    if (isCompleted) return
    setResults(prev => { const n = { ...prev }; delete n[cpId]; return n }); setShowTipFor(null)
  }

  function handlePhoto(type: 'before' | 'after') {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]; if (!file) return; setError('')
      const reader = new FileReader()
      if (type === 'before') { reader.onload = () => setPhotoBeforeState(reader.result as string) }
      else { reader.onload = () => setPhotoAfter(reader.result as string) }
      reader.readAsDataURL(file)
      const formData = new FormData(); formData.append('photo', file)
      startTransition(async () => {
        try {
          if (type === 'before') await uploadBeforePhoto(visitId, formData)
          else await uploadVisitPhoto(visitId, formData)
        } catch (err) { setError(err instanceof Error ? err.message : 'Ошибка') }
      })
    }
  }

  function handleComplete() {
    setError(''); vibrate()
    startTransition(async () => {
      try { await completeVisit(visitId); router.push('/tasks') }
      catch (err) { setError(err instanceof Error ? err.message : 'Ошибка') }
    })
  }

  return (
    <div>
      {/* Timer bar */}
      {!isCompleted && visitStartedAt && (
        <div className="flex items-center justify-between bg-gray-900 text-white rounded-2xl px-4 py-2.5 mb-4">
          <span className="text-xs font-bold uppercase text-gray-400">Время визита</span>
          <span className="text-lg font-black font-mono">{formatTime(timer)}</span>
        </div>
      )}

      {/* Pre-visit intelligence */}
      {lastVisitStats && !isCompleted && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-3 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-blue-500 uppercase">Прошлый визит</p>
            <div className="flex gap-3">
              <span className="text-sm font-black text-green-600">{lastVisitStats.sold} прод.</span>
              <span className="text-sm font-black text-red-500">{lastVisitStats.notSold} отк.</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
        <button onClick={() => setTab('sales')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${tab === 'sales' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
          Продажи {soldCount > 0 && <span className="text-green-600 ml-1">{soldCount}✓</span>}
        </button>
        <button onClick={() => setTab('merch')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${tab === 'merch' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
          Полка {merchScore > 0 && <span className="text-blue-600 ml-1">{merchScore}%</span>}
        </button>
      </div>

      {/* ═══ SALES TAB ═══ */}
      {tab === 'sales' && (
        <>
          {mustProducts.length > 0 && !isCompleted && (
            <div className={`border-2 rounded-2xl p-3 mb-4 ${mustSold === mustProducts.length ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300 animate-pulse-soft'}`}>
              <p className={`text-xs font-black uppercase ${mustSold === mustProducts.length ? 'text-green-600' : 'text-red-600'}`}>
                {mustSold === mustProducts.length ? '✓ Все MUST товары проданы!' : `⚠ MUST товары: ${mustSold}/${mustProducts.length}`}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Товары</span>
            <span className={`text-sm font-black ${allMarked ? 'text-green-600' : 'text-gray-400'}`}>{markedCount}/{totalCount}</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div className={`h-full rounded-full transition-all ${allMarked ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${totalCount > 0 ? (markedCount / totalCount) * 100 : 0}%` }} />
          </div>

          <div className="space-y-3 mb-6">
            {sortedProducts.map(p => {
              const result = results[p.client_product_id]
              const isReasonOpen = showReasonFor === p.client_product_id
              const isTipShown = showTipFor === p.client_product_id
              const isMust = p.priority === 'must'

              return (
                <div key={p.client_product_id}>
                  <div className={`rounded-2xl border-2 p-4 transition-all ${
                    result?.is_sold ? 'bg-green-50 border-green-400'
                    : result?.is_sold === false ? 'bg-red-50 border-red-400'
                    : isMust ? 'bg-red-50 border-red-300'
                    : p.wasUnsoldLastTime ? 'bg-orange-50 border-orange-400'
                    : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-base font-bold text-gray-900 leading-tight flex-1 mr-2">{p.product.name}</p>
                      <div className="flex gap-1 shrink-0">
                        {isMust && !result && <span className="text-xs font-black px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse-soft">MUST</span>}
                        {p.wasUnsoldLastTime && !result && !isMust && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white">долг</span>}
                      </div>
                    </div>
                    {p.wasUnsoldLastTime && p.lastRefusalReason && !result && (
                      <p className="text-xs text-orange-700 mb-2 -mt-1">Прошлый раз: {p.lastRefusalReason}</p>
                    )}
                    {result ? (
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${result.is_sold ? 'text-green-700' : 'text-red-700'}`}>
                          {result.is_sold ? '✓ Продано' : `✗ ${result.refusal_reason}`}
                        </span>
                        {!isCompleted && <button onClick={() => handleReset(p.client_product_id)} className="text-xs text-gray-400 underline">Изменить</button>}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => handleSold(p.client_product_id)} disabled={isPending}
                          className="flex-1 bg-green-600 active:bg-green-700 text-white text-base font-bold py-3.5 rounded-xl active:scale-95 disabled:opacity-50">Продал</button>
                        <button onClick={() => handleNotSold(p.client_product_id)} disabled={isPending}
                          className="flex-1 bg-red-500 active:bg-red-600 text-white text-base font-bold py-3.5 rounded-xl active:scale-95 disabled:opacity-50">Не продал</button>
                      </div>
                    )}
                  </div>
                  {isReasonOpen && (
                    <div className="bg-red-50 rounded-b-2xl border-2 border-t-0 border-red-300 p-3 -mt-2 pt-5 space-y-1.5">
                      {REFUSAL_REASONS.map(reason => (
                        <button key={reason} onClick={() => handleSelectReason(p.client_product_id, reason)}
                          className="block w-full text-left text-sm font-medium px-4 py-3 rounded-xl bg-white border border-red-200 active:bg-red-100">{reason}</button>
                      ))}
                    </div>
                  )}
                  {isTipShown && result && !result.is_sold && result.refusal_reason && OBJECTION_TIPS[result.refusal_reason] && (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-3 mt-1">
                      <p className="text-xs font-bold text-yellow-700 mb-1">💡 Подсказка</p>
                      <p className="text-sm text-yellow-800">{OBJECTION_TIPS[result.refusal_reason]}</p>
                      <button onClick={() => { handleReset(p.client_product_id); setShowTipFor(null) }}
                        className="mt-2 text-xs font-bold text-blue-600 underline">Попробовать снова →</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ═══ MERCH TAB ═══ */}
      {tab === 'merch' && (
        <>
          {/* Perfect Store Score */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 mb-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase opacity-80">Perfect Store Score</p>
                <p className="text-3xl font-black">{merchScore}%</p>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center">
                <span className="text-lg font-black">{merchCompleted}/{MERCH_TASKS.length}</span>
              </div>
            </div>
          </div>

          {/* Before photo */}
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">📸 Фото ДО</p>
          {photoBeforeState ? (
            <img src={photoBeforeState} alt="До" className="w-full h-32 object-cover rounded-2xl border-2 border-blue-300 mb-4" />
          ) : (
            <label className="flex items-center justify-center h-20 border-2 border-dashed border-blue-300 rounded-2xl cursor-pointer active:bg-blue-50 mb-4">
              <span className="text-sm font-bold text-blue-500">Сделать фото ДО</span>
              <input type="file" accept="image/*" capture="environment" onChange={handlePhoto('before')} className="hidden" />
            </label>
          )}

          {/* Checklist */}
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Чек-лист мерчендайзинга</p>
          <div className="space-y-2 mb-4">
            {MERCH_TASKS.map(task => (
              <button key={task.id} onClick={() => { vibrate(); setMerchDone(prev => ({ ...prev, [task.id]: !prev[task.id] })) }}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left active:scale-[0.98] ${
                  merchDone[task.id] ? 'bg-green-50 border-green-400' : 'bg-white border-gray-200'
                }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-base ${
                  merchDone[task.id] ? 'bg-green-500 text-white' : 'bg-gray-100'
                }`}>
                  {merchDone[task.id] ? '✓' : task.emoji}
                </div>
                <span className={`text-sm font-bold ${merchDone[task.id] ? 'text-green-700 line-through' : 'text-gray-800'}`}>{task.label}</span>
              </button>
            ))}
          </div>

          {/* After photo */}
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">📸 Фото ПОСЛЕ (обязательно)</p>
          {photoAfter ? (
            <div className="relative mb-4">
              <img src={photoAfter} alt="После" className="w-full h-32 object-cover rounded-2xl border-2 border-green-300" />
              {!isCompleted && (
                <label className="absolute bottom-2 right-2 bg-white/90 font-bold text-xs px-3 py-1.5 rounded-xl cursor-pointer shadow">
                  Переснять <input type="file" accept="image/*" capture="environment" onChange={handlePhoto('after')} className="hidden" />
                </label>
              )}
            </div>
          ) : (
            <label className="flex items-center justify-center h-20 border-2 border-dashed border-green-300 rounded-2xl cursor-pointer active:bg-green-50 mb-4">
              <span className="text-sm font-bold text-green-600">Сделать фото ПОСЛЕ</span>
              <input type="file" accept="image/*" capture="environment" onChange={handlePhoto('after')} className="hidden" />
            </label>
          )}

          {/* Before/After comparison */}
          {photoBeforeState && photoAfter && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div><p className="text-xs text-center text-gray-400 mb-1">ДО</p><img src={photoBeforeState} alt="До" className="w-full h-24 object-cover rounded-xl border" /></div>
              <div><p className="text-xs text-center text-gray-400 mb-1">ПОСЛЕ</p><img src={photoAfter} alt="После" className="w-full h-24 object-cover rounded-xl border" /></div>
            </div>
          )}
        </>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4 font-medium">{error}</p>}

      {/* Complete */}
      {!isCompleted && (
        <button onClick={handleComplete} disabled={!canComplete || isPending}
          className={`w-full font-black py-5 rounded-2xl text-lg active:scale-[0.98] shadow-lg ${
            canComplete ? 'bg-green-600 active:bg-green-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
          }`}>
          {isPending ? 'Сохраняем...' : canComplete ? '✓ Завершить визит' : `Осталось: ${
            !allMarked && !hasPhotoAfter ? `${totalCount - markedCount} тов. + фото` : !allMarked ? `${totalCount - markedCount} тов.` : 'фото ПОСЛЕ'
          }`}
        </button>
      )}

      {isCompleted && (
        <div className="bg-green-100 rounded-2xl p-5 text-center">
          <p className="text-green-700 font-black text-lg">✓ Визит завершён</p>
          {timer > 0 && <p className="text-sm text-green-600 mt-1">Время: {formatTime(timer)}</p>}
        </div>
      )}
    </div>
  )
}
