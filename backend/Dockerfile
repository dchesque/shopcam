# Multi-stage build otimizado
FROM python:3.11-slim AS builder

# Instalar dependências necessárias
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    wget \
    pkg-config \
    gcc \
    g++ \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# Criar e ativar ambiente virtual
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Atualizar pip
RUN pip install --upgrade pip setuptools wheel

# Copiar requirements primeiro
COPY requirements.txt /tmp/

# Instalar todas as dependências
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Stage de produção
FROM python:3.11-slim AS production

# Instalar apenas runtime dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    libgfortran5 \
    libopenblas0 \
    liblapack3 \
    curl \
    wget \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copiar venv do builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Configurar diretório de trabalho
WORKDIR /app

# Criar diretórios necessários
RUN mkdir -p logs uploads temp face_embeddings cache

# Copiar código da aplicação
COPY . /app/

# Download do modelo YOLO (se necessário)
RUN if [ ! -f "yolo11n.pt" ]; then \
    wget -q https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n.pt || echo "YOLO will be downloaded at runtime"; \
    fi

# Variáveis de ambiente padrão
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    API_HOST=0.0.0.0 \
    API_PORT=8001 \
    NODE_ENV=production

# Health check na porta correta
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/api/health || exit 1

# Expor porta correta
EXPOSE 8001

# Comando direto
CMD ["python", "main.py"]