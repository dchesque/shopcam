# 🔌 ShopFlow - API Reference

Referência completa da API REST do ShopFlow Backend.

---

## 📋 Informações Gerais

### Base URLs

| Ambiente | URL |
|----------|-----|
| **Desenvolvimento** | `http://localhost:8001` |
| **Produção VPS** | `https://api.yourdomain.com` |
| **EasyPanel** | `https://your-app.easypanel.host` |

### Documentação Interativa

Quando o backend estiver rodando, acesse:
- **Swagger UI**: `http://localhost:8001/docs`
- **ReDoc**: `http://localhost:8001/redoc`

---

## 🔐 Autenticação

A API do ShopFlow usa **Bearer Token** para autenticação.

### Headers Obrigatórios

```http
Authorization: Bearer SUA_API_KEY
Content-Type: application/json
```

### Exemplo de Request com Auth

```bash
curl -X GET "http://localhost:8001/api/health" \
  -H "Authorization: Bearer SUA_API_KEY" \
  -H "accept: application/json"
```

**Nota:** Para o MVP, a autenticação pode ser desabilitada. Em produção, configure `BRIDGE_API_KEY` no `.env`.

---

## 🏥 Health & Status

### `GET /api/health`

Verifica a saúde geral do sistema e todos os componentes.

**Response 200:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-09T10:30:00.000Z",
  "version": "1.0.0",
  "components": {
    "database": true,
    "detector": true,
    "tracker": true,
    "smart_engine": true,
    "privacy_manager": true,
    "face_recognition": true,
    "behavior_analyzer": true,
    "customer_segmentation": true,
    "predictive_insights": true
  }
}
```

**Exemplo Python:**
```python
import requests

response = requests.get('http://localhost:8001/api/health')
health = response.json()

if health['status'] == 'healthy':
    print("✅ Sistema saudável!")
    print(f"Versão: {health['version']}")
else:
    print("❌ Sistema com problemas")
```

---

## 🎥 Camera Endpoints

### `GET /api/camera/stream`

Stream MJPEG ao vivo com bounding boxes e anotações.

**Response:** `multipart/x-mixed-replace; boundary=frame`

**Exemplo HTML:**
```html
<img src="http://localhost:8001/api/camera/stream" alt="Camera stream" />
```

**Exemplo React:**
```typescript
function CameraStream() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

  return (
    <div className="camera-container">
      <img
        src={`${API_URL}/api/camera/stream`}
        alt="Live camera stream"
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  )
}
```

**Visualizações no Stream:**
- 🟢 **Verde**: Cliente individual
- 🔵 **Azul**: Funcionário identificado
- 🟡 **Amarelo**: Pessoa em grupo
- **Overlay**: Métricas em tempo real (pessoas, clientes, funcionários, grupos)

---

### `GET /api/camera/stats`

Estatísticas da câmera RTSP (FPS, frames, erros).

**Response 200:**
```json
{
  "status": "success",
  "data": {
    "fps": 4.8,
    "total_frames": 15234,
    "processed_frames": 15200,
    "errors": 2,
    "uptime_seconds": 3600,
    "camera_status": "connected",
    "last_frame_at": "2025-11-09T10:30:45.123Z"
  }
}
```

**Exemplo cURL:**
```bash
curl http://localhost:8001/api/camera/stats
```

---

### `GET /api/camera/status`

Status dos serviços de processamento de câmera.

**Response 200:**
```json
{
  "detector_loaded": true,
  "analytics_initialized": true,
  "modules": {
    "face_recognition": true,
    "behavior_analysis": true,
    "group_detection": true,
    "temporal_analysis": true
  },
  "timestamp": "2025-11-09T10:30:00.000Z"
}
```

---

## 📊 Analytics Endpoints

### `GET /api/analytics/metrics`

Métricas agregadas das últimas 24 horas.

**Query Parameters:**
- `hours` (optional): Número de horas (padrão: 24)

**Response 200:**
```json
{
  "status": "success",
  "data": {
    "current": {
      "people": 12,
      "customers": 10,
      "employees": 2,
      "groups": 3,
      "potential_customers": 4
    },
    "hourly_avg": {
      "people": 15.2,
      "customers": 12.8,
      "employees": 2.4,
      "groups": 3.1
    },
    "peak": {
      "people": 28,
      "hour": "14:00",
      "timestamp": "2025-11-09T14:00:00Z"
    },
    "trend": "stable",
    "history_24h": [
      {
        "hour": "10:00",
        "people": 12,
        "customers": 10,
        "employees": 2
      },
      // ... 23 mais entradas
    ]
  },
  "timestamp": "2025-11-09T10:30:00Z"
}
```

**Exemplo Python:**
```python
def get_metrics_24h():
    response = requests.get('http://localhost:8001/api/analytics/metrics')

    if response.status_code == 200:
        data = response.json()['data']

        print(f"📊 Métricas Atuais:")
        print(f"   👥 Pessoas: {data['current']['people']}")
        print(f"   🛒 Clientes: {data['current']['customers']}")
        print(f"   👤 Funcionários: {data['current']['employees']}")
        print(f"   👨‍👩‍👧‍👦 Grupos: {data['current']['groups']}")
        print(f"\n📈 Pico:")
        print(f"   Horário: {data['peak']['hour']}")
        print(f"   Pessoas: {data['peak']['people']}")

        return data
```

**Exemplo TypeScript (React):**
```typescript
interface MetricsResponse {
  status: string
  data: {
    current: {
      people: number
      customers: number
      employees: number
      groups: number
      potential_customers: number
    }
    hourly_avg: {
      people: number
      customers: number
      employees: number
      groups: number
    }
    peak: {
      people: number
      hour: string
      timestamp: string
    }
    trend: 'up' | 'down' | 'stable'
    history_24h: Array<{
      hour: string
      people: number
      customers: number
      employees: number
    }>
  }
  timestamp: string
}

async function fetchMetrics(): Promise<MetricsResponse> {
  const response = await fetch('http://localhost:8001/api/analytics/metrics')
  return response.json()
}
```

---

### `GET /api/analytics/smart-metrics`

Métricas inteligentes em tempo real (incluindo predições e insights).

**Response 200:**
```json
{
  "status": "success",
  "data": {
    "counting": {
      "total_people": 12,
      "customers": 10,
      "employees": 2,
      "confidence_score": 0.95
    },
    "behavior": {
      "avg_dwell_time": 12.5,
      "hot_zones": ["entrance", "electronics"],
      "flow_pattern": "normal",
      "group_shopping_rate": 0.3
    },
    "segmentation": {
      "new": 4,
      "regular": 5,
      "vip": 1
    },
    "predictions": {
      "next_hour": 15,
      "conversion_probability": 0.68,
      "optimal_staff": 3
    },
    "insights": {
      "anomalies": [],
      "recommendations": [
        "Aumentar staff na área de eletrônicos",
        "Promoção direcionada para novos clientes"
      ]
    }
  },
  "timestamp": "2025-11-09T10:30:00Z"
}
```

**Exemplo JavaScript:**
```javascript
async function getSmartMetrics() {
  try {
    const response = await fetch('http://localhost:8001/api/analytics/smart-metrics')
    const result = await response.json()

    if (result.data) {
      const { counting, predictions, insights } = result.data

      console.log(`👥 Pessoas: ${counting.total_people}`)
      console.log(`🔮 Previsão próxima hora: ${predictions.next_hour} pessoas`)
      console.log(`💰 Prob. conversão: ${(predictions.conversion_probability * 100).toFixed(0)}%`)

      if (insights.recommendations.length > 0) {
        console.log(`\n💡 Recomendações:`)
        insights.recommendations.forEach(rec => console.log(`  • ${rec}`))
      }
    }

    return result
  } catch (error) {
    console.error('Erro ao buscar métricas:', error)
    return null
  }
}
```

---

### `GET /api/analytics/health`

Health check específico do sistema de analytics.

**Response 200:**
```json
{
  "status": "healthy",
  "analytics_engine": "initialized",
  "modules": {
    "face_recognition": true,
    "behavior_analyzer": true,
    "customer_segmentation": true,
    "predictive_insights": true
  },
  "timestamp": "2025-11-09T10:30:00Z"
}
```

---

## 👥 Employee Endpoints

### `POST /api/employees/register`

Registra novo funcionário com reconhecimento facial.

**Request (multipart/form-data):**
- `name` (string, required): Nome completo
- `file` (file, required): Foto do funcionário (JPEG/PNG)
- `employee_id` (string, optional): ID personalizado
- `department` (string, optional): Departamento
- `position` (string, optional): Cargo

**Response 200:**
```json
{
  "status": "success",
  "message": "Funcionário João Silva registrado com sucesso",
  "data": {
    "employee_id": "emp_12345678",
    "name": "João Silva",
    "department": "Vendas",
    "position": "Vendedor",
    "registered_at": "2025-11-09T10:30:00Z",
    "face_recognition_enabled": true,
    "privacy_compliant": true
  }
}
```

**Response 400 (Erro de Validação):**
```json
{
  "status": "error",
  "message": "Nenhuma face detectada na imagem",
  "code": "NO_FACE_DETECTED"
}
```

**Exemplo Python:**
```python
def register_employee(name, photo_path, department=None, position=None):
    url = "http://localhost:8001/api/employees/register"

    with open(photo_path, 'rb') as f:
        files = {'file': ('photo.jpg', f, 'image/jpeg')}
        data = {
            'name': name,
            'department': department or '',
            'position': position or ''
        }

        response = requests.post(url, files=files, data=data)

    if response.status_code == 200:
        result = response.json()
        print(f"✅ Funcionário {name} registrado!")
        print(f"🆔 ID: {result['data']['employee_id']}")
        return result['data']
    else:
        print(f"❌ Erro: {response.status_code} - {response.text}")
        return None

# Uso
employee = register_employee(
    name="João Silva",
    photo_path="./joao_foto.jpg",
    department="Vendas",
    position="Vendedor"
)
```

**Exemplo JavaScript (FormData):**
```javascript
async function registerEmployee(name, photoFile, options = {}) {
  const formData = new FormData()

  formData.append('name', name)
  formData.append('file', photoFile)
  if (options.department) formData.append('department', options.department)
  if (options.position) formData.append('position', options.position)

  try {
    const response = await fetch('http://localhost:8001/api/employees/register', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Funcionário registrado:', result.data.name)
      return result.data
    } else {
      console.error('❌ Erro:', result.message)
      return null
    }
  } catch (error) {
    console.error('❌ Erro de rede:', error)
    return null
  }
}

// Uso com input file
const photoInput = document.querySelector('input[type="file"]')
const photoFile = photoInput.files[0]

registerEmployee('João Silva', photoFile, {
  department: 'Vendas',
  position: 'Vendedor'
})
```

---

### `GET /api/employees/list`

Lista todos os funcionários cadastrados.

**Query Parameters:**
- `active_only` (boolean, default: true): Apenas funcionários ativos
- `include_last_seen` (boolean, default: true): Incluir último avistamento

**Response 200:**
```json
{
  "status": "success",
  "data": {
    "employees": [
      {
        "id": "uuid-1234-5678",
        "employee_id": "emp_12345678",
        "name": "João Silva",
        "department": "Vendas",
        "position": "Vendedor",
        "is_active": true,
        "registered_at": "2025-11-09T10:00:00Z",
        "last_seen": "2025-11-09T10:25:00Z"
      },
      {
        "id": "uuid-8765-4321",
        "employee_id": "emp_87654321",
        "name": "Maria Santos",
        "department": "Gerência",
        "position": "Gerente",
        "is_active": true,
        "registered_at": "2025-11-08T14:30:00Z",
        "last_seen": "2025-11-09T10:20:00Z"
      }
    ],
    "statistics": {
      "total_registered": 2,
      "active_employees": 2,
      "face_recognition_enabled": 2
    }
  }
}
```

**Exemplo cURL:**
```bash
curl "http://localhost:8001/api/employees/list?active_only=true&include_last_seen=true"
```

**Exemplo Python:**
```python
def list_employees(active_only=True):
    url = f"http://localhost:8001/api/employees/list?active_only={active_only}&include_last_seen=true"

    response = requests.get(url)

    if response.status_code == 200:
        result = response.json()
        employees = result['data']['employees']
        stats = result['data']['statistics']

        print(f"📊 Total: {stats['total_registered']}")
        print(f"   Ativos: {stats['active_employees']}")

        print(f"\n👥 Funcionários:")
        for emp in employees:
            last_seen = emp.get('last_seen', 'Nunca visto')
            print(f"   • {emp['name']} ({emp['employee_id']})")
            print(f"     {emp.get('position', 'N/A')} - Último avistamento: {last_seen}")

        return employees
    else:
        print(f"❌ Erro: {response.status_code}")
        return []
```

---

### `GET /api/employees/{employee_id}`

Detalhes de funcionário específico.

**Path Parameters:**
- `employee_id` (string): ID do funcionário

**Response 200:**
```json
{
  "status": "success",
  "data": {
    "employee_id": "emp_12345678",
    "name": "João Silva",
    "department": "Vendas",
    "position": "Vendedor",
    "is_active": true,
    "registered_at": "2025-11-09T10:00:00Z",
    "last_seen": "2025-11-09T10:25:00Z",
    "total_detections": 45,
    "avg_daily_detections": 15.2
  }
}
```

**Response 404:**
```json
{
  "status": "error",
  "message": "Funcionário não encontrado",
  "code": "EMPLOYEE_NOT_FOUND"
}
```

---

### `DELETE /api/employees/{employee_id}`

Remove funcionário (direito ao esquecimento - LGPD).

**Path Parameters:**
- `employee_id` (string): ID do funcionário

**Response 200:**
```json
{
  "status": "success",
  "message": "Funcionário removido com sucesso",
  "data": {
    "employee_id": "emp_12345678",
    "face_data_deleted": true,
    "database_deactivated": true,
    "embeddings_removed": true
  }
}
```

**Exemplo Python:**
```python
def remove_employee(employee_id):
    url = f"http://localhost:8001/api/employees/{employee_id}"

    response = requests.delete(url)

    if response.status_code == 200:
        result = response.json()
        print(f"✅ Funcionário {employee_id} removido")
        print(f"🗑️ Dados faciais deletados: {result['data']['face_data_deleted']}")
        print(f"🗄️ Embeddings removidos: {result['data']['embeddings_removed']}")
        return True
    else:
        print(f"❌ Erro: {response.status_code}")
        return False
```

---

## 🔄 WebSocket

### `ws://localhost:8001/ws/smart-metrics`

Stream de métricas inteligentes em tempo real.

**Message Format:**
```json
{
  "type": "smart_metrics_update",
  "timestamp": "2025-11-09T10:30:00Z",
  "data": {
    "total_people": 12,
    "employees": 2,
    "customers": 10,
    "groups": 3,
    "potential_customers": 4
  }
}
```

**Exemplo Python (websockets):**
```python
import asyncio
import websockets
import json

async def listen_smart_metrics():
    uri = "ws://localhost:8001/ws/smart-metrics"

    try:
        async with websockets.connect(uri) as websocket:
            print("🔄 Conectado ao WebSocket de métricas")

            async for message in websocket:
                data = json.loads(message)

                if data['type'] == 'smart_metrics_update':
                    metrics = data['data']
                    print(f"\n📊 Métricas ({data['timestamp']}):")
                    print(f"   👥 Pessoas: {metrics.get('total_people', 0)}")
                    print(f"   👤 Funcionários: {metrics.get('employees', 0)}")
                    print(f"   🛒 Clientes: {metrics.get('customers', 0)}")

    except websockets.exceptions.ConnectionClosed:
        print("❌ Conexão WebSocket fechada")
    except Exception as e:
        print(f"❌ Erro WebSocket: {e}")

# Executar
asyncio.run(listen_smart_metrics())
```

**Exemplo JavaScript (Browser):**
```javascript
class ShopFlowWebSocket {
  constructor(baseUrl = 'ws://localhost:8001') {
    this.ws = new WebSocket(`${baseUrl}/ws/smart-metrics`)
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5

    this.ws.onopen = () => {
      console.log('🔄 WebSocket conectado')
      this.reconnectAttempts = 0
    }

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.handleMetricsUpdate(data)
    }

    this.ws.onclose = () => {
      console.log('❌ WebSocket desconectado')
      this.attemptReconnect()
    }

    this.ws.onerror = (error) => {
      console.error('❌ Erro WebSocket:', error)
    }
  }

  handleMetricsUpdate(data) {
    if (data.type === 'smart_metrics_update') {
      const metrics = data.data
      console.log('📊 Métricas atualizadas:', metrics)

      // Atualizar UI
      document.getElementById('people-count').textContent = metrics.total_people || 0
      document.getElementById('employees-count').textContent = metrics.employees || 0
      document.getElementById('customers-count').textContent = metrics.customers || 0
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.pow(2, this.reconnectAttempts) * 1000

      console.log(`🔄 Reconectando em ${delay/1000}s`)
      setTimeout(() => {
        this.ws = new WebSocket(this.ws.url)
      }, delay)
    }
  }

  disconnect() {
    this.ws.close()
  }
}

// Uso
const wsClient = new ShopFlowWebSocket()
```

---

## ❌ Códigos de Erro

### HTTP Status Codes

| Código | Significado |
|--------|-------------|
| `200` | Sucesso |
| `400` | Bad Request (validação falhou) |
| `401` | Unauthorized (autenticação falhou) |
| `404` | Not Found (recurso não encontrado) |
| `500` | Internal Server Error |
| `503` | Service Unavailable (serviço temporariamente indisponível) |

### Application Error Codes

| Code | Mensagem | Solução |
|------|----------|---------|
| `NO_FACE_DETECTED` | Nenhuma face detectada na imagem | Use foto com rosto visível, bem iluminado, frontal |
| `MULTIPLE_FACES_DETECTED` | Múltiplas faces detectadas | Use foto com apenas uma pessoa |
| `EMPLOYEE_NOT_FOUND` | Funcionário não encontrado | Verifique se o employee_id está correto |
| `DATABASE_ERROR` | Erro ao acessar banco de dados | Verifique conexão com Supabase |
| `INVALID_IMAGE_FORMAT` | Formato de imagem inválido | Use JPEG ou PNG |
| `RTSP_CONNECTION_FAILED` | Falha ao conectar câmera RTSP | Verifique URL RTSP e conectividade |

### Formato de Resposta de Erro

```json
{
  "status": "error",
  "message": "Descrição do erro",
  "code": "ERROR_CODE",
  "details": {
    "field": "campo que causou erro",
    "validation": "regra de validação"
  }
}
```

---

## 🔒 Rate Limiting

**Atualmente não implementado no MVP.**

Para produção, recomenda-se:
- **Limite geral**: 100 requests/minuto por IP
- **Endpoints pesados** (/api/employees/register): 10 requests/minuto
- **Headers de resposta**:
  - `X-RateLimit-Limit`: Limite total
  - `X-RateLimit-Remaining`: Requisições restantes
  - `X-RateLimit-Reset`: Timestamp do reset

---

## 📚 Client Libraries

### Python Client

```python
import requests
from typing import Optional, Dict, List

class ShopFlowClient:
    def __init__(self, base_url: str = "http://localhost:8001", api_key: str = None):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()

        if api_key:
            self.session.headers.update({'Authorization': f'Bearer {api_key}'})

    def health_check(self) -> Dict:
        response = self.session.get(f'{self.base_url}/api/health')
        response.raise_for_status()
        return response.json()

    def get_metrics(self, hours: int = 24) -> Dict:
        response = self.session.get(
            f'{self.base_url}/api/analytics/metrics',
            params={'hours': hours}
        )
        response.raise_for_status()
        return response.json()

    def register_employee(self, name: str, photo_path: str, **kwargs) -> Optional[Dict]:
        with open(photo_path, 'rb') as f:
            files = {'file': ('photo.jpg', f, 'image/jpeg')}
            data = {'name': name, **kwargs}

            response = self.session.post(
                f'{self.base_url}/api/employees/register',
                files=files,
                data=data
            )

            return response.json() if response.status_code == 200 else None

    def list_employees(self, active_only: bool = True) -> List[Dict]:
        response = self.session.get(
            f'{self.base_url}/api/employees/list',
            params={'active_only': active_only}
        )

        if response.status_code == 200:
            return response.json()['data']['employees']
        return []

# Uso
client = ShopFlowClient("http://localhost:8001")
health = client.health_check()
print("Sistema saudável:", health['status'] == 'healthy')

metrics = client.get_metrics()
print(f"Pessoas: {metrics['data']['current']['people']}")
```

---

## 🧪 Testing

### Health Check Test

```bash
#!/bin/bash
# test_health.sh

echo "Testing health endpoint..."
curl -s http://localhost:8001/api/health | jq '.status'
```

### Complete API Test Suite

```bash
#!/bin/bash
# test_all_endpoints.sh

BASE_URL="http://localhost:8001"

echo "1. Testing health..."
curl -s $BASE_URL/api/health | jq '.status'

echo "\n2. Testing camera stats..."
curl -s $BASE_URL/api/camera/stats | jq '.data.fps'

echo "\n3. Testing camera status..."
curl -s $BASE_URL/api/camera/status | jq '.detector_loaded'

echo "\n4. Testing analytics metrics..."
curl -s $BASE_URL/api/analytics/metrics | jq '.data.current.people'

echo "\n5. Testing analytics health..."
curl -s $BASE_URL/api/analytics/health | jq '.status'

echo "\n6. Testing employees list..."
curl -s $BASE_URL/api/employees/list | jq '.data.statistics.total_registered'

echo "\n✅ All tests complete!"
```

---

## 📖 Referências

- **[README.md](../README.md)** - Visão geral do projeto
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Arquitetura técnica
- **[SETUP.md](../SETUP.md)** - Setup e configuração
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deploy em produção
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Solução de problemas

---

**Versão:** 1.0.0 | **Última atualização:** 2025-11-09
