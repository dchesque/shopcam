import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import type { Database } from './database'

/**
 * Tipos de autenticação
 */

// Profile do usuário do banco de dados
export type UserProfile = Database['public']['Tables']['profiles']['Row']

// Usuário estendido com profile
export interface User extends SupabaseUser {
  profile?: UserProfile
}

// Contexto de autenticação
export interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>
}

// Credenciais de login
export interface SignInCredentials {
  email: string
  password: string
}

// Dados de registro
export interface SignUpCredentials {
  email: string
  password: string
  fullName?: string
}

// Resposta de autenticação
export interface AuthResponse {
  error: Error | null
}
