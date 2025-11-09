'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Camera,
  Download,
  Pause,
  Play,
  RefreshCw,
  Maximize2,
  Minimize2
} from 'lucide-react'

// ============================================
// MVP CAMERA PAGE - SIMPLIFICADO
// ============================================

export default function CamerasPage() {
  const [isPaused, setIsPaused] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [streamKey, setStreamKey] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
  const streamUrl = `${apiUrl}/api/camera/stream?t=${streamKey}`

  // Handle snapshot download
  const handleSnapshot = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const link = document.createElement('a')
    link.href = streamUrl
    link.download = `snapshot-${timestamp}.jpg`
    link.click()
  }

  // Handle pause/play
  const handleTogglePause = () => {
    setIsPaused(!isPaused)
  }

  // Handle refresh stream
  const handleRefresh = () => {
    setStreamKey(prev => prev + 1)
  }

  // Handle fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Listen for fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Câmera ao Vivo
          </h1>
          <p className="text-neutral-400">
            Stream em tempo real com detecções de IA
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleTogglePause}
            variant="outline"
            size="sm"
            className="text-neutral-400 border-neutral-700"
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Retomar
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pausar
              </>
            )}
          </Button>

          <Button
            onClick={handleSnapshot}
            variant="outline"
            size="sm"
            className="text-neutral-400 border-neutral-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Snapshot
          </Button>

          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="text-neutral-400 border-neutral-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>

          <Button
            onClick={handleToggleFullscreen}
            variant="outline"
            size="sm"
            className="text-neutral-400 border-neutral-700"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 mr-2" />
                Sair
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 mr-2" />
                Fullscreen
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stream Container */}
      <Card
        ref={containerRef}
        className="relative bg-neutral-900/50 border-neutral-800/50 overflow-hidden"
      >
        {/* Stream MJPEG */}
        <div className="relative bg-neutral-800/30 aspect-video">
          {!isPaused ? (
            <img
              key={streamKey}
              src={streamUrl}
              alt="Camera stream"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback se stream não estiver disponível
                console.error('Stream error')
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-400 text-lg">Stream pausado</p>
                <p className="text-neutral-500 text-sm mt-2">
                  Clique em "Retomar" para continuar
                </p>
              </div>
            </div>
          )}

          {/* Overlay - Legenda de Cores */}
          <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm p-4 rounded-lg border border-neutral-700/50 space-y-2">
            <div className="text-white font-semibold text-sm mb-3">
              Legenda de Detecções
            </div>

            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-white text-sm">Cliente</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-white text-sm">Funcionário</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-white text-sm">Grupo</span>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-neutral-700/50">
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`}></div>
            <span className="text-white text-sm font-medium">
              {isPaused ? 'Pausado' : 'Ao Vivo'}
            </span>
          </div>
        </div>

        {/* Info Bar */}
        <div className="p-4 bg-neutral-900/80 border-t border-neutral-800/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-300">Câmera Principal</span>
              </div>
              <div className="w-px h-4 bg-neutral-700"></div>
              <span className="text-neutral-400">
                RTSP Stream • 5 FPS
              </span>
            </div>

            <div className="text-neutral-400">
              Última atualização: {new Date().toLocaleTimeString('pt-BR')}
            </div>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-4 bg-neutral-900/30 border-neutral-800/50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Camera className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">
              Como funciona o sistema de detecção
            </h3>
            <div className="text-neutral-400 text-sm space-y-1">
              <p>• <strong className="text-green-400">Verde:</strong> Clientes individuais ou em grupos pequenos (1-4 pessoas)</p>
              <p>• <strong className="text-blue-400">Azul:</strong> Funcionários identificados pelo reconhecimento facial</p>
              <p>• <strong className="text-yellow-400">Amarelo:</strong> Grupos grandes (5+ pessoas)</p>
              <p className="mt-2 text-xs text-neutral-500">
                Dica: Use o botão "Fullscreen" para visualização em tela cheia. Pressione ESC para sair.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
