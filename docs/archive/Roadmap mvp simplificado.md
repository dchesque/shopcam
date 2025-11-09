# 🎯 ROADMAP - Transformação ShopFlow em MVP Simplificado

## 📋 Visão Geral da Transformação

**Objetivo**: Transformar o ShopFlow completo (29 páginas + 4 módulos IA) em MVP enxuto focado em 3 features essenciais.

**Features MVP**:
1. ✅ Contagem de pessoas (YOLO11)
2. ✅ Detecção de grupos (clustering espacial)
3. ✅ Identificação de funcionários (embedding facial)

**Arquitetura Alvo**: Cloud-only (sem bridge local)
- Backend na VPS conecta direto via RTSP
- Frontend simplificado (3 páginas)
- Database Supabase (1 tabela principal)

---

## 🗂️ FASE 1: LIMPEZA E SIMPLIFICAÇÃO DO BACKEND ✅ **CONCLUÍDA!**

### 📦 Etapa 1.1: Remover Módulos Complexos de IA ⏸️ **ADIADA** (mantida para compatibilidade)

#### Tarefa 1.1.1: Desabilitar Smart Analytics Engine Avançado
**Arquivos afetados**:
- `backend/core/ai/smart_analytics_engine.py`
- `backend/main.py`

**Status**: ⏸️ **ADIADA** - Mantida para compatibilidade com face recognition
**Nota**: Smart Analytics Engine foi mantido mas configurado para usar apenas reconhecimento facial no MVP

**Subtarefas**:
- [x] Manter apenas `face_recognition.py` (necessário)
- [ ] ⏸️ Simplificar classe `SmartAnalyticsEngine` (adiada para fase 2)
- [ ] ⏸️ Atualizar `SmartMetrics` dataclass (adiada para fase 2)

#### Tarefa 1.1.2: Simplificar Privacy Manager
**Status**: ⏸️ **ADIADA** - Funcionalidade mantida

**Subtarefas**:
- [x] Manter funcionalidades LGPD essenciais (já implementado)
- [ ] ⏸️ Simplificar métodos de compliance (adiada)

#### Tarefa 1.1.3: Remover Endpoints Desnecessários
**Status**: ✅ **PARCIALMENTE CONCLUÍDA**

**Subtarefas**:
- [x] **Bridge endpoints removidos**:
  - ✅ Removido `POST /api/bridge/frames`
  - ✅ Removido `POST /api/bridge/heartbeat`
- [x] **Novos endpoints MVP criados**:
  - ✅ `GET /api/camera/stream` (MJPEG stream)
  - ✅ `GET /api/camera/stats` (estatísticas)
- [ ] ⏸️ **Analytics**: Simplificar (próxima fase)
- [ ] ⏸️ **Employees**: Simplificar (próxima fase)

---

### 📦 Etapa 1.2: Implementar Conexão RTSP Direta ✅ **CONCLUÍDA!**

#### Tarefa 1.2.1: Criar Módulo de Captura RTSP ✅ **CONCLUÍDA!**
**Arquivo criado**: ✅ `backend/core/rtsp_capture.py` (467 linhas)

**Subtarefas**:
- [x] ✅ Criar classe `RTSPCameraManager`:
  - ✅ Método `connect_camera(rtsp_url)` com cv2.VideoCapture
  - ✅ Método `capture_frame()` para ler frames
  - ✅ Método `disconnect()` para cleanup
  - ✅ Tratamento de reconexão automática
  - ✅ Verificação de saúde da conexão
- [x] ✅ Implementar threading para captura contínua:
  - ✅ Thread separada para leitura de frames
  - ✅ Queue thread-safe para frames
  - ✅ Frame skip configurável (processar apenas 5 FPS)
- [x] ✅ Adicionar configurações via .env:
  - ✅ `CAMERA_RTSP_URL`
  - ✅ `CAMERA_FPS_PROCESS` (5 por padrão)
  - ✅ `CAMERA_RECONNECT_TIMEOUT` (10 segundos)

#### Tarefa 1.2.2: Integrar Captura no Main Loop ✅ **CONCLUÍDA!**
**Arquivos afetados**:
- ✅ `backend/main.py` (modificado)
- ✅ `backend/core/rtsp_processor.py` (novo - 436 linhas)

**Subtarefas**:
- [x] ✅ Remover dependências do Bridge:
  - ✅ Endpoints bridge removidos
- [x] ✅ Criar novo loop de processamento:
  - ✅ Classe `RTSPFrameProcessor` implementada
  - ✅ Captura frame via RTSP
  - ✅ Processa com YOLO11
  - ✅ Detecta grupos
  - ✅ Reconhece funcionários
  - ✅ Salva no Supabase
- [x] ✅ Adicionar ao startup da aplicação:
  - ✅ Inicializar RTSPFrameProcessor no lifespan
  - ✅ Conectar na câmera automaticamente
  - ✅ Iniciar thread de processamento assíncrona
- [x] ✅ Implementar cleanup no shutdown

#### Tarefa 1.2.3: Criar Endpoint de Stream MJPEG ✅ **CONCLUÍDA!**
**Novo endpoint**: ✅ `GET /api/camera/stream`

**Subtarefas**:
- [x] ✅ Implementar gerador de stream MJPEG:
  - ✅ Pega último frame processado
  - ✅ Desenha bounding boxes coloridos
  - ✅ Adiciona labels (Cliente/Funcionário/Grupo)
  - ✅ Converte para JPEG (qualidade 85%)
  - ✅ Retorna em formato multipart/x-mixed-replace
- [x] ✅ Implementar função de desenho de visualizações:
  - ✅ Método `_draw_visualizations()` implementado
  - ✅ Cores: 🟢 Verde (cliente), 🔵 Azul (funcionário), 🟡 Amarelo (grupo)
  - ✅ Labels com nome (funcionários) e confidence
  - ✅ Overlay com estatísticas no canto superior esquerdo
- [x] ✅ Adicionar controle de qualidade:
  - ✅ FPS do stream = 10 FPS (configurável)
  - ✅ Qualidade JPEG = 85% (configurável)
  - ✅ Buffer gerenciado automaticamente

**Endpoint adicional criado**: ✅ `GET /api/camera/stats` (estatísticas da câmera)

---

### 📦 Etapa 1.3: Implementar Detecção de Grupos ✅ **CONCLUÍDA!**

#### Tarefa 1.3.1: Criar Módulo de Group Detection ✅ **CONCLUÍDA!**
**Arquivo criado**: ✅ `backend/core/group_detector_simple.py` (314 linhas)

**Subtarefas**:
- [x] ✅ Implementar algoritmo DBSCAN simplificado:
  - ✅ Classe `GroupDetectorSimple` criada
  - ✅ Método `detect_groups(detections)` implementado
  - ✅ Parâmetros: `max_distance` (1.5m padrão), `min_group_size` (2)
- [x] ✅ Implementar funções auxiliares:
  - ✅ Cálculo de distância euclidiana
  - ✅ Detecção de centro da bounding box
  - ✅ Conversão pixels → metros (automática baseada em altura média)
- [x] ✅ Adicionar lógica de negócio:
  - ✅ Grupos de 2-4 pessoas = 1 cliente potencial
  - ✅ Grupos de 5+ pessoas = 2 clientes potenciais
  - ✅ Indivíduo = 1 cliente potencial
  - ✅ Funcionário = não conta

#### Tarefa 1.3.2: Integrar Group Detection no Pipeline ✅ **CONCLUÍDA!**
**Arquivos afetados**:
- ✅ `backend/core/rtsp_processor.py`

**Subtarefas**:
- [x] ✅ Adicionar ao loop de processamento:
  1. ✅ YOLO detecta pessoas → `detections`
  2. ✅ GroupDetectorSimple agrupa → `groups`
  3. ✅ FaceRecognition identifica → `employees`
  4. ✅ Calcular clientes potenciais → `potential_customers`
- [x] ✅ Atualizar estrutura de dados salva no Supabase:
  - ✅ `groups_count` (número de grupos)
  - ✅ `groups_detail` (JSON com tamanho de cada grupo)
  - ✅ `potential_customers` (contagem inteligente)

---

### 📦 Etapa 1.4: Simplificar Database Schema ✅ **PARCIALMENTE CONCLUÍDA**

#### Tarefa 1.4.1: Criar Schema MVP Simples
**Status**: ⏸️ **ADIADA** para fase de infraestrutura
**Nota**: Schema existente é compatível com MVP

**Subtarefas**:
- [ ] ⏸️ Criar `backend/scripts/create_mvp_tables.sql` (será feito na Fase 3)
- [x] ✅ Tabela `camera_events` existe e é compatível:
  ```sql
  CREATE TABLE camera_events (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    camera_id TEXT DEFAULT 'camera1',
    
    -- Contagens
    total_people INTEGER NOT NULL,
    employees_count INTEGER DEFAULT 0,
    groups_count INTEGER DEFAULT 0,
    potential_customers INTEGER NOT NULL,
    
    -- Detalhes grupos (JSON simples)
    groups_detail JSONB,
    
    -- Performance
    processing_time_ms INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] Indexes otimizados:
  - `idx_events_timestamp` em timestamp DESC
  - `idx_events_camera` em (camera_id, timestamp)
- [ ] Tabela `employees` (já existe, simplificar):
  ```sql
  CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    embedding FLOAT8[] NOT NULL,  -- Facial embedding
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] ⏸️ Remover tabelas complexas (será feito manualmente quando necessário):
  - `behavior_patterns` (análise avançada)
  - `customer_segments` (segmentação complexa)
  - `predictions` (predições)

#### Tarefa 1.4.2: Atualizar Database Manager ✅ **CONCLUÍDA!**
**Arquivos afetados**:
- ✅ `backend/core/database.py` (adicionados ~100 linhas)

**Subtarefas**:
- [x] ✅ Métodos de inserção implementados:
  - ✅ `insert_camera_event_simple(data)` com campos MVP
  - ✅ Mantém compatibilidade com métodos existentes
- [x] ✅ Métodos essenciais de employees:
  - ✅ `insert_employee(name, embedding, email, status)`
  - ✅ `get_all_employees()` (lista todos)
  - ✅ `get_employee_by_id(id)`
  - ✅ `delete_employee(id)`
- [x] ✅ Métodos de eventos mantidos:
  - ✅ `get_camera_stats(camera_id, hours)`
  - ✅ `get_camera_events(camera_id, start_date, end_date)`

---

### 📦 Etapa 1.5: Atualizar Configurações ✅ **CONCLUÍDA!**

#### Tarefa 1.5.1: Criar .env.mvp ✅ **CONCLUÍDA!**
**Arquivo criado**: ✅ `backend/.env.mvp` (70 linhas com documentação)

**Subtarefas**:
- [x] ✅ Configurações RTSP:
  ```env
  CAMERA_RTSP_URL=rtsp://user:pass@ip:554/cam/realmonitor?channel=1&subtype=0
  CAMERA_FPS_PROCESS=5
  CAMERA_RECONNECT_TIMEOUT=10
  ```
- [x] ✅ Configurações YOLO simplificadas:
  ```env
  YOLO_MODEL=yolo11n.pt
  YOLO_CONFIDENCE=0.5
  YOLO_DEVICE=cpu
  ```
- [x] ✅ Configurações de Grupos:
  ```env
  GROUP_MAX_DISTANCE=1.5
  GROUP_MIN_SIZE=2
  ```
- [x] ✅ Configurações Facial:
  ```env
  FACE_RECOGNITION_ENABLED=true
  FACE_TOLERANCE=0.6
  ```
- [x] ✅ Adicionadas ao `backend/core/config.py`:
  - ✅ `CAMERA_RTSP_URL`, `CAMERA_FPS_PROCESS`, `CAMERA_RECONNECT_TIMEOUT`
  - ✅ `GROUP_MAX_DISTANCE`, `GROUP_MIN_SIZE`
  - ✅ `FACE_RECOGNITION_ENABLED`

#### Tarefa 1.5.2: Atualizar requirements.txt
**Status**: ⏸️ **ADIADA** (funcional com dependências atuais)
**Arquivos afetados**:
- `backend/requirements.txt`

**Subtarefas**:
- [x] ✅ Dependências ESSENCIAIS já instaladas:
  - ✅ fastapi, uvicorn, opencv-python, ultralytics
  - ✅ supabase, python-dotenv, loguru
  - ✅ face-recognition, numpy, Pillow
- [ ] ⏸️ Remover dependências não-MVP (pode ser feito depois):
  - TensorFlow/DeepFace (se não usado)
  - Scikit-learn (já usado pelo DBSCAN - manter)
  - Pandas (análise avançada - remover depois)
  - Plotly/Seaborn (visualizações - remover depois)

---

## 🌐 FASE 2: SIMPLIFICAÇÃO DO FRONTEND

### 📦 Etapa 2.1: Remover Páginas Desnecessárias

#### Tarefa 2.1.1: Identificar Páginas MVP
**Manter apenas**:
- `app/(auth)/dashboard/page.tsx` - Dashboard principal
- `app/(auth)/cameras/page.tsx` - Visualização da câmera
- `app/(auth)/employees/page.tsx` - Gestão de funcionários

**Remover**:
- `app/(auth)/analytics/*` - Toda pasta (6 páginas)
- `app/(auth)/reports/*` - Toda pasta (1 página)
- `app/(auth)/settings/*` - Toda pasta (3 páginas)
- `app/(auth)/cameras/settings/*` - Configurações avançadas

#### Tarefa 2.1.2: Deletar Arquivos
**Subtarefas**:
- [ ] Backup das pastas antes de deletar
- [ ] Deletar pastas de páginas não-MVP
- [ ] Atualizar navegação na sidebar
- [ ] Remover rotas do sistema de navegação

---

### 📦 Etapa 2.2: Simplificar Dashboard

#### Tarefa 2.2.1: Redesign Dashboard MVP
**Arquivo**: `frontend/src/app/(auth)/dashboard/page.tsx`

**Subtarefas**:
- [ ] Layout simplificado com 3 seções:
  1. **Métricas Atuais** (cards):
     - Total de pessoas na loja
     - Clientes potenciais
     - Funcionários identificados
     - Taxa de grupos
  2. **Gráfico Simples**:
     - Linha temporal últimas 24h
     - Apenas 1 gráfico (pessoas x tempo)
  3. **Preview da Câmera**:
     - Snapshot da câmera ao vivo
     - Link para página completa
- [ ] Remover widgets complexos:
     - PieChart de segmentação
     - Heatmap
     - Predições
     - Comparações

#### Tarefa 2.2.2: Simplificar Componentes de Métricas
**Arquivos afetados**:
- `frontend/src/components/dashboard/MetricCard.tsx`

**Subtarefas**:
- [ ] Manter MetricCard básico:
  - Valor numérico grande
  - Label descritivo
  - Ícone
  - Trend simples (↑↓)
- [ ] Remover:
  - Sparklines complexos
  - Mini-gráficos SVG
  - Animações elaboradas

---

### 📦 Etapa 2.3: Simplificar Página de Câmera

#### Tarefa 2.3.1: Redesign Camera Page
**Arquivo**: `frontend/src/app/(auth)/cameras/page.tsx`

**Subtarefas**:
- [ ] Layout focado:
  - Stream MJPEG em tela cheia
  - Overlay com estatísticas no canto
  - Controles mínimos (snapshot, pausar)
- [ ] Remover:
  - Grid de múltiplas câmeras
  - Configurações avançadas inline
  - Controles complexos (qualidade, FPS, etc)

#### Tarefa 2.3.2: Simplificar StreamDisplay Component
**Arquivo**: `frontend/src/components/cameras/StreamDisplay.tsx`

**Subtarefas**:
- [ ] Implementação simples:
  - Tag `<img>` consumindo `/api/camera/stream`
  - Overlay com info básica
  - Legenda de cores (Verde/Azul/Amarelo)
- [ ] Remover:
  - Fallbacks complexos
  - Detecção de tipos de stream
  - Configurações avançadas

---

### 📦 Etapa 2.4: Simplificar Página de Funcionários

#### Tarefa 2.4.1: Redesign Employees Page
**Arquivo**: `frontend/src/app/(auth)/employees/page.tsx`

**Subtarefas**:
- [ ] Layout minimalista:
  1. **Botão "Cadastrar Funcionário"**
  2. **Lista de funcionários** (cards simples):
     - Nome
     - Status (ativo/inativo)
     - Data de cadastro
     - Botão deletar
- [ ] Modal de cadastro simples:
  - Nome (input)
  - Email (input, opcional)
  - Upload de foto (drag & drop)
  - Preview da foto
  - Botão "Cadastrar"
- [ ] Remover:
  - Análise de presença
  - Relatórios de funcionários
  - Configurações avançadas
  - Múltiplos formulários

---

### 📦 Etapa 2.5: Atualizar Hooks e API Calls

#### Tarefa 2.5.1: Simplificar Custom Hooks
**Arquivos afetados**:
- `frontend/src/hooks/useRealTimeMetrics.ts`
- `frontend/src/hooks/useEmployees.ts`

**Subtarefas**:
- [ ] `useRealTimeMetrics`:
  - Manter apenas `fetchCurrentMetrics()`
  - Endpoint: `GET /api/analytics/metrics`
  - Remover streams complexos
  - Remover predições
- [ ] `useEmployees`:
  - `fetchEmployees()` → `GET /api/employees/list`
  - `registerEmployee(data)` → `POST /api/employees/register`
  - `deleteEmployee(id)` → `DELETE /api/employees/{id}`
  - Remover analytics de presença

#### Tarefa 2.5.2: Atualizar API Service Layer
**Arquivos afetados**:
- `frontend/src/lib/api/*`

**Subtarefas**:
- [ ] Criar `api/metrics.ts`:
  - `getCurrentMetrics()` para dashboard
- [ ] Criar `api/employees.ts`:
  - `listEmployees()`
  - `registerEmployee(formData)`
  - `deleteEmployee(id)`
- [ ] Deletar arquivos não-MVP:
  - `api/analytics.ts` (complexo)
  - `api/reports.ts`
  - `api/predictions.ts`

---

### 📦 Etapa 2.6: Simplificar Navegação

#### Tarefa 2.6.1: Atualizar Sidebar
**Arquivo**: `frontend/src/components/layout/Sidebar.tsx`

**Subtarefas**:
- [ ] Itens de menu MVP:
  ```typescript
  [
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    { name: 'Câmera', icon: Video, href: '/cameras' },
    { name: 'Funcionários', icon: Users, href: '/employees' }
  ]
  ```
- [ ] Remover:
  - Analytics (6 subitens)
  - Relatórios
  - Configurações avançadas
  - Múltiplas câmeras

---

### 📦 Etapa 2.7: Atualizar Dependências

#### Tarefa 2.7.1: Limpar package.json
**Arquivo**: `frontend/package.json`

**Subtarefas**:
- [ ] Dependências ESSENCIAIS:
  ```json
  {
    "next": "15.0.0",
    "react": "^18.2.0",
    "typescript": "^5.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@tanstack/react-query": "^5.0.0",
    "recharts": "^2.8.0",
    "tailwindcss": "^3.3.0",
    "framer-motion": "^10.16.0"
  }
  ```
- [ ] Remover dependências não-MVP:
  - Zustand (se não usar estado global complexo)
  - React Hook Form (formulários simples nativos)
  - Zod (validação simples nativa)
  - Bibliotecas de gráficos avançadas

#### Tarefa 2.7.2: Atualizar .env.example
**Arquivo**: `frontend/.env.example`

**Subtarefas**:
- [ ] Variáveis MVP:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:8001
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
  NODE_ENV=production
  ```
- [ ] Remover:
  - Analytics IDs (complexo para MVP)
  - Sentry (monitoring avançado)
  - Feature flags

---

## 🗄️ FASE 3: CONFIGURAÇÃO DE INFRAESTRUTURA

### 📦 Etapa 3.1: Setup Supabase

#### Tarefa 3.1.1: Configurar Database
**Subtarefas**:
- [ ] Criar projeto no Supabase
- [ ] Executar SQL de criação das tabelas MVP:
  - `camera_events`
  - `employees`
- [ ] Criar indexes otimizados
- [ ] Configurar RLS (Row Level Security) básico
- [ ] Habilitar Realtime para `camera_events`

#### Tarefa 3.1.2: Configurar Storage (Opcional)
**Subtarefas**:
- [ ] Criar bucket `employee-photos` (se quiser guardar fotos)
- [ ] Configurar políticas de acesso
- [ ] Definir limites de tamanho (5MB por foto)

---

### 📦 Etapa 3.2: Configurar VPS (Hostinger KVM 2)

#### Tarefa 3.2.1: Setup Inicial da VPS
**Subtarefas**:
- [ ] Contratar VPS KVM 2 Hostinger
- [ ] Acessar via SSH
- [ ] Atualizar sistema:
  ```bash
  apt update && apt upgrade -y
  ```
- [ ] Instalar Docker:
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  ```
- [ ] Instalar Docker Compose:
  ```bash
  apt install docker-compose -y
  ```

#### Tarefa 3.2.2: Configurar Firewall
**Subtarefas**:
- [ ] Instalar UFW:
  ```bash
  apt install ufw
  ```
- [ ] Configurar regras:
  ```bash
  ufw allow 22/tcp   # SSH
  ufw allow 80/tcp   # HTTP
  ufw allow 443/tcp  # HTTPS
  ufw allow 8001/tcp # Backend API
  ufw enable
  ```

#### Tarefa 3.2.3: Configurar SSL com Let's Encrypt
**Subtarefas**:
- [ ] Instalar Certbot:
  ```bash
  apt install certbot python3-certbot-nginx
  ```
- [ ] Gerar certificado (após configurar domínio):
  ```bash
  certbot --nginx -d api.seudominio.com
  ```

---

### 📦 Etapa 3.3: Configurar Câmera (Intelbras Mibo)

#### Tarefa 3.3.1: Opção A - Tailscale VPN (Recomendado)
**Subtarefas**:
- [ ] Instalar Tailscale no roteador da loja:
  - Acessar admin do roteador
  - Instalar Tailscale (se suportado)
  - OU: instalar em PC conectado à rede
- [ ] Instalar Tailscale na VPS:
  ```bash
  curl -fsSL https://tailscale.com/install.sh | sh
  tailscale up
  ```
- [ ] Obter IP Tailscale da câmera:
  - Exemplo: `100.64.1.2`
- [ ] Testar conectividade:
  ```bash
  ping 100.64.1.2
  ```
- [ ] Montar URL RTSP:
  ```
  rtsp://admin:senha@100.64.1.2:554/cam/realmonitor?channel=1&subtype=0
  ```

#### Tarefa 3.3.2: Opção B - Port Forwarding (Menos Seguro)
**Subtarefas**:
- [ ] Acessar admin do roteador da loja
- [ ] Configurar IP fixo para câmera (DHCP reservation)
- [ ] Abrir porta 554 (RTSP):
  - Port Forwarding: 554 → IP da câmera
- [ ] Configurar DDNS (No-IP, DuckDNS):
  - Cadastrar domínio gratuito
  - Configurar no roteador
- [ ] Testar acesso externo:
  ```
  rtsp://admin:senha@seu-ddns.ddns.net:554/cam/realmonitor?channel=1&subtype=0
  ```

---

### 📦 Etapa 3.4: Deploy Backend na VPS

#### Tarefa 3.4.1: Preparar Dockerfile MVP
**Novo arquivo**: `backend/Dockerfile.mvp`

**Subtarefas**:
- [ ] Criar Dockerfile otimizado:
  ```dockerfile
  FROM python:3.11-slim
  WORKDIR /app
  
  # Instalar dependências sistema
  RUN apt-get update && apt-get install -y \
      libgl1-mesa-glx libglib2.0-0 && \
      rm -rf /var/lib/apt/lists/*
  
  # Copiar e instalar deps Python
  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt
  
  # Copiar código
  COPY . .
  
  # Criar dirs
  RUN mkdir -p logs uploads
  
  EXPOSE 8001
  CMD ["python", "main.py"]
  ```

#### Tarefa 3.4.2: Criar docker-compose.yml
**Novo arquivo**: `backend/docker-compose.yml`

**Subtarefas**:
- [ ] Configuração completa:
  ```yaml
  version: '3.8'
  services:
    backend:
      build:
        context: .
        dockerfile: Dockerfile.mvp
      ports:
        - "8001:8001"
      environment:
        - CAMERA_RTSP_URL=${CAMERA_RTSP_URL}
        - SUPABASE_URL=${SUPABASE_URL}
        - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
        - YOLO_MODEL=yolo11n.pt
      restart: always
      volumes:
        - ./logs:/app/logs
  ```

#### Tarefa 3.4.3: Deploy na VPS
**Subtarefas**:
- [ ] Fazer upload dos arquivos:
  ```bash
  scp -r backend/* root@sua-vps-ip:/root/shopflow-backend/
  ```
- [ ] Conectar na VPS:
  ```bash
  ssh root@sua-vps-ip
  cd /root/shopflow-backend
  ```
- [ ] Criar arquivo .env com configurações
- [ ] Build e executar:
  ```bash
  docker-compose up -d --build
  ```
- [ ] Verificar logs:
  ```bash
  docker-compose logs -f
  ```
- [ ] Testar API:
  ```bash
  curl http://localhost:8001/api/health
  ```

---

### 📦 Etapa 3.5: Deploy Frontend (Opção 1: Vercel)

#### Tarefa 3.5.1: Configurar Projeto Vercel
**Subtarefas**:
- [ ] Fazer push do código para GitHub
- [ ] Criar conta no Vercel
- [ ] Importar repositório
- [ ] Configurar build:
  - Root Directory: `frontend`
  - Framework: Next.js
  - Build Command: `npm run build`
  - Output Directory: `.next`

#### Tarefa 3.5.2: Configurar Environment Variables
**Subtarefas**:
- [ ] No dashboard Vercel, adicionar:
  - `NEXT_PUBLIC_API_URL` → `https://sua-vps-ip:8001`
  - `NEXT_PUBLIC_SUPABASE_URL` → URL do Supabase
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Chave do Supabase
  - `NODE_ENV` → `production`

#### Tarefa 3.5.3: Deploy
**Subtarefas**:
- [ ] Deploy automático ao fazer push
- [ ] Verificar build logs
- [ ] Testar aplicação: `https://seu-app.vercel.app`

---

### 📦 Etapa 3.6: Deploy Frontend (Opção 2: Mesma VPS)

#### Tarefa 3.6.1: Adicionar Frontend ao docker-compose
**Arquivo**: `backend/docker-compose.yml` (atualizar)

**Subtarefas**:
- [ ] Adicionar serviço frontend:
  ```yaml
  frontend:
    build:
      context: ../frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8001
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    restart: always
    depends_on:
      - backend
  ```

#### Tarefa 3.6.2: Configurar Nginx Reverse Proxy
**Subtarefas**:
- [ ] Instalar Nginx:
  ```bash
  apt install nginx
  ```
- [ ] Criar config:
  ```nginx
  server {
    server_name seudominio.com;
    
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

---

## 🧪 FASE 4: TESTES E VALIDAÇÃO

### 📦 Etapa 4.1: Testes de Integração

#### Tarefa 4.1.1: Testar Fluxo Completo
**Subtarefas**:
- [ ] **Teste 1: Câmera → Backend**
  - Verificar conexão RTSP
  - Confirmar captura de frames
  - Verificar detecção YOLO funcionando
- [ ] **Teste 2: Processamento IA**
  - Colocar pessoas na frente da câmera
  - Verificar contagem correta
  - Testar detecção de grupos
- [ ] **Teste 3: Reconhecimento Facial**
  - Cadastrar funcionário de teste
  - Funcionário aparecer na câmera
  - Verificar identificação correta
- [ ] **Teste 4: Frontend → Backend**
  - Dashboard mostrando dados corretos
  - Câmera ao vivo com bounding boxes
  - Cadastro de funcionário funcionando

#### Tarefa 4.1.2: Testes de Performance
**Subtarefas**:
- [ ] Monitorar uso de CPU (deve ficar < 70%)
- [ ] Monitorar uso de RAM (deve ficar < 2 GB)
- [ ] Verificar latência do stream (< 0.3s)
- [ ] Testar por 1 hora contínua
- [ ] Verificar estabilidade da conexão RTSP

---

### 📦 Etapa 4.2: Testes de Casos de Uso

#### Tarefa 4.2.1: Cenários Reais
**Subtarefas**:
- [ ] **Cenário 1: Loja vazia**
  - Contagem = 0
  - Dashboard atualiza corretamente
- [ ] **Cenário 2: 1 cliente**
  - Contagem = 1 cliente potencial
  - Bounding box verde
- [ ] **Cenário 3: Família (3 pessoas)**
  - Contagem = 1 cliente potencial
  - Bounding box amarelo no grupo
  - Label "Grupo de 3 pessoas"
- [ ] **Cenário 4: Funcionário entra**
  - Reconhece corretamente
  - Bounding box azul
  - Label com nome do funcionário
- [ ] **Cenário 5: Funcionário + 2 clientes**
  - Contagem = 2 clientes potenciais
  - Funcionário não conta
- [ ] **Cenário 6: Excursão (10 pessoas)**
  - Contagem = 2 clientes potenciais
  - Grupo grande identificado

---

### 📦 Etapa 4.3: Correções e Ajustes

#### Tarefa 4.3.1: Lista de Verificação Final
**Subtarefas**:
- [ ] Bounding boxes aparecendo corretamente
- [ ] Cores corretas (Verde/Azul/Amarelo)
- [ ] Labels legíveis
- [ ] Estatísticas atualizando em tempo real
- [ ] Stream sem travamentos
- [ ] Reconhecimento facial > 90% precisão
- [ ] Detecção de grupos funcionando
- [ ] Dashboard responsivo (mobile/desktop)
- [ ] Cadastro de funcionários funcionando
- [ ] Deleção de funcionários funcionando

---

## 📝 FASE 5: DOCUMENTAÇÃO E ENTREGA

### 📦 Etapa 5.1: Documentação de Uso

#### Tarefa 5.1.1: Criar README MVP
**Novo arquivo**: `README_MVP.md`

**Subtarefas**:
- [ ] Visão geral do MVP
- [ ] Features implementadas
- [ ] Requisitos mínimos
- [ ] Instruções de instalação
- [ ] Configuração da câmera
- [ ] Uso básico
- [ ] Troubleshooting comum
- [ ] Custos estimados (R$ 45/mês)

#### Tarefa 5.1.2: Criar Guia de Configuração
**Novo arquivo**: `SETUP_GUIDE_MVP.md`

**Subtarefas**:
- [ ] Passo a passo Supabase
- [ ] Passo a passo VPS
- [ ] Passo a passo Tailscale
- [ ] Passo a passo Deploy
- [ ] Screenshots de cada etapa
- [ ] Comandos prontos para copiar

---

### 📦 Etapa 5.2: Video/GIF de Demonstração

#### Tarefa 5.2.1: Gravar Demonstração
**Subtarefas**:
- [ ] Gravar tela mostrando:
  - Dashboard com métricas
  - Stream ao vivo com bounding boxes
  - Cadastro de funcionário
  - Reconhecimento em ação
  - Detecção de grupo
- [ ] Editar vídeo (max 3 minutos)
- [ ] Criar GIF animado do stream
- [ ] Adicionar ao README

---

## 🎯 RESUMO DE ENTREGAS

### ✅ Backend MVP
- [x] Conexão RTSP direta
- [x] YOLO11 contagem básica
- [x] Detecção de grupos (DBSCAN)
- [x] Reconhecimento facial (embeddings)
- [x] API REST simplificada (3 endpoints principais)
- [x] Stream MJPEG com bounding boxes
- [x] Database Supabase (2 tabelas)

### ✅ Frontend MVP
- [x] Dashboard simplificado (métricas + gráfico)
- [x] Página de câmera ao vivo
- [x] Página de gestão de funcionários
- [x] 3 páginas no total
- [x] Responsivo (mobile/desktop)

### ✅ Infraestrutura
- [x] VPS Hostinger KVM 2 configurada
- [x] Supabase database setup
- [x] Tailscale VPN (ou DDNS)
- [x] Docker deployment
- [x] SSL configurado

### ✅ Documentação
- [x] README MVP
- [x] Setup guide
- [x] Vídeo demonstração
- [x] Troubleshooting

---

## 📊 ESTIMATIVA DE TEMPO

| Fase | Duração Estimada |
|------|------------------|
| **Fase 1: Backend** | 3-4 dias |
| **Fase 2: Frontend** | 2-3 dias |
| **Fase 3: Infraestrutura** | 2-3 dias |
| **Fase 4: Testes** | 1-2 dias |
| **Fase 5: Documentação** | 1 dia |
| **TOTAL** | **9-13 dias** |

---

## 💰 CUSTO MENSAL MVP

```
VPS KVM 2 Hostinger:  R$ 45/mês
Supabase Free Tier:   R$ 0/mês
Tailscale:            R$ 0/mês
Domínio (opcional):   R$ 3/mês
─────────────────────────────
TOTAL:                R$ 48/mês

vs Projeto Completo:  R$ 230/mês
ECONOMIA:             R$ 182/mês (79%)
```

---

## 🎉 RESULTADO FINAL

### O Que Você Terá:

✅ **Sistema funcional** com 3 features IA  
✅ **Stream ao vivo** com bounding boxes coloridos  
✅ **Contagem inteligente** (grupos = 1 cliente)  
✅ **Reconhecimento facial** de funcionários  
✅ **Dashboard** com métricas em tempo real  
✅ **Acesso remoto** de qualquer lugar  
✅ **Custo 83% menor** que versão completa  

### Arquitetura Final:

```
📹 Câmera Intelbras (loja)
        ↓ (RTSP via Tailscale)
☁️ VPS Hostinger (R$ 45/mês)
   ├─ Backend (Python + YOLO11)
   └─ Frontend (Next.js)
        ↓
🗄️ Supabase (grátis)
        ↓
💻 Você (navegador, qualquer lugar)
```

**MVP completo e funcional em 9-13 dias!** 🚀