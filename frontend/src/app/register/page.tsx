'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Loading } from '@/components/ui/loading'
import { UserPlus, Mail, Lock, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  // Validação de senha
  const passwordValidation = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Validações
    if (!fullName.trim()) {
      setError('Por favor, informe seu nome completo')
      return
    }

    if (!isPasswordValid) {
      setError('A senha não atende aos requisitos mínimos')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await signUp(email, password, fullName)

      if (error) {
        if (error.message.includes('already registered')) {
          setError('Este email já está cadastrado')
        } else {
          setError('Erro ao criar conta. Tente novamente.')
        }
        toast.error('Erro ao criar conta', {
          description: error.message,
        })
        return
      }

      setSuccess(true)
      toast.success('Conta criada com sucesso!', {
        description: 'Verifique seu email para confirmar a conta',
      })

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      console.error('Erro no registro:', err)
      setError('Ocorreu um erro inesperado. Tente novamente.')
      toast.error('Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
        <div className="fixed inset-0 bg-gradient-to-br from-red-500/10 via-neutral-950 to-purple-500/10" />
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />

        <div className="relative w-full max-w-md">
          <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Conta criada com sucesso!</h1>
            <p className="text-neutral-400 mb-6">
              Enviamos um email de confirmação para <strong>{email}</strong>.
              Por favor, verifique sua caixa de entrada e confirme seu email antes de fazer login.
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-red-500 to-purple-500 hover:from-red-600 hover:to-purple-600"
            >
              Ir para Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4 py-8">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-red-500/10 via-neutral-950 to-purple-500/10" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />

      {/* Register card */}
      <div className="relative w-full max-w-md">
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-red-500 to-purple-500 p-3 rounded-xl">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Criar conta</h1>
            <p className="text-neutral-400">Comece a usar o ShopFlow hoje</p>
          </div>

          {/* Error alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-neutral-300">
                Nome completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-red-500/50 focus:ring-red-500/20"
                />
              </div>
            </div>

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
              <Label htmlFor="password" className="text-neutral-300">
                Senha
              </Label>
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

              {/* Password strength */}
              {password && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs text-neutral-400">Requisitos da senha:</p>
                  <div className="space-y-1">
                    <div className={`text-xs flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-400' : 'text-neutral-500'}`}>
                      <div className={`w-1 h-1 rounded-full ${passwordValidation.minLength ? 'bg-green-400' : 'bg-neutral-500'}`} />
                      Mínimo 8 caracteres
                    </div>
                    <div className={`text-xs flex items-center gap-2 ${passwordValidation.hasUpper ? 'text-green-400' : 'text-neutral-500'}`}>
                      <div className={`w-1 h-1 rounded-full ${passwordValidation.hasUpper ? 'bg-green-400' : 'bg-neutral-500'}`} />
                      Uma letra maiúscula
                    </div>
                    <div className={`text-xs flex items-center gap-2 ${passwordValidation.hasLower ? 'text-green-400' : 'text-neutral-500'}`}>
                      <div className={`w-1 h-1 rounded-full ${passwordValidation.hasLower ? 'bg-green-400' : 'bg-neutral-500'}`} />
                      Uma letra minúscula
                    </div>
                    <div className={`text-xs flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-400' : 'text-neutral-500'}`}>
                      <div className={`w-1 h-1 rounded-full ${passwordValidation.hasNumber ? 'bg-green-400' : 'bg-neutral-500'}`} />
                      Um número
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-neutral-300">
                Confirmar senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 pr-10 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-red-500/50 focus:ring-red-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showConfirmPassword ? (
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
              disabled={isLoading || !isPasswordValid}
              className="w-full bg-gradient-to-r from-red-500 to-purple-500 hover:from-red-600 hover:to-purple-600 text-white font-semibold py-3 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Criar conta
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
                Já tem uma conta?
              </span>
            </div>
          </div>

          {/* Login link */}
          <div className="text-center">
            <Link
              href="/login"
              className="text-red-400 hover:text-red-300 font-medium transition-colors"
            >
              Fazer login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-neutral-500">
          <p>
            Ao criar uma conta, você concorda com nossos{' '}
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
