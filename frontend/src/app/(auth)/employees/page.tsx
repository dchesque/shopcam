'use client'

import * as React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  UserPlus,
  Users,
  Trash2,
  Upload,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

// ============================================
// MVP EMPLOYEES PAGE - SIMPLIFICADO
// ============================================

interface Employee {
  id: string
  name: string
  employee_id?: string
  department?: string
  position?: string
  created_at: string
  status: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Form state
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [department, setDepartment] = React.useState('')
  const [position, setPosition] = React.useState('')
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

  // Fetch employees
  const fetchEmployees = React.useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/employees/list`)
      if (response.ok) {
        const data = await response.json()
        setEmployees(data.employees || [])
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setIsLoading(false)
    }
  }, [apiUrl])

  React.useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !file) {
      setMessage({ type: 'error', text: 'Nome e foto são obrigatórios' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('file', file)
      if (email) formData.append('employee_id', email)
      if (department) formData.append('department', department)
      if (position) formData.append('position', position)

      const response = await fetch(`${apiUrl}/api/employees/register`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Funcionário cadastrado com sucesso!' })

        // Reset form
        setName('')
        setEmail('')
        setDepartment('')
        setPosition('')
        setFile(null)
        setPreview(null)

        // Refresh list
        fetchEmployees()

        // Close modal after 2s
        setTimeout(() => {
          setIsModalOpen(false)
          setMessage(null)
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.detail || 'Erro ao cadastrar funcionário' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async (employeeId: string, employeeName: string) => {
    if (!confirm(`Tem certeza que deseja remover ${employeeName}?`)) return

    try {
      const response = await fetch(`${apiUrl}/api/employees/${employeeId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchEmployees()
      } else {
        alert('Erro ao deletar funcionário')
      }
    } catch (error) {
      alert('Erro ao conectar com o servidor')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Funcionários
          </h1>
          <p className="text-neutral-400">
            Gerencie sua equipe e reconhecimento facial
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          size="md"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Cadastrar Funcionário
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-neutral-900/50 border-neutral-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm mb-1">Total de Funcionários</p>
              <p className="text-3xl font-bold text-white">{employees.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-neutral-900/50 border-neutral-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm mb-1">Funcionários Ativos</p>
              <p className="text-3xl font-bold text-green-400">
                {employees.filter(e => e.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Employee List */}
      <Card className="p-6 bg-neutral-900/50 border-neutral-800/50">
        <h3 className="text-lg font-semibold text-white mb-4">
          Lista de Funcionários
        </h3>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-neutral-800/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Nenhum funcionário cadastrado
            </h3>
            <p className="text-neutral-400 mb-6">
              Comece cadastrando o primeiro funcionário
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="primary"
              size="md"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Cadastrar Primeiro Funcionário
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map(employee => (
              <Card
                key={employee.id}
                className="p-4 bg-neutral-800/30 border-neutral-700/50 hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {employee.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{employee.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-neutral-400 mt-1">
                        {employee.position && (
                          <span>{employee.position}</span>
                        )}
                        {employee.department && (
                          <>
                            <span>•</span>
                            <span>{employee.department}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>
                          Cadastrado em {new Date(employee.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      employee.status === 'active'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-neutral-500/10 text-neutral-400'
                    }`}>
                      {employee.status === 'active' ? 'Ativo' : 'Inativo'}
                    </div>

                    <Button
                      onClick={() => handleDelete(employee.id, employee.name)}
                      variant="danger"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-neutral-900 border-neutral-800 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Cadastrar Funcionário</h2>
                <Button
                  onClick={() => setIsModalOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="text-neutral-400"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Message */}
              {message && (
                <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
                  message.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-red-500/10 border border-red-500/30'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
                    {message.text}
                  </span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Nome Completo *
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João Silva"
                    required
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>

                {/* Email/ID */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Email ou ID (opcional)
                  </label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: joao@empresa.com"
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>

                {/* Department & Position */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Departamento (opcional)
                    </label>
                    <Input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Ex: Vendas"
                      className="bg-neutral-800 border-neutral-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Cargo (opcional)
                    </label>
                    <Input
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Ex: Vendedor"
                      className="bg-neutral-800 border-neutral-700 text-white"
                    />
                  </div>
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Foto do Funcionário *
                  </label>

                  {!preview ? (
                    <label className="block">
                      <div className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center cursor-pointer hover:border-neutral-600 transition-colors">
                        <Upload className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
                        <p className="text-neutral-400 mb-1">
                          Clique para selecionar ou arraste a foto aqui
                        </p>
                        <p className="text-neutral-500 text-sm">
                          JPG, PNG ou JPEG (máx. 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        required
                      />
                    </label>
                  ) : (
                    <div className="relative h-64">
                      <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          setFile(null)
                          setPreview(null)
                        }}
                        variant="danger"
                        size="sm"
                        className="absolute top-2 right-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-400 text-sm">
                    ℹ️ A foto será usada para reconhecimento facial. Certifique-se de que o rosto está visível e bem iluminado.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    variant="outline"
                    size="md"
                    className="flex-1 border-neutral-700 text-neutral-400"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Cadastrando...' : 'Cadastrar Funcionário'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
