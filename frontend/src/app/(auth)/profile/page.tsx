'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Shield, Save, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [fullName, setFullName] = React.useState(user?.profile?.full_name || '')
  const [isLoading, setIsLoading] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')

  // Atualizar quando o user mudar
  React.useEffect(() => {
    if (user?.profile?.full_name) {
      setFullName(user.profile.full_name)
    }
  }, [user])

  const handleSave = async () => {
    if (!fullName.trim()) {
      setErrorMessage('Por favor, insira um nome')
      return
    }

    setIsLoading(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const { error } = await updateProfile({ full_name: fullName })

      if (error) {
        setErrorMessage('Erro ao atualizar perfil: ' + error.message)
      } else {
        setSuccessMessage('Perfil atualizado com sucesso!')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error) {
      setErrorMessage('Erro ao atualizar perfil')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Meu Perfil
        </h1>
        <p className="text-neutral-400">
          Gerencie suas informações pessoais
        </p>
      </div>

      {/* Profile Card */}
      <Card className="p-6 bg-neutral-900/50 border-neutral-800/50">
        {/* Avatar Section */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-neutral-800/50">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">
              {user?.profile?.full_name || 'Usuário'}
            </h2>
            <p className="text-sm text-neutral-400">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="space-y-6">
          {/* Nome Completo */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Digite seu nome completo"
              className={cn(
                "w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-lg",
                "text-white placeholder-neutral-500",
                "focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50",
                "transition-all duration-200"
              )}
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Email
            </label>
            <div className={cn(
              "w-full px-4 py-3 bg-neutral-800/30 border border-neutral-700/30 rounded-lg",
              "text-neutral-400 flex items-center gap-2"
            )}>
              <Mail className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              O email não pode ser alterado
            </p>
          </div>

          {/* Role (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Função
            </label>
            <div className={cn(
              "w-full px-4 py-3 bg-neutral-800/30 border border-neutral-700/30 rounded-lg",
              "text-neutral-400 flex items-center gap-2"
            )}>
              <Shield className="w-4 h-4" />
              <span className="capitalize">{user?.profile?.role || 'user'}</span>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
            >
              <p className="text-sm text-green-400">{successMessage}</p>
            </motion.div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
              <p className="text-sm text-red-400">{errorMessage}</p>
            </motion.div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={isLoading || !fullName.trim()}
              className={cn(
                "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
                "text-white font-medium px-6",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-4 bg-blue-500/10 border-blue-500/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-400 mb-1">
              Informação de Segurança
            </h3>
            <p className="text-xs text-blue-300/80">
              Suas informações pessoais são armazenadas de forma segura.
              Para alterar sua senha ou email, entre em contato com o administrador do sistema.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
