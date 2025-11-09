import {
  LayoutDashboard,
  Video,
  Users,
} from 'lucide-react'

// ============================================
// MVP SIMPLIFICADO - 3 PÁGINAS APENAS
// ============================================
export const MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Visão geral do sistema'
  },
  {
    id: 'cameras',
    label: 'Câmera',
    href: '/cameras',
    icon: Video,
    description: 'Visualização ao vivo'
  },
  {
    id: 'employees',
    label: 'Funcionários',
    href: '/employees',
    icon: Users,
    description: 'Gerenciar equipe'
  },
]

export const COLORS = {
  primary: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },
  secondary: {
    50: '#faf5ff',
    500: '#a855f7',
    600: '#9333ea',
  },
  neutral: {
    50: '#fafafa',
    400: '#a1a1aa',
    500: '#71717a',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  }
}

// ============================================
// API ENDPOINTS MVP
// ============================================
export const API_ENDPOINTS = {
  // Camera endpoints
  CAMERA_STREAM: '/api/camera/stream',     // MJPEG stream
  CAMERA_STATS: '/api/camera/stats',       // Estatísticas da câmera

  // Analytics endpoints
  METRICS: '/api/analytics/metrics',       // Métricas básicas
  HEALTH: '/api/analytics/health',         // Status do sistema

  // Employee endpoints
  EMPLOYEES_LIST: '/api/employees/list',   // Listar funcionários
  EMPLOYEES_REGISTER: '/api/employees/register', // Cadastrar
  EMPLOYEES_DELETE: '/api/employees',      // Deletar (usar com /{id})
} as const