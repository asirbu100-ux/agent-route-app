import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager') redirect('/tasks')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="font-bold text-gray-900">Контроль агентов</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{profile?.full_name}</span>
          <SignOutForm />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className="w-52 bg-white border-r border-gray-200 py-4 px-3 shrink-0">
          <NavLink href="/dashboard">Обзор</NavLink>
          <NavLink href="/clients">Клиенты</NavLink>
          <NavLink href="/products">Товары</NavLink>
        </nav>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-100 font-medium mb-0.5"
    >
      {children}
    </Link>
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
      <button type="submit" className="text-xs text-gray-500 hover:text-gray-700">
        Выйти
      </button>
    </form>
  )
}
