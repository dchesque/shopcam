/**
 * Helper para construir URLs de API consistentes
 */

/**
 * Obtém a URL base da API a partir das variáveis de ambiente
 */
export function getApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
  // Remove barra no final se existir para evitar barras duplas
  return apiUrl.replace(/\/$/, '')
}

/**
 * Constrói uma URL completa de API garantindo formatação correta
 * @param endpoint - O endpoint da API (ex: '/api/camera/stream')
 * @param params - Parâmetros opcionais de query string
 */
export function buildApiUrl(endpoint: string, params?: Record<string, string>): string {
  const baseUrl = getApiBaseUrl()

  // Garante que endpoint comece com barra
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  // Constrói a URL base
  let url = `${baseUrl}${normalizedEndpoint}`

  // Adiciona parâmetros se existirem
  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString()
    url += `?${queryString}`
  }

  return url
}

/**
 * Helper específico para URLs de streaming de câmera
 */
export function getCameraStreamUrl(cameraId?: string, additionalParams?: Record<string, string>): string {
  const endpoint = cameraId ? `/api/camera/stream/${cameraId}` : '/api/camera/stream'
  return buildApiUrl(endpoint, additionalParams)
}

/**
 * Helper para URLs de API de funcionários
 */
export function getEmployeesApiUrl(action: 'list' | 'register' | string, employeeId?: string): string {
  if (action === 'list') {
    return buildApiUrl('/api/employees/list')
  }
  if (action === 'register') {
    return buildApiUrl('/api/employees/register')
  }
  if (employeeId) {
    return buildApiUrl(`/api/employees/${employeeId}`)
  }
  return buildApiUrl('/api/employees')
}

/**
 * Verifica se a URL da API está configurada corretamente
 */
export function isApiConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_API_URL
}