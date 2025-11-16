"""
Estado global da aplicação para compartilhar instâncias entre módulos
"""

from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from core.ai.smart_analytics_engine import SmartAnalyticsEngine
    from core.rtsp_processor import RTSPFrameProcessor

# Estado global da aplicação
smart_engine: Optional['SmartAnalyticsEngine'] = None
rtsp_processor: Optional['RTSPFrameProcessor'] = None

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