import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from './BottomNav'

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
      <BottomNav />
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
