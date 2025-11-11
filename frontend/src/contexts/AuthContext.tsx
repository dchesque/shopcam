'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { AuthContextType, User, UserProfile } from '@/types/auth'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Inicializar sessão
  useEffect(() => {
    // Carregar perfil do usuário
    const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          console.error('Erro ao carregar perfil:', error)
          return null
        }

        return data as UserProfile
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        return null
      }
    }

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          const profile = await loadUserProfile(session.user.id)
          setUser({ ...session.user, profile: profile || undefined })
          setSession(session)
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)

      if (session?.user) {
        const profile = await loadUserProfile(session.user.id)
        setUser({ ...session.user, profile: profile || undefined })
        setSession(session)
      } else {
        setUser(null)
        setSession(null)
      }

      // Navegação baseada no evento
      if (event === 'SIGNED_IN') {
        router.push('/dashboard')
      } else if (event === 'SIGNED_OUT') {
        router.push('/login')
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  // Login
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      if (data.user) {
        // Carregar perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        setUser({ ...data.user, profile: profile as UserProfile || undefined })
        setSession(data.session)
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Registro
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        return { error }
      }

      // Criar perfil do usuário
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName || null,
          role: 'user',
        })

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError)
        }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Logout
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  // Reset de senha
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Atualizar perfil
  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { error: new Error('Usuário não autenticado') }
      }

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)

      if (error) {
        return { error }
      }

      // Recarregar perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUser({ ...user, profile: profile as UserProfile })
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

// Hook para obter o usuário atual
export function useUser() {
  const { user } = useAuth()
  return user
}

// Hook para verificar se está autenticado
export function useIsAuthenticated() {
  const { user, isLoading } = useAuth()
  return { isAuthenticated: !!user, isLoading }
}
