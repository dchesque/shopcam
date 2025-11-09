'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  UserCheck,
  UsersRound,
  TrendingUp,
  Video,
  RefreshCw
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

// ============================================
// MVP DASHBOARD - SIMPLIFICADO
// ============================================

export default function DashboardPage() {
  const [metrics, setMetrics] = React.useState({
    totalPeople: 0,
    potentialCustomers: 0,
    employees: 0,
    groupsRate: 0,
  })

  const [chartData, setChartData] = React.useState<Array<{ time: string; people: number }>>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [lastUpdate, setLastUpdate] = React.useState<Date>(new Date())

  // Fetch metrics from backend
  const fetchMetrics = React.useCallback(async () => {
    try {
      // Buscar métricas do backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      const response = await fetch(`${apiUrl}/api/analytics/metrics`)
      if (response.ok) {
        const data = await response.json()

        setMetrics({
          totalPeople: data.total_people || 0,
          potentialCustomers: data.potential_customers || 0,
          employees: data.employees_count || 0,
          groupsRate: data.groups_count || 0,
        })

        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch chart data (últimas 24h)
  const fetchChartData = React.useCallback(async () => {
    try {
      // Buscar dados históricos
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      const response = await fetch(`${apiUrl}/api/analytics/history?hours=24`)
      if (response.ok) {
        const data = await response.json()

        // Formatar dados para o gráfico
        const formatted = data.map((item: any) => ({
          time: new Date(item.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          people: item.total_people || 0
        }))

        setChartData(formatted)
      }
    } catch (error) {
      console.error('Error fetching chart data:', error)

      // Dados de exemplo se falhar
      setChartData(generateDummyData())
    }
  }, [])

  // Initial fetch
  React.useEffect(() => {
    fetchMetrics()
    fetchChartData()

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      fetchMetrics()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchMetrics, fetchChartData])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Dashboard MVP
          </h1>
          <p className="text-neutral-400">
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </p>
        </div>

        <Button
          onClick={() => {
            fetchMetrics()
            fetchChartData()
          }}
          variant="outline"
          size="sm"
          className="text-neutral-400 border-neutral-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Metrics Grid - 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Pessoas */}
        <MetricCardSimple
          title="Total de Pessoas"
          value={metrics.totalPeople}
          icon={Users}
          color="blue"
          isLoading={isLoading}
        />

        {/* Clientes Potenciais */}
        <MetricCardSimple
          title="Clientes Potenciais"
          value={metrics.potentialCustomers}
          icon={TrendingUp}
          color="green"
          isLoading={isLoading}
        />

        {/* Funcionários */}
        <MetricCardSimple
          title="Funcionários"
          value={metrics.employees}
          icon={UserCheck}
          color="purple"
          isLoading={isLoading}
        />

        {/* Grupos */}
        <MetricCardSimple
          title="Grupos Detectados"
          value={metrics.groupsRate}
          icon={UsersRound}
          color="yellow"
          isLoading={isLoading}
        />
      </div>

      {/* Gráfico Simples - Últimas 24h */}
      <Card className="p-6 bg-neutral-900/50 border-neutral-800/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Fluxo de Pessoas
            </h3>
            <p className="text-sm text-neutral-400">Últimas 24 horas</p>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="time"
                stroke="#666"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#666"
                fontSize={12}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line
                type="monotone"
                dataKey="people"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Preview da Câmera */}
      <Card className="p-6 bg-neutral-900/50 border-neutral-800/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Câmera ao Vivo</h3>
            <p className="text-sm text-neutral-400">Stream em tempo real</p>
          </div>

          <Link href="/cameras">
            <Button
              variant="outline"
              size="sm"
              className="text-neutral-400 border-neutral-700"
            >
              <Video className="w-4 h-4 mr-2" />
              Ver Fullscreen
            </Button>
          </Link>
        </div>

        {/* Preview do Stream MJPEG */}
        <div className="relative bg-neutral-800/30 rounded-lg overflow-hidden aspect-video">
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/camera/stream`}
            alt="Camera stream"
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback se stream não estiver disponível
              e.currentTarget.src = '/placeholder-camera.png'
            }}
          />

          {/* Overlay com legenda */}
          <div className="absolute bottom-4 right-4 bg-black/70 p-3 rounded-lg text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-white">Cliente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-white">Funcionário</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-white">Grupo</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ============================================
// Metric Card Simplificado
// ============================================

interface MetricCardSimpleProps {
  title: string
  value: number
  icon: React.ElementType
  color: 'blue' | 'green' | 'purple' | 'yellow'
  isLoading?: boolean
}

function MetricCardSimple({
  title,
  value,
  icon: Icon,
  color,
  isLoading
}: MetricCardSimpleProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    purple: 'bg-purple-500/10 text-purple-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
  }

  return (
    <Card className="p-6 bg-neutral-900/50 border-neutral-800/50">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-neutral-400">{title}</p>
        {isLoading ? (
          <div className="h-8 bg-neutral-800 rounded animate-pulse w-20" />
        ) : (
          <p className="text-3xl font-bold text-white">{value}</p>
        )}
      </div>
    </Card>
  )
}

// ============================================
// Dummy Data Generator (fallback)
// ============================================

function generateDummyData() {
  const data = []
  const now = new Date()

  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    data.push({
      time: time.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      people: Math.floor(Math.random() * 20) + 5
    })
  }

  return data
}
