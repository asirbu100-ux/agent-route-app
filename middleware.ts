import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — MUST be done before any redirect checks
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public paths that don't require auth
  const isPublicPath =
    pathname.startsWith('/auth') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    // Read role from JWT custom claim
    const jwt = await supabase.auth.getSession()
    const role = (jwt.data.session?.user?.user_metadata?.user_role as string) ??
      (await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data }) => data?.role ?? 'agent'))

    // Redirect to correct area if on wrong path
    if (pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'manager' ? '/dashboard' : '/route'
      return NextResponse.redirect(url)
    }

    // Prevent agents from accessing manager routes
    const managerPaths = ['/dashboard', '/agents', '/routes', '/products']
    if (role === 'agent' && managerPaths.some(p => pathname.startsWith(p))) {
      const url = request.nextUrl.clone()
      url.pathname = '/route'
      return NextResponse.redirect(url)
    }

    // Prevent managers from accessing agent routes
    if (role === 'manager' && pathname.startsWith('/route')) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Redirect away from login if already logged in
    if (pathname.startsWith('/auth/login')) {
      const url = request.nextUrl.clone()
      url.pathname = role === 'manager' ? '/dashboard' : '/route'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
