import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Route handler para callback de autenticação do Supabase
 * Usado para confirmação de email e reset de senha
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        // Redirecionar para a URL de desenvolvimento
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        // Redirecionar para a URL de produção
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        // Fallback
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Retornar para uma página de erro se houver problema
  return NextResponse.redirect(`${origin}/login?error=authentication_failed`)
}
