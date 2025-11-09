# 🚀 ShopFlow MVP - Guia de Setup Completo

**Para novos usuários** que desejam configurar o ShopFlow do zero.

**Tempo estimado:** 60-90 minutos

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Setup do Supabase](#setup-do-supabase)
3. [Setup do Backend](#setup-do-backend)
4. [Setup do Frontend](#setup-do-frontend)
5. [Cadastrar Primeiro Funcionário](#cadastrar-primeiro-funcionário)
6. [Verificação Final](#verificação-final)
7. [Próximos Passos](#próximos-passos)

---

## 🔧 Pré-requisitos

### **Hardware Necessário:**

| Item | Especificação Mínima | Recomendado |
|------|---------------------|-------------|
| **Câmera IP** | RTSP habilitado, 720p | 1080p, H.264 |
| **Computador/VPS** | 2 vCPU, 4GB RAM | 4 vCPU, 8GB RAM |
| **Armazenamento** | 20GB | 50GB SSD |
| **Rede** | 10 Mbps | 50+ Mbps |

### **Software Necessário:**

**Para Backend:**
- [ ] Docker (20.10+)
- [ ] Docker Compose (2.0+)
- [ ] Git

**Para Frontend:**
- [ ] Node.js (18+)
- [ ] npm (9+) ou yarn

**Para Desenvolvimento:**
- [ ] Editor de código (VS Code recomendado)
- [ ] curl ou Postman (para testes)

### **Contas Necessárias:**

- [ ] GitHub (para clonar o repositório)
- [ ] Supabase (database - free tier OK)
- [ ] Vercel (opcional, para deploy frontend)

---

## ☁️ PASSO 1: Setup do Supabase

**Tempo:** ~10 minutos

### **1.1 - Criar Conta:**

1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub ou email
4. Confirme o email (se necessário)

### **1.2 - Criar Projeto:**

1. No dashboard, clique em "New Project"
2. Preencha:
   - **Name:** `shopflow-mvp` (ou nome de sua escolha)
   - **Database Password:** Gere uma senha forte (salve!)
   - **Region:** Escolha a mais próxima de você
   - **Pricing Plan:** Free (até 500MB OK para MVP)
3. Clique em "Create new project"
4. Aguarde ~2 minutos (setup do database)

### **1.3 - Executar Script SQL:**

1. No menu lateral, clique em "SQL Editor"
2. Clique em "New Query"
3. Abra o arquivo `backend/scripts/setup_supabase_mvp.sql` do repositório
4. Copie **TODO o conteúdo** do arquivo
5. Cole no SQL Editor do Supabase
6. Clique em "Run" (▶️)
7. Aguarde execução (~10 segundos)
8. Verifique se apareceu "Success. No rows returned"

### **1.4 - Copiar Credenciais:**

1. No menu lateral, clique em "Settings" (⚙️)
2. Clique em "API"
3. Copie e salve:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **Service Role Key (secret):** `eyJhbGciOiJIUzI1NiIs...`

⚠️ **IMPORTANTE:** O Service Role Key é secreto! Não commitá-lo no Git.

### **1.5 - Verificar Tabelas Criadas:**

1. No menu lateral, clique em "Table Editor"
2. Você deve ver 2 tabelas:
   - ✅ `camera_events` (com 3 registros de teste)
   - ✅ `employees` (vazia)

**✅ Supabase configurado!**

---

## 🐳 PASSO 2: Setup do Backend

**Tempo:** ~20 minutos

### **2.1 - Clonar Repositório:**

```bash
# Escolha um diretório
cd ~  # ou C:\Users\SeuNome no Windows

# Clone
git clone <url-do-repositorio>
cd shopcam/backend
```

### **2.2 - Instalar Docker:**

**Linux (Ubuntu/Debian):**
```bash
# Instalar Docker
curl -fsSL https://get.docker.com | bash

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Aplicar mudanças (ou fazer logout/login)
newgrp docker

# Verificar
docker --version
docker-compose --version
```

**macOS:**
```bash
# Baixar Docker Desktop
# https://www.docker.com/products/docker-desktop/

# Após instalação, verificar:
docker --version
docker-compose --version
```

**Windows:**
```bash
# Baixar Docker Desktop
# https://www.docker.com/products/docker-desktop/

# Habilitar WSL 2 (se necessário)
# Após instalação, abrir PowerShell e verificar:
docker --version
docker-compose --version
```

### **2.3 - Configurar Variáveis de Ambiente:**

```bash
# Copiar template
cp .env.production.template .env

# Editar arquivo
nano .env  # ou use VS Code: code .env
```

**Preencher com suas credenciais:**

```env
# Supabase (copiar do Passo 1.4)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...

# Câmera RTSP
# Exemplo Intelbras: rtsp://admin:senha@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0
# Exemplo Hikvision: rtsp://admin:senha@192.168.1.100:554/Streaming/Channels/101
CAMERA_RTSP_URL=rtsp://admin:senha@IP_DA_CAMERA:554/stream

# YOLO Config (padrão OK)
YOLO_MODEL=yolo11n.pt
YOLO_CONFIDENCE=0.5
YOLO_DEVICE=cpu

# Camera Processing (padrão OK)
CAMERA_FPS_PROCESS=5
CAMERA_RECONNECT_TIMEOUT=10

# Group Detection (padrão OK)
GROUP_MAX_DISTANCE=1.5
GROUP_MIN_SIZE=2

# Face Recognition (padrão OK)
FACE_RECOGNITION_ENABLED=true
FACE_TOLERANCE=0.6

# Server (padrão OK)
PORT=8001
HOST=0.0.0.0
LOG_LEVEL=INFO
```

**Salvar e fechar** (Ctrl+O, Enter, Ctrl+X no nano)

### **2.4 - Descobrir URL da Câmera (se necessário):**

**Método 1: Software do fabricante**
- Usar app do fabricante (ex: Intelbras Cloud, Hik-Connect)
- Procurar por "RTSP URL" ou "Stream URL"

**Método 2: Scan de rede**
```bash
# Linux/Mac
sudo nmap -p 554 192.168.1.0/24

# Procurar IPs com porta 554 aberta (RTSP)
```

**Método 3: Testar manualmente**
```bash
# Instalar ffmpeg
sudo apt install ffmpeg  # Linux
brew install ffmpeg      # Mac

# Testar URL
ffplay rtsp://admin:senha@IP:554/stream
```

**Formatos comuns:**
- Intelbras: `rtsp://admin:senha@IP:554/cam/realmonitor?channel=1&subtype=0`
- Hikvision: `rtsp://admin:senha@IP:554/Streaming/Channels/101`
- Dahua: `rtsp://admin:senha@IP:554/cam/realmonitor?channel=1&subtype=1`

### **2.5 - Build e Iniciar Backend:**

```bash
# Build da imagem Docker (primeira vez: ~5-10 min)
docker-compose build

# Iniciar container
docker-compose up -d

# Verificar se está rodando
docker-compose ps
# Deve mostrar: shopflow-backend   Up

# Ver logs em tempo real
docker-compose logs -f backend
```

**Logs esperados:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     RTSP connection established
INFO:     YOLO model loaded: yolo11n.pt
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001
```

Pressione `Ctrl+C` para sair dos logs (container continua rodando)

### **2.6 - Testar Backend:**

```bash
# Health check
curl http://localhost:8001/health

# Deve retornar:
# {"status":"ok","timestamp":"..."}

# Métricas
curl http://localhost:8001/api/analytics/metrics

# Deve retornar JSON com:
# {"total_people":X,"potential_customers":Y,...}
```

**✅ Backend configurado e rodando!**

---

## 💻 PASSO 3: Setup do Frontend

**Tempo:** ~15 minutos

### **3.1 - Instalar Node.js:**

**Linux (Ubuntu/Debian):**
```bash
# Instalar via nvm (recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Verificar
node --version  # v18.x.x
npm --version   # 9.x.x
```

**macOS:**
```bash
# Via Homebrew
brew install node@18

# Ou via nvm (mesmo do Linux)
```

**Windows:**
```bash
# Baixar instalador
# https://nodejs.org/en/download/

# Escolher LTS (v18+)
# Após instalação, abrir PowerShell:
node --version
npm --version
```

### **3.2 - Instalar Dependências:**

```bash
# Navegar para pasta frontend
cd ../frontend  # ou cd C:\shopcam\frontend no Windows

# Instalar dependências (~2-3 minutos)
npm install

# Aguardar conclusão
```

### **3.3 - Configurar Variável de Ambiente:**

```bash
# Criar arquivo .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8001" > .env.local

# Ou manualmente:
# Windows: criar arquivo .env.local com o conteúdo acima
```

**Se backend estiver em outra máquina:**
```env
NEXT_PUBLIC_API_URL=http://IP_DO_BACKEND:8001
```

### **3.4 - Iniciar Frontend (Desenvolvimento):**

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Aguardar mensagem:
# ✓ Ready in 2.5s
# ➜ Local:   http://localhost:3000
```

### **3.5 - Acessar no Navegador:**

1. Abra: http://localhost:3000
2. Você deve ver a tela de login/dashboard
3. Navegue para `/cameras` e verifique se o stream aparece

**✅ Frontend configurado e rodando!**

---

## 👤 PASSO 4: Cadastrar Primeiro Funcionário

**Tempo:** ~5 minutos

### **4.1 - Preparar Foto:**

**Requisitos da foto:**
- ✅ Rosto visível e centralizado
- ✅ Boa iluminação
- ✅ Pessoa olhando para frente
- ✅ Sem óculos escuros ou máscaras
- ✅ Formato: JPG ou PNG
- ✅ Tamanho: < 5MB

**Dicas:**
- Use uma selfie ou foto de documento
- Fundo neutro é melhor (mas não obrigatório)
- Distância: ~50cm da câmera

### **4.2 - Cadastrar via Frontend:**

1. Acesse: http://localhost:3000/employees
2. Clique em "Cadastrar Funcionário"
3. Preencha o formulário:
   - **Nome:** João da Silva
   - **Email:** joao.silva@loja.com
   - **Cargo:** Vendedor
   - **Departamento:** Vendas
4. Faça upload da foto (drag & drop ou clique)
5. Clique em "Cadastrar"

**Resultado esperado:**
- ✅ Mensagem de sucesso
- ✅ Funcionário aparece na tabela
- ✅ Status: "active"

### **4.3 - Verificar no Supabase:**

1. Acesse dashboard Supabase
2. Clique em "Table Editor"
3. Selecione tabela `employees`
4. Você deve ver 1 registro com:
   - `name`: João da Silva
   - `employee_id`: joao.silva@loja.com
   - `embedding`: [array de 128 floats]

### **4.4 - Testar Reconhecimento:**

1. Acesse: http://localhost:3000/cameras
2. A pessoa cadastrada deve aparecer na frente da câmera
3. Aguarde 2-3 segundos
4. Bounding box deve ficar **vermelho**
5. Label deve mostrar: "João da Silva"

**✅ Reconhecimento facial funcionando!**

---

## ✅ PASSO 5: Verificação Final

**Tempo:** ~10 minutos

### **5.1 - Checklist de Funcionalidades:**

**Backend:**
- [ ] Container rodando (`docker-compose ps`)
- [ ] Health check: `curl http://localhost:8001/health`
- [ ] Stream MJPEG: `curl http://localhost:8001/api/camera/stream -o test.jpg`
- [ ] Métricas: `curl http://localhost:8001/api/analytics/metrics`

**Frontend:**
- [ ] Dashboard carregando (http://localhost:3000)
- [ ] Métricas aparecendo (Total Pessoas, Clientes, etc.)
- [ ] Gráfico temporal com dados
- [ ] Preview da câmera visível

**Câmera:**
- [ ] Stream ao vivo em /cameras
- [ ] Bounding boxes visíveis
- [ ] Funcionário reconhecido (bounding box vermelho)
- [ ] Controles funcionando (play/pause, fullscreen)

**Supabase:**
- [ ] Tabela `camera_events` recebendo novos registros
- [ ] Timestamps recentes (últimos minutos)
- [ ] Tabela `employees` com pelo menos 1 funcionário

### **5.2 - Testar Cenários Básicos:**

**Cenário 1: Loja Vazia**
- Remova todas as pessoas do campo de visão
- Dashboard deve mostrar: `total_people: 0`

**Cenário 2: 1 Cliente (não cadastrado)**
- Coloque uma pessoa não cadastrada
- Dashboard: `total_people: 1`, `potential_customers: 1`
- Bounding box: verde

**Cenário 3: 1 Funcionário (cadastrado)**
- Coloque o funcionário cadastrado
- Dashboard: `total_people: 1`, `employees_count: 1`
- Bounding box: vermelho com nome

**Cenário 4: Grupo de 2**
- Coloque 2 pessoas próximas (< 1.5m)
- Dashboard: `groups_count: 1`
- Label: "Grupo de 2"

### **5.3 - Executar Testes Automatizados:**

```bash
# Testes manuais
cd backend/tests
./test_manual.sh

# Deve passar 9/9 testes
```

**✅ Sistema totalmente funcional!**

---

## 🚀 PASSO 6: Próximos Passos

### **Otimizações:**

**Melhorar Performance:**
```bash
# Se tiver GPU NVIDIA:
# Editar backend/.env
YOLO_DEVICE=cuda

# Reduzir FPS se CPU alto:
CAMERA_FPS_PROCESS=3
```

**Ajustar Agrupamento:**
```bash
# Grupos muito grandes/pequenos:
GROUP_MAX_DISTANCE=2.0  # Aumentar distância
GROUP_MIN_SIZE=3        # Mínimo 3 pessoas
```

**Melhorar Reconhecimento Facial:**
```bash
# Muito sensível (muitos falsos positivos):
FACE_TOLERANCE=0.5  # Mais rigoroso

# Pouco sensível (não reconhece):
FACE_TOLERANCE=0.7  # Mais permissivo
```

### **Deploy em Produção:**

Consultar: `FASE_3_INFRAESTRUTURA_GUIA_COMPLETO.md`

**Passos:**
1. Contratar VPS (Contabo, DigitalOcean, etc.)
2. Deploy backend via Docker
3. Configurar Tailscale (acesso câmera)
4. Deploy frontend no Vercel

**Custo:** ~R$ 48/mês (opção econômica)

### **Monitoramento:**

```bash
# Ver logs do backend
docker-compose logs -f backend

# Ver uso de recursos
docker stats shopflow-backend

# Ver eventos no Supabase
# Dashboard > Table Editor > camera_events
# Ordenar por timestamp DESC
```

### **Backup:**

```bash
# Exportar dados do Supabase
# Dashboard > Database > Backups
# Fazer backup manual semanal

# Backup de embeddings (local)
cd backend
tar -czf face_embeddings_backup.tar.gz face_embeddings/
```

---

## 🆘 Problemas Comuns

### **Backend não inicia:**

```bash
# Ver logs de erro
docker-compose logs backend

# Erros comuns:
# 1. Supabase credentials inválidas
# 2. RTSP URL incorreta
# 3. Porta 8001 já em uso

# Verificar porta
sudo lsof -i :8001  # Linux/Mac
netstat -ano | findstr :8001  # Windows
```

### **Stream não carrega:**

```bash
# Testar RTSP diretamente
ffplay rtsp://admin:senha@IP:554/stream

# Se não funcionar:
# - Verificar IP da câmera
# - Verificar usuário/senha
# - Verificar porta (554)
# - Verificar se RTSP está habilitado na câmera
```

### **Funcionário não reconhecido:**

1. Verificar se foi cadastrado (Supabase > employees)
2. Foto de boa qualidade?
3. Distância adequada (~1-3m)?
4. Iluminação suficiente?
5. Ajustar `FACE_TOLERANCE` no .env

### **Frontend não conecta no backend:**

```bash
# Verificar variável de ambiente
cat frontend/.env.local

# Testar conectividade
curl http://localhost:8001/health

# Verificar CORS (abrir DevTools > Console)
# Se erro de CORS: verificar backend/main.py
```

**Mais troubleshooting:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 📚 Documentação Adicional

- 📘 **[README](README.md)** - Visão geral do projeto
- 🔌 **[API Documentation](API_DOCUMENTATION.md)** - Endpoints detalhados
- 👤 **[User Manual](USER_MANUAL.md)** - Como usar o sistema
- 🧪 **[Testing Guide](FASE_4_GUIA_COMPLETO_TESTES.md)** - Suite de testes
- 🐛 **[Troubleshooting](TROUBLESHOOTING.md)** - Solução de problemas

---

## ✅ Checklist Final de Setup

- [ ] Supabase configurado e tabelas criadas
- [ ] Backend rodando em Docker
- [ ] Frontend rodando e acessível
- [ ] Câmera conectada e streamando
- [ ] Pelo menos 1 funcionário cadastrado
- [ ] Reconhecimento facial funcionando
- [ ] Dashboard exibindo métricas
- [ ] Testes manuais passando (9/9)

**🎉 PARABÉNS! Seu ShopFlow MVP está configurado e funcionando!**

---

**Dúvidas?** Consulte a documentação completa ou abra uma issue.

**Próximo passo:** Deploy em produção (ver `FASE_3_INFRAESTRUTURA_GUIA_COMPLETO.md`)
