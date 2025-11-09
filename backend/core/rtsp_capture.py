"""
RTSP Camera Capture Module - MVP Simplificado
Captura frames de câmeras IP via RTSP sem necessidade de bridge local.

Features:
- Conexão direta RTSP usando OpenCV
- Threading assíncrono para captura contínua
- Reconexão automática em caso de falha
- Queue thread-safe para frames
- Frame skipping configurável (processar apenas X FPS)
"""

import cv2
import numpy as np
import threading
import queue
import time
from typing import Optional, Tuple
from loguru import logger
from dataclasses import dataclass
from datetime import datetime


@dataclass
class CameraStats:
    """Estatísticas de saúde da câmera"""
    is_connected: bool
    fps_received: float
    fps_processed: float
    frames_dropped: int
    last_frame_time: Optional[datetime]
    reconnection_attempts: int
    total_frames_captured: int


class RTSPCameraManager:
    """
    Gerenciador de captura RTSP para câmeras IP.

    Usage:
        manager = RTSPCameraManager(
            rtsp_url="rtsp://user:pass@192.168.1.100:554/stream",
            target_fps=5
        )
        manager.connect()

        while True:
            frame = manager.get_frame()
            if frame is not None:
                # Process frame
                pass
    """

    def __init__(
        self,
        rtsp_url: str,
        target_fps: int = 5,
        reconnect_timeout: int = 10,
        frame_queue_size: int = 30,
        read_timeout: int = 30
    ):
        """
        Inicializa o gerenciador de câmera RTSP.

        Args:
            rtsp_url: URL completa RTSP (ex: rtsp://admin:senha@ip:554/cam/realmonitor?channel=1&subtype=0)
            target_fps: FPS alvo para processamento (padrão: 5)
            reconnect_timeout: Segundos antes de tentar reconectar (padrão: 10)
            frame_queue_size: Tamanho máximo da fila de frames (padrão: 30)
            read_timeout: Timeout em segundos para leitura de frame (padrão: 30)
        """
        self.rtsp_url = rtsp_url
        self.target_fps = target_fps
        self.reconnect_timeout = reconnect_timeout
        self.frame_queue_size = frame_queue_size
        self.read_timeout = read_timeout

        # Estado da conexão
        self.capture: Optional[cv2.VideoCapture] = None
        self.is_running = False
        self.capture_thread: Optional[threading.Thread] = None

        # Queue thread-safe para frames
        self.frame_queue: queue.Queue = queue.Queue(maxsize=frame_queue_size)

        # Estatísticas
        self.stats = CameraStats(
            is_connected=False,
            fps_received=0.0,
            fps_processed=0.0,
            frames_dropped=0,
            last_frame_time=None,
            reconnection_attempts=0,
            total_frames_captured=0
        )

        # Controle de FPS
        self.frame_interval = 1.0 / target_fps
        self.last_frame_time = 0.0

        # Lock para thread safety
        self._lock = threading.Lock()

        logger.info(f"RTSPCameraManager initialized for {self._sanitize_url(rtsp_url)}")

    def _sanitize_url(self, url: str) -> str:
        """Remove credenciais da URL para logging seguro"""
        try:
            # Remove senha da URL
            if '@' in url:
                protocol, rest = url.split('://')
                auth_and_host = rest.split('/', 1)
                if '@' in auth_and_host[0]:
                    auth, host = auth_and_host[0].split('@')
                    user = auth.split(':')[0] if ':' in auth else auth
                    safe_url = f"{protocol}://{user}:***@{host}"
                    if len(auth_and_host) > 1:
                        safe_url += f"/{auth_and_host[1]}"
                    return safe_url
            return url
        except Exception:
            return "rtsp://***"

    def connect(self) -> bool:
        """
        Conecta na câmera RTSP e inicia captura em thread separada.

        Returns:
            bool: True se conectou com sucesso, False caso contrário
        """
        try:
            logger.info(f"Connecting to RTSP camera: {self._sanitize_url(self.rtsp_url)}")

            # Criar VideoCapture com configurações otimizadas
            self.capture = cv2.VideoCapture(self.rtsp_url, cv2.CAP_FFMPEG)

            # Configurações para reduzir latência
            self.capture.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Buffer mínimo

            # Verificar se conseguiu abrir
            if not self.capture.isOpened():
                logger.error("Failed to open RTSP stream")
                return False

            # Testar leitura de um frame
            ret, frame = self.capture.read()
            if not ret or frame is None:
                logger.error("Failed to read test frame from RTSP stream")
                self.capture.release()
                return False

            logger.success(f"RTSP connection established! Frame size: {frame.shape}")

            # Iniciar thread de captura
            self.is_running = True
            self.stats.is_connected = True
            self.capture_thread = threading.Thread(target=self._capture_loop, daemon=True)
            self.capture_thread.start()

            logger.info(f"Capture thread started. Target FPS: {self.target_fps}")
            return True

        except Exception as e:
            logger.error(f"Error connecting to RTSP camera: {e}")
            self.stats.is_connected = False
            return False

    def _capture_loop(self):
        """
        Loop principal de captura de frames (roda em thread separada).
        Implementa frame skipping para atingir target FPS.
        """
        logger.info("Starting RTSP capture loop...")
        fps_counter = 0
        fps_start_time = time.time()
        last_successful_read = time.time()

        while self.is_running:
            try:
                # Verificar timeout de leitura
                if time.time() - last_successful_read > self.read_timeout:
                    logger.warning(f"No frames received for {self.read_timeout}s. Attempting reconnection...")
                    self._attempt_reconnection()
                    last_successful_read = time.time()
                    continue

                # Ler frame da câmera
                ret, frame = self.capture.read()

                if not ret or frame is None:
                    logger.warning("Failed to read frame from camera")
                    time.sleep(0.1)
                    continue

                last_successful_read = time.time()

                # Frame skipping - processar apenas na taxa target_fps
                current_time = time.time()
                if current_time - self.last_frame_time < self.frame_interval:
                    continue  # Skip este frame

                self.last_frame_time = current_time

                # Tentar adicionar frame na queue
                try:
                    self.frame_queue.put_nowait((frame.copy(), datetime.now()))
                    fps_counter += 1

                    with self._lock:
                        self.stats.total_frames_captured += 1
                        self.stats.last_frame_time = datetime.now()

                except queue.Full:
                    # Queue cheia - descartar frame mais antigo
                    try:
                        self.frame_queue.get_nowait()
                        self.frame_queue.put_nowait((frame.copy(), datetime.now()))
                        with self._lock:
                            self.stats.frames_dropped += 1
                    except Exception:
                        pass

                # Calcular FPS a cada segundo
                if current_time - fps_start_time >= 1.0:
                    with self._lock:
                        self.stats.fps_processed = fps_counter / (current_time - fps_start_time)
                    fps_counter = 0
                    fps_start_time = current_time

            except Exception as e:
                logger.error(f"Error in capture loop: {e}")
                time.sleep(1)

        logger.info("Capture loop stopped")

    def _attempt_reconnection(self):
        """Tenta reconectar na câmera"""
        logger.warning("Attempting camera reconnection...")

        with self._lock:
            self.stats.reconnection_attempts += 1
            self.stats.is_connected = False

        # Liberar conexão atual
        if self.capture is not None:
            try:
                self.capture.release()
            except Exception:
                pass

        # Aguardar timeout
        time.sleep(self.reconnect_timeout)

        # Tentar reconectar
        try:
            self.capture = cv2.VideoCapture(self.rtsp_url, cv2.CAP_FFMPEG)
            self.capture.set(cv2.CAP_PROP_BUFFERSIZE, 1)

            if self.capture.isOpened():
                ret, _ = self.capture.read()
                if ret:
                    logger.success("Camera reconnected successfully!")
                    with self._lock:
                        self.stats.is_connected = True
                    return True

            logger.error("Reconnection failed")
            return False

        except Exception as e:
            logger.error(f"Reconnection error: {e}")
            return False

    def get_frame(self, timeout: float = 1.0) -> Optional[np.ndarray]:
        """
        Obtém o próximo frame disponível da queue.

        Args:
            timeout: Tempo máximo para aguardar frame (segundos)

        Returns:
            np.ndarray: Frame BGR do OpenCV, ou None se timeout
        """
        try:
            frame, timestamp = self.frame_queue.get(timeout=timeout)
            return frame
        except queue.Empty:
            return None

    def get_latest_frame(self) -> Optional[Tuple[np.ndarray, datetime]]:
        """
        Obtém o frame mais recente disponível, descartando frames antigos.

        Returns:
            Tuple[np.ndarray, datetime]: (frame, timestamp) ou None se não houver frames
        """
        frame = None
        timestamp = None

        # Esvaziar queue e pegar só o último
        try:
            while True:
                frame, timestamp = self.frame_queue.get_nowait()
        except queue.Empty:
            pass

        if frame is not None:
            return (frame, timestamp)
        return None

    def get_stats(self) -> CameraStats:
        """Retorna estatísticas atuais da câmera"""
        with self._lock:
            return CameraStats(
                is_connected=self.stats.is_connected,
                fps_received=self.stats.fps_received,
                fps_processed=self.stats.fps_processed,
                frames_dropped=self.stats.frames_dropped,
                last_frame_time=self.stats.last_frame_time,
                reconnection_attempts=self.stats.reconnection_attempts,
                total_frames_captured=self.stats.total_frames_captured
            )

    def is_healthy(self) -> bool:
        """
        Verifica se a câmera está saudável.

        Returns:
            bool: True se câmera está conectada e recebendo frames nos últimos 5s
        """
        with self._lock:
            if not self.stats.is_connected:
                return False

            if self.stats.last_frame_time is None:
                return False

            # Verificar se recebeu frame nos últimos 5 segundos
            time_since_last_frame = (datetime.now() - self.stats.last_frame_time).total_seconds()
            return time_since_last_frame < 5.0

    def disconnect(self):
        """Desconecta da câmera e para captura"""
        logger.info("Disconnecting from RTSP camera...")

        # Parar thread de captura
        self.is_running = False

        # Aguardar thread finalizar
        if self.capture_thread is not None and self.capture_thread.is_alive():
            self.capture_thread.join(timeout=5.0)

        # Liberar VideoCapture
        if self.capture is not None:
            try:
                self.capture.release()
            except Exception as e:
                logger.error(f"Error releasing capture: {e}")

        # Limpar queue
        try:
            while not self.frame_queue.empty():
                self.frame_queue.get_nowait()
        except Exception:
            pass

        with self._lock:
            self.stats.is_connected = False

        logger.info("RTSP camera disconnected")

    def __enter__(self):
        """Context manager entry"""
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.disconnect()

    def __del__(self):
        """Destructor - garantir cleanup"""
        try:
            self.disconnect()
        except Exception:
            pass
