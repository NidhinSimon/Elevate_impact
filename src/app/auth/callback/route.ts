import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      console.log("[AUTH CALLBACK] Success, redirecting to:", next);
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error("[AUTH CALLBACK] Error exchanging code:", error.message);
  } else {
    console.warn("[AUTH CALLBACK] No code found in URL");
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
