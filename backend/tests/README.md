# 🧪 ShopFlow MVP - Testes

Suite completa de testes para validação do MVP ShopFlow.

---

## 📁 Arquivos

| Arquivo | Tipo | Descrição | Tempo |
|---------|------|-----------|-------|
| `test_integration.py` | Automatizado | Testes pytest de todos os endpoints | ~2 min |
| `test_manual.sh` | Manual | Testes rápidos com bash/curl | ~1 min |
| `test_performance.py` | Automatizado | Benchmarks de performance | ~5 min |
| `test_stress.py` | Automatizado | Teste de stress 1-24h | 1-24h |
| `CENARIOS_TESTE.md` | Manual | 10 cenários do mundo real | ~30 min |

---

## 🚀 Quick Start

### **Validação Rápida (3 minutos):**

```bash
# 1. Testes manuais
./test_manual.sh

# 2. Testes de integração
pytest test_integration.py -v
```

### **Validação Completa (40 minutos):**

```bash
# 1. Manuais
./test_manual.sh

# 2. Integração
pytest test_integration.py -v

# 3. Performance
python test_performance.py

# 4. Cenários (manual)
# Ver CENARIOS_TESTE.md
```

---

## 📋 Pré-requisitos

```bash
# Instalar dependências
pip install pytest requests psutil

# Dar permissões (Linux/Mac)
chmod +x test_manual.sh

# Backend deve estar rodando
curl http://localhost:8001/health
```

---

## 📊 Testes de Integração

**40+ testes automatizados** que validam:
- Health check
- Analytics (metrics, history)
- Camera (stream, stats)
- Employees (list, register, delete)
- Performance (response time)
- Conectividade (CORS)

```bash
# Executar todos
pytest test_integration.py -v

# Executar classe específica
pytest test_integration.py::TestHealthCheck -v

# VPS customizada
pytest test_integration.py --backend-url http://vps:8001 -v
```

---

## 🛠️ Testes Manuais

**9 testes rápidos** com curl:

```bash
# Local
./test_manual.sh

# VPS
./test_manual.sh http://192.168.1.100:8001

# Windows (Git Bash)
bash test_manual.sh
```

**Output esperado:**
```
Total de testes: 9
Passou: 9
Falhou: 0
✓ TODOS OS TESTES PASSARAM! ✓
```

---

## 🎬 Cenários Reais

**10 cenários** do mundo real documentados em `CENARIOS_TESTE.md`:

1. **Loja Vazia** - 0 pessoas
2. **Cliente Sozinho** - 1 pessoa detectada
3. **Grupo de 2** - Agrupamento DBSCAN
4. **Grupo de 4** - Cálculo de clientes potenciais
5. **Funcionário Sozinho** - Reconhecimento facial
6. **Funcionário + Cliente** - Diferenciação
7. **Funcionário + Grupo** - Grupo misto
8. **Múltiplos Grupos** - Separação espacial
9. **Hora de Pico** - 10+ pessoas
10. **Reconhecimento Facial** - Robustez

**Como executar:**
1. Abrir `CENARIOS_TESTE.md`
2. Seguir instruções passo a passo
3. Validar no Dashboard, Stream e Supabase

---

## ⚡ Testes de Performance

Benchmarks automatizados:

```bash
# Teste padrão (30s)
python test_performance.py

# Teste longo (60s) com export
python test_performance.py --duration 60 --output report.json

# VPS
python test_performance.py --backend-url http://vps:8001

# Pular stream (mais rápido)
python test_performance.py --skip-stream
```

**Métricas:**
- Response time (min/max/avg/stddev)
- FPS do stream
- CPU e RAM usage
- Requisições concorrentes

---

## 🔥 Testes de Stress

Validação de estabilidade em operação contínua:

```bash
# 1 hora
python test_stress.py --duration 3600

# 24 horas
python test_stress.py --duration 86400

# Background (Linux/Mac)
nohup python test_stress.py --duration 86400 > stress.log 2>&1 &
tail -f stress.log
```

**O que é testado:**
- Sistema não crasha
- Sem memory leaks (crescimento < 10%)
- Taxa de sucesso > 95%
- Performance consistente

---

## 📊 Interpretação de Resultados

### **Testes de Integração:**
- ✅ **100% passed**: Todos os endpoints OK
- ⚠️ **90-99% passed**: Verificar falhas específicas
- ❌ **<90% passed**: Problemas críticos

### **Performance:**
- ✅ **Response < 500ms**: Ótimo
- ⚠️ **Response 500-1000ms**: Aceitável
- ❌ **Response > 1000ms**: Lento

- ✅ **FPS > 5**: Ótimo
- ⚠️ **FPS 3-5**: Aceitável para MVP
- ❌ **FPS < 3**: Muito lento

### **Stress:**
- ✅ **Taxa sucesso > 99%**: Excelente
- ⚠️ **Taxa sucesso 95-99%**: Aceitável
- ❌ **Taxa sucesso < 95%**: Instável

- ✅ **Memory leak < 10%**: Normal
- ⚠️ **Memory leak 10-20%**: Atenção
- ❌ **Memory leak > 20%**: Leak detectado

---

## 🐛 Troubleshooting

### **Backend não acessível:**
```bash
# Verificar se está rodando
docker-compose ps

# Ver logs
docker-compose logs -f backend

# Testar health
curl http://localhost:8001/health
```

### **Testes falhando:**
```bash
# Verificar conectividade
ping localhost

# Testar endpoint específico
curl http://localhost:8001/api/analytics/metrics

# Ver logs do pytest
pytest test_integration.py -v -s
```

### **Performance ruim:**
```bash
# Verificar recursos
docker stats shopflow-backend

# Reduzir FPS de processamento (backend/.env)
CAMERA_FPS_PROCESS=3

# Usar GPU se disponível
YOLO_DEVICE=cuda
```

---

## 📖 Documentação Completa

Para informações detalhadas, consultar:

- **`FASE_4_GUIA_COMPLETO_TESTES.md`** - Guia completo com todos os detalhes
- **`CENARIOS_TESTE.md`** - Detalhamento dos 10 cenários
- **`FASE_4_COMPLETA.md`** - Resumo da fase de testes

---

## ✅ Checklist de Aprovação MVP

Antes de aprovar para produção:

- [ ] Testes de integração: 100% passando
- [ ] Testes manuais: 100% passando
- [ ] Cenários 1-8: 90%+ passando
- [ ] Performance: Response < 500ms, FPS > 3
- [ ] Stress 1h: Taxa > 95%, sem crashes

---

**Documentado por:** Claude Code
**Data:** 2025-11-08
**Versão:** MVP 1.0
