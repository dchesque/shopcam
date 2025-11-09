# 🚀 FASE 3 - INFRAESTRUTURA - GUIA COMPLETO DE DEPLOY

**Data:** 2025-11-08
**Objetivo:** Deploy completo do ShopFlow MVP em produção

---

## 📋 VISÃO GERAL

Este guia cobre todo o processo de deploy do MVP:

1. ✅ **Setup Supabase** (5-10 min)
2. ✅ **Configurar VPS** (20-30 min)
3. ✅ **Deploy Backend** (15-20 min)
4. ✅ **Configurar Câmera** (15-30 min)
5. ✅ **Deploy Frontend** (10-15 min)
6. ✅ **Testes Finais** (10 min)

**Tempo total estimado:** 1h15min - 2h

---

## 📦 PRÉ-REQUISITOS

Antes de começar, tenha em mãos:

- [ ] Conta GitHub (para código)
- [ ] Conta Supabase (grátis)
- [ ] VPS Hostinger KVM 2 ou similar (R$ 45/mês)
- [ ] Câmera IP com RTSP habilitado
- [ ] Conta Vercel (grátis) OU espaço na VPS para frontend

---

## 🗄️ ETAPA 1: SETUP SUPABASE (5-10 min)

### **1.1 Criar Projeto**

1. Acessar: https://supabase.com
2. Fazer login/cadastro
3. Clicar "New Project"
4. Preencher:
   - **Name:** ShopFlow MVP
   - **Database Password:** [senha forte]
   - **Region:** South America (São Paulo) - se disponível
5. Aguardar 2-3 minutos (provisionamento)

### **1.2 Executar SQL de Setup**

1. Ir em: **SQL Editor** (menu lateral)
2. Clicar: **New Query**
3. Copiar conteúdo de: `backend/scripts/setup_supabase_mvp.sql`
4. Colar no editor
5. Clicar: **Run** (ou Ctrl+Enter)
6. Aguardar conclusão (deve mostrar "Success")

### **1.3 Verificar Tabelas**

Execute no SQL Editor:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('camera_events', 'employees');
```

Resultado esperado:
```
table_name
--------------
camera_events
employees
```

### **1.4 Obter Credenciais**

1. Ir em: **Settings** → **API**
2. Copiar:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** (opcional para MVP)
   - **service_role secret:** (obrigatório - copiar com cuidado!)

⚠️ **IMPORTANTE:** Guardar essas credenciais em local seguro!

---

## 🖥️ ETAPA 2: CONFIGURAR VPS (20-30 min)

### **2.1 Contratar VPS**

**Opções recomendadas:**

**A) Hostinger KVM 2** (recomendado)
- **Specs:** 2 vCPU, 4GB RAM, 50GB SSD
- **Custo:** ~R$ 45/mês
- **Link:** https://www.hostinger.com.br/vps

**B) Contabo VPS S**
- **Specs:** 4 vCPU, 6GB RAM, 100GB SSD
- **Custo:** ~R$ 30/mês
- **Link:** https://contabo.com

**C) Digital Ocean Droplet**
- **Specs:** 2 vCPU, 4GB RAM, 80GB SSD
- **Custo:** $24/mês (~R$ 120/mês)
- **Link:** https://www.digitalocean.com

### **2.2 Acessar VPS via SSH**

```bash
# Conectar (trocar IP pelo seu)
ssh root@seu.ip.da.vps

# Será pedida a senha (fornecida no email da contratação)
```

### **2.3 Atualizar Sistema**

```bash
# Atualizar pacotes
apt update && apt upgrade -y

# Instalar utilitários essenciais
apt install -y curl wget git nano htop
```

### **2.4 Instalar Docker**

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verificar instalação
docker --version
# Saída esperada: Docker version 24.x.x

# Habilitar Docker no boot
systemctl enable docker
systemctl start docker
```

### **2.5 Instalar Docker Compose**

```bash
# Instalar Docker Compose
apt install -y docker-compose

# Verificar instalação
docker-compose --version
# Saída esperada: docker-compose version 1.29.x
```

### **2.6 Configurar Firewall**

```bash
# Instalar UFW
apt install -y ufw

# Configurar regras
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 8001/tcp # Backend API

# Ativar firewall
ufw enable

# Verificar status
ufw status
```

---

## 📹 ETAPA 3: CONFIGURAR CÂMERA (15-30 min)

### **Opção A: Tailscale VPN** (Recomendado - Mais Seguro)

#### **3.1 Instalar Tailscale na VPS**

```bash
# Instalar Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Autenticar (abrirá link no navegador)
tailscale up

# Verificar IP Tailscale
tailscale ip
# Exemplo: 100.64.0.1
```

#### **3.2 Instalar Tailscale na Rede da Loja**

**Opções:**

**A) Roteador com Tailscale:**
- Alguns roteadores (TP-Link, Asus) suportam Tailscale
- Configurar no painel admin do roteador

**B) Computador/Raspberry Pi na Loja:**
```bash
# Windows: Baixar installer
https://tailscale.com/download/windows

# Linux/Raspberry Pi:
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up
```

**C) NVR da Câmera:**
- Alguns NVRs suportam Tailscale
- Verificar documentação do fabricante

#### **3.3 Obter IP Tailscale da Câmera**

```bash
# Na VPS, listar dispositivos
tailscale status

# Ou acessar: https://login.tailscale.com/admin/machines
```

#### **3.4 Testar Conectividade**

```bash
# Ping da VPS para câmera
ping 100.64.1.2  # Trocar pelo IP Tailscale da câmera

# Testar RTSP com VLC (na VPS)
apt install -y vlc
cvlc rtsp://admin:senha@100.64.1.2:554/cam/realmonitor?channel=1&subtype=0
```

#### **3.5 Montar URL RTSP**

```
rtsp://admin:senha@100.64.1.2:554/cam/realmonitor?channel=1&subtype=0
```

**Parâmetros Intelbras:**
- **channel:** 1 (primeira câmera)
- **subtype:** 0 (main stream) ou 1 (sub stream)

---

### **Opção B: Port Forwarding + DDNS** (Menos Seguro)

#### **3.1 Configurar IP Fixo para Câmera**

1. Acessar painel admin do roteador (geralmente 192.168.1.1)
2. Ir em: **DHCP** → **DHCP Reservation**
3. Reservar IP fixo para câmera (ex: 192.168.1.100)

#### **3.2 Configurar Port Forwarding**

1. Ir em: **Port Forwarding** ou **Virtual Server**
2. Adicionar regra:
   - **Service Name:** Camera RTSP
   - **External Port:** 554
   - **Internal IP:** 192.168.1.100
   - **Internal Port:** 554
   - **Protocol:** TCP
3. Salvar

#### **3.3 Configurar DDNS**

**Opções gratuitas:**

**A) No-IP:**
1. Criar conta: https://www.noip.com
2. Criar hostname: `sua-loja.ddns.net`
3. Configurar DDNS no roteador

**B) DuckDNS:**
1. Criar conta: https://www.duckdns.org
2. Criar domínio: `sua-loja.duckdns.org`
3. Instalar client no roteador ou PC da loja

#### **3.4 Testar Acesso Externo**

```bash
# Da VPS, testar ping
ping sua-loja.ddns.net

# Testar RTSP
cvlc rtsp://admin:senha@sua-loja.ddns.net:554/cam/realmonitor?channel=1&subtype=0
```

#### **3.5 URL RTSP Final**

```
rtsp://admin:senha@sua-loja.ddns.net:554/cam/realmonitor?channel=1&subtype=0
```

---

## 🐳 ETAPA 4: DEPLOY BACKEND (15-20 min)

### **4.1 Preparar Código**

```bash
# Na VPS, criar diretório
mkdir -p /root/shopflow
cd /root/shopflow

# Opção A: Clonar do GitHub
git clone https://github.com/seu-usuario/shopflow.git .

# Opção B: Fazer upload via SCP (do seu computador)
# scp -r backend/* root@seu.ip.da.vps:/root/shopflow/
```

### **4.2 Criar Arquivo .env**

```bash
# Navegar para pasta backend
cd /root/shopflow/backend

# Criar .env
nano .env
```

Colar conteúdo:
```env
# SUPABASE
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=sua_service_key_aqui

# CÂMERA RTSP (Tailscale)
CAMERA_RTSP_URL=rtsp://admin:senha@100.64.1.2:554/cam/realmonitor?channel=1&subtype=0

# YOLO
YOLO_MODEL=yolo11n.pt
YOLO_CONFIDENCE=0.5
YOLO_DEVICE=cpu

# CAMERA
CAMERA_FPS_PROCESS=5
CAMERA_RECONNECT_TIMEOUT=10

# GROUPS
GROUP_MAX_DISTANCE=1.5
GROUP_MIN_SIZE=2

# FACE
FACE_RECOGNITION_ENABLED=true
FACE_TOLERANCE=0.6

# SERVER
PORT=8001
HOST=0.0.0.0
LOG_LEVEL=INFO
```

Salvar: `Ctrl+X` → `Y` → `Enter`

### **4.3 Build e Iniciar**

```bash
# Build da imagem Docker
docker-compose build

# Iniciar serviço
docker-compose up -d

# Verificar logs
docker-compose logs -f backend
```

**Logs esperados:**
```
🚀 Iniciando Shop Flow Backend MVP (RTSP direto)...
✅ Supabase conectado
✅ YOLO11 carregado
✅ Tracker inicializado
✅ Smart Analytics Engine inicializado
🎥 Inicializando RTSP Processor...
✅ RTSP Processor iniciado - processamento ao vivo ativo!
🎯 Backend MVP iniciado com sucesso! Câmera conectada via RTSP.
```

### **4.4 Testar Endpoints**

```bash
# Health check
curl http://localhost:8001/health

# Métricas
curl http://localhost:8001/api/analytics/metrics

# Stream MJPEG (abrir no navegador)
# http://seu.ip.da.vps:8001/api/camera/stream
```

### **4.5 Comandos Úteis**

```bash
# Ver logs em tempo real
docker-compose logs -f backend

# Reiniciar backend
docker-compose restart backend

# Parar backend
docker-compose down

# Rebuild completo
docker-compose up -d --build --force-recreate

# Ver status
docker-compose ps

# Acessar shell do container
docker-compose exec backend bash
```

---

## 🌐 ETAPA 5: DEPLOY FRONTEND (10-15 min)

### **Opção A: Vercel** (Recomendado - Grátis)

#### **5.1 Preparar Repositório**

```bash
# No seu computador
cd frontend

# Fazer push para GitHub
git add .
git commit -m "Frontend MVP pronto"
git push origin main
```

#### **5.2 Deploy no Vercel**

1. Acessar: https://vercel.com
2. Login com GitHub
3. Clicar: **Add New** → **Project**
4. Selecionar repositório: `seu-usuario/shopflow`
5. Configurar:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

#### **5.3 Configurar Environment Variables**

Adicionar no Vercel (Settings → Environment Variables):

```env
NEXT_PUBLIC_API_URL=http://seu.ip.da.vps:8001
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
NODE_ENV=production
```

#### **5.4 Deploy**

1. Clicar: **Deploy**
2. Aguardar build (2-3 minutos)
3. Acessar URL: `https://seu-app.vercel.app`

---

### **Opção B: VPS (Mesma do Backend)**

#### **5.1 Adicionar ao docker-compose**

```bash
# Editar docker-compose.yml
cd /root/shopflow/backend
nano docker-compose.yml
```

Adicionar serviço frontend:
```yaml
  frontend:
    build:
      context: ../frontend
      dockerfile: Dockerfile
    container_name: shopflow-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8001
      - NODE_ENV=production
    depends_on:
      - backend
```

#### **5.2 Build e Iniciar**

```bash
docker-compose up -d --build
```

#### **5.3 Configurar Nginx Reverse Proxy**

```bash
# Instalar Nginx
apt install -y nginx

# Criar config
nano /etc/nginx/sites-available/shopflow
```

Colar:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8001;
    }
}
```

```bash
# Ativar site
ln -s /etc/nginx/sites-available/shopflow /etc/nginx/sites-enabled/

# Testar config
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

---

## ✅ ETAPA 6: TESTES FINAIS (10 min)

### **6.1 Testar Backend**

```bash
# Health check
curl http://seu.ip.da.vps:8001/health

# Métricas
curl http://seu.ip.da.vps:8001/api/analytics/metrics

# Lista de funcionários
curl http://seu.ip.da.vps:8001/api/employees/list
```

### **6.2 Testar Frontend**

1. Acessar: `https://seu-app.vercel.app` (ou IP da VPS)
2. Verificar:
   - [ ] Dashboard carrega
   - [ ] Métricas aparecem
   - [ ] Gráfico aparece
   - [ ] Preview da câmera funciona
3. Ir em: `/cameras`
   - [ ] Stream MJPEG aparece
   - [ ] Bounding boxes visíveis
   - [ ] Controles funcionam
4. Ir em: `/employees`
   - [ ] Lista carrega
   - [ ] Cadastrar funcionário funciona
   - [ ] Upload de foto funciona

### **6.3 Testar Fluxo Completo**

1. **Cadastrar Funcionário:**
   - Ir em `/employees`
   - Cadastrar com foto
   - Verificar que aparece na lista

2. **Testar Reconhecimento:**
   - Funcionário aparecer na câmera
   - Verificar bounding box azul
   - Ver nome do funcionário

3. **Verificar Métricas:**
   - Dashboard deve mostrar contagens corretas
   - Gráfico atualiza ao longo do tempo
   - Database Supabase recebe eventos

---

## 🐛 TROUBLESHOOTING

### **Backend não inicia**

```bash
# Ver logs
docker-compose logs backend

# Erros comuns:
# 1. URL RTSP errada → Verificar .env
# 2. Supabase inacessível → Verificar credenciais
# 3. Porta em uso → docker-compose down e up
```

### **Stream não aparece**

```bash
# Testar RTSP manualmente
apt install -y ffmpeg
ffmpeg -i rtsp://admin:senha@camera.ip:554/... -f null -

# Se erro → Problema na URL ou rede
# Se sucesso → Problema no código
```

### **Frontend não conecta no backend**

```bash
# Verificar CORS
# Adicionar ao backend/.env:
CORS_ORIGINS=https://seu-app.vercel.app

# Reiniciar backend
docker-compose restart backend
```

### **Reconhecimento facial não funciona**

```bash
# Verificar se face_recognition está instalado
docker-compose exec backend python -c "import face_recognition"

# Se erro → Rebuild da imagem
docker-compose build --no-cache
```

---

## 📊 CUSTOS MENSAIS

```
VPS KVM 2 Hostinger:    R$ 45/mês
Supabase Free Tier:     R$ 0/mês
Tailscale Free:         R$ 0/mês
Vercel Free:            R$ 0/mês
Domínio (opcional):     R$ 3/mês
─────────────────────────────────
TOTAL:                  R$ 48/mês
```

---

## 🎉 DEPLOY COMPLETO!

Parabéns! Seu ShopFlow MVP está em produção! 🚀

**Acessos:**
- **Frontend:** https://seu-app.vercel.app
- **Backend API:** http://seu.ip.da.vps:8001
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Stream MJPEG:** http://seu.ip.da.vps:8001/api/camera/stream

**Próximos Passos:**
- Configurar SSL/HTTPS (Let's Encrypt)
- Configurar backups do Supabase
- Monitoramento com Sentry (opcional)
- Domínio customizado (opcional)

---

**Documentado por:** Claude Code
**Data:** 2025-11-08
