'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Loading } from '@/components/ui/loading'
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        setError('Email ou senha inválidos')
        toast.error('Erro ao fazer login', {
          description: 'Verifique suas credenciais e tente novamente',
        })
        return
      }

      toast.success('Login realizado com sucesso!')
      router.push(redirectTo)
    } catch (err) {
      console.error('Erro no login:', err)
      setError('Ocorreu um erro inesperado. Tente novamente.')
      toast.error('Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-red-500/10 via-neutral-950 to-purple-500/10" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />

      {/* Login card */}
      <div className="relative w-full max-w-md">
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-red-500 to-purple-500 p-3 rounded-xl">
              <LogIn className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo</h1>
            <p className="text-neutral-400">Entre com sua conta ShopFlow</p>
          </div>

          {/* Error alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-red-500/50 focus:ring-red-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-neutral-300">
                  Senha
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 pr-10 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-red-500/50 focus:ring-red-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-500 to-purple-500 hover:from-red-600 hover:to-purple-600 text-white font-semibold py-3 transition-all duration-200 hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-neutral-900/50 text-neutral-400">
                Novo no ShopFlow?
              </span>
            </div>
          </div>

          {/* Register link */}
          <div className="text-center">
            <Link
              href="/register"
              className="text-red-400 hover:text-red-300 font-medium transition-colors"
            >
              Criar uma conta
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-neutral-500">
          <p>
            Ao continuar, você concorda com nossos{' '}
            <Link href="/terms" className="text-neutral-400 hover:text-neutral-300 underline">
              Termos de Serviço
            </Link>{' '}
            e{' '}
            <Link href="/privacy" className="text-neutral-400 hover:text-neutral-300 underline">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading size="lg" />}>
      <LoginForm />
    </Suspense>
  )
}
