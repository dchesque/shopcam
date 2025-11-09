"""
Group Detection - MVP Simplificado
Detecção básica de grupos usando clustering espacial para contagem de clientes potenciais.

Lógica de Negócio:
- Grupos de 2-4 pessoas = 1 cliente potencial
- Grupos de 5+ pessoas = 2 clientes potenciais
- Indivíduo sozinho = 1 cliente potencial
- Funcionários não contam como clientes

Author: ShopFlow MVP
Version: 1.0
"""

import numpy as np
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass
from sklearn.cluster import DBSCAN
from loguru import logger


@dataclass
class Detection:
    """Detecção de uma pessoa no frame"""
    bbox: Tuple[float, float, float, float]  # x1, y1, x2, y2
    confidence: float
    person_id: str
    is_employee: bool = False
    employee_name: str = ""

    @property
    def center(self) -> Tuple[float, float]:
        """Centro da bounding box"""
        x1, y1, x2, y2 = self.bbox
        return ((x1 + x2) / 2, (y1 + y2) / 2)

    @property
    def height(self) -> float:
        """Altura da bounding box em pixels"""
        return self.bbox[3] - self.bbox[1]

    @property
    def width(self) -> float:
        """Largura da bounding box em pixels"""
        return self.bbox[2] - self.bbox[0]


@dataclass
class GroupInfo:
    """Informações sobre um grupo detectado"""
    group_id: int
    member_count: int
    members: List[str]  # IDs das pessoas
    center_position: Tuple[float, float]
    potential_customers: int  # Quantos clientes potenciais representa

    @property
    def label(self) -> str:
        """Label para visualização"""
        if self.member_count == 1:
            return "Individual"
        elif self.member_count <= 4:
            return f"Grupo de {self.member_count}"
        else:
            return f"Grupo Grande ({self.member_count})"


class GroupDetectorSimple:
    """
    Detector de grupos simplificado usando DBSCAN.

    Funcionalidades:
    - Clustering espacial de pessoas próximas
    - Cálculo de clientes potenciais baseado no tamanho do grupo
    - Exclusão de funcionários da contagem

    Usage:
        detector = GroupDetectorSimple(max_distance=1.5, min_group_size=2)
        groups = detector.detect_groups(detections)
        total_customers = detector.calculate_potential_customers(groups, detections)
    """

    def __init__(
        self,
        max_distance: float = 1.5,
        min_group_size: int = 2,
        reference_height_pixels: float = 160.0,
        reference_height_meters: float = 1.7
    ):
        """
        Inicializa o detector de grupos.

        Args:
            max_distance: Distância máxima em metros para considerar pessoas no mesmo grupo
            min_group_size: Tamanho mínimo para considerar um cluster como grupo
            reference_height_pixels: Altura de referência em pixels (pessoa média)
            reference_height_meters: Altura de referência em metros (1.7m = pessoa média)
        """
        self.max_distance = max_distance
        self.min_group_size = min_group_size
        self.reference_height_pixels = reference_height_pixels
        self.reference_height_meters = reference_height_meters

        # Fator de conversão pixel -> metros (será ajustado por frame baseado nas pessoas)
        self.pixels_per_meter = reference_height_pixels / reference_height_meters

        logger.info(
            f"GroupDetectorSimple initialized - "
            f"max_distance={max_distance}m, min_group_size={min_group_size}"
        )

    def _estimate_pixels_per_meter(self, detections: List[Detection]) -> float:
        """
        Estima fator de conversão pixels->metros baseado nas alturas das pessoas.

        Args:
            detections: Lista de detecções

        Returns:
            Pixels por metro estimado
        """
        if not detections:
            return self.pixels_per_meter

        # Usar altura média das pessoas detectadas
        heights = [d.height for d in detections]
        avg_height_pixels = np.median(heights)  # Usar mediana para robustez

        # Se houver pessoas muito pequenas/grandes, filtrar outliers
        if len(heights) > 3:
            q1 = np.percentile(heights, 25)
            q3 = np.percentile(heights, 75)
            iqr = q3 - q1
            filtered_heights = [h for h in heights if q1 - 1.5*iqr <= h <= q3 + 1.5*iqr]
            if filtered_heights:
                avg_height_pixels = np.median(filtered_heights)

        # Assumir pessoa média tem 1.7m
        estimated_ppm = avg_height_pixels / self.reference_height_meters

        return estimated_ppm

    def _pixels_to_meters(self, pixels: float, pixels_per_meter: float) -> float:
        """Converte distância em pixels para metros"""
        return pixels / pixels_per_meter

    def detect_groups(self, detections: List[Detection]) -> List[GroupInfo]:
        """
        Detecta grupos de pessoas usando clustering DBSCAN.

        Args:
            detections: Lista de detecções de pessoas

        Returns:
            Lista de grupos detectados
        """
        if len(detections) < self.min_group_size:
            # Se tem menos pessoas que min_group_size, tratar todos como individuais
            return [
                GroupInfo(
                    group_id=i,
                    member_count=1,
                    members=[d.person_id],
                    center_position=d.center,
                    potential_customers=0 if d.is_employee else 1
                )
                for i, d in enumerate(detections)
            ]

        # Estimar fator de conversão pixels->metros
        pixels_per_meter = self._estimate_pixels_per_meter(detections)

        # Extrair posições centrais
        positions = np.array([d.center for d in detections])

        # Calcular eps em pixels (max_distance em metros)
        eps_pixels = self.max_distance * pixels_per_meter

        # Aplicar DBSCAN
        clustering = DBSCAN(eps=eps_pixels, min_samples=self.min_group_size)
        labels = clustering.fit_predict(positions)

        # Processar clusters
        groups = []
        group_id = 0

        # Processar grupos (label >= 0)
        unique_labels = set(labels)
        for label in unique_labels:
            if label == -1:
                continue  # Pular pessoas sozinhas (noise)

            # Obter membros do cluster
            cluster_indices = np.where(labels == label)[0]
            cluster_detections = [detections[i] for i in cluster_indices]
            member_ids = [detections[i].person_id for i in cluster_indices]

            # Calcular centro do grupo
            cluster_positions = positions[cluster_indices]
            center = tuple(np.mean(cluster_positions, axis=0))

            # Calcular clientes potenciais (excluindo funcionários)
            non_employee_count = sum(1 for d in cluster_detections if not d.is_employee)
            potential_customers = self._calculate_group_potential_customers(
                non_employee_count
            )

            groups.append(GroupInfo(
                group_id=group_id,
                member_count=len(cluster_detections),
                members=member_ids,
                center_position=center,
                potential_customers=potential_customers
            ))
            group_id += 1

        # Processar pessoas sozinhas (label == -1)
        individual_indices = np.where(labels == -1)[0]
        for idx in individual_indices:
            detection = detections[idx]
            groups.append(GroupInfo(
                group_id=group_id,
                member_count=1,
                members=[detection.person_id],
                center_position=detection.center,
                potential_customers=0 if detection.is_employee else 1
            ))
            group_id += 1

        logger.debug(
            f"Detected {len(groups)} groups/individuals from {len(detections)} people"
        )

        return groups

    def _calculate_group_potential_customers(self, group_size: int) -> int:
        """
        Calcula quantos clientes potenciais um grupo representa.

        Lógica de Negócio:
        - 1 pessoa = 1 cliente
        - 2-4 pessoas = 1 cliente (família, casal)
        - 5+ pessoas = 2 clientes (grupo grande, excursão)

        Args:
            group_size: Número de pessoas no grupo (excluindo funcionários)

        Returns:
            Número de clientes potenciais
        """
        if group_size == 0:
            return 0
        elif group_size == 1:
            return 1
        elif 2 <= group_size <= 4:
            return 1
        else:  # 5+
            return 2

    def calculate_potential_customers(
        self,
        groups: List[GroupInfo],
        detections: List[Detection]
    ) -> Dict[str, Any]:
        """
        Calcula métricas de clientes potenciais.

        Args:
            groups: Lista de grupos detectados
            detections: Lista de detecções originais

        Returns:
            Dicionário com métricas
        """
        # Contar funcionários
        employees = [d for d in detections if d.is_employee]
        customers = [d for d in detections if not d.is_employee]

        # Somar clientes potenciais de todos os grupos
        total_potential_customers = sum(g.potential_customers for g in groups)

        # Contar grupos (excluindo individuais)
        actual_groups = [g for g in groups if g.member_count >= self.min_group_size]

        # Detalhes dos grupos
        groups_detail = [
            {
                "group_id": g.group_id,
                "size": g.member_count,
                "potential_customers": g.potential_customers,
                "label": g.label
            }
            for g in actual_groups
        ]

        return {
            "total_people": len(detections),
            "employees_count": len(employees),
            "customers_count": len(customers),
            "potential_customers": total_potential_customers,
            "groups_count": len(actual_groups),
            "individuals_count": sum(1 for g in groups if g.member_count == 1),
            "groups_detail": groups_detail,
            "employee_names": [e.employee_name for e in employees if e.employee_name]
        }

    def get_visualization_info(
        self,
        groups: List[GroupInfo],
        detections: List[Detection]
    ) -> Dict[str, Any]:
        """
        Retorna informações para visualização de bounding boxes.

        Returns:
            Dicionário com informações para desenhar no frame
        """
        visualization = {
            "groups": [],
            "individuals": [],
            "employees": []
        }

        # Mapear person_id para detection
        detection_map = {d.person_id: d for d in detections}

        for group in groups:
            group_detections = [detection_map[pid] for pid in group.members if pid in detection_map]

            if group.member_count == 1:
                # Individual
                detection = group_detections[0]
                if detection.is_employee:
                    visualization["employees"].append({
                        "bbox": detection.bbox,
                        "label": detection.employee_name or "Funcionário",
                        "color": "blue",
                        "person_id": detection.person_id
                    })
                else:
                    visualization["individuals"].append({
                        "bbox": detection.bbox,
                        "label": "Cliente",
                        "color": "green",
                        "person_id": detection.person_id
                    })
            else:
                # Grupo
                for detection in group_detections:
                    if not detection.is_employee:
                        visualization["groups"].append({
                            "bbox": detection.bbox,
                            "label": group.label,
                            "color": "yellow",
                            "person_id": detection.person_id,
                            "group_id": group.group_id
                        })

        return visualization


# Funções utilitárias para integração fácil

def simple_group_detection(
    detections: List[Detection],
    max_distance: float = 1.5,
    min_group_size: int = 2
) -> Tuple[List[GroupInfo], Dict[str, Any]]:
    """
    Função helper para detecção simples de grupos.

    Args:
        detections: Lista de detecções
        max_distance: Distância máxima em metros
        min_group_size: Tamanho mínimo de grupo

    Returns:
        Tupla (grupos, métricas)
    """
    detector = GroupDetectorSimple(
        max_distance=max_distance,
        min_group_size=min_group_size
    )

    groups = detector.detect_groups(detections)
    metrics = detector.calculate_potential_customers(groups, detections)

    return groups, metrics
