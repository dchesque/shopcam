# 🔒 Guia de Segurança - ShopFlow Backend

Este documento contém diretrizes e boas práticas de segurança para o backend do ShopFlow.

---

## 📋 Índice

1. [Variáveis Sensíveis](#variáveis-sensíveis)
2. [Configuração CORS](#configuração-cors)
3. [Ambientes](#ambientes)
4. [Rotação de Credenciais](#rotação-de-credenciais)
5. [Checklist de Deploy](#checklist-de-deploy)
6. [Testes de Segurança](#testes-de-segurança)
7. [Monitoramento](#monitoramento)
8. [Reportar Vulnerabilidades](#reportar-vulnerabilidades)

---

## 🔐 Variáveis Sensíveis

### SUPABASE_SERVICE_KEY ⚠️ CRÍTICO

**Nível de Privilégio:** ADMINISTRATIVO TOTAL

#### Riscos:
- Acesso completo ao banco de dados (leitura/escrita/exclusão)
- Bypass de Row Level Security (RLS)
- Capacidade de criar/deletar usuários
- Acesso a todas as tabelas e dados sensíveis

#### Uso Correto:
- ✅ **APENAS backend** - NUNCA exponha no frontend
- ✅ Armazenar em **secrets manager** em produção
- ✅ Rotacionar a cada **30-90 dias**
- ✅ Logar apenas últimos 8 caracteres: `...{key[-8:]}`
- ❌ **NUNCA** hardcode no código
- ❌ **NUNCA** commite no Git
- ❌ **NUNCA** exponha em logs

#### Storage por Ambiente:

**Development:**
```bash
# .env.local (gitignored)
SUPABASE_SERVICE_KEY=eyJhbGc...
```

**Production (Railway):**
```bash
railway variables set SUPABASE_SERVICE_KEY="eyJhbGc..."
```

**Production (Heroku):**
```bash
heroku config:set SUPABASE_SERVICE_KEY="eyJhbGc..."
```

**Production (Docker):**
```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
```

---

## 🌐 Configuração CORS

### Como Funciona

O ShopFlow usa **CORS baseado em ambiente**, configurado automaticamente:

#### Development (`ENVIRONMENT=development`)
```python
Permitido: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001"
]
```

#### Staging (`ENVIRONMENT=staging`)
```python
Permitido: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://staging.{PRODUCTION_DOMAIN}",
    "https://{PRODUCTION_DOMAIN}"
]
```

#### Production (`ENVIRONMENT=production`)
```python
Permitido: [
    "https://{PRODUCTION_DOMAIN}",
    "https://www.{PRODUCTION_DOMAIN}"
]
```

### Validações de Segurança

O sistema bloqueia automaticamente:

1. ❌ Wildcard (`*`) em produção
2. ❌ HTTP em produção (apenas HTTPS)
3. ❌ Localhost em produção
4. ❌ Falta de `PRODUCTION_DOMAIN` em produção

### Testar CORS

**Teste 1: Origem Permitida (deve passar)**
```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS http://localhost:8001/api/health -v
```

**Esperado:**
```
< Access-Control-Allow-Origin: http://localhost:3000
< Access-Control-Allow-Credentials: true
```

**Teste 2: Origem Não Permitida (deve falhar)**
```bash
curl -H "Origin: https://malicious-site.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS http://localhost:8001/api/health -v
```

**Esperado:**
```
(Sem header Access-Control-Allow-Origin na resposta)
```

---

## 🔄 Rotação de Credenciais

### SUPABASE_SERVICE_KEY

**Frequência:** A cada 30-90 dias

**Processo:**

1. **Gerar Nova Key:**
   - Acessar [Supabase Dashboard](https://app.supabase.com/)
   - Ir para: `Settings → API`
   - Clicar em `Generate new service_role key`
   - Copiar a nova key

2. **Atualizar em Produção:**
   ```bash
   # Railway
   railway variables set SUPABASE_SERVICE_KEY="nova-key-aqui"

   # Heroku
   heroku config:set SUPABASE_SERVICE_KEY="nova-key-aqui"
   ```

3. **Reiniciar Aplicação:**
   ```bash
   # Railway
   railway up

   # Heroku
   heroku restart
   ```

4. **Validar Funcionamento:**
   ```bash
   curl https://api.seu-dominio.com/health
   # Verificar que services.database = true
   ```

5. **Revogar Key Antiga:**
   - Voltar ao Supabase Dashboard
   - `Settings → API → Revoke old key`
   - ⚠️ **Aguarde 24h** antes de revogar (para garantir que nova key funciona)

### API_SECRET_KEY

**Frequência:** A cada 90 dias ou se comprometida

**Gerar Nova Key:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Atualizar:**
```bash
railway variables set API_SECRET_KEY="nova-secret-key"
railway restart
```

---

## ✅ Checklist de Deploy em Produção

Antes de fazer deploy, verificar:

### 🔐 Segurança
- [ ] `SUPABASE_SERVICE_KEY` está em secrets manager (não hardcoded)
- [ ] `ENVIRONMENT=production` configurado
- [ ] `PRODUCTION_DOMAIN` definido corretamente
- [ ] `API_SECRET_KEY` gerada (não usar padrão)
- [ ] CORS restrito ao domínio de produção
- [ ] Row Level Security (RLS) habilitado no Supabase
- [ ] Service key rotacionada nos últimos 90 dias

### 🌐 Infraestrutura
- [ ] HTTPS obrigatório (configurado no load balancer)
- [ ] Rate limiting configurado
- [ ] Firewall configurado (portas necessárias apenas)
- [ ] Logs estruturados habilitados
- [ ] Backup do banco configurado
- [ ] Monitoramento configurado (Prometheus/Grafana/Sentry)
- [ ] Alertas configurados para erros críticos

### 🧪 Testes
- [ ] Testes de CORS passando
- [ ] Health check respondendo
- [ ] Validação de ambiente funcionando
- [ ] Conexão com Supabase validada
- [ ] Teste de carga realizado

---

## 🧪 Testes de Segurança

### Teste 1: Validação de Ambiente

```bash
cd backend
python -c "from core.config import settings; print(f'Environment: {settings.ENVIRONMENT}'); print(f'Origins: {settings.get_allowed_origins()}')"
```

**Esperado (development):**
```
Environment: development
Origins: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001']
```

**Esperado (production):**
```
Environment: production
Origins: ['https://shopflow.com', 'https://www.shopflow.com']
```

### Teste 2: CORS Restritivo

**Setup:**
```bash
# Terminal 1: Iniciar backend
cd backend && python main.py
```

**Teste Origem Não Permitida:**
```bash
# Terminal 2
curl -H "Origin: https://evil.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:8001/api/health -v 2>&1 | grep -i "access-control-allow-origin"
```

**Esperado:** (Sem output = bloqueado ✅)

**Teste Origem Permitida:**
```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:8001/api/health -v 2>&1 | grep -i "access-control-allow-origin"
```

**Esperado:**
```
< access-control-allow-origin: http://localhost:3000
```

### Teste 3: Production Mode

```bash
export ENVIRONMENT=production
export PRODUCTION_DOMAIN=teste.com

python -c "from core.config import settings; print(settings.get_allowed_origins())"
```

**Esperado:**
```
['https://teste.com', 'https://www.teste.com']
```

### Teste 4: Validação de Service Key

```bash
# Teste com key inválida
SUPABASE_SERVICE_KEY="" python main.py
```

**Esperado:**
```
ValueError: 🔒 ERRO: SUPABASE_SERVICE_KEY inválida ou não configurada
```

---

## 📊 Monitoramento

### Logs de Segurança

O sistema gera logs automáticos para:

1. **Inicialização CORS:**
   ```
   🔒 CORS configurado para ambiente: production
   🌐 Origens permitidas: ['https://shopflow.com', 'https://www.shopflow.com']
   ```

2. **Conexão Supabase:**
   ```
   🔐 Inicializando Supabase: https://xxx.supabase.co
   🔑 Service Key configurada (últimos 8 chars): ...AbCd1234
   ✅ Validação de ambiente de produção: OK
   ```

3. **Tentativas de CORS Inválidas:**
   ```
   WARNING: CORS request from unauthorized origin: https://malicious.com
   ```

### Alertas Críticos

Configure alertas para:

- ❌ Falha na validação de SUPABASE_SERVICE_KEY
- ❌ Tentativa de wildcard CORS em produção
- ❌ Falha na conexão com Supabase
- ❌ Múltiplas requisições de origem não autorizada
- ❌ Erro na validação de ambiente de produção

### Métricas de Segurança

Monitorar:

- **Taxa de rejeição CORS:** Deve ser baixa (<1%)
- **Uptime Supabase:** Deve ser >99.9%
- **Latência de autenticação:** Deve ser <200ms
- **Requisições bloqueadas:** Investigar picos

---

## 🔍 Auditoria

### Verificação Periódica (Mensal)

```bash
# 1. Verificar .env não está no Git
git ls-files | grep -E '\.env$|\.env\.local$|\.env\.production$'
# Esperado: (vazio)

# 2. Verificar service key nos logs
grep -r "SUPABASE_SERVICE_KEY" backend/logs/
# Esperado: Não deve aparecer a key completa

# 3. Verificar CORS em produção
curl https://api.seu-dominio.com/health -H "Origin: https://evil.com" -v
# Esperado: Sem Access-Control-Allow-Origin header
```

---

## 🚨 Reportar Vulnerabilidades

### Processo de Divulgação Responsável

Se você encontrou uma vulnerabilidade de segurança:

1. **NÃO** abra uma issue pública no GitHub
2. **NÃO** divulgue publicamente sem aprovação
3. Envie relatório confidencial para: **security@shopflow.com**

### Informações a Incluir:

- Descrição da vulnerabilidade
- Passos para reproduzir
- Impacto potencial
- Prova de conceito (se aplicável)
- Sugestão de correção (opcional)

### Timeline de Resposta:

- **24h:** Confirmação de recebimento
- **7 dias:** Avaliação inicial e classificação
- **30 dias:** Correção e patch (para vulnerabilidades críticas)
- **90 dias:** Divulgação pública (após correção)

---

## 📚 Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [LGPD - Lei Geral de Proteção de Dados](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)

---

## 📝 Histórico de Atualizações

| Data | Versão | Mudanças |
|------|--------|----------|
| 2025-01-XX | 1.0.0 | Guia inicial de segurança |

---

**Última atualização:** Janeiro 2025
**Próxima revisão:** Abril 2025
