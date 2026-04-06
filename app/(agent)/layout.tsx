import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'agent') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 safe-top">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-black">
              {profile?.full_name?.charAt(0) ?? 'A'}
            </span>
          </div>
          <span className="font-bold text-gray-900 text-sm">{profile?.full_name}</span>
        </div>
        <SignOutForm />
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>

      {/* Fixed bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex pb-safe z-50">
        <Link href="/tasks" className="flex-1 flex flex-col items-center py-3 text-xs font-bold text-blue-600">
          <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Задачи
        </Link>
        <Link href="/tasks/leaderboard" className="flex-1 flex flex-col items-center py-3 text-xs font-bold text-gray-400">
          <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Рейтинг
        </Link>
        <Link href="/tasks/report" className="flex-1 flex flex-col items-center py-3 text-xs font-bold text-gray-400">
          <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Отчёт
        </Link>
      </nav>
    </div>
  )
}

function SignOutForm() {
  async function signOut() {
    'use server'
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    await supabase.auth.signOut()
    const { redirect } = await import('next/navigation')
    redirect('/auth/login')
  }

  return (
    <form action={signOut}>
      <button type="submit" className="text-xs font-bold text-gray-400 px-3 py-1 rounded-lg active:bg-gray-100">
        Выйти
      </button>
    </form>
  )
}
