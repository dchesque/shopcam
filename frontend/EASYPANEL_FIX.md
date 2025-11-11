# 🔧 Fix: Erro ao Adicionar Câmeras no Easypanel

## Problema Identificado

O erro **HTTP 404** ao tentar adicionar câmeras ocorre porque a variável de ambiente `NEXT_PUBLIC_API_URL` não está configurada corretamente no Easypanel.

### Sintomas
- ❌ "Erro ao listar câmeras: Error: Erro ao listar câmeras:"
- ❌ Requisições para `/api/camera/` retornam 404
- ❌ Redirecionamentos HTTP 308 em sequência

### Causa Raiz
O frontend precisa saber onde está o backend. Sem `NEXT_PUBLIC_API_URL`, ele tenta chamar `/api/camera` no próprio frontend (que não tem essas rotas).

---

## ✅ Solução: Configurar NEXT_PUBLIC_API_URL no Easypanel

### Passo 1: Identificar a URL do Backend

Primeiro, você precisa saber a URL do seu backend no Easypanel. Ela será algo como:
```
https://shopflow-backend.seu-projeto.easypanel.host
```

### Passo 2: Configurar no Frontend do Easypanel

1. **Acesse o Easypanel**
2. **Vá até o projeto do Frontend** (shopflow-frontend)
3. **Clique em "Environment Variables"** ou "Variáveis de Ambiente"
4. **Adicione a variável:**

```bash
NEXT_PUBLIC_API_URL=https://shopflow-backend.seu-projeto.easypanel.host
```

⚠️ **IMPORTANTE**: Substitua `shopflow-backend.seu-projeto.easypanel.host` pela URL real do seu backend!

### Passo 3: Rebuild da Aplicação

**CRÍTICO**: No Easypanel, variáveis `NEXT_PUBLIC_*` precisam ser configuradas **ANTES** do build!

Você tem duas opções:

#### Opção A: Rebuild pelo Easypanel (Recomendado)
1. Após adicionar a variável, clique em **"Rebuild"** ou **"Redeploy"**
2. O Easypanel vai fazer o build com a variável correta
3. Aguarde o build completar (~2-5 minutos)

#### Opção B: Build Local e Push
```bash
cd frontend

# Build com a variável correta
docker build -f Dockerfile.easypanel \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="sua_url" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="sua_key" \
  --build-arg NEXT_PUBLIC_API_URL="https://shopflow-backend.seu-projeto.easypanel.host" \
  -t shopflow-frontend:latest .

# Push para o registry do Easypanel
docker push seu-registry/shopflow-frontend:latest
```

### Passo 4: Verificar Configuração

Após o rebuild, acesse a página de teste:
```
https://seu-frontend.easypanel.host/test-env
```

Você deve ver:
```
✅ NEXT_PUBLIC_API_URL: https://shopflow-backend.seu-projeto.easypanel.host
✅ Configurado corretamente!
```

---

## 🎯 Validação Final

Depois de configurar e fazer rebuild:

1. **Teste a API de Health do Backend**
   ```bash
   curl https://shopflow-backend.seu-projeto.easypanel.host/api/health
   ```
   Deve retornar: `{"status": "ok", ...}`

2. **Teste a Listagem de Câmeras**
   - Acesse: `https://seu-frontend.easypanel.host/settings`
   - Clique em "Adicionar Câmera"
   - Preencha os dados
   - Agora deve funcionar! ✅

---

## 📋 Checklist de Variáveis Necessárias

Configure **TODAS** estas variáveis no Easypanel:

```bash
# Supabase (obrigatório)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Backend API (obrigatório)
NEXT_PUBLIC_API_URL=https://shopflow-backend.seu-projeto.easypanel.host

# WebSocket (opcional - mesmo host do backend, porta 8001)
NEXT_PUBLIC_WS_URL=wss://shopflow-backend.seu-projeto.easypanel.host

# Next.js (automático, mas pode definir)
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

---

## 🔍 Troubleshooting

### Problema: Ainda retorna 404 após rebuild
**Solução**:
1. Verifique se o rebuild completou 100%
2. Faça hard refresh no navegador (Ctrl+Shift+R)
3. Limpe o cache do navegador

### Problema: Backend não responde
**Solução**:
1. Verifique se o backend está rodando no Easypanel
2. Teste: `curl https://backend-url/api/health`
3. Verifique os logs do backend no Easypanel

### Problema: Erro de CORS
**Solução**:
Verifique se o backend tem CORS configurado para aceitar o domínio do frontend.

### Problema: "localhost" aparece na URL
**Causa**: A variável não foi passada no **build time**
**Solução**: Fazer rebuild completo (não apenas restart)

---

## 📝 Resumo

✅ **O que fazer**:
1. Configurar `NEXT_PUBLIC_API_URL` no Easypanel
2. Fazer **REBUILD** (não apenas restart)
3. Verificar em `/test-env`
4. Testar adicionar câmera

❌ **O que NÃO fazer**:
- Não configurar a variável apenas no runtime (precisa ser build-time)
- Não usar `localhost` na variável (use a URL pública do backend)
- Não esquecer de fazer rebuild após mudar a variável

---

## 🆘 Ainda com Problemas?

Se após seguir todos os passos ainda não funcionar:

1. **Verifique os logs do frontend**: No Easypanel → Frontend → Logs
2. **Verifique os logs do backend**: No Easypanel → Backend → Logs
3. **Teste a conectividade**:
   ```bash
   # Do seu computador
   curl https://backend-url/api/camera/
   # Deve retornar lista de câmeras
   ```

---

## 📚 Documentação Adicional

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Easypanel Docs](https://easypanel.io/docs)
- Arquivo local: `DEPLOY_GUIDE.md`
