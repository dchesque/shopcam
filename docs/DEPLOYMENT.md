# 🚀 ShopFlow - Deployment Guide

Guia completo para deploy do ShopFlow MVP em produção.

---

## 📋 Visão Geral

O ShopFlow pode ser deployado de três formas:
1. **Backend VPS** (Contabo/DigitalOcean) + **Frontend Vercel** (Recomendado para MVP)
2. **Docker Compose** em VPS única (All-in-one)
3. **Localhost** apenas para desenvolvimento

---

## 🎯 Arquitetura de Produção Recomendada

```
┌─────────────────────────────────────────────────────────┐
│           FRONTEND (Vercel)                              │
│   Next.js 15 | HTTPS | CDN Global | Edge Functions     │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS (API calls)
                       ▼
┌─────────────────────────────────────────────────────────┐
│           BACKEND (VPS + Docker)                         │
│   FastAPI | YOLO11n | RTSP Processing | MJPEG Stream   │
└──────┬────────────────────────┬─────────────────────────┘
       │                        │
       │ RTSP                   │ PostgreSQL
       ▼                        ▼
┌──────────────┐      ┌──────────────────────────┐
│ Câmera IP    │      │  Supabase (Managed)      │
│ (via VPN)    │      │  - PostgreSQL            │
└──────────────┘      │  - Auth                  │
                      │  - Storage               │
                      └──────────────────────────┘
```

**Custos mensais:** ~R$ 48/mês (Contabo VPS M + Supabase Free + Vercel Free)

---

## 🌍 Pré-requisitos

### Para Deploy Produção

- [ ] **VPS** (Contabo VPS M ou similar) - 4 vCPU, 8GB RAM
- [ ] **Conta Supabase** (free tier)
- [ ] **Conta Vercel** (free tier)
- [ ] **Câmera IP** com RTSP
- [ ] **Tailscale** ou DDNS configurado (para acessar câmera)
- [ ] **Domínio** (opcional mas recomendado)

### Software Necessário (VPS)

```bash
# Ubuntu 22.04 LTS (recomendado)
- Docker 20.10+
- Docker Compose 2.0+
- Git
```

---

## 📦 Parte 1: Setup Supabase

### 1.1 Criar Projeto

1. Acesse https://supabase.com
2. Sign up/Login
3. **New Project**:
   - Name: `shopflow-mvp`
   - Database Password: `senha_forte_aqui`
   - Region: `South America (São Paulo)` ou mais próxima
   - Plan: **Free** (250MB database, 500MB storage)

### 1.2 Executar SQL para Tabelas

Vá em **SQL Editor** e execute:

```sql
-- Tabela de funcionários
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT,
    position TEXT,
    embedding FLOAT8[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_is_active ON employees(is_active);

-- Tabela de eventos de câmera
CREATE TABLE IF NOT EXISTS camera_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL,
    camera_id TEXT NOT NULL,
    total_people INTEGER NOT NULL,
    employees_count INTEGER DEFAULT 0,
    customers_count INTEGER DEFAULT 0,
    potential_customers INTEGER DEFAULT 0,
    groups_count INTEGER DEFAULT 0,
    groups_detail JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_camera_events_timestamp ON camera_events(timestamp DESC);
CREATE INDEX idx_camera_events_camera_id ON camera_events(camera_id);
CREATE INDEX idx_camera_events_created_at ON camera_events(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE camera_events ENABLE ROW LEVEL SECURITY;

-- Política para service_role (backend usa essa role)
CREATE POLICY "Service role full access employees" ON employees
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access camera_events" ON camera_events
  FOR ALL USING (auth.role() = 'service_role');
```

### 1.3 Obter Credenciais

1. Vá em **Settings** > **API**
2. Copie:
   - **URL**: `https://xxx.supabase.co`
   - **anon key**: `eyJhbGci...` (public key, pode expor no frontend)
   - **service_role key**: `eyJhbGci...` (⚠️ **PRIVADA - NUNCA expor no frontend**)

---

## 🖥️ Parte 2: Setup Backend (VPS)

### 2.1 Conectar na VPS

```bash
ssh root@SEU_IP_VPS
```

### 2.2 Instalar Dependências

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt install docker-compose -y

# Verificar instalação
docker --version
docker-compose --version
```

### 2.3 Clonar Repositório

```bash
cd /opt
git clone https://github.com/dchesque/shopcam.git
cd shopcam/backend
```

### 2.4 Configurar .env

```bash
cp .env.production.template .env
nano .env
```

**Exemplo .env para produção:**

```env
# ==============================================================================
# 🗄️ SUPABASE DATABASE
# ==============================================================================
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi... (sua anon key)
SUPABASE_SERVICE_KEY=eyJhbGci... (sua service key - PRIVADA!)

# ==============================================================================
# 🌐 API CONFIGURATION
# ==============================================================================
API_HOST=0.0.0.0
API_PORT=8001
API_DEBUG=False

# CORS - Domínios permitidos (ajustar para seu domínio)
ALLOWED_ORIGINS=https://seu-frontend.vercel.app,https://seudominio.com

# ==============================================================================
# 🎥 RTSP CAMERA
# ==============================================================================
# URL da câmera via Tailscale ou DDNS
CAMERA_RTSP_URL=rtsp://admin:senha@100.x.x.x:554/cam/realmonitor?channel=1&subtype=0
CAMERA_FPS_PROCESS=5
CAMERA_RECONNECT_TIMEOUT=10

# ==============================================================================
# 🤖 AI CONFIGURATION
# ==============================================================================
YOLO_MODEL=yolo11n.pt
YOLO_CONFIDENCE=0.5
YOLO_DEVICE=cpu

# Face Recognition
FACE_RECOGNITION_ENABLED=True
FACE_RECOGNITION_TOLERANCE=0.6

# Group Detection
GROUP_MAX_DISTANCE=1.5
GROUP_MIN_SIZE=2

# ==============================================================================
# 🔒 SECURITY
# ==============================================================================
# Gerar com: openssl rand -hex 32
BRIDGE_API_KEY=sua_chave_super_secreta_aqui_64_caracteres

# ==============================================================================
# 📊 LOGGING
# ==============================================================================
LOG_LEVEL=INFO
LOG_MAX_SIZE=50
LOG_BACKUP_COUNT=5
```

**Salvar:** `Ctrl+O` → Enter → `Ctrl+X`

### 2.5 Deploy com Docker Compose

```bash
# Build e start
docker-compose up -d

# Ver logs
docker-compose logs -f

# Verificar status
docker-compose ps
```

### 2.6 Configurar Firewall (UFW)

```bash
# Instalar UFW se necessário
apt install ufw -y

# Permitir SSH (IMPORTANTE! antes de habilitar)
ufw allow 22/tcp

# Permitir porta do backend
ufw allow 8001/tcp

# Habilitar firewall
ufw enable

# Verificar status
ufw status
```

### 2.7 Testar Backend

```bash
# Health check
curl http://localhost:8001/api/health

# Camera stats
curl http://localhost:8001/api/camera/stats

# Stream (deve retornar MJPEG)
curl http://localhost:8001/api/camera/stream --output test.jpg
```

**Resposta esperada do health check:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-09T...",
  "version": "1.0.0",
  "components": {
    "database": true,
    "detector": true,
    "tracker": true,
    "smart_engine": true
  }
}
```

---

## 🌐 Parte 3: Setup Frontend (Vercel)

### 3.1 Fork Repositório (se ainda não fez)

1. Vá em https://github.com/dchesque/shopcam
2. Clique em **Fork**
3. Crie fork na sua conta

### 3.2 Deploy no Vercel

1. Acesse https://vercel.com
2. **Import Git Repository**
3. Escolha seu fork do ShopFlow
4. **Root Directory**: `frontend`
5. **Framework Preset**: `Next.js`
6. **Build Command**: `npm run build`
7. **Output Directory**: `.next`

### 3.3 Configurar Environment Variables

No Vercel dashboard, vá em **Settings** > **Environment Variables** e adicione:

```env
# Supabase (usar ANON KEY, NÃO a service key!)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (anon key)

# Backend API (IP ou domínio da VPS)
NEXT_PUBLIC_API_URL=http://SEU_IP_VPS:8001
NEXT_PUBLIC_BACKEND_URL=http://SEU_IP_VPS:8001

# Environment
NEXT_PUBLIC_NODE_ENV=production
```

**⚠️ IMPORTANTE:**
- Use **ANON KEY** no frontend (pública)
- Nunca exponha a **SERVICE KEY** no frontend!

### 3.4 Deploy

1. Clique em **Deploy**
2. Aguarde build (~2-5 min)
3. Acesse a URL do deploy (e.g., `https://shopcam.vercel.app`)

### 3.5 Configurar Domínio Personalizado (Opcional)

1. Vá em **Settings** > **Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções do Vercel
4. Aguarde propagação (pode levar até 48h)

---

## 📹 Parte 4: Conectar Câmera RTSP

### Opção 1: Tailscale VPN (Recomendado)

#### 4.1 Instalar Tailscale na VPS

```bash
# Instalar Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Autenticar
tailscale up

# Verificar IP Tailscale
tailscale ip -4
# Exemplo: 100.x.x.x
```

#### 4.2 Instalar Tailscale na Rede da Câmera

- **Opção A:** Instalar em roteador (se suportado)
- **Opção B:** Instalar em PC/Raspberry Pi na rede da loja
- **Opção C:** Usar Tailscale subnet routing

#### 4.3 Testar Conexão

```bash
# Na VPS, ping na câmera via Tailscale
ping 100.y.y.y  # IP Tailscale da rede da câmera

# Testar RTSP
ffplay rtsp://admin:senha@100.y.y.y:554/cam/realmonitor?channel=1&subtype=0
```

### Opção 2: DDNS (Alternativa)

1. Configure DDNS no roteador (No-IP, DuckDNS, etc.)
2. Abra porta 554 (RTSP) no roteador
3. Use URL: `rtsp://admin:senha@seu-ddns.duckdns.org:554/...`

**⚠️ Menos seguro que Tailscale VPN**

---

## ✅ Verificação Final

### Backend Checklist

```bash
# 1. Health check
curl http://SEU_IP_VPS:8001/api/health

# 2. Camera stats
curl http://SEU_IP_VPS:8001/api/camera/stats

# 3. Analytics metrics
curl http://SEU_IP_VPS:8001/api/analytics/metrics

# 4. Employees list
curl http://SEU_IP_VPS:8001/api/employees/list

# 5. Stream MJPEG (deve funcionar)
curl http://SEU_IP_VPS:8001/api/camera/stream --output test_stream.jpg
```

### Frontend Checklist

1. Acesse `https://seu-app.vercel.app`
2. **Dashboard**: Deve carregar métricas
3. **Câmeras**: Stream MJPEG deve aparecer
4. **Funcionários**: Deve listar (vazio se nenhum cadastrado)

### Integration Test

1. No frontend, vá em **Funcionários**
2. Cadastre um funcionário de teste
3. Vá em **Câmera** e veja se o stream está ativo
4. Volte ao **Dashboard** e veja se as métricas aparecem

---

## 🔒 Segurança Pós-Deploy

### 1. Verificar HTTPS

- ✅ Frontend Vercel: HTTPS automático
- ⚠️ Backend VPS: Configure SSL se expor publicamente

### 2. Proteger Service Key

```bash
# NUNCA commite .env
cat backend/.gitignore | grep .env
# Deve aparecer: .env
```

### 3. Firewall

```bash
# Verificar regras UFW
ufw status numbered

# Deve ter apenas:
# - 22/tcp (SSH)
# - 8001/tcp (Backend API)
```

### 4. Atualizar ALLOWED_ORIGINS

```env
# backend/.env
ALLOWED_ORIGINS=https://seu-app.vercel.app
# NÃO use *
```

---

## 📊 Monitoramento

### Logs Backend

```bash
# Ver logs do Docker
docker-compose logs -f backend

# Filtrar erros
docker-compose logs backend | grep ERROR

# Últimas 100 linhas
docker-compose logs --tail=100 backend
```

### Metrics

```bash
# CPU e RAM
docker stats

# Ver processos Python
docker exec -it shopflow-backend ps aux | grep python

# Espaço em disco
df -h
```

### Health Checks Automatizados

Crie um cron job para monitoramento:

```bash
# Criar script de health check
nano /opt/health_check.sh
```

```bash
#!/bin/bash
# /opt/health_check.sh

BACKEND_URL="http://localhost:8001/api/health"

response=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL)

if [ $response -ne 200 ]; then
    echo "$(date): Backend DOWN! HTTP $response" >> /var/log/shopflow_health.log
    # Reiniciar serviço
    cd /opt/shopcam/backend && docker-compose restart
else
    echo "$(date): Backend UP (HTTP $response)" >> /var/log/shopflow_health.log
fi
```

```bash
# Tornar executável
chmod +x /opt/health_check.sh

# Adicionar ao cron (a cada 5 minutos)
crontab -e
# Adicionar linha:
*/5 * * * * /opt/health_check.sh
```

---

## 🔄 Atualizações e Manutenção

### Atualizar Backend

```bash
# 1. Conectar na VPS
ssh root@SEU_IP_VPS

# 2. Ir para o diretório
cd /opt/shopcam

# 3. Backup do .env
cp backend/.env backend/.env.backup

# 4. Pull das mudanças
git pull origin main

# 5. Rebuild e restart
cd backend
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 6. Verificar logs
docker-compose logs -f
```

### Atualizar Frontend

O Vercel faz deploy automático ao fazer push para a branch main:

```bash
# Local
git add .
git commit -m "Update frontend"
git push origin main

# Vercel detecta e faz deploy automaticamente
```

---

## 🐛 Troubleshooting

### Backend não inicia

```bash
# Ver logs detalhados
docker-compose logs backend

# Verificar se porta 8001 está em uso
netstat -tulpn | grep 8001

# Reiniciar
docker-compose restart backend
```

### Frontend não conecta no backend

**Erro comum:** `Failed to fetch from API`

**Solução:**
1. Verificar `NEXT_PUBLIC_API_URL` no Vercel
2. Verificar CORS no backend (`.env` → `ALLOWED_ORIGINS`)
3. Testar backend diretamente: `curl http://SEU_IP_VPS:8001/api/health`

### Stream não carrega

**Erro:** Imagem não aparece na página de Câmera

**Checklist:**
1. Backend está rodando? → `curl http://SEU_IP_VPS:8001/api/camera/stream`
2. RTSP conectado? → Ver logs: `docker-compose logs backend | grep RTSP`
3. Câmera acessível? → Testar com VLC: `vlc rtsp://...`
4. Tailscale conectado? → `tailscale status`

### Supabase connection error

```bash
# Verificar variáveis no .env
cat backend/.env | grep SUPABASE

# Testar conexão manualmente
docker exec -it shopflow-backend python -c "
from core.database import SupabaseManager
db = SupabaseManager()
print('Connection OK!' if db.supabase else 'Connection FAILED')
"
```

---

## 📚 Recursos Adicionais

- **[README.md](../README.md)** - Visão geral do projeto
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Arquitetura técnica
- **[API.md](API.md)** - Referência da API
- **[TESTING.md](TESTING.md)** - Guia de testes
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Solução de problemas

---

**Versão:** 1.0.0 | **Última atualização:** 2025-11-09
