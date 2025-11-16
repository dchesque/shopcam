"""
Estado global da aplicação para compartilhar instâncias entre módulos
"""

from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from core.ai.smart_analytics_engine import SmartAnalyticsEngine
    from core.rtsp_processor import RTSPFrameProcessor
    from core.database import SupabaseManager  # Adicionar import

# Estado global da aplicação
smart_engine: Optional['SmartAnalyticsEngine'] = None
rtsp_processor: Optional['RTSPFrameProcessor'] = None
supabase_manager: Optional['SupabaseManager'] = None

def set_smart_engine(engine: 'SmartAnalyticsEngine'):
    """Definir a instância global do Smart Analytics Engine"""
    global smart_engine
    smart_engine = engine

def get_smart_engine() -> Optional['SmartAnalyticsEngine']:
    """Obter a instância global do Smart Analytics Engine"""
    return smart_engine

def set_rtsp_processor(processor: 'RTSPFrameProcessor'):
    """Definir a instância global do RTSP Processor"""
    global rtsp_processor
    rtsp_processor = processor

def get_rtsp_processor() -> Optional['RTSPFrameProcessor']:
    """Obter a instância global do RTSP Processor"""
    return rtsp_processor

def set_supabase_manager(db: 'SupabaseManager'):
    """Definir a instância global do Supabase Manager"""
    global supabase_manager
    supabase_manager = db

def get_supabase_manager() -> Optional['SupabaseManager']:
    """Obter a instância global do Supabase Manager"""
    return supabase_manager