'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { startDay } from '@/lib/actions/workday'

export default function StartDayButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await startDay()
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="bg-blue-600 active:bg-blue-700 disabled:opacity-50 text-white font-black py-5 px-16 rounded-2xl text-xl transition-all active:scale-95 shadow-xl"
    >
      {isPending ? 'Загрузка...' : 'Начать день'}
    </button>
  )
}
