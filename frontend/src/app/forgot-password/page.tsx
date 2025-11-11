'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Loading } from '@/components/ui/loading'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await resetPassword(email)

      if (error) {
        setError('Erro ao enviar email de recuperação')
        toast.error('Erro ao enviar email', {
          description: 'Verifique o email e tente novamente',
        })
        return
      }

      setSuccess(true)
      toast.success('Email enviado!', {
        description: 'Verifique sua caixa de entrada',
      })
    } catch (err) {
      console.error('Erro ao enviar email:', err)
      setError('Ocorreu um erro inesperado. Tente novamente.')
      toast.error('Erro ao enviar email')
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
            <h1 className="text-2xl font-bold text-white mb-4">Email enviado!</h1>
            <p className="text-neutral-400 mb-6">
              Enviamos instruções para recuperação de senha para <strong>{email}</strong>.
              Verifique sua caixa de entrada e siga as instruções.
            </p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-red-500 to-purple-500 hover:from-red-600 hover:to-purple-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="fixed inset-0 bg-gradient-to-br from-red-500/10 via-neutral-950 to-purple-500/10" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />

      <div className="relative w-full max-w-md">
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-red-500 to-purple-500 p-3 rounded-xl">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Recuperar senha</h1>
            <p className="text-neutral-400">
              Digite seu email para receber instruções de recuperação
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-500 to-purple-500 hover:from-red-600 hover:to-purple-600 text-white font-semibold py-3 transition-all duration-200 hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  Enviar instruções
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-neutral-400 hover:text-neutral-300 text-sm inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
