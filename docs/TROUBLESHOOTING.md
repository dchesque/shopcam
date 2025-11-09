# 🔧 ShopFlow - Troubleshooting Guide

Guia completo de solução de problemas do ShopFlow.

---

## 📋 Índice

- [Backend Issues](#-backend-issues)
- [Frontend Issues](#-frontend-issues)
- [Camera/RTSP Issues](#-camerartsp-issues)
- [Database Issues](#-database-issues)
- [Performance Issues](#-performance-issues)
- [Deploy Issues](#-deploy-issues)

---

## 🖥️ Backend Issues

### ❌ Backend não inicia

**Sintoma:** `python main.py` falha ou trava

**Diagnóstico:**
```bash
# Ver erro completo
python main.py

# Verificar dependências
pip list | grep fastapi
pip list | grep ultralytics

# Verificar Python version
python --version  # Deve ser 3.11+
```

**Soluções:**
```bash
# Reinstalar dependências
pip install --upgrade -r requirements.txt

# Verificar .env
cat .env | grep SUPABASE_URL
# Deve ter valores válidos

# Criar diretórios necessários
mkdir -p uploads logs face_embeddings
chmod 755 uploads logs face_embeddings
```

---

### ❌ Health check retorna erro

**Sintoma:** `curl http://localhost:8001/api/health` → 500 ou connection refused

**Diagnóstico:**
```bash
# Verificar se está rodando
ps aux | grep python | grep main.py

# Verificar porta
netstat -tulpn | grep 8001
# Ou no Windows:
netstat -ano | findstr :8001

# Ver logs
tail -f logs/app.log
```

**Soluções:**

**1. Porta já em uso:**
```bash
# Matar processo na porta 8001
kill $(lsof -t -i:8001)
# Ou no Windows:
# taskkill /PID <PID> /F

# Ou mudar porta no .env
API_PORT=8002
```

**2. Supabase connection error:**
```bash
# Verificar variáveis
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_KEY

# Testar conexão manual
curl $SUPABASE_URL/rest/v1/

# Renovar chaves no Supabase Dashboard
# Settings > API > Regenerate keys
```

---

### ❌ YOLO Model não encontrado

**Sintoma:** `ERROR: Model yolo11n.pt not found`

**Diagnóstico:**
```bash
# Verificar se arquivo existe
ls -lh yolo11n.pt

# Verificar conexão internet (modelo baixa automaticamente na primeira execução)
ping google.com
```

**Soluções:**
```bash
# Download manual do modelo
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolo11n.pt

# Ou via Python
python -c "from ultralytics import YOLO; model = YOLO('yolo11n.pt')"

# Verificar permissões
chmod 644 yolo11n.pt
```

---

### ❌ Erro de Memória (OOM)

**Sintoma:** `MemoryError` ou `Killed` no Docker

**Diagnóstico:**
```bash
# Ver uso de memória
docker stats

# Ver RAM disponível
free -h
```

**Soluções:**
```env
# Ajustar .env para usar menos memória

# 1. Usar modelo YOLO mais leve
YOLO_MODEL=yolo11n.pt  # (já é o mais leve)

# 2. Processar menos FPS
CAMERA_FPS_PROCESS=3  # ao invés de 5

# 3. Desabilitar face recognition temporariamente
FACE_RECOGNITION_ENABLED=False
```

**No Docker Compose:**
```yaml
# backend/docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G  # Aumentar limite se possível
```

---

## 🌐 Frontend Issues

### ❌ Frontend não builda

**Sintoma:** `npm run build` falha

**Diagnóstico:**
```bash
cd frontend

# Build verbose
npm run build -- --verbose

# Verificar Node version
node --version  # Deve ser 18+

# Limpar cache
rm -rf .next node_modules
npm install
```

**Soluções:**

**1. Erro de TypeScript:**
```bash
# Ver erros específicos
npm run build 2>&1 | grep error

# Fixar tipos
npm run type-check
```

**2. Erro de dependências:**
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install

# Verificar versões
cat package.json | grep next
# Deve ser "^15.5.2"
```

---

### ❌ API calls falhando no frontend

**Sintoma:** `Failed to fetch` no console do browser

**Diagnóstico:**
```bash
# 1. Abrir DevTools (F12)
# 2. Ver aba Network
# 3. Ver qual request está falhando
```

**Soluções:**

**1. CORS Error:**
```env
# backend/.env
# Adicionar domínio do frontend
ALLOWED_ORIGINS=http://localhost:3000,https://seu-app.vercel.app
```

**2. URL incorreta:**
```env
# frontend/.env.local
# Verificar URL do backend
NEXT_PUBLIC_API_URL=http://localhost:8001
# NÃO pode ter / no final
```

**3. Backend offline:**
```bash
# Testar backend diretamente
curl http://localhost:8001/api/health

# Se falhar, backend está down
# Ver seção "Backend não inicia"
```

---

### ❌ Stream MJPEG não carrega

**Sintoma:** Imagem não aparece na página /cameras

**Diagnóstico:**
```bash
# 1. Testar stream diretamente
curl http://localhost:8001/api/camera/stream --output test.jpg

# 2. Ver se arquivo foi criado
ls -lh test.jpg

# 3. Abrir no navegador
# http://localhost:8001/api/camera/stream
```

**Soluções:**

**1. RTSP não conectado:**
```bash
# Ver logs do backend
docker-compose logs backend | grep RTSP

# Deve ter: "✅ RTSP Processor iniciado"
# Se tiver erro, ver seção "Camera/RTSP Issues"
```

**2. CORS bloqueando stream:**
```env
# backend/.env
ALLOWED_ORIGINS=http://localhost:3000,https://seu-app.vercel.app
```

**3. Browser cache:**
```javascript
// Adicionar timestamp para forçar reload
<img src={`${API_URL}/api/camera/stream?t=${Date.now()}`} />
```

---

## 📹 Camera/RTSP Issues

### ❌ RTSP não conecta

**Sintoma:** `Failed to connect to RTSP camera` nos logs

**Diagnóstico:**
```bash
# 1. Verificar URL RTSP
cat backend/.env | grep CAMERA_RTSP_URL

# 2. Testar com VLC ou ffplay
vlc rtsp://admin:senha@IP:554/cam/realmonitor?channel=1&subtype=0
# Ou:
ffplay rtsp://admin:senha@IP:554/cam/realmonitor?channel=1&subtype=0

# 3. Ping na câmera
ping 192.168.1.100  # IP da câmera
```

**Soluções:**

**1. URL incorreta:**
```env
# Formatos comuns:

# Intelbras
rtsp://admin:senha@IP:554/cam/realmonitor?channel=1&subtype=0

# Hikvision
rtsp://admin:senha@IP:554/Streaming/Channels/101

# Dahua
rtsp://admin:senha@IP:554/cam/realmonitor?channel=1&subtype=0

# Axis
rtsp://admin:senha@IP:554/axis-media/media.amp

# Verificar manual da câmera para URL correta
```

**2. Firewall bloqueando porta 554:**
```bash
# Testar conexão
telnet IP_CAMERA 554

# Se falhar, abrir porta no firewall
# Ou configurar na câmera
```

**3. Credenciais incorretas:**
```bash
# Testar login via navegador
# http://IP_CAMERA

# Se não conseguir logar, resetar senha da câmera
```

**4. Câmera em rede diferente (via Tailscale):**
```bash
# Verificar Tailscale conectado
tailscale status

# Ping via Tailscale
ping 100.x.x.x  # IP Tailscale da câmera

# Usar IP Tailscale no .env
CAMERA_RTSP_URL=rtsp://admin:senha@100.x.x.x:554/...
```

---

### ❌ Stream travando/buffering

**Sintoma:** Stream congela ou fica atrasado

**Diagnóstico:**
```bash
# Ver FPS real
curl http://localhost:8001/api/camera/stats | jq '.data.fps'

# Ver processamento
docker-compose logs backend | grep "Processing time"
```

**Soluções:**
```env
# 1. Reduzir FPS alvo
CAMERA_FPS_PROCESS=3  # ao invés de 5

# 2. Usar substream (menor resolução)
# Mudar URL RTSP de subtype=0 para subtype=1
CAMERA_RTSP_URL=rtsp://admin:senha@IP:554/cam/realmonitor?channel=1&subtype=1

# 3. Aumentar timeout de reconexão
CAMERA_RECONNECT_TIMEOUT=20  # ao invés de 10
```

---

## 🗄️ Database Issues

### ❌ Supabase connection timeout

**Sintoma:** `Connection timeout` ou `502 Bad Gateway`

**Diagnóstico:**
```bash
# Testar URL Supabase
curl $SUPABASE_URL/rest/v1/

# Verificar status Supabase
# https://status.supabase.com/
```

**Soluções:**

**1. Supabase pausado (free tier):**
- Supabase pausa projeto após 1 semana de inatividade
- Solução: Acessar dashboard e resumir projeto

**2. Limite de conexões atingido:**
- Free tier: 60 conexões simultâneas
- Solução: Reduzir pool de conexões ou upgrade para Pro

**3. Network temporário:**
```bash
# Retry automático já implementado no código
# Aguardar 10-30 segundos e tentar novamente
```

---

### ❌ Query lenta

**Sintoma:** `/api/analytics/metrics` demora > 2 segundos

**Diagnóstico:**
```bash
# Ver tempo de resposta
time curl http://localhost:8001/api/analytics/metrics
```

**Soluções:**
```sql
-- Criar índices no Supabase SQL Editor

-- 1. Índice em timestamp (se não existe)
CREATE INDEX IF NOT EXISTS idx_camera_events_timestamp
ON camera_events(timestamp DESC);

-- 2. Índice em created_at
CREATE INDEX IF NOT EXISTS idx_camera_events_created_at
ON camera_events(created_at DESC);

-- 3. Limpar dados antigos (opcional)
DELETE FROM camera_events
WHERE created_at < NOW() - INTERVAL '30 days';
```

---

## ⚡ Performance Issues

### ❌ Alto uso de CPU

**Sintoma:** CPU > 80% constante

**Diagnóstico:**
```bash
# Ver uso de CPU
htop
# Ou:
docker stats

# Ver qual processo
ps aux --sort=-%cpu | head -10
```

**Soluções:**
```env
# 1. Reduzir FPS
CAMERA_FPS_PROCESS=3

# 2. Usar modelo YOLO mais leve (já estamos usando o mais leve)
YOLO_MODEL=yolo11n.pt

# 3. Desabilitar face recognition temporariamente
FACE_RECOGNITION_ENABLED=False

# 4. Reduzir workers
NUM_WORKERS=1
```

---

### ❌ Alto uso de RAM

**Sintoma:** RAM > 90%, swap sendo usado

**Diagnóstico:**
```bash
# Ver uso de memória
free -h

# Ver por processo
ps aux --sort=-%mem | head -10
```

**Soluções:**
- Ver seção "Erro de Memória (OOM)"

---

### ❌ Disco cheio

**Sintoma:** `No space left on device`

**Diagnóstico:**
```bash
# Ver espaço em disco
df -h

# Ver qual diretório está ocupando
du -sh * | sort -h
```

**Soluções:**
```bash
# 1. Limpar logs antigos
find logs/ -name "*.log" -mtime +7 -delete

# 2. Limpar uploads antigos (se SAVE_SNAPSHOTS=True)
find uploads/ -name "*.jpg" -mtime +3 -delete

# 3. Limpar Docker
docker system prune -a --volumes
```

---

## 🚀 Deploy Issues

### ❌ Docker build falha

**Sintoma:** `docker-compose build` erro

**Diagnóstico:**
```bash
# Build verbose
docker-compose build --no-cache --progress=plain
```

**Soluções:**

**1. Requirements.txt desatualizado:**
```bash
# Regenerar requirements
pip freeze > requirements.txt
```

**2. Dockerfile com erro:**
```bash
# Testar build manual
cd backend
docker build -t test .
```

---

### ❌ Vercel deploy falha

**Sintoma:** Build error no Vercel

**Diagnóstico:**
- Ver logs no Vercel dashboard
- Procurar por `Error:` ou `Failed`

**Soluções:**

**1. Build command incorreto:**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

**2. Environment variables faltando:**
- Verificar todas as variáveis `NEXT_PUBLIC_*` no Vercel Settings

**3. Node version incorreta:**
```json
// package.json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 🔍 Debugging Avançado

### Enable Debug Logs

```env
# backend/.env
LOG_LEVEL=DEBUG
API_DEBUG=True
```

```bash
# Ver logs em tempo real
tail -f logs/app.log

# Filtrar por nível
grep DEBUG logs/app.log
grep ERROR logs/app.log
```

### Network Debugging

```bash
# Ver conexões ativas
netstat -tulpn | grep LISTEN

# Ver tráfego (requer tcpdump)
tcpdump -i any port 8001

# Testar conectividade
curl -v http://localhost:8001/api/health
```

### Python Debugging

```python
# Adicionar ao código para debug
import pdb; pdb.set_trace()

# Ou usar ipdb (mais amigável)
import ipdb; ipdb.set_trace()

# Logging detalhado
from loguru import logger
logger.debug(f"Variable value: {my_var}")
```

---

## 📞 Obter Ajuda

### 1. Verificar Logs

```bash
# Backend
docker-compose logs -f backend
tail -f backend/logs/app.log

# Frontend (dev)
npm run dev  # Ver console

# Frontend (build)
npm run build 2>&1 | tee build.log
```

### 2. Testar Endpoints

```bash
# Script de diagnóstico
curl http://localhost:8001/api/health | jq
curl http://localhost:8001/api/camera/status | jq
curl http://localhost:8001/api/camera/stats | jq
curl http://localhost:8001/api/analytics/metrics | jq
```

### 3. Suporte

- **GitHub Issues:** https://github.com/dchesque/shopcam/issues
- **Documentação:** Consultar outros guias em `/docs`
- **Logs:** Sempre anexar logs relevantes ao reportar problemas

---

## ✅ Checklist de Diagnóstico

Quando encontrar um problema, seguir esta ordem:

1. **[ ]** Verificar logs (`docker-compose logs` ou `tail -f logs/app.log`)
2. **[ ]** Verificar health checks (`curl /api/health`)
3. **[ ]** Verificar variáveis de ambiente (`.env` configurado corretamente?)
4. **[ ]** Verificar conectividade (camera, database, network)
5. **[ ]** Verificar recursos (CPU, RAM, disco)
6. **[ ]** Tentar reiniciar serviço (`docker-compose restart`)
7. **[ ]** Consultar este guia para solução específica
8. **[ ]** Se persistir, abrir issue no GitHub com logs

---

## 📚 Referências

- **[README.md](../README.md)** - Visão geral
- **[SETUP.md](../SETUP.md)** - Setup e configuração
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Arquitetura técnica
- **[API.md](API.md)** - API reference
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deploy guide
- **[TESTING.md](TESTING.md)** - Testing guide

---

**Versão:** 1.0.0 | **Última atualização:** 2025-11-09
