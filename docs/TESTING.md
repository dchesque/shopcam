# 🧪 ShopFlow - Testing Guide

Guia completo de testes do ShopFlow MVP.

---

## 📋 Visão Geral

Este guia cobre:
- Testes automatizados (pytest)
- Testes manuais (bash scripts)
- Testes de integração
- Testes de performance
- Validação de produção

---

## 🚀 Quick Start

### Testes Básicos

```bash
# Backend - Health check
curl http://localhost:8001/api/health

# Backend - Camera stats
curl http://localhost:8001/api/camera/stats

# Backend - Analytics
curl http://localhost:8001/api/analytics/metrics

# Frontend - Build
cd frontend && npm run build
```

---

## 🔬 Testes Automatizados (Backend)

### Setup do Ambiente de Testes

```bash
cd backend

# Instalar dependências de teste
pip install pytest pytest-asyncio pytest-cov httpx

# Criar .env.test
cp .env.example .env.test
```

### Executar Testes

```bash
# Todos os testes
pytest

# Com coverage
pytest --cov=. --cov-report=html

# Apenas testes de integração
pytest tests/integration/

# Verbose mode
pytest -v

# Parar no primeiro erro
pytest -x
```

### Estrutura de Testes

```
backend/tests/
├── test_health.py          # Health checks
├── test_analytics.py       # Analytics endpoints
├── test_employees.py       # Employee endpoints
├── test_camera.py          # Camera endpoints
└── integration/
    ├── test_full_flow.py   # End-to-end flow
    └── test_performance.py # Performance tests
```

### Exemplo de Teste

```python
# backend/tests/test_health.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_endpoint():
    """Test health check endpoint"""
    response = client.get("/api/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "components" in data
    assert data["components"]["database"] == True

def test_camera_status():
    """Test camera status endpoint"""
    response = client.get("/api/camera/status")

    assert response.status_code == 200
    data = response.json()
    assert "detector_loaded" in data
    assert data["detector_loaded"] == True
```

---

## 🧪 Testes Manuais

### Bash Scripts de Teste

#### test_all_endpoints.sh

```bash
#!/bin/bash
# backend/tests/manual/test_all_endpoints.sh

BASE_URL="http://localhost:8001"
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "🧪 ShopFlow Backend - Test Suite"
echo "================================"

# Test 1: Health Check
echo -n "1. Health check... "
response=$(curl -s "$BASE_URL/api/health")
if echo "$response" | grep -q "healthy"; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "Response: $response"
fi

# Test 2: Camera Stats
echo -n "2. Camera stats... "
response=$(curl -s "$BASE_URL/api/camera/stats")
if echo "$response" | grep -q "fps"; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

# Test 3: Camera Status
echo -n "3. Camera status... "
response=$(curl -s "$BASE_URL/api/camera/status")
if echo "$response" | grep -q "detector_loaded"; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

# Test 4: Analytics Metrics
echo -n "4. Analytics metrics... "
response=$(curl -s "$BASE_URL/api/analytics/metrics")
if echo "$response" | grep -q "data"; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

# Test 5: Employees List
echo -n "5. Employees list... "
response=$(curl -s "$BASE_URL/api/employees/list")
if echo "$response" | grep -q "employees"; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

# Test 6: MJPEG Stream
echo -n "6. MJPEG stream... "
curl -s "$BASE_URL/api/camera/stream" -m 2 --output /tmp/test_stream.jpg 2>/dev/null
if [ -f /tmp/test_stream.jpg ] && [ -s /tmp/test_stream.jpg ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    rm /tmp/test_stream.jpg
else
    echo -e "${RED}❌ FAIL${NC}"
fi

echo "================================"
echo "✅ Test suite complete!"
```

#### Executar

```bash
chmod +x backend/tests/manual/test_all_endpoints.sh
./backend/tests/manual/test_all_endpoints.sh
```

---

## 📊 Testes de Performance

### Load Testing com cURL

```bash
#!/bin/bash
# backend/tests/manual/load_test.sh

REQUESTS=100
CONCURRENT=10
URL="http://localhost:8001/api/health"

echo "🔥 Load Test: $REQUESTS requests, $CONCURRENT concurrent"

time for i in $(seq 1 $REQUESTS); do
    curl -s $URL > /dev/null &
    if (( i % CONCURRENT == 0 )); then
        wait
    fi
done
wait

echo "✅ Load test complete!"
```

### Stress Test 24h

```bash
#!/bin/bash
# backend/tests/manual/stress_test_24h.sh

echo "🏋️ Starting 24h stress test..."
echo "Start time: $(date)"

END_TIME=$(($(date +%s) + 86400))  # 24 horas

while [ $(date +%s) -lt $END_TIME ]; do
    # Test health
    curl -s http://localhost:8001/api/health > /dev/null

    # Test metrics
    curl -s http://localhost:8001/api/analytics/metrics > /dev/null

    # Test stream (1 frame)
    curl -s http://localhost:8001/api/camera/stream -m 1 > /dev/null

    # Log status
    echo "$(date): ✅ Iteration complete"

    sleep 30  # Intervalo de 30s entre iterações
done

echo "✅ 24h stress test complete!"
echo "End time: $(date)"
```

---

## 🎯 Cenários de Teste Reais

### Cenário 1: Detecção de Cliente Individual

**Objetivo:** Validar detecção de 1 pessoa sozinha

**Passos:**
1. Inicie o backend
2. Posicione 1 pessoa sozinha no campo de visão
3. Aguarde 5 segundos
4. Verifique métricas:
   ```bash
   curl http://localhost:8001/api/analytics/metrics | jq '.data.current'
   ```

**Resultado esperado:**
```json
{
  "people": 1,
  "customers": 1,
  "employees": 0,
  "groups": 0,
  "potential_customers": 1
}
```

### Cenário 2: Detecção de Grupo (Família)

**Objetivo:** Validar agrupamento de 4 pessoas próximas

**Passos:**
1. Posicione 4 pessoas próximas (< 1.5m distância)
2. Aguarde processamento
3. Verifique métricas

**Resultado esperado:**
```json
{
  "people": 4,
  "customers": 4,
  "employees": 0,
  "groups": 1,
  "potential_customers": 1
}
```

### Cenário 3: Reconhecimento de Funcionário

**Objetivo:** Validar face recognition

**Passos:**
1. Cadastre funcionário:
   ```bash
   curl -X POST http://localhost:8001/api/employees/register \
     -F "name=João Silva" \
     -F "file=@joao_foto.jpg" \
     -F "department=Vendas"
   ```

2. Posicione funcionário no campo de visão
3. Aguarde reconhecimento (3-5 segundos)
4. Verifique métricas:
   ```bash
   curl http://localhost:8001/api/analytics/metrics | jq '.data.current'
   ```

**Resultado esperado:**
```json
{
  "people": 1,
  "customers": 0,
  "employees": 1,
  "groups": 0,
  "potential_customers": 0
}
```

### Cenário 4: Cena Mista (Clientes + Funcionário)

**Objetivo:** Validar detecção e classificação simultânea

**Setup:**
- 1 funcionário cadastrado
- 2 clientes em grupo
- 1 cliente individual

**Resultado esperado:**
```json
{
  "people": 4,
  "customers": 3,
  "employees": 1,
  "groups": 1,
  "potential_customers": 2
}
```

### Cenário 5: Grupo Grande (Excursão)

**Objetivo:** Validar lógica de clientes potenciais para grupos de 5+

**Setup:** 6 pessoas próximas

**Resultado esperado:**
```json
{
  "people": 6,
  "customers": 6,
  "employees": 0,
  "groups": 1,
  "potential_customers": 2
}
```

---

## 🖥️ Testes Frontend

### Build Test

```bash
cd frontend

# Install dependencies
npm install

# Run build
npm run build

# Check for errors
echo $?  # Should be 0
```

### E2E Testing (Manual)

1. **Dashboard Page**
   - [ ] Métricas carregam corretamente
   - [ ] Gráfico 24h renderiza
   - [ ] Preview do stream aparece
   - [ ] Auto-refresh funciona (5s)

2. **Camera Page**
   - [ ] Stream MJPEG carrega
   - [ ] Fullscreen funciona
   - [ ] Play/Pause funcionam
   - [ ] Stats da câmera aparecem

3. **Employees Page**
   - [ ] Lista de funcionários carrega
   - [ ] Upload de foto funciona
   - [ ] Cadastro salva corretamente
   - [ ] Delete funciona

---

## 📈 Métricas de Aceitação

### Performance

| Métrica | Target | Como Medir |
|---------|--------|------------|
| FPS Processamento | > 3 | Ver logs backend ou `/api/camera/stats` |
| Response Time (avg) | < 500ms | `curl -w "@curl-format.txt" URL` |
| CPU Usage | < 80% | `docker stats` ou `htop` |
| RAM Usage | < 80% | `docker stats` ou `free -h` |
| Processing/Frame | < 500ms | Ver logs: "Processing time:" |

### Accuracy

| Métrica | Target | Como Validar |
|---------|--------|--------------|
| Person Detection | > 90% | Teste manual com 10 cenários |
| Face Recognition | > 85% | 10 fotos do mesmo funcionário |
| Group Detection | > 80% | 10 cenários de grupos |

### Reliability

| Métrica | Target | Como Testar |
|---------|--------|-------------|
| Uptime 24h | > 99% | Stress test 24h |
| Error Rate | < 1% | 1000 requests, contar erros |
| RTSP Reconnection | < 10s | Desconectar câmera, medir tempo |

---

## 🐛 Debugging Tests

### Logs Detalhados

```bash
# Backend - Debug logs
export LOG_LEVEL=DEBUG
python main.py

# Docker logs
docker-compose logs -f backend

# Filter errors
docker-compose logs backend | grep ERROR
```

### Test com Mock Data

```python
# backend/tests/test_with_mock.py
import pytest
from unittest.mock import Mock, patch

@patch('core.detector.YOLOPersonDetector.detect')
def test_detection_with_mock(mock_detect):
    # Mock YOLO response
    mock_detect.return_value = [
        {"bbox": [100, 100, 200, 200], "confidence": 0.95}
    ]

    # Test your function
    result = process_frame(frame)

    assert result['people_count'] == 1
    assert result['confidence'] >= 0.9
```

---

## ✅ Checklist de Validação

### Pre-Deploy Checklist

- [ ] Todos testes automatizados passando
- [ ] Testes manuais de 10 cenários OK
- [ ] Performance dentro dos targets
- [ ] Load test 100 requests OK
- [ ] Stress test 1h sem crashes
- [ ] Frontend build sem erros
- [ ] E2E manual das 3 páginas OK
- [ ] Health checks 200 OK
- [ ] Logs sem ERRORs críticos

### Post-Deploy Checklist

- [ ] Health check produção OK
- [ ] Stream MJPEG funcionando
- [ ] Cadastro de funcionário OK
- [ ] Métricas atualizando
- [ ] Monitoramento ativo
- [ ] Backup configurado

---

## 📚 Referências

- **[README.md](../README.md)** - Visão geral
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Arquitetura
- **[API.md](API.md)** - API reference
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deploy guide
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Troubleshooting

---

**Versão:** 1.0.0 | **Última atualização:** 2025-11-09
