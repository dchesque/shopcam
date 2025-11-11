# 🐳 ShopFlow Backend - Docker Deploy Guide

Guia completo para deploy do backend usando Docker.

---

## 📋 Pré-requisitos

- ✅ **Docker** 20.10+ instalado
- ✅ **Docker Compose** 2.0+ instalado
- ✅ **4GB RAM** mínimo no host
- ✅ **10GB disk** espaço livre
- ✅ Conta **Supabase** configurada
- ✅ Câmera **RTSP** acessível

### Verificar instalação:
```bash
docker --version
# Docker version 20.10.x ou superior

docker-compose --version
# Docker Compose version 2.x.x ou superior
```

---

## 🚀 Quick Start (3 minutos)

### 1. Clonar repositório:
```bash
git clone https://github.com/seu-usuario/shopflow.git
cd shopflow/backend
```

### 2. Configurar ambiente:
```bash
cp .env.example .env
nano .env  # ou vim, code, etc
```

**Variáveis obrigatórias:**
```env
# Supabase (obter em https://supabase.com/dashboard)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsI...

# Câmera RTSP
CAMERA_RTSP_URL=rtsp://admin:senha@192.168.1.100:554/stream
```

### 3. Build e iniciar:
```bash
docker-compose up -d --build
```

### 4. Verificar:
```bash
# Ver logs
docker-compose logs -f

# Testar health
curl http://localhost:8001/api/health
```

**Pronto!** Backend rodando em `http://localhost:8001`

---

## 📦 Arquivos do Projeto

```
backend/
├── Dockerfile              # ⭐ Imagem otimizada multi-stage
├── docker-compose.yml      # Orquestração
├── .dockerignore          # Exclusões para build
├── .env                   # Configurações (NÃO commitar!)
├── .env.example           # Template de configuração
├── requirements.txt       # Dependências Python
├── main.py               # Entrypoint
└── build-and-test.sh     # Script de build automatizado
```

---

## 🏗️ Build Manual

### Build simples:
```bash
docker build -t shopflow-backend:latest .
```

### Build com cache limpo:
```bash
docker build --no-cache -t shopflow-backend:latest .
```

### Build com platform específica:
```bash
# Para ARM64 (Apple Silicon, Raspberry Pi)
docker build --platform linux/arm64 -t shopflow-backend:latest .

# Para AMD64 (x86_64, servidores)
docker build --platform linux/amd64 -t shopflow-backend:latest .
```

### Build multi-platform:
```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t shopflow-backend:latest \
  --push \
  .
```

---

## 🎮 Comandos Docker Compose

### Iniciar:
```bash
docker-compose up -d
```

### Parar:
```bash
docker-compose down
```

### Ver logs:
```bash
docker-compose logs -f        # Todos os serviços
docker-compose logs -f backend  # Apenas backend
```

### Rebuild:
```bash
docker-compose up -d --build
```

### Restart:
```bash
docker-compose restart
```

### Ver status:
```bash
docker-compose ps
```

### Entrar no container:
```bash
docker-compose exec backend bash
```

### Ver recursos:
```bash
docker-compose stats
```

---

## 🧪 Testar Imagem

### Usando script automatizado:
```bash
chmod +x build-and-test.sh
./build-and-test.sh
```

O script vai:
1. ✅ Verificar pré-requisitos
2. ✅ Fazer build da imagem
3. ✅ Iniciar container de teste
4. ✅ Testar health endpoint
5. ✅ Mostrar informações úteis

### Testes manuais:
```bash
# Health check
curl http://localhost:8001/api/health

# Swagger docs
open http://localhost:8001/docs

# Camera stats
curl http://localhost:8001/api/camera/stats

# Stream MJPEG (navegador)
open http://localhost:8001/api/camera/stream
```

---

## 🔧 Configurações Avançadas

### Limites de recursos:

**docker-compose.yml:**
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'      # Máximo 2 CPUs
          memory: 2G     # Máximo 2GB RAM
        reservations:
          cpus: '1'      # Garantir 1 CPU
          memory: 1G     # Garantir 1GB RAM
```

### Volumes persistentes:

```yaml
volumes:
  - ./logs:/app/logs                      # Logs
  - ./uploads:/app/uploads                # Uploads
  - ./face_embeddings:/app/face_embeddings # Face embeddings
  - ./cache:/app/cache                    # Cache
```

### Networking:

```yaml
networks:
  shopflow-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Health checks:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8001/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

---

## 🌐 Deploy em Produção

### 1. VPS (Hostinger, DigitalOcean, AWS EC2):

```bash
# SSH no servidor
ssh user@seu-servidor.com

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clonar projeto
git clone https://github.com/seu-usuario/shopflow.git
cd shopflow/backend

# Configurar .env
cp .env.example .env
nano .env

# Iniciar
docker-compose up -d --build

# Setup reverse proxy (Nginx/Caddy)
# Ver seção abaixo
```

### 2. EasyPanel:

```yaml
# Configurar em EasyPanel
Source: GitHub repository
Build: Use Dockerfile
Port: 8001
Environment: Importar variáveis do .env
```

### 3. Render/Railway/Fly.io:

```yaml
# render.yaml
services:
  - type: web
    name: shopflow-backend
    env: docker
    dockerfilePath: ./backend/Dockerfile
    envVars:
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_KEY
        sync: false
```

---

## 🔒 Reverse Proxy (Nginx)

### Configuração Nginx:

```nginx
server {
    listen 80;
    server_name api.shopflow.com;

    location / {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts para MJPEG stream
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

### Com SSL (Certbot):
```bash
sudo certbot --nginx -d api.shopflow.com
```

---

## 📊 Monitoramento

### Logs:
```bash
# Tempo real
docker-compose logs -f --tail=100

# Salvar em arquivo
docker-compose logs > logs-$(date +%Y%m%d).txt

# Filtrar erros
docker-compose logs | grep ERROR
```

### Métricas:
```bash
# CPU/RAM usage
docker stats shopflow-backend

# Disk usage
docker system df
```

### Health monitoring:
```bash
# Script de monitoramento
#!/bin/bash
while true; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/api/health)
  if [ "$STATUS" != "200" ]; then
    echo "⚠️  Backend unhealthy! Restarting..."
    docker-compose restart
  fi
  sleep 60
done
```

---

## 🧹 Manutenção

### Limpar cache Docker:
```bash
docker system prune -a
```

### Atualizar imagem:
```bash
git pull
docker-compose down
docker-compose up -d --build
```

### Backup volumes:
```bash
docker run --rm \
  -v shopflow_backend_logs:/data \
  -v $(pwd):/backup \
  ubuntu tar czf /backup/logs-backup-$(date +%Y%m%d).tar.gz /data
```

### Restore volumes:
```bash
docker run --rm \
  -v shopflow_backend_logs:/data \
  -v $(pwd):/backup \
  ubuntu tar xzf /backup/logs-backup-20250110.tar.gz -C /
```

---

## ❓ Troubleshooting

Ver guia completo: [DOCKER_TROUBLESHOOTING.md](DOCKER_TROUBLESHOOTING.md)

### Problemas comuns:

**1. Build falha:**
```bash
docker builder prune -a
docker-compose build --no-cache
```

**2. Container para:**
```bash
docker logs shopflow-backend
# Verificar .env
```

**3. Health check falha:**
```bash
curl http://localhost:8001/api/health
docker logs shopflow-backend | grep ERROR
```

**4. Memória insuficiente:**
```env
# .env
CAMERA_FPS_PROCESS=3
FACE_RECOGNITION_ENABLED=false
```

---

## 📚 Documentação Adicional

- [README Principal](../README.md)
- [SETUP.md](../SETUP.md)
- [ARCHITECTURE.md](../ARCHITECTURE.md)
- [API.md](../docs/API.md)
- [TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)

---

## 💡 Dicas de Performance

### 1. Usar volumes para cache:
```yaml
volumes:
  - pip-cache:/root/.cache/pip
  - yolo-cache:/root/.ultralytics
```

### 2. Limitar logs:
```yaml
logging:
  options:
    max-size: "10m"
    max-file: "3"
```

### 3. Usar overlay2 storage driver:
```bash
docker info | grep "Storage Driver"
```

### 4. Aumentar inotify limits:
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

**🎉 Pronto! Backend ShopFlow dockerizado e funcional!**

Versão: 2.0-mvp | Última atualização: 2025-11-10