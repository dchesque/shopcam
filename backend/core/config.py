"""
Configurações do backend com segurança aprimorada
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from functools import lru_cache
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file='.env.local',
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra='allow'
    )

    # ========================================================================
    # 🔐 SUPABASE - NUNCA expor service_key diretamente
    # ========================================================================
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""  # Carregada apenas em runtime seguro

    # ========================================================================
    # 🌐 CORS & SECURITY - RESTRITIVO POR PADRÃO
    # ========================================================================
    ENVIRONMENT: str = "development"  # development | staging | production
    PRODUCTION_DOMAIN: str = ""  # Definir em produção (ex: shopflow.com)

    # Origens permitidas (fallback para desenvolvimento)
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    def get_allowed_origins(self) -> List[str]:
        """
        Retorna origens permitidas baseado no ambiente.

        - DEVELOPMENT: localhost apenas
        - STAGING: localhost + staging domain
        - PRODUCTION: domínio de produção apenas (HTTPS obrigatório)

        Se ALLOWED_ORIGINS_CUSTOM estiver definido, usa essa lista (separada por vírgulas).

        Raises:
            ValueError: Se PRODUCTION_DOMAIN não estiver definido em produção
        """
        # Se origens customizadas foram definidas, usar elas (para Easypanel, Vercel, etc)
        custom_origins = os.getenv("ALLOWED_ORIGINS_CUSTOM", "")
        if custom_origins:
            origins_list = [origin.strip() for origin in custom_origins.split(",") if origin.strip()]
            if origins_list:
                return origins_list

        if self.ENVIRONMENT == "production":
            if not self.PRODUCTION_DOMAIN:
                raise ValueError(
                    "🔒 ERRO DE SEGURANÇA: PRODUCTION_DOMAIN deve estar definido em produção! "
                    "Configure a variável PRODUCTION_DOMAIN ou ALLOWED_ORIGINS_CUSTOM no .env ou secrets manager."
                )
            # Em produção, permitir apenas o domínio configurado (com HTTPS)
            domain = self.PRODUCTION_DOMAIN.replace('http://', '').replace('https://', '')
            return [
                f"https://{domain}",
                f"https://www.{domain}"
            ]
        elif self.ENVIRONMENT == "staging":
            # Em staging, permitir localhost + domínio de staging
            staging_origins = [
                "http://localhost:3000",
                "http://127.0.0.1:3000"
            ]
            if self.PRODUCTION_DOMAIN:
                domain = self.PRODUCTION_DOMAIN.replace('http://', '').replace('https://', '')
                staging_origins.extend([
                    f"https://staging.{domain}",
                    f"https://{domain}"
                ])
            return staging_origins
        else:  # development
            # Em desenvolvimento, permitir apenas localhost
            return [
                "http://localhost:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3001"
            ]

    @property
    def is_production(self) -> bool:
        """Verifica se está em ambiente de produção"""
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        """Verifica se está em ambiente de desenvolvimento"""
        return self.ENVIRONMENT == "development"

    # ========================================================================
    # 📡 API
    # ========================================================================
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8001
    API_DEBUG: bool = False
    API_SECRET_KEY: str = "secret-key-change-me"

    # ========================================================================
    # 🤖 YOLO/AI
    # ========================================================================
    YOLO_MODEL: str = "yolo11n.pt"
    YOLO_CONFIDENCE: float = 0.6
    YOLO_IOU: float = 0.45
    DETECTION_CLASSES: List[int] = [0]  # 0 = person

    # ========================================================================
    # 🎥 RTSP Camera (MVP - substituindo bridge)
    # ========================================================================
    CAMERA_RTSP_URL: str = os.getenv("CAMERA_RTSP_URL", "rtsp://admin:password@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0")
    CAMERA_FPS_PROCESS: int = 5  # FPS para processamento
    CAMERA_RECONNECT_TIMEOUT: int = 10  # Segundos antes de tentar reconectar
    FACE_RECOGNITION_ENABLED: bool = True  # Habilitar reconhecimento facial

    # ========================================================================
    # 👥 Tracking
    # ========================================================================
    TRACKING_MAX_DISAPPEARED: int = 30
    TRACKING_MAX_DISTANCE: float = 50.0
    LINE_POSITION: int = 50  # Percentage from top

    # ========================================================================
    # 👨‍👩‍👧‍👦 Group Detection (MVP)
    # ========================================================================
    GROUP_MAX_DISTANCE: float = 1.5  # Metros entre pessoas para considerar grupo
    GROUP_MIN_SIZE: int = 2  # Tamanho mínimo de grupo

    # ========================================================================
    # 🗄️ Redis
    # ========================================================================
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_PASSWORD: str = ""

    # ========================================================================
    # 💾 File Storage
    # ========================================================================
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    SNAPSHOT_RETENTION_DAYS: int = 7
    SAVE_SNAPSHOTS: bool = True

    # ========================================================================
    # 📝 Logging
    # ========================================================================
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/backend.log"

    # ========================================================================
    # 📊 Monitoring
    # ========================================================================
    PROMETHEUS_ENABLED: bool = True
    PROMETHEUS_PORT: int = 8090
    HEALTH_CHECK_ENABLED: bool = True

    # ========================================================================
    # 🔌 WebSocket
    # ========================================================================
    WS_MAX_CONNECTIONS: int = 100
    WS_HEARTBEAT_INTERVAL: int = 30

@lru_cache()
def get_settings() -> Settings:
    """
    Função singleton para obter configurações.
    Usa cache para evitar recarregar .env múltiplas vezes.
    """
    return Settings()

# Instância global (para compatibilidade com código existente)
settings = get_settings()