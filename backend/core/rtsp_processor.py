"""
RTSP Frame Processor - MVP Simplificado
Processa frames continuamente de câmera RTSP e executa análise IA simplificada.

Pipeline:
1. Capturar frame via RTSP
2. Detectar pessoas (YOLO11)
3. Detectar grupos (clustering)
4. Reconhecer funcionários (facial)
5. Salvar métricas no database
6. Manter último frame para stream MJPEG

Author: ShopFlow MVP
Version: 1.0
"""

import asyncio
import cv2
import numpy as np
import time
from datetime import datetime
from typing import Optional, Dict, Any, List
from loguru import logger

from core.rtsp_capture import RTSPCameraManager
from core.detector import YOLOPersonDetector
from core.group_detector_simple import GroupDetectorSimple, Detection
from core.database import SupabaseManager


class RTSPFrameProcessor:
    """
    Processador contínuo de frames RTSP com IA simplificada.

    Funcionalidades:
    - Captura contínua de frames via RTSP
    - Detecção de pessoas (YOLO)
    - Detecção de grupos
    - Reconhecimento facial de funcionários
    - Persistência de métricas
    - Stream MJPEG para visualização
    """

    def __init__(
        self,
        rtsp_url: str,
        detector: YOLOPersonDetector,
        database: SupabaseManager,
        target_fps: int = 5,
        face_recognition_enabled: bool = True
    ):
        """
        Inicializa o processador RTSP.

        Args:
            rtsp_url: URL da câmera RTSP
            detector: Detector YOLO já inicializado
            database: Gerenciador de database já inicializado
            target_fps: FPS alvo para processamento
            face_recognition_enabled: Se deve usar reconhecimento facial
        """
        self.rtsp_url = rtsp_url
        self.detector = detector
        self.database = database
        self.target_fps = target_fps
        self.face_recognition_enabled = face_recognition_enabled

        # Gerenciador de câmera
        self.camera_manager = RTSPCameraManager(
            rtsp_url=rtsp_url,
            target_fps=target_fps,
            reconnect_timeout=10,
            frame_queue_size=30
        )

        # Detector de grupos
        self.group_detector = GroupDetectorSimple(
            max_distance=1.5,  # 1.5 metros
            min_group_size=2
        )

        # Estado do processamento
        self.is_running = False
        self.processing_task: Optional[asyncio.Task] = None

        # Último frame processado (para MJPEG stream)
        self.last_processed_frame: Optional[np.ndarray] = None
        self.last_frame_timestamp: Optional[datetime] = None
        self.last_metrics: Optional[Dict[str, Any]] = None

        # Face recognition (carregar sob demanda)
        self.face_recognizer = None
        self._employee_embeddings: Dict[str, Any] = {}

        # Estatísticas
        self.stats = {
            "frames_processed": 0,
            "avg_processing_time": 0.0,
            "last_error": None
        }

        logger.info(f"RTSPFrameProcessor initialized for {self.camera_manager._sanitize_url(rtsp_url)}")

    async def initialize(self):
        """Inicializa componentes (face recognition, etc)"""
        logger.info("Initializing RTSP processor...")

        # Inicializar reconhecimento facial se habilitado
        if self.face_recognition_enabled:
            try:
                # Importar apenas se necessário
                import face_recognition

                logger.success("Face recognition module loaded")

                # Carregar embeddings de funcionários do database
                await self._load_employee_embeddings()

            except ImportError:
                logger.warning("face-recognition not installed, disabling facial recognition")
                self.face_recognition_enabled = False
            except Exception as e:
                logger.error(f"Error initializing face recognition: {e}")
                self.face_recognition_enabled = False

        logger.success("RTSP processor initialized")

    async def _load_employee_embeddings(self):
        """Carrega embeddings de funcionários do database"""
        try:
            # Buscar todos os funcionários ativos
            employees = await self.database.get_all_employees()

            self._employee_embeddings = {}
            for emp in employees:
                if emp.get("status") == "active" and emp.get("embedding"):
                    self._employee_embeddings[emp["id"]] = {
                        "name": emp["name"],
                        "embedding": np.array(emp["embedding"])
                    }

            logger.info(f"Loaded {len(self._employee_embeddings)} employee embeddings")

        except Exception as e:
            logger.error(f"Error loading employee embeddings: {e}")

    async def start(self):
        """Inicia o processamento contínuo"""
        if self.is_running:
            logger.warning("Processor already running")
            return

        logger.info("Starting RTSP frame processor...")

        # Conectar na câmera
        if not self.camera_manager.connect():
            logger.error("Failed to connect to RTSP camera")
            return False

        # Iniciar loop de processamento
        self.is_running = True
        self.processing_task = asyncio.create_task(self._processing_loop())

        logger.success("RTSP processor started successfully")
        return True

    async def stop(self):
        """Para o processamento"""
        logger.info("Stopping RTSP processor...")

        self.is_running = False

        # Cancelar task de processamento
        if self.processing_task:
            self.processing_task.cancel()
            try:
                await self.processing_task
            except asyncio.CancelledError:
                pass

        # Desconectar câmera
        self.camera_manager.disconnect()

        logger.success("RTSP processor stopped")

    async def _processing_loop(self):
        """Loop principal de processamento de frames"""
        logger.info("Starting processing loop...")

        while self.is_running:
            try:
                # Obter próximo frame
                frame = self.camera_manager.get_frame(timeout=1.0)

                if frame is None:
                    # Sem frame disponível, tentar novamente
                    await asyncio.sleep(0.1)
                    continue

                # Processar frame
                start_time = time.time()
                await self._process_frame(frame)
                processing_time = (time.time() - start_time) * 1000  # ms

                # Atualizar estatísticas
                self.stats["frames_processed"] += 1
                self.stats["avg_processing_time"] = (
                    (self.stats["avg_processing_time"] * 0.9) +
                    (processing_time * 0.1)
                )

                # Log periódico
                if self.stats["frames_processed"] % 100 == 0:
                    logger.info(
                        f"Processed {self.stats['frames_processed']} frames, "
                        f"avg: {self.stats['avg_processing_time']:.1f}ms"
                    )

            except Exception as e:
                logger.error(f"Error in processing loop: {e}")
                self.stats["last_error"] = str(e)
                await asyncio.sleep(1.0)

        logger.info("Processing loop stopped")

    async def _process_frame(self, frame: np.ndarray):
        """
        Processa um único frame.

        Pipeline:
        1. YOLO detection
        2. Group detection
        3. Face recognition (funcionários)
        4. Calculate metrics
        5. Save to database
        6. Update last frame (for MJPEG stream)
        """
        timestamp = datetime.now()

        # 1. Detectar pessoas com YOLO
        yolo_detections = await self.detector.detect_persons(frame)

        # Converter para formato Detection do group detector
        detections = []
        for i, det in enumerate(yolo_detections):
            detection = Detection(
                bbox=(det['x1'], det['y1'], det['x2'], det['y2']),
                confidence=det['confidence'],
                person_id=f"person_{i}",
                is_employee=False
            )
            detections.append(detection)

        # 2. Reconhecimento facial (se habilitado)
        if self.face_recognition_enabled and len(self._employee_embeddings) > 0:
            await self._recognize_employees(frame, detections)

        # 3. Detectar grupos
        groups = self.group_detector.detect_groups(detections)

        # 4. Calcular métricas
        metrics = self.group_detector.calculate_potential_customers(groups, detections)

        # Adicionar timestamp
        metrics["timestamp"] = timestamp.isoformat()
        metrics["camera_id"] = "camera1"

        # 5. Salvar no database
        await self._save_metrics(metrics)

        # 6. Atualizar último frame para stream MJPEG
        annotated_frame = self._draw_visualizations(frame, detections, groups, metrics)
        self.last_processed_frame = annotated_frame
        self.last_frame_timestamp = timestamp
        self.last_metrics = metrics

    async def _recognize_employees(self, frame: np.ndarray, detections: List[Detection]):
        """
        Reconhece funcionários usando face recognition.

        Atualiza as detections in-place.
        """
        if not self.face_recognition_enabled or not self._employee_embeddings:
            return

        try:
            import face_recognition

            # Detectar faces no frame
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_frame)
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

            # Para cada face detectada
            for face_encoding, face_location in zip(face_encodings, face_locations):
                # Comparar com embeddings de funcionários
                for emp_id, emp_data in self._employee_embeddings.items():
                    emp_encoding = emp_data["embedding"]

                    # Calcular distância
                    matches = face_recognition.compare_faces(
                        [emp_encoding],
                        face_encoding,
                        tolerance=0.6
                    )

                    if matches[0]:
                        # Encontrou funcionário! Marcar detection correspondente
                        top, right, bottom, left = face_location

                        # Encontrar detection YOLO que corresponde a esta face
                        for detection in detections:
                            x1, y1, x2, y2 = detection.bbox

                            # Check overlap (face dentro de bbox pessoa)
                            if (x1 <= left <= x2 and x1 <= right <= x2 and
                                y1 <= top <= y2 and y1 <= bottom <= y2):
                                detection.is_employee = True
                                detection.employee_name = emp_data["name"]
                                logger.debug(f"Employee recognized: {emp_data['name']}")
                                break

        except Exception as e:
            logger.error(f"Error in face recognition: {e}")

    async def _save_metrics(self, metrics: Dict[str, Any]):
        """Salva métricas no database"""
        try:
            await self.database.insert_camera_event_simple(metrics)

        except Exception as e:
            logger.error(f"Error saving metrics to database: {e}")

    def _draw_visualizations(
        self,
        frame: np.ndarray,
        detections: List[Detection],
        groups: List,
        metrics: Dict[str, Any]
    ) -> np.ndarray:
        """
        Desenha visualizações no frame (bounding boxes, labels, etc).

        Returns:
            Frame anotado
        """
        annotated = frame.copy()

        # Obter informações de visualização
        viz_info = self.group_detector.get_visualization_info(groups, detections)

        # Desenhar funcionários (azul)
        for emp in viz_info["employees"]:
            x1, y1, x2, y2 = map(int, emp["bbox"])
            cv2.rectangle(annotated, (x1, y1), (x2, y2), (255, 0, 0), 2)  # Azul
            label = emp["label"]
            cv2.putText(
                annotated, label, (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2
            )

        # Desenhar grupos (amarelo)
        for grp in viz_info["groups"]:
            x1, y1, x2, y2 = map(int, grp["bbox"])
            cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 255, 255), 2)  # Amarelo
            label = grp["label"]
            cv2.putText(
                annotated, label, (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2
            )

        # Desenhar indivíduos (verde)
        for ind in viz_info["individuals"]:
            x1, y1, x2, y2 = map(int, ind["bbox"])
            cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 255, 0), 2)  # Verde
            label = ind["label"]
            cv2.putText(
                annotated, label, (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2
            )

        # Overlay com estatísticas no canto
        overlay_text = [
            f"Pessoas: {metrics['total_people']}",
            f"Clientes: {metrics['potential_customers']}",
            f"Funcionarios: {metrics['employees_count']}",
            f"Grupos: {metrics['groups_count']}"
        ]

        y_offset = 30
        for i, text in enumerate(overlay_text):
            cv2.rectangle(
                annotated, (10, y_offset - 20), (250, y_offset + 10),
                (0, 0, 0), -1  # Fundo preto
            )
            cv2.putText(
                annotated, text, (15, y_offset),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2
            )
            y_offset += 35

        # Timestamp
        timestamp_text = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(
            annotated, timestamp_text, (10, annotated.shape[0] - 20),
            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1
        )

        return annotated

    def get_latest_frame(self) -> Optional[bytes]:
        """
        Retorna o último frame processado codificado como JPEG.

        Returns:
            Frame JPEG em bytes ou None
        """
        if self.last_processed_frame is None:
            return None

        try:
            # Codificar como JPEG
            ret, jpeg = cv2.imencode('.jpg', self.last_processed_frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            if ret:
                return jpeg.tobytes()
            return None

        except Exception as e:
            logger.error(f"Error encoding frame to JPEG: {e}")
            return None

    def get_stats(self) -> Dict[str, Any]:
        """Retorna estatísticas do processador"""
        return {
            **self.stats,
            "is_running": self.is_running,
            "camera_healthy": self.camera_manager.is_healthy(),
            "camera_stats": self.camera_manager.get_stats().__dict__,
            "last_metrics": self.last_metrics
        }

    async def reload_employees(self):
        """Recarrega embeddings de funcionários (chamar após cadastro/exclusão)"""
        if self.face_recognition_enabled:
            await self._load_employee_embeddings()
            logger.info("Employee embeddings reloaded")
