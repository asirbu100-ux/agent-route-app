'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { finishDay } from '@/lib/actions/workday'

export default function FinishDayButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirm, setConfirm] = useState(false)

  function handleFinish() {
    startTransition(async () => {
      await finishDay()
      router.refresh()
    })
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="w-full bg-green-600 active:bg-green-700 text-white font-black py-5 rounded-2xl text-lg transition-all active:scale-[0.98] shadow-xl"
      >
        Завершить день
      </button>
    )
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-green-300 p-5 space-y-3">
      <p className="text-base text-gray-800 font-bold text-center">Завершить рабочий день?</p>
      <div className="flex gap-3">
        <button
          onClick={handleFinish}
          disabled={isPending}
          className="flex-1 bg-green-600 text-white font-bold py-4 rounded-xl active:bg-green-700 disabled:opacity-50 text-base"
        >
          {isPending ? 'Завершаем...' : 'Да'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-xl active:bg-gray-200 text-base"
        >
          Нет
        </button>
      </div>
    </div>
  )
}
