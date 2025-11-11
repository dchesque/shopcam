/**
 * Tipos do banco de dados Supabase
 * Gerado automaticamente - não editar manualmente
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'user' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'user' | 'viewer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'user' | 'viewer'
          created_at?: string
          updated_at?: string
        }
      }
      cameras: {
        Row: {
          id: string
          name: string
          rtsp_url: string
          location: string
          status: 'online' | 'offline' | 'error'
          fps: number
          resolution: string
          confidence_threshold: number
          line_position: number
          detection_zone: Json
          is_active: boolean
          created_at: string
          updated_at: string
          last_seen: string | null
          ip_address: string | null
          port: number | null
        }
        Insert: {
          id?: string
          name: string
          rtsp_url: string
          location: string
          status?: 'online' | 'offline' | 'error'
          fps?: number
          resolution?: string
          confidence_threshold?: number
          line_position?: number
          detection_zone?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
          last_seen?: string | null
          ip_address?: string | null
          port?: number | null
        }
        Update: {
          id?: string
          name?: string
          rtsp_url?: string
          location?: string
          status?: 'online' | 'offline' | 'error'
          fps?: number
          resolution?: string
          confidence_threshold?: number
          line_position?: number
          detection_zone?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
          last_seen?: string | null
          ip_address?: string | null
          port?: number | null
        }
      }
      employees: {
        Row: {
          id: string
          name: string
          email: string
          department: string
          photo_url: string | null
          status: 'active' | 'inactive'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          department: string
          photo_url?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          department?: string
          photo_url?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
        }
      }
      camera_events: {
        Row: {
          id: string
          camera_id: string
          person_type: 'customer' | 'employee'
          confidence: number
          timestamp: string
          bbox: Json
        }
        Insert: {
          id?: string
          camera_id: string
          person_type: 'customer' | 'employee'
          confidence: number
          timestamp?: string
          bbox: Json
        }
        Update: {
          id?: string
          camera_id?: string
          person_type?: 'customer' | 'employee'
          confidence?: number
          timestamp?: string
          bbox?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
