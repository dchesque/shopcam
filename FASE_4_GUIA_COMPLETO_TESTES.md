# 🧪 SHOPFLOW MVP - GUIA COMPLETO DE TESTES

**Versão:** MVP 1.0
**Data:** 2025-11-08
**Fase:** 4 - Testes e Validação

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Testes de Integração](#testes-de-integração)
4. [Testes Manuais](#testes-manuais)
5. [Cenários Reais](#cenários-reais)
6. [Testes de Performance](#testes-de-performance)
7. [Testes de Stress](#testes-de-stress)
8. [Interpretação de Resultados](#interpretação-de-resultados)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 VISÃO GERAL

### **Tipos de Testes Disponíveis:**

| Tipo | Arquivo | Objetivo | Duração |
|------|---------|----------|---------|
| **Integração** | `test_integration.py` | Validar todos os endpoints | ~2 min |
| **Manuais** | `test_manual.sh` | Testes rápidos com curl | ~1 min |
| **Cenários Reais** | `CENARIOS_TESTE.md` | Validar lógica de negócio | ~30 min |
| **Performance** | `test_performance.py` | Medir latência, FPS, CPU/RAM | ~5 min |
| **Stress** | `test_stress.py` | Operação contínua 24h | 1-24h |

### **Ordem Recomendada de Execução:**

```
1. Testes Manuais (validação rápida)
   ↓
2. Testes de Integração (endpoints automatizados)
   ↓
3. Cenários Reais (lógica de negócio)
   ↓
4. Testes de Performance (benchmarks)
   ↓
5. Testes de Stress (estabilidade)
```

---

## 🔧 PRÉ-REQUISITOS

### **1. Ambiente Configurado:**

```bash
# Backend rodando
docker-compose ps
# Deve mostrar: shopflow-backend (running)

# Frontend acessível
curl http://localhost:3000
# Deve retornar HTML

# Supabase configurado
# Verificar no dashboard: tabelas camera_events e employees criadas
```

### **2. Dependências Python:**

```bash
# Navegar para pasta de testes
cd backend/tests

# Instalar dependências
pip install pytest requests psutil

# Verificar instalação
python -c "import pytest, requests, psutil; print('✓ OK')"
```

### **3. Ferramentas CLI (opcional):**

```bash
# curl (para testes manuais)
curl --version

# jq (para formatar JSON)
jq --version

# docker (para stats)
docker --version
```

---

## 🔬 TESTES DE INTEGRAÇÃO

### **Arquivo:** `backend/tests/test_integration.py`

### **Descrição:**
Testes automatizados com pytest que validam todos os endpoints do backend MVP.

### **Endpoints Testados:**

1. **Health Check** (`/health`)
   - ✅ Retorna 200 OK
   - ✅ JSON com campo `status: "ok"`

2. **Analytics Metrics** (`/api/analytics/metrics`)
   - ✅ Retorna métricas atuais
   - ✅ Campos: `total_people`, `potential_customers`, `employees_count`, `groups_count`
   - ✅ Valores não-negativos

3. **Analytics History** (`/api/analytics/history`)
   - ✅ Retorna array de eventos
   - ✅ Eventos com timestamps válidos

4. **Camera Stream** (`/api/camera/stream`)
   - ✅ Retorna MJPEG (multipart/x-mixed-replace)
   - ✅ Produz pelo menos 1 frame em 3 segundos

5. **Camera Stats** (`/api/camera/stats`)
   - ✅ Retorna estatísticas da câmera

6. **Employees List** (`/api/employees/list`)
   - ✅ Retorna array de funcionários

7. **Employees Register** (`/api/employees/register`)
   - ✅ Rejeita cadastro sem foto (400/422)

8. **Employees Delete** (`/api/employees/{id}`)
   - ✅ Rejeita ID inválido (404/400)

### **Como Executar:**

```bash
# Método 1: Via pytest (recomendado)
cd backend
pytest tests/test_integration.py -v

# Método 2: Direto com Python
python tests/test_integration.py

# Método 3: Backend customizado
pytest tests/test_integration.py -v --backend-url http://192.168.1.100:8001

# Método 4: Via variável de ambiente
export BACKEND_URL=http://vps:8001
pytest tests/test_integration.py -v
```

### **Output Esperado:**

```
========================================
tests/test_integration.py::TestHealthCheck::test_health_endpoint_returns_200 PASSED
tests/test_integration.py::TestHealthCheck::test_health_endpoint_returns_json PASSED
tests/test_integration.py::TestHealthCheck::test_health_contains_status PASSED
tests/test_integration.py::TestAnalytics::test_metrics_endpoint_returns_200 PASSED
tests/test_integration.py::TestAnalytics::test_metrics_returns_valid_json PASSED
...
========================= 15 passed in 12.34s =========================
```

### **Interpretação:**

- ✅ **15/15 passed**: Todos os endpoints funcionando
- ⚠️ **10-14 passed**: Alguns endpoints com problemas (verificar logs)
- ❌ **<10 passed**: Sistema com falhas críticas

---

## 🛠️ TESTES MANUAIS

### **Arquivo:** `backend/tests/test_manual.sh`

### **Descrição:**
Script bash para testes rápidos usando curl. Útil para validação rápida após deploy.

### **Como Executar:**

```bash
# Dar permissão de execução (Linux/Mac)
chmod +x backend/tests/test_manual.sh

# Executar (localhost)
./backend/tests/test_manual.sh

# Executar (VPS)
./backend/tests/test_manual.sh http://192.168.1.100:8001

# Windows (Git Bash)
bash backend/tests/test_manual.sh
```

### **Output Esperado:**

```
========================================
1. HEALTH CHECK
========================================

Testing Health Endpoint... ✓ OK (200)
{
  "status": "ok",
  "timestamp": "2025-11-08T12:00:00"
}

========================================
2. ANALYTICS - METRICS
========================================

Testing Metrics Endpoint... ✓ OK (200)
{
  "total_people": 5,
  "potential_customers": 2,
  "employees_count": 1,
  "groups_count": 1
}

...

========================================
RESUMO DOS TESTES
========================================
Total de testes: 9
Passou: 9
Falhou: 0
✓ TODOS OS TESTES PASSARAM! ✓
```

### **Interpretação:**

- ✅ **9/9 passed**: Sistema OK
- ⚠️ **7-8 passed**: Verificar falhas específicas
- ❌ **<7 passed**: Problemas críticos

---

## 🎬 CENÁRIOS REAIS

### **Arquivo:** `backend/tests/CENARIOS_TESTE.md`

### **Descrição:**
Testes manuais que simulam situações reais do dia a dia da loja.

### **10 Cenários Principais:**

1. **Loja Vazia** - 0 pessoas detectadas
2. **Cliente Sozinho** - 1 cliente, bounding box verde
3. **Grupo de 2** - Agrupamento DBSCAN
4. **Grupo de 4** - Cálculo de clientes potenciais
5. **Funcionário Sozinho** - Reconhecimento facial
6. **Funcionário + Cliente** - Diferenciação
7. **Funcionário + Grupo** - Grupo misto
8. **Múltiplos Grupos** - Separação espacial
9. **Hora de Pico** - 10+ pessoas
10. **Reconhecimento Facial** - Robustez

### **Como Executar:**

1. Abrir o arquivo `CENARIOS_TESTE.md`
2. Seguir instruções de cada cenário
3. Preencher matriz de resultados
4. Verificar no Dashboard, Stream e Supabase

### **Exemplo - Cenário 2 (Cliente Sozinho):**

**Setup:**
```
1. Posicionar 1 pessoa na frente da câmera
2. Aguardar 5 segundos
3. Observar detecção
```

**Validações:**
- [ ] Dashboard mostra `total_people: 1`
- [ ] Dashboard mostra `potential_customers: 1`
- [ ] Stream exibe 1 bounding box verde
- [ ] Supabase registrou o evento

**Resultado:**
```markdown
✅ PASSOU
- Pessoa detectada corretamente
- Classificada como cliente (não funcionário)
- Bounding box estável
```

### **Critérios de Sucesso:**

- ✅ **90%+ dos cenários básicos (1-8) passando**
- ✅ **Cenário 9 com performance aceitável (<500ms)**
- ✅ **Reconhecimento facial >80% acurácia**

---

## ⚡ TESTES DE PERFORMANCE

### **Arquivo:** `backend/tests/test_performance.py`

### **Descrição:**
Benchmarks de performance: response time, FPS, CPU, RAM, concorrência.

### **Métricas Coletadas:**

| Métrica | Descrição | Limite Aceitável |
|---------|-----------|------------------|
| **Response Time** | Latência dos endpoints | < 2000ms |
| **FPS** | Frames por segundo do stream | 3-5 FPS |
| **CPU** | Uso de CPU | < 80% |
| **RAM** | Uso de memória | < 80% |
| **Throughput** | Requests/segundo | > 10 req/s |

### **Como Executar:**

```bash
# Teste padrão (30s)
python backend/tests/test_performance.py

# Teste customizado
python backend/tests/test_performance.py \
  --backend-url http://vps:8001 \
  --duration 60 \
  --concurrent 20 \
  --output results.json

# Pular stream (mais rápido)
python backend/tests/test_performance.py --skip-stream

# Pular monitoramento de sistema
python backend/tests/test_performance.py --skip-system
```

### **Output Esperado:**

```
============================================================
SHOPFLOW MVP - TESTES DE PERFORMANCE
============================================================
Backend URL: http://localhost:8001
Duração: 30s
Data/Hora: 2025-11-08 12:00:00
============================================================

🔍 Verificando conectividade...
✅ Backend online (response: 45ms)

📊 Benchmarking endpoints...
  Testing health... ✓ Avg: 43.50ms
  Testing metrics... ✓ Avg: 156.20ms
  Testing history... ✓ Avg: 189.45ms
  Testing stats... ✓ Avg: 98.30ms
  Testing employees... ✓ Avg: 145.60ms

📹 Benchmarking stream (10s)...
  ✓ FPS: 4.8
  ✓ Frames: 48
  ✓ Dados: 12.5 MB

💻 Monitorando sistema (30s)...
..............................✓

🔄 Testando 10 requisições concorrentes...

============================================================
RESUMO DOS RESULTADOS
============================================================

📊 Endpoints:
  health          Avg:  43.50ms  Min:  38.20ms  Max:  52.10ms
  metrics         Avg: 156.20ms  Min: 142.30ms  Max: 178.50ms
  history         Avg: 189.45ms  Min: 165.20ms  Max: 215.30ms
  stats           Avg:  98.30ms  Min:  85.10ms  Max: 112.50ms
  employees       Avg: 145.60ms  Min: 128.40ms  Max: 168.20ms

📹 Stream:
  FPS: 4.8
  Frames: 48

💻 Sistema:
  CPU:  Avg:  45.2%  Max:  68.5%
  RAM:  Avg:  52.1%  Max:  55.8%

🔄 Concorrência (10 requisições):
  Avg: 163.45ms
  Max: 198.30ms

💾 Resultados salvos em: results.json

✅ Testes de performance concluídos!
```

### **Interpretação:**

**Response Times:**
- ✅ **< 200ms**: Excelente
- ⚠️ **200-500ms**: Aceitável
- ❌ **> 500ms**: Lento (investigar)

**FPS:**
- ✅ **> 5 FPS**: Ótimo
- ⚠️ **3-5 FPS**: Aceitável para MVP
- ❌ **< 3 FPS**: Muito lento

**CPU/RAM:**
- ✅ **< 60%**: Recursos sobressalentes
- ⚠️ **60-80%**: Atenção
- ❌ **> 80%**: Risco de degradação

---

## 🔥 TESTES DE STRESS

### **Arquivo:** `backend/tests/test_stress.py`

### **Descrição:**
Teste de estabilidade em operação contínua prolongada (1-24 horas).

### **O que é Testado:**

- ✅ Sistema não crasha durante operação contínua
- ✅ Não há memory leaks
- ✅ Performance não degrada com o tempo
- ✅ Taxa de sucesso > 95%
- ✅ Erros são tratados gracefully

### **Como Executar:**

```bash
# Teste de 1 hora (para validação rápida)
python backend/tests/test_stress.py --duration 3600

# Teste de 24 horas (stress completo)
python backend/tests/test_stress.py --duration 86400

# Teste com intervalo customizado
python backend/tests/test_stress.py \
  --duration 7200 \
  --interval 30 \
  --backend-url http://vps:8001

# Executar em background (Linux/Mac)
nohup python backend/tests/test_stress.py --duration 86400 > stress.log 2>&1 &

# Monitorar progresso
tail -f stress.log
```

### **Output Durante Execução:**

```
======================================================================
SHOPFLOW MVP - TESTE DE STRESS
======================================================================
Backend: http://localhost:8001
Duração: 1 day, 0:00:00
Intervalo: 60s
Início: 2025-11-08 12:00:00
======================================================================

⚠️  Pressione CTRL+C para interromper

🔍 Verificando conectividade inicial...
✅ Backend online, iniciando teste...

======================================================================
⏱️  Tempo decorrido: 0:05:00 | Restante: 23:55:00
📊 Iterações: 5 | Requests: 10 | Erros: 0
✅ Taxa de sucesso: 100.0%
💻 CPU: 45.2% | RAM: 52.1%
⚡ Response time (avg últimos 10): 156.3ms
======================================================================

...
```

### **Relatório Final:**

```
======================================================================
RELATÓRIO FINAL - TESTE DE STRESS
======================================================================

📅 Período:
   Início: 2025-11-08 12:00:00
   Fim:    2025-11-09 12:00:00
   Duração: 1 day, 0:00:00

📊 Estatísticas:
   Iterações: 1440
   Total de requests: 2880
   Requests com sucesso: 2876
   Requests com falha: 4
   Timeouts: 1
   Taxa de sucesso: 99.86%

⚡ Performance:
   Response time médio: 158.42ms
   Response time mínimo: 42.10ms
   Response time máximo: 523.50ms
   Desvio padrão: 45.23ms

💻 Recursos do Sistema:
   CPU média: 48.5%
   CPU máxima: 72.3%
   RAM média: 54.2%
   RAM máxima: 58.1%

🔍 Detecção de Memory Leak:
   ✅ Nenhum leak detectado (crescimento: 3.9%)

⚠️  Eventos:
   Erros: 4
   Avisos: 12

   Últimos 5 erros:
   - [2025-11-08T18:30:15] Health check timeout
   - [2025-11-08T22:15:42] Metrics endpoint failed: 500
   - [2025-11-09T04:45:22] Health check timeout
   - [2025-11-09T09:20:18] Connection reset

🎯 VEREDICTO FINAL:
   ✅ PASSOU - Sistema estável durante todo o teste!

💾 Relatório salvo em: stress_test_report_20251108_120000.json
======================================================================
```

### **Interpretação:**

**Taxa de Sucesso:**
- ✅ **> 99%**: Excelente estabilidade
- ⚠️ **95-99%**: Aceitável (verificar erros)
- ❌ **< 95%**: Instabilidade crítica

**Memory Leak:**
- ✅ **Crescimento < 10%**: Normal
- ⚠️ **Crescimento 10-20%**: Atenção
- ❌ **Crescimento > 20%**: Leak detectado

**Performance:**
- ✅ **Desvio padrão < 50ms**: Consistente
- ⚠️ **Desvio padrão 50-100ms**: Variável
- ❌ **Desvio padrão > 100ms**: Instável

---

## 📊 INTERPRETAÇÃO DE RESULTADOS

### **Matriz de Aprovação MVP:**

| Teste | Critério de Sucesso | Prioridade |
|-------|---------------------|------------|
| **Integração** | 100% dos endpoints passando | 🔴 Crítico |
| **Manuais** | 100% dos testes OK | 🔴 Crítico |
| **Cenários 1-8** | 90%+ passando | 🔴 Crítico |
| **Cenário 9** | Performance < 500ms | 🟡 Importante |
| **Cenário 10** | Acurácia > 80% | 🟡 Importante |
| **Performance** | Response < 500ms, FPS > 3 | 🟡 Importante |
| **Stress 1h** | Taxa sucesso > 95% | 🟡 Importante |
| **Stress 24h** | Sem crashes, sem leaks | 🟢 Desejável |

### **Decisões Baseadas em Resultados:**

**Cenário A: Todos os testes verdes**
```
✅ MVP APROVADO PARA PRODUÇÃO
- Deploy imediato
- Monitorar primeiras 48h
```

**Cenário B: Testes críticos OK, alguns avisos**
```
⚠️ MVP APROVADO COM RESSALVAS
- Deploy em produção
- Investigar avisos
- Planejar correções incrementais
```

**Cenário C: Falhas em testes críticos**
```
❌ MVP NÃO APROVADO
- Não fazer deploy
- Corrigir falhas críticas
- Re-executar todos os testes
```

---

## 🐛 TROUBLESHOOTING

### **Problema: Testes de integração falhando**

```bash
# 1. Verificar se backend está rodando
curl http://localhost:8001/health

# 2. Ver logs do backend
docker-compose logs -f backend

# 3. Verificar conectividade com Supabase
# No logs, procurar por "Supabase" ou "database"

# 4. Testar manualmente cada endpoint
curl http://localhost:8001/api/analytics/metrics
```

### **Problema: Stream não produz frames**

```bash
# 1. Verificar se câmera está conectada
ffplay rtsp://admin:senha@IP:554/stream

# 2. Ver logs do RTSP
docker-compose logs backend | grep "RTSP"

# 3. Testar stream direto
curl http://localhost:8001/api/camera/stream -o test.jpg

# 4. Verificar variável de ambiente
docker-compose exec backend env | grep CAMERA_RTSP_URL
```

### **Problema: Performance ruim**

```bash
# 1. Verificar recursos do container
docker stats shopflow-backend

# 2. Reduzir FPS de processamento
# Editar .env:
CAMERA_FPS_PROCESS=3  # Era 5

# 3. Usar GPU se disponível
YOLO_DEVICE=cuda  # Era cpu

# 4. Reduzir confidence threshold
YOLO_CONFIDENCE=0.6  # Era 0.5 (menos detecções = mais rápido)
```

### **Problema: Memory leak detectado**

```bash
# 1. Monitorar RAM do container
docker stats shopflow-backend

# 2. Reiniciar container periodicamente (workaround temporário)
docker-compose restart backend

# 3. Investigar logs para memory leaks
docker-compose logs backend | grep -i "memory\|leak\|oom"

# 4. Limitar RAM do container (docker-compose.yml)
services:
  backend:
    mem_limit: 2g
```

---

## ✅ CHECKLIST FINAL DE TESTES

Antes de aprovar MVP para produção, garantir:

### **Testes Automatizados:**
- [ ] Testes de integração: 100% passando
- [ ] Testes manuais: 100% passando
- [ ] Performance: response < 500ms, FPS > 3

### **Testes Manuais:**
- [ ] Cenário 1 (Loja Vazia): ✅
- [ ] Cenário 2 (Cliente Sozinho): ✅
- [ ] Cenário 3 (Grupo de 2): ✅
- [ ] Cenário 4 (Grupo de 4): ✅
- [ ] Cenário 5 (Funcionário Sozinho): ✅
- [ ] Cenário 6 (Funcionário + Cliente): ✅
- [ ] Cenário 7 (Funcionário + Grupo): ✅
- [ ] Cenário 8 (Múltiplos Grupos): ✅
- [ ] Cenário 9 (Hora de Pico): ✅
- [ ] Cenário 10 (Reconhecimento Facial): ✅

### **Estabilidade:**
- [ ] Stress 1h: taxa sucesso > 95%
- [ ] Stress 24h: sem crashes
- [ ] Sem memory leaks detectados

### **Integração Frontend-Backend:**
- [ ] Dashboard exibe métricas corretas
- [ ] Stream ao vivo funcionando
- [ ] Cadastro de funcionários funcional
- [ ] Dados persistindo no Supabase

### **Documentação:**
- [ ] Relatórios de teste salvos
- [ ] Problemas conhecidos documentados
- [ ] Instruções de deploy atualizadas

---

**CONCLUSÃO:**

✅ **Se todos os itens acima estiverem marcados**, o MVP está pronto para produção!

⚠️ **Se houver ressalvas**, documentar e decidir se são bloqueantes.

❌ **Se houver falhas críticas**, corrigir antes de deploy.

---

**Documentado por:** Claude Code
**Data:** 2025-11-08
**Fase:** 4 - Testes e Validação

**BOA SORTE NOS TESTES! 🚀**
