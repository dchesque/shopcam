'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loading } from '@/components/ui/loading'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

/**
 * Componente para proteger rotas que requerem autenticação
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !user) {
        // Salvar a rota atual para redirecionar após login
        const currentPath = window.location.pathname
        router.push(`${redirectTo}?redirectTo=${currentPath}`)
      } else if (!requireAuth && user) {
        // Se o usuário está autenticado mas não deveria estar nesta rota
        router.push('/dashboard')
      }
    }
  }, [user, isLoading, requireAuth, redirectTo, router])

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    )
  }

  // Se requer autenticação mas não está autenticado, não renderiza nada
  if (requireAuth && !user) {
    return null
  }

  // Se não requer autenticação mas está autenticado, não renderiza nada
  if (!requireAuth && user) {
    return null
  }

  return <>{children}</>
}
