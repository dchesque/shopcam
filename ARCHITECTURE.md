# 🏗️ ShopFlow - Arquitetura Técnica

## 📋 Visão Geral

O **ShopFlow** é um sistema de análise comportamental para lojas físicas que utiliza visão computacional e IA para fornecer insights em tempo real sobre o fluxo de clientes.

### Princípios de Design

- **Cloud-First**: Backend na VPS, frontend no Vercel, database no Supabase
- **RTSP Direto**: Processamento direto do stream da câmera (sem bridge)
- **Real-Time**: Métricas atualizadas a cada 5 segundos
- **Privacy-First**: LGPD/GDPR compliant
- **MVP-Focused**: Apenas features essenciais e comprovadas

### Stack Tecnológico

| Camada | Tecnologia | Versão | Propósito |
|--------|-----------|--------|-----------|
| **Backend** | FastAPI | 0.115.0 | API REST + Stream |
| **IA** | YOLO11n | - | Detecção de pessoas |
| **IA** | DBSCAN | - | Agrupamento espacial |
| **IA** | face_recognition | 1.3.0 | Reconhecimento facial |
| **Video** | OpenCV | 4.8+ | Processamento RTSP |
| **Database** | Supabase (PostgreSQL) | - | Persistência |
| **Frontend** | Next.js | 15.5.2 | Interface web |
| **UI** | React 18 + TypeScript | - | Componentes |
| **Styling** | Tailwind CSS | - | Design system |
| **Charts** | Recharts | 2.15.4 | Gráficos |
| **Deploy** | Docker + Vercel | - | Containerização |

---

## 🏗️ Arquitetura de Sistema

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐         │
│  │Dashboard │  │ Câmera   │  │ Funcionários   │         │
│  └──────────┘  └──────────┘  └────────────────┘         │
│       │              │                 │                 │
│       └──────────────┴─────────────────┘                 │
│                      │ HTTPS                             │
└──────────────────────┼───────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────┐
│           BACKEND (FastAPI + Docker)                     │
│  ┌───────────────────────────────────────────────┐      │
│  │         RTSP Frame Processor                  │      │
│  │  ┌────────────┐  ┌──────────┐  ┌──────────┐  │      │
│  │  │RTSP Capture│→│YOLO11n   │→│Face Recog│  │      │
│  │  │(5 FPS)     │  │Detector  │  │Manager   │  │      │
│  │  └────────────┘  └──────────┘  └──────────┘  │      │
│  │         ↓              ↓              ↓       │      │
│  │  ┌────────────┐  ┌──────────────────────┐   │      │
│  │  │Group       │  │ Analytics Metrics    │   │      │
│  │  │Detector    │  │ Calculation          │   │      │
│  │  │(DBSCAN)    │  └──────────────────────┘   │      │
│  │  └────────────┘                              │      │
│  └───────────────────────────────────────────────┘      │
│         │                                   │            │
│         │ MJPEG Stream                      │ PostgreSQL │
│         ▼                                   ▼            │
└────────────────────────────────────────────────────────┘
         │                                   │
         │                                   │
    ┌────▼─────┐                     ┌──────▼────────┐
    │ Câmera   │                     │  Supabase DB  │
    │ RTSP     │                     │  - employees  │
    │          │                     │  - camera_    │
    └──────────┘                     │    events     │
                                     └───────────────┘
```

### Fluxo de Dados

```
1. Câmera RTSP → RTSPCameraManager (captura 5 FPS)
                    ↓
2. Frame → YOLOPersonDetector (detecta pessoas)
                    ↓
3. Detections → GroupDetectorSimple (agrupa espacialmente)
                    ↓
4. Detections → FaceRecognitionManager (identifica funcionários)
                    ↓
5. Métricas → Supabase (persiste camera_events)
                    ↓
6. Frame Anotado → MJPEG Stream (visualização)
                    ↓
7. Frontend → Fetch /api/analytics/metrics (exibe dashboard)
```

---

## 🔧 Backend - Componentes

### 1. RTSP Capture Layer

**Arquivo:** `backend/core/rtsp_capture.py`
**Classe:** `RTSPCameraManager`

**Responsabilidades:**
- Conexão direta com câmera IP via protocolo RTSP
- Threading assíncrono com queue thread-safe
- Reconexão automática em caso de falha
- Frame skipping para manter FPS alvo (5 FPS)
- Sanitização de URLs (remove credenciais dos logs)
- Estatísticas de saúde da câmera

**Configurações:**
```python
CAMERA_RTSP_URL = "rtsp://admin:senha@IP:554/cam/realmonitor?channel=1&subtype=0"
CAMERA_FPS_PROCESS = 5
CAMERA_RECONNECT_TIMEOUT = 10
```

**Uso:**
```python
camera = RTSPCameraManager(rtsp_url=settings.CAMERA_RTSP_URL, target_fps=5)
camera.connect()
frame = camera.get_frame()  # numpy array BGR
stats = camera.get_stats()  # FPS, frames captured, errors
```

---

### 2. Detection Layer

**Arquivo:** `backend/core/detector.py`
**Classe:** `YOLOPersonDetector`

**Responsabilidades:**
- Detecção de pessoas usando YOLO11n
- Filtragem por classe (apenas "person")
- Aplicação de threshold de confiança
- Retorno de bounding boxes normalizadas

**Configurações:**
```python
YOLO_MODEL = "yolo11n.pt"
YOLO_CONFIDENCE = 0.5
```

**Output:**
```python
detections = [
    {
        "bbox": [x1, y1, x2, y2],  # pixels
        "confidence": 0.87,
        "class_id": 0,
        "class_name": "person"
    }
]
```

**Performance:**
- Modelo: YOLO11n (nano, mais leve)
- Tempo médio: 50-100ms por frame
- Throughput: 4-5 FPS em VPS 4 vCPU

---

### 3. Group Detection Layer

**Arquivo:** `backend/core/group_detector_simple.py`
**Classe:** `GroupDetectorSimple`

**Responsabilidades:**
- Clustering espacial usando DBSCAN
- Conversão de pixels para metros (usando FOV da câmera)
- Lógica de negócio para cálculo de clientes potenciais
- Exclusão de funcionários da contagem

**Lógica de Clientes Potenciais:**
```python
# 1 pessoa sozinha = 1 cliente potencial
# Grupo de 2-4 pessoas = 1 cliente potencial (família, casal)
# Grupo de 5+ pessoas = 2 clientes potenciais (excursão, grupo grande)

def calculate_potential_customers(group_size: int) -> int:
    if group_size == 1:
        return 1
    elif 2 <= group_size <= 4:
        return 1
    else:  # 5+
        return 2
```

**Configurações:**
```python
GROUP_MAX_DISTANCE = 1.5  # metros
GROUP_MIN_SIZE = 2
```

**Output:**
```python
{
    "total_people": 7,
    "employees_count": 1,
    "customers_count": 6,
    "potential_customers": 2,
    "groups_count": 2,
    "groups_detail": [
        {"group_id": 0, "size": 4, "potential_customers": 1, "label": "Grupo de 4"},
        {"group_id": 1, "size": 2, "potential_customers": 1, "label": "Grupo de 2"}
    ]
}
```

---

### 4. Face Recognition Layer

**Arquivo:** `backend/core/ai/face_recognition.py`
**Classe:** `FaceRecognitionManager`

**Responsabilidades:**
- Registro de funcionários (foto → embedding)
- Reconhecimento em tempo real
- Armazenamento de embeddings (sem fotos)
- LGPD compliant (direito ao esquecimento)

**Configurações:**
```python
FACE_RECOGNITION_ENABLED = True
FACE_RECOGNITION_TOLERANCE = 0.6
```

**Workflow:**
```
1. Registro:
   Foto → face_recognition.face_encodings() → embedding (128-d vector)
   → Salvar no Supabase (employees.embedding)

2. Reconhecimento:
   Frame → face_recognition.face_locations() → face crops
   → face_encodings() → comparar com embeddings DB
   → Match? → Retornar employee_id
```

**Privacy:**
- ✅ Apenas embeddings armazenados (não fotos)
- ✅ Dados podem ser deletados (DELETE /api/employees/{id})
- ✅ Logs de auditoria
- ✅ Consentimento obrigatório

---

### 5. Processing Pipeline

**Arquivo:** `backend/core/rtsp_processor.py`
**Classe:** `RTSPFrameProcessor`

**Responsabilidades:**
- Pipeline completo de processamento end-to-end
- Processamento assíncrono contínuo (loop)
- Anotação de frames para stream MJPEG
- Persistência de métricas no Supabase
- Manutenção de frame mais recente para streaming

**Pipeline:**
```python
async def process_frame():
    # 1. Capturar frame RTSP
    frame = camera.get_frame()

    # 2. Detectar pessoas (YOLO11n)
    detections = detector.detect(frame)

    # 3. Detectar grupos (DBSCAN)
    groups = group_detector.detect_groups(detections)

    # 4. Reconhecer funcionários (face_recognition)
    if face_recognition_enabled:
        employees = face_manager.recognize_faces(frame, detections)

    # 5. Calcular métricas
    metrics = group_detector.calculate_potential_customers(groups, detections)

    # 6. Anotar frame (bounding boxes, labels)
    annotated_frame = self.draw_annotations(frame, detections, groups, employees)

    # 7. Salvar métricas no Supabase
    await database.insert_camera_event_simple(metrics)

    # 8. Armazenar frame para stream MJPEG
    self.latest_frame = cv2.imencode('.jpg', annotated_frame)[1].tobytes()
```

**Visualizações Desenhadas:**
- Bounding boxes coloridos:
  - 🟢 Verde = Cliente individual
  - 🔵 Azul = Funcionário
  - 🟡 Amarelo = Pessoa em grupo
- Labels com nomes (funcionários) e confidence
- Overlay com estatísticas (canto superior esquerdo)
- Timestamp

---

### 6. Database Layer

**Arquivo:** `backend/core/database.py`
**Classe:** `SupabaseManager`

**Responsabilidades:**
- Cliente Supabase PostgreSQL
- Connection pooling
- Métodos CRUD para employees e camera_events
- Queries de histórico e analytics

**Principais Métodos:**
```python
# Employees
async def get_all_employees() -> List[Dict]
async def get_employee_by_id(employee_id: str) -> Optional[Dict]
async def insert_employee(name, embedding, ...) -> Dict
async def delete_employee(employee_id: str) -> bool

# Camera Events
async def insert_camera_event_simple(event_data: Dict) -> Optional[Dict]
async def get_metrics_24h() -> List[Dict]
```

---

### 7. API Layer

**Arquivo:** `backend/api/routes/`

#### Camera Endpoints (`camera.py`)

| Endpoint | Method | Descrição |
|----------|--------|-----------|
| `/api/camera/stream` | GET | Stream MJPEG com bounding boxes |
| `/api/camera/stats` | GET | Estatísticas da câmera (FPS, frames) |
| `/api/camera/status` | GET | Status dos serviços |

#### Analytics Endpoints (`analytics.py`)

| Endpoint | Method | Descrição |
|----------|--------|-----------|
| `/api/analytics/metrics` | GET | Métricas 24h (pessoas, clientes, funcionários, grupos) |
| `/api/analytics/smart-metrics` | GET | Métricas inteligentes em tempo real |
| `/api/analytics/health` | GET | Health check analytics |

#### Employee Endpoints (`employees.py`)

| Endpoint | Method | Descrição |
|----------|--------|-----------|
| `/api/employees/register` | POST | Cadastrar funcionário com foto |
| `/api/employees/list` | GET | Listar funcionários |
| `/api/employees/{id}` | GET | Detalhes do funcionário |
| `/api/employees/{id}` | DELETE | Remover funcionário (LGPD) |

---

## 🌐 Frontend - Componentes

### Estrutura de Pastas

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx         # Dashboard principal
│   │   │   ├── cameras/
│   │   │   │   └── page.tsx         # Visualização stream
│   │   │   └── employees/
│   │   │       └── page.tsx         # Gerenciamento funcionários
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Homepage
│   │
│   ├── components/
│   │   ├── ui/                      # Radix UI components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── providers/
│   │   │   └── RealtimeProvider.tsx # WebSocket provider
│   │   └── cameras/
│   │       └── CameraConfigForm.tsx
│   │
│   └── lib/
│       ├── constants.ts             # API URLs, config
│       └── utils.ts                 # Helpers
```

---

### Páginas

#### 1. Dashboard (`/dashboard`)

**Responsabilidades:**
- Exibir métricas em tempo real (atualiza a cada 5s)
- Gráfico de histórico 24h (line chart)
- Preview do stream da câmera

**Componentes:**
- 4x Metric Cards (Pessoas, Clientes, Funcionários, Grupos)
- 1x Line Chart (Recharts) - histórico 24h
- 1x Stream Preview (thumbnail clicável)

**Data Fetching:**
```typescript
// Fetch a cada 5 segundos
useEffect(() => {
  const fetchMetrics = async () => {
    const res = await fetch('/api/analytics/metrics')
    const data = await res.json()
    setMetrics(data)
  }

  fetchMetrics()
  const interval = setInterval(fetchMetrics, 5000)
  return () => clearInterval(interval)
}, [])
```

#### 2. Câmera (`/cameras`)

**Responsabilidades:**
- Exibir stream MJPEG em fullscreen
- Controles de câmera (play/pause, fullscreen)
- Estatísticas da câmera

**Componentes:**
- Stream Display (MJPEG img tag)
- Controls (play/pause, fullscreen, refresh)
- Stats Card (FPS, resolução, status)

**Stream Integration:**
```typescript
<img
  src={`${API_URL}/api/camera/stream`}
  alt="Camera stream"
  style={{ width: '100%', height: 'auto' }}
/>
```

#### 3. Funcionários (`/employees`)

**Responsabilidades:**
- Listar funcionários cadastrados
- Cadastrar novo funcionário (upload foto)
- Deletar funcionário

**Componentes:**
- Employee List (table/cards)
- Register Form (file upload + metadata)
- Delete Dialog (confirmation)

**Upload Workflow:**
```typescript
const formData = new FormData()
formData.append('name', 'João Silva')
formData.append('file', photoFile)

await fetch('/api/employees/register', {
  method: 'POST',
  body: formData
})
```

---

## 🗄️ Database Schema

### Supabase Tables

#### 1. `employees`

```sql
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT,
    position TEXT,
    embedding FLOAT8[] NOT NULL,  -- Face recognition embedding (128-d)
    is_active BOOLEAN DEFAULT true,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_is_active ON employees(is_active);
```

**Campos:**
- `id`: UUID gerado automaticamente
- `employee_id`: ID customizado (e.g., "emp_12345678")
- `name`: Nome completo
- `embedding`: Vetor de 128 dimensões do face_recognition
- `is_active`: Flag para soft delete

#### 2. `camera_events`

```sql
CREATE TABLE camera_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL,
    camera_id TEXT NOT NULL,
    total_people INTEGER NOT NULL,
    employees_count INTEGER DEFAULT 0,
    customers_count INTEGER DEFAULT 0,
    potential_customers INTEGER DEFAULT 0,
    groups_count INTEGER DEFAULT 0,
    groups_detail JSONB,  -- Detalhes dos grupos
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_camera_events_timestamp ON camera_events(timestamp DESC);
CREATE INDEX idx_camera_events_camera_id ON camera_events(camera_id);
CREATE INDEX idx_camera_events_created_at ON camera_events(created_at DESC);
```

**Campos:**
- `timestamp`: Quando o evento ocorreu
- `camera_id`: ID da câmera (suporte multi-câmera futuro)
- `total_people`: Total de pessoas detectadas
- `employees_count`: Funcionários identificados
- `customers_count`: Clientes (total - funcionários)
- `potential_customers`: Clientes potenciais (lógica de grupos)
- `groups_count`: Número de grupos detectados
- `groups_detail`: JSON com detalhes dos grupos

**Exemplo de `groups_detail`:**
```json
[
    {"group_id": 0, "size": 4, "potential_customers": 1, "label": "Grupo de 4"},
    {"group_id": 1, "size": 2, "potential_customers": 1, "label": "Grupo de 2"}
]
```

---

## 🔄 End-to-End Flow

### 1. Inicialização do Sistema

```
1. Backend Startup (main.py):
   - Conectar Supabase
   - Carregar YOLO11n model
   - Inicializar FaceRecognitionManager (carregar embeddings do DB)
   - Inicializar GroupDetectorSimple
   - Criar RTSPFrameProcessor
   - Conectar à câmera RTSP
   - Iniciar loop de processamento assíncrono

2. Frontend Startup:
   - Carregar React app
   - Configurar API_URL (from .env)
   - Iniciar polling de métricas (5s interval)
```

### 2. Frame Processing (Loop Contínuo)

```
Loop a cada ~200ms (5 FPS):

1. RTSPCameraManager captura frame
   ↓
2. YOLOPersonDetector detecta pessoas
   → Output: Lista de bounding boxes
   ↓
3. GroupDetectorSimple agrupa pessoas
   → Output: Lista de grupos + métricas
   ↓
4. FaceRecognitionManager reconhece funcionários
   → Output: Lista de employee_ids identificados
   ↓
5. RTSPFrameProcessor anota frame
   → Desenha bounding boxes, labels, overlay
   ↓
6. SupabaseManager salva métricas
   → INSERT INTO camera_events
   ↓
7. Frame JPEG armazenado para MJPEG stream
```

### 3. Frontend Data Flow

```
1. Dashboard page (a cada 5s):
   GET /api/analytics/metrics
   → Retorna métricas 24h agregadas
   → Atualiza UI (metric cards + chart)

2. Camera page (stream contínuo):
   <img src="/api/camera/stream">
   → Recebe MJPEG multipart
   → Browser renderiza frames automaticamente

3. Employees page:
   GET /api/employees/list
   → Retorna lista de funcionários
   → Renderiza table/cards

   POST /api/employees/register (on submit)
   → Upload foto
   → Backend processa face embedding
   → Salva no DB
   → Retorna sucesso
```

---

## 🔒 Segurança

### Backend

- **CORS**: Configurado para domínios autorizados
- **Environment Variables**: Credenciais nunca hardcoded
- **Input Validation**: FastAPI Pydantic models
- **Error Handling**: Logs sanitizados (remove passwords de URLs)

### Database

- **Row Level Security (RLS)**: Habilitado no Supabase
- **Service Key**: Apenas backend tem acesso (nunca no frontend)
- **Anon Key**: Somente leitura pública limitada

### Privacy

- **Face Embeddings**: Apenas vetores matemáticos (não fotos)
- **Data Retention**: Configurável (default 30 dias)
- **Direito ao Esquecimento**: DELETE endpoint implementado
- **Audit Logs**: Todas operações sensíveis registradas

---

## 📊 Performance

### Benchmarks (VPS 4 vCPU, 8GB RAM)

| Métrica | Valor | Nota |
|---------|-------|------|
| FPS Processamento | 4-5 | Target: 5 FPS |
| Tempo YOLO11n | 50-100ms | Por frame |
| Tempo Face Recognition | 20-40ms | Se habilitado |
| Response Time API | 50-150ms | Média |
| CPU Usage | 45-60% | Pico durante processamento |
| RAM Usage | 50-55% | Com modelo carregado |

### Otimizações

- **YOLO11n**: Modelo nano (mais leve) ao invés de YOLO11s/m/l
- **Frame Skipping**: Processa 5 FPS ao invés de 30 FPS
- **Threading**: Captura RTSP em thread separada
- **Database Pooling**: Reutilização de conexões
- **Face Recognition**: Opcional (pode desabilitar)

---

## 🚀 Deployment

### Backend (VPS)

```bash
# Docker Compose
docker-compose up -d

# Ou manual
python main.py
```

### Frontend (Vercel)

```bash
# Deploy automático via Git
vercel --prod
```

### Camera (RTSP)

```bash
# Acesso local → VPN Tailscale
# Ou DDNS (No-IP, DuckDNS)
```

---

## 📚 Referências

- **[README.md](README.md)** - Visão geral do projeto
- **[SETUP.md](SETUP.md)** - Setup completo desenvolvimento e produção
- **[docs/API.md](docs/API.md)** - Referência completa da API
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Deploy em produção
- **[docs/TESTING.md](docs/TESTING.md)** - Testes e validação

---

**Versão:** 1.0.0 | **Última atualização:** 2025-11-09
