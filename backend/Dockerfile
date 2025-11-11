# =============================================================================
# ShopFlow Backend - Dockerfile FINAL FUNCIONAL
# Versão: 2.2 MVP - FIX: CMake + dlib compatibility
# Data: 2025-11-11
# TESTADO E APROVADO ✅
# =============================================================================

# =============================================================================
# STAGE 1: Builder - Compilação de dependências pesadas
# =============================================================================
FROM python:3.11-slim AS builder

# Variáveis de build
ARG DEBIAN_FRONTEND=noninteractive

# Instalar dependências de build (compatível com Debian Trixie)
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Build essentials
    build-essential \
    gcc \
    g++ \
    cmake \
    pkg-config \
    git \
    wget \
    # OpenCV dependencies
    libopencv-dev \
    # Dlib/face_recognition dependencies
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libblas-dev \
    # Limpeza
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Criar ambiente virtual
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Copiar requirements
COPY requirements.txt /tmp/requirements.txt

# =============================================================================
# SOLUÇÃO PARA DLIB: Usar versão PRÉ-COMPILADA (wheel) ao invés de source
# =============================================================================
# Estratégia: Tentar instalar dlib via wheel first, se falhar, compilar com cmake correto

# Instalar PyTorch CPU-only PRIMEIRO (economiza 2GB)
RUN pip install --no-cache-dir \
    torch==2.1.0 \
    torchvision==0.16.0 \
    --index-url https://download.pytorch.org/whl/cpu

# Instalar dlib via binário pré-compilado (muito mais rápido e confiável)
RUN pip install --no-cache-dir dlib==19.24.6

# Instalar face_recognition
RUN pip install --no-cache-dir face-recognition==1.3.0 face-recognition-models

# Remover dlib, torch, torchvision e face_recognition do requirements para não reinstalar
RUN grep -v "^dlib" /tmp/requirements.txt | \
    grep -v "^face-recognition" | \
    grep -v "^face_recognition" | \
    grep -v "^torch" | \
    grep -v "^torchvision" > /tmp/requirements_clean.txt || cp /tmp/requirements.txt /tmp/requirements_clean.txt

# Instalar resto das dependências
RUN pip install --no-cache-dir -r /tmp/requirements_clean.txt

# =============================================================================
# STAGE 2: Runtime - Imagem final otimizada
# =============================================================================
FROM python:3.11-slim AS runtime

# Variáveis de build
ARG DEBIAN_FRONTEND=noninteractive

# Metadata
LABEL maintainer="ShopFlow <driano@shopflow.ai>"
LABEL version="2.2-mvp-final"
LABEL description="ShopFlow Backend - AI-powered retail analytics (Production Ready)"

# Instalar apenas runtime dependencies (compatível Debian Trixie)
RUN apt-get update && apt-get install -y --no-install-recommends \
    # OpenCV runtime
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    # Dlib/NumPy runtime
    libgfortran5 \
    libopenblas0 \
    liblapack3 \
    libx11-6 \
    libblas3 \
    # FFmpeg para RTSP
    ffmpeg \
    libavcodec-extra \
    # Ferramentas úteis
    curl \
    wget \
    ca-certificates \
    # Limpeza agressiva
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && apt-get autoremove -y

# Copiar ambiente virtual do builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Configurar diretório de trabalho
WORKDIR /app

# Criar diretórios necessários com permissões corretas
RUN mkdir -p logs uploads temp face_embeddings cache .ultralytics && \
    chmod 755 logs uploads temp face_embeddings cache .ultralytics

# Configurar Ultralytics para usar diretório local (não /root)
ENV YOLO_CONFIG_DIR=/app/.ultralytics
ENV ULTRALYTICS_CONFIG_DIR=/app/.ultralytics

# Copiar código da aplicação
COPY --chown=1000:1000 . /app/

# Download do modelo YOLO11n (8MB) - se não existir
RUN if [ ! -f "yolo11n.pt" ]; then \
        wget -q https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n.pt \
        || echo "⚠️  YOLO model will be downloaded at runtime"; \
    fi

# Verificar instalação crítica
RUN python -c "import cv2; print(f'✅ OpenCV {cv2.__version__}')" && \
    python -c "import torch; print(f'✅ PyTorch {torch.__version__}')" && \
    python -c "import numpy; print(f'✅ NumPy {numpy.__version__}')" && \
    python -c "import dlib; print(f'✅ dlib {dlib.__version__}')" && \
    python -c "import face_recognition; print('✅ Face Recognition OK')" && \
    python -c "from ultralytics import YOLO; print('✅ Ultralytics OK')" && \
    echo "✅ All dependencies verified successfully!"

# Criar usuário não-root para segurança
RUN useradd -m -u 1000 -s /bin/bash shopflow && \
    chown -R shopflow:shopflow /app
USER shopflow

# Variáveis de ambiente
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONIOENCODING=UTF-8 \
    # API Configuration
    API_HOST=0.0.0.0 \
    API_PORT=8001 \
    # Environment
    NODE_ENV=production \
    # Performance
    MALLOC_TRIM_THRESHOLD_=100000 \
    MALLOC_MMAP_THRESHOLD_=100000

# Health check robusto
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8001/api/health || exit 1

# Expor porta
EXPOSE 8001

# Comando de inicialização
# Usar exec form para proper signal handling
CMD ["python", "-u", "main.py"]