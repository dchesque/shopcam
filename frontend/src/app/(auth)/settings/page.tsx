'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  Wifi,
  WifiOff,
  Settings as SettingsIcon,
  VideoIcon
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cameraAPI, type Camera as CameraType, type CameraCreateData } from '@/lib/api/cameras'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const [cameras, setCameras] = React.useState<CameraType[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [showAddModal, setShowAddModal] = React.useState(false)
  const [editingCamera, setEditingCamera] = React.useState<CameraType | null>(null)
  const [testingConnection, setTestingConnection] = React.useState<string | null>(null)

  // Carregar câmeras
  const loadCameras = React.useCallback(async () => {
    try {
      const { cameras: cameraList } = await cameraAPI.listCameras()
      setCameras(cameraList)
    } catch (error) {
      console.error('Erro ao carregar câmeras:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadCameras()
  }, [loadCameras])

  const handleDelete = async (cameraId: string) => {
    if (!confirm('Tem certeza que deseja remover esta câmera?')) return

    try {
      await cameraAPI.deleteCamera(cameraId)
      await loadCameras()
    } catch (error) {
      console.error('Erro ao deletar câmera:', error)
      alert('Erro ao deletar câmera')
    }
  }

  const handleTestConnection = async (cameraId: string) => {
    setTestingConnection(cameraId)
    try {
      const result = await cameraAPI.testConnection(cameraId)
      alert(result.success ? 'Conexão bem-sucedida!' : `Erro: ${result.message}`)
      await loadCameras() // Recarregar para atualizar status
    } catch (error) {
      console.error('Erro ao testar conexão:', error)
      alert('Erro ao testar conexão')
    } finally {
      setTestingConnection(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Configurações
          </h1>
          <p className="text-neutral-400">
            Gerencie suas câmeras e configurações do sistema
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Câmera
        </Button>
      </div>

      {/* Cameras Section */}
      <Card className="p-6 bg-neutral-900/50 border-neutral-800/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Camera className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Câmeras Configuradas
            </h2>
            <p className="text-sm text-neutral-400">
              Gerencie suas câmeras RTSP
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-neutral-800/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : cameras.length === 0 ? (
          <div className="text-center py-12">
            <VideoIcon className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-400 mb-2">
              Nenhuma câmera configurada
            </h3>
            <p className="text-sm text-neutral-500 mb-6">
              Adicione sua primeira câmera RTSP para começar
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              variant="outline"
              className="border-neutral-700 text-neutral-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Câmera
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {cameras.map((camera) => (
              <CameraCard
                key={camera.id}
                camera={camera}
                onEdit={() => setEditingCamera(camera)}
                onDelete={() => handleDelete(camera.id)}
                onTest={() => handleTestConnection(camera.id)}
                isTesting={testingConnection === camera.id}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || editingCamera) && (
          <CameraModal
            camera={editingCamera}
            onClose={() => {
              setShowAddModal(false)
              setEditingCamera(null)
            }}
            onSave={async () => {
              await loadCameras()
              setShowAddModal(false)
              setEditingCamera(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// Camera Card Component
// ============================================

interface CameraCardProps {
  camera: CameraType
  onEdit: () => void
  onDelete: () => void
  onTest: () => void
  isTesting: boolean
}

function CameraCard({ camera, onEdit, onDelete, onTest, isTesting }: CameraCardProps) {
  const statusColors = {
    online: 'text-green-400 bg-green-400/10',
    offline: 'text-red-400 bg-red-400/10',
    error: 'text-yellow-400 bg-yellow-400/10',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/50",
        "hover:bg-neutral-800/50 transition-colors"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Status Indicator */}
          <div className={cn(
            "p-2 rounded-lg",
            statusColors[camera.status]
          )}>
            {camera.status === 'online' ? (
              <Wifi className="w-5 h-5" />
            ) : (
              <WifiOff className="w-5 h-5" />
            )}
          </div>

          {/* Camera Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-medium">{camera.name}</h3>
              <span className={cn(
                "px-2 py-0.5 rounded text-xs font-medium",
                statusColors[camera.status]
              )}>
                {camera.status}
              </span>
            </div>
            <p className="text-sm text-neutral-400 mb-1">{camera.location}</p>
            <p className="text-xs text-neutral-500 font-mono truncate max-w-md">
              {camera.rtsp_url}
            </p>
          </div>

          {/* Camera Details */}
          <div className="hidden lg:flex items-center gap-4 text-sm text-neutral-400">
            <div>
              <span className="text-neutral-500">FPS:</span> {camera.fps}
            </div>
            <div>
              <span className="text-neutral-500">Resolução:</span> {camera.resolution}
            </div>
            <div>
              <span className="text-neutral-500">Linha:</span> {camera.line_position}%
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onTest}
            disabled={isTesting}
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
          >
            {isTesting ? (
              <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={onEdit}
            variant="ghost"
            size="sm"
            className="text-neutral-400 hover:text-white hover:bg-neutral-700/50"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            onClick={onDelete}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// Camera Modal (Add/Edit)
// ============================================

interface CameraModalProps {
  camera: CameraType | null
  onClose: () => void
  onSave: () => void
}

function CameraModal({ camera, onClose, onSave }: CameraModalProps) {
  const isEdit = !!camera

  const [formData, setFormData] = React.useState<CameraCreateData>({
    name: camera?.name || '',
    rtsp_url: camera?.rtsp_url || '',
    location: camera?.location || '',
    line_position: camera?.line_position || 50,
    fps: camera?.fps || 5,
    resolution: camera?.resolution || '1920x1080',
    confidence_threshold: camera?.confidence_threshold || 0.5,
    is_active: camera?.is_active ?? true,
  })

  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isEdit && camera) {
        await cameraAPI.updateCamera(camera.id, formData)
      } else {
        await cameraAPI.createCamera(formData)
      }
      onSave()
    } catch (err) {
      setError('Erro ao salvar câmera: ' + (err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {isEdit ? 'Editar Câmera' : 'Nova Câmera RTSP'}
              </h2>
              <p className="text-sm text-neutral-400">
                Configure a URL RTSP e parâmetros da câmera
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Nome da Câmera *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Câmera Entrada Principal"
              className={cn(
                "w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-lg",
                "text-white placeholder-neutral-500",
                "focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
              )}
            />
          </div>

          {/* URL RTSP */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              URL RTSP *
            </label>
            <input
              type="text"
              required
              value={formData.rtsp_url}
              onChange={(e) => setFormData({ ...formData, rtsp_url: e.target.value })}
              placeholder="rtsp://usuario:senha@192.168.1.100:554/stream"
              className={cn(
                "w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-lg",
                "text-white placeholder-neutral-500 font-mono text-sm",
                "focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
              )}
            />
            <p className="text-xs text-neutral-500 mt-1">
              Formato: rtsp://[usuario]:[senha]@[ip]:[porta]/[caminho]
            </p>
          </div>

          {/* Localização */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Localização
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ex: Entrada Principal, Seção Eletrônicos"
              className={cn(
                "w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-lg",
                "text-white placeholder-neutral-500",
                "focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
              )}
            />
          </div>

          {/* Grid de Configurações */}
          <div className="grid grid-cols-2 gap-4">
            {/* FPS */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                FPS (Frames/s)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.fps}
                onChange={(e) => setFormData({ ...formData, fps: parseInt(e.target.value) })}
                className={cn(
                  "w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-lg",
                  "text-white",
                  "focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                )}
              />
            </div>

            {/* Resolução */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Resolução
              </label>
              <select
                value={formData.resolution}
                onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                className={cn(
                  "w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-lg",
                  "text-white",
                  "focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                )}
              >
                <option value="1920x1080">1920x1080 (Full HD)</option>
                <option value="1280x720">1280x720 (HD)</option>
                <option value="640x480">640x480 (SD)</option>
              </select>
            </div>

            {/* Posição da Linha */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Linha de Detecção (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.line_position}
                onChange={(e) => setFormData({ ...formData, line_position: parseInt(e.target.value) })}
                className={cn(
                  "w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-lg",
                  "text-white",
                  "focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                )}
              />
            </div>

            {/* Confidence Threshold */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Confiança (0.1 - 1.0)
              </label>
              <input
                type="number"
                min="0.1"
                max="1.0"
                step="0.1"
                value={formData.confidence_threshold}
                onChange={(e) => setFormData({ ...formData, confidence_threshold: parseFloat(e.target.value) })}
                className={cn(
                  "w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-lg",
                  "text-white",
                  "focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                )}
              />
            </div>
          </div>

          {/* Status Ativo */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-red-500 focus:ring-2 focus:ring-red-500/50"
            />
            <label htmlFor="is_active" className="text-sm text-neutral-300">
              Câmera ativa (processar detecções)
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              className="text-neutral-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name || !formData.rtsp_url}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {isEdit ? 'Salvar Alterações' : 'Adicionar Câmera'}
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
