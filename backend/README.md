# 🏪 ShopFlow Backend

[![Python](https://img.shields.io/badge/python-v3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg)](https://fastapi.tiangolo.com/)
[![YOLO](https://img.shields.io/badge/YOLO-v11n-yellow.svg)](https://github.com/ultralytics/ultralytics)

Backend do ShopFlow MVP - Sistema de análise de fluxo de clientes com IA.

## 🎯 Features MVP

- 🎥 **Detecção de Pessoas**: YOLO11n em tempo real
- 👥 **Detecção de Grupos**: DBSCAN para clustering espacial
- 👤 **Reconhecimento Facial**: Identificação de funcionários (LGPD-compliant)
- 📊 **Cálculo de Clientes Potenciais**: Lógica inteligente baseada em grupos
- 🎬 **Stream MJPEG**: Visualização ao vivo com bounding boxes
- 🗄️ **Persistência**: Supabase PostgreSQL

## 🚀 Quick Start

### Instalação Local

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar .env
cp .env.production.template .env
# Editar .env com suas credenciais

# Executar
python main.py
```

### Deploy com Docker

```bash
# Via Docker Compose (recomendado)
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

### Verificar Funcionamento

```bash
# Health check
curl http://localhost:8001/api/health

# Swagger docs
open http://localhost:8001/docs
```

---

## 🏗️ Arquitetura

```
📹 Câmera RTSP
    ↓
RTSPCameraManager (5 FPS)
    ↓
YOLOPersonDetector (detecção)
    ↓
GroupDetectorSimple (agrupamento)
    ↓
FaceRecognitionManager (identificação)
    ↓
Métricas → Supabase
    ↓
MJPEG Stream → Frontend
```

**Detalhes:** Ver [ARCHITECTURE.md](../ARCHITECTURE.md)

---

## 📊 API Endpoints

### Sistema
- `GET /api/health` - Health check
- `GET /docs` - Swagger UI

### Câmera
- `GET /api/camera/stream` - Stream MJPEG
- `GET /api/camera/stats` - Estatísticas
- `GET /api/camera/status` - Status

### Analytics
- `GET /api/analytics/metrics` - Métricas 24h
- `GET /api/analytics/smart-metrics` - Métricas inteligentes
- `GET /api/analytics/health` - Health analytics

### Funcionários
- `POST /api/employees/register` - Cadastrar
- `GET /api/employees/list` - Listar
- `DELETE /api/employees/{id}` - Remover (LGPD)

**Referência completa:** [docs/API.md](../docs/API.md)

---

## ⚙️ Configuração

### .env Essencial

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# API
API_HOST=0.0.0.0
API_PORT=8001

# Câmera RTSP
CAMERA_RTSP_URL=rtsp://admin:senha@IP:554/...

# IA
YOLO_MODEL=yolo11n.pt
FACE_RECOGNITION_ENABLED=True
```

**Configuração completa:** [SETUP.md](../SETUP.md)

---

## 🔒 Segurança

### ⚠️ ANTES DE FAZER DEPLOY

**1. NUNCA commite `.env` no Git**

```bash
# Verificar se .env está no .gitignore
grep -r "SUPABASE_SERVICE_KEY" .env .env.* 2>/dev/null
# Se retornar algo = PERIGO! A key está exposta.
```

**2. Configurar ENVIRONMENT corretamente**

```env
# Development (local)
ENVIRONMENT=development

# Production (deploy)
ENVIRONMENT=production
PRODUCTION_DOMAIN=seu-dominio.com  # SEM https://
```

**3. Validar CORS em produção**

```bash
# Testar que apenas seu domínio é permitido
curl -v -H "Origin: https://site-malicioso.com" \
     -X OPTIONS https://api.seu-dominio.com/api/health

# Esperado: DEVE FALHAR (sem Access-Control-Allow-Origin)

# Testar origem válida
curl -v -H "Origin: https://seu-dominio.com" \
     -X OPTIONS https://api.seu-dominio.com/api/health

# Esperado: DEVE PASSAR (com Access-Control-Allow-Origin)
```

### 🔐 SUPABASE_SERVICE_KEY - Proteção Crítica

A `SUPABASE_SERVICE_KEY` tem **privilégios administrativos totais**:

- ✅ **USE:** Apenas no backend
- ✅ **ARMAZENE:** Em secrets manager em produção
- ✅ **ROTACIONE:** A cada 30-90 dias
- ❌ **NUNCA:** Exponha no frontend
- ❌ **NUNCA:** Commite no Git
- ❌ **NUNCA:** Logue a key completa

### 🚀 Deploy Seguro

**Railway:**
```bash
railway variables set SUPABASE_SERVICE_KEY="sua-key-aqui"
railway variables set ENVIRONMENT="production"
railway variables set PRODUCTION_DOMAIN="seu-dominio.com"
railway up
```

**Heroku:**
```bash
heroku config:set SUPABASE_SERVICE_KEY="sua-key-aqui"
heroku config:set ENVIRONMENT="production"
heroku config:set PRODUCTION_DOMAIN="seu-dominio.com"
git push heroku main
```

**Docker:**
```yaml
# docker-compose.yml
environment:
  - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
  - ENVIRONMENT=production
  - PRODUCTION_DOMAIN=seu-dominio.com
```

### ✅ Checklist de Produção

- [ ] `SUPABASE_SERVICE_KEY` em secrets (não em .env commitado)
- [ ] `ENVIRONMENT=production`
- [ ] `PRODUCTION_DOMAIN` configurado
- [ ] CORS restrito ao domínio de produção
- [ ] RLS (Row Level Security) habilitado no Supabase
- [ ] Service key rotacionada nos últimos 90 dias
- [ ] HTTPS obrigatório
- [ ] Logs estruturados habilitados
- [ ] Monitoramento configurado
- [ ] Backup do banco configurado

**Guia completo:** [SECURITY.md](./SECURITY.md)

---

## 📁 Estrutura

```
backend/
├── main.py                       # App FastAPI
├── docker-compose.yml            # Docker setup
├── requirements.txt              # Dependências
│
├── api/routes/                   # Endpoints
│   ├── camera.py
│   ├── analytics.py
│   └── employees.py
│
├── core/                         # Núcleo
│   ├── rtsp_capture.py          # Captura RTSP
│   ├── rtsp_processor.py        # Pipeline IA
│   ├── detector.py              # YOLO detector
│   ├── group_detector_simple.py # DBSCAN groups
│   ├── database.py              # Supabase
│   └── ai/
│       └── face_recognition.py  # Face recognition
```

---

## 🧪 Testes

```bash
# Health check
curl http://localhost:8001/api/health

# Todos endpoints
./tests/manual/test_all_endpoints.sh

# Ver logs
docker-compose logs -f backend
```

**Guia de testes:** [docs/TESTING.md](../docs/TESTING.md)

---

## 📚 Documentação

- **[README Principal](../README.md)** - Visão geral do projeto
- **[SETUP.md](../SETUP.md)** - Setup e configuração
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Arquitetura técnica
- **[docs/API.md](../docs/API.md)** - Referência da API
- **[docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)** - Deploy produção
- **[docs/TESTING.md](../docs/TESTING.md)** - Guia de testes
- **[docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)** - Troubleshooting

---

**v1.0.0** | 2025-11-09