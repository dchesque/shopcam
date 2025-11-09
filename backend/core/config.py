"""
Configurações do backend
"""

from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Supabase - Always read from .env file
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    
    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8001
    API_DEBUG: bool = False
    API_SECRET_KEY: str = "secret-key-change-me"

    # YOLO/AI
    YOLO_MODEL: str = "yolo11n.pt"
    YOLO_CONFIDENCE: float = 0.6
    YOLO_IOU: float = 0.45
    DETECTION_CLASSES: List[int] = [0]  # 0 = person

    # RTSP Camera (MVP - substituindo bridge)
    CAMERA_RTSP_URL: str = os.getenv("CAMERA_RTSP_URL", "rtsp://admin:password@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0")
    CAMERA_FPS_PROCESS: int = 5  # FPS para processamento
    CAMERA_RECONNECT_TIMEOUT: int = 10  # Segundos antes de tentar reconectar
    FACE_RECOGNITION_ENABLED: bool = True  # Habilitar reconhecimento facial

    # Tracking
    TRACKING_MAX_DISAPPEARED: int = 30
    TRACKING_MAX_DISTANCE: float = 50.0
    LINE_POSITION: int = 50  # Percentage from top

    # Group Detection (MVP)
    GROUP_MAX_DISTANCE: float = 1.5  # Metros entre pessoas para considerar grupo
    GROUP_MIN_SIZE: int = 2  # Tamanho mínimo de grupo
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_PASSWORD: str = ""
    
    # File Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    SNAPSHOT_RETENTION_DAYS: int = 7
    SAVE_SNAPSHOTS: bool = True
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/backend.log"
    
    # Monitoring
    PROMETHEUS_ENABLED: bool = True
    PROMETHEUS_PORT: int = 8090
    HEALTH_CHECK_ENABLED: bool = True
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "https://shopflow-frontend.hshars.easypanel.host",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]
    
    # WebSocket
    WS_MAX_CONNECTIONS: int = 100
    WS_HEARTBEAT_INTERVAL: int = 30
    
    class Config:
        env_file = ".env.local"  # Use .env.local for development
        extra = "allow"

settings = Settings()

def get_settings() -> Settings:
    """Função para obter configurações"""
    return settings