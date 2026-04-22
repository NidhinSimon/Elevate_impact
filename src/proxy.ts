import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Senior Dev Practice:
 * This 'proxy.ts' serves as the middleware for Next.js 16.
 * It handles session verification, route protection, and role-based access control.
 * We use 'getUser()' instead of 'getSession()' for improved security as per Supabase recommendations.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Senior Dev Note: getUser() is safer as it verifies the JWT with the Supabase Auth server.
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const publicPaths = [
    '/',
    '/charity',
    '/draw',
    '/donate',
    '/pricing',
    '/login',
    '/signup',
    '/subscribe',
    '/admin/login',
    '/auth/auth-code-error',
    '/auth/callback',
    '/api/stripe/webhook',
  ]
  
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith('/charity/')
  )

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/admin/login'
    
  const isAdminPath = pathname.startsWith('/admin') && pathname !== '/admin/login'
  
  const isUserAppPath =
    pathname.startsWith('/dashboard') ||
    pathname === '/checkout' ||
    pathname.startsWith('/onboarding')
    
  const isProtectedApiPath = [
    '/api/checkout',
    '/api/stripe/checkout',
    '/api/stripe/verify-session',
    '/api/score',
    '/api/scores',
    '/api/subscription',
    '/api/charity-contribution',
  ].some((path) => pathname === path || pathname.startsWith(`${path}/`))

  let profile: { subscription_status?: string; role?: string } | null = null

  if (user && (isAdminPath || isUserAppPath || isProtectedApiPath || isAuthPage)) {
    const { data } = await supabase
      .from('profiles')
      .select('subscription_status, role')
      .eq('id', user.id)
      .single()

    profile = data
  }

  // Handle authenticated users visiting auth pages
  if (isAuthPage && user) {
    if (pathname === '/admin/login') {
      if (profile?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  if (isPublicPath) return response

  // Admin route protection
  if (isAdminPath) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
  }

  // Dashboard and protected API protection
  if (isUserAppPath || isProtectedApiPath) {
    if (!user) {
      if (isProtectedApiPath) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }

    const status = profile?.subscription_status || 'inactive'

    // Subscription gate for dashboard
    if (
      isUserAppPath &&
      pathname.startsWith('/dashboard') &&
      ['inactive', 'cancelled', 'lapsed'].includes(status)
    ) {
      if (pathname !== '/subscribe' && pathname !== '/dashboard/subscription') {
        return NextResponse.redirect(new URL('/subscribe', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
