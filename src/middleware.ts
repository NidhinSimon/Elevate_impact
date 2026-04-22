import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const { data: { session } } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname;

  // Define public paths that bypass all checks
  const publicPaths = [
    '/', 
    '/charity', 
    '/draw', 
    '/donate', 
    '/login', 
    '/signup', 
    '/subscribe',
    '/api/stripe/webhook'
  ];
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith('/charity/'));

  if (isPublicPath) return response;

  // Protect Dashboard and Score APIs
  const isProtectedPath = pathname.startsWith('/dashboard') || pathname.startsWith('/api/scores');

  if (isProtectedPath) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Fetch subscription status
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', session.user.id)
      .single()

    const status = profile?.subscription_status || 'inactive';
    
    if (['inactive', 'cancelled', 'lapsed'].includes(status)) {
      // Allow only the subscribe page if inactive
      if (pathname !== '/subscribe') {
        return NextResponse.redirect(new URL('/subscribe', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
