# ShopFlow Frontend - Guia Completo de Deploy

## Status: PRONTO PARA PRODUÇÃO ✅

Frontend completamente verificado e otimizado para deploy em produção.

## Correções Implementadas

### 1. Performance e SEO
- ✅ Substituído todos `<img>` por `<Image />` do Next.js
- ✅ Otimização automática de imagens habilitada
- ✅ Lazy loading implementado

### 2. Qualidade de Código
- ✅ TypeScript check passa sem erros
- ✅ ESLint sem warnings
- ✅ Dependências do React Hook corrigidas

### 3. Segurança
- ✅ `.env.local` removido do repositório Git
- ✅ Headers de segurança configurados
- ✅ Usuário non-root no Docker

### 4. Build e Deploy
- ✅ Next.js configurado com `output: 'standalone'`
- ✅ Dockerfile multi-stage otimizado
- ✅ Health check implementado

## Variáveis de Ambiente Necessárias

```env
# Supabase (Obrigatório)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# API Backend (Obrigatório)
NEXT_PUBLIC_API_URL=https://api.seudominio.com
NEXT_PUBLIC_WS_URL=wss://api.seudominio.com

# Configurações (Opcional)
NEXT_PUBLIC_SITE_URL=https://seudominio.com
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## Deploy com Easypanel

### 1. Preparar Imagem Docker

```bash
# Build da imagem
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="sua_url" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="sua_key" \
  --build-arg NEXT_PUBLIC_API_URL="sua_api" \
  -f Dockerfile.easypanel \
  -t shopflow-frontend:latest \
  .
```

### 2. Configurar no Easypanel

1. **Criar novo App**
   - Nome: `shopflow-frontend`
   - Tipo: Docker Container

2. **Configurações do Container**
   - Imagem: `shopflow-frontend:latest`
   - Porta: `3000`
   - Health Check Path: `/api/health`

3. **Variáveis de Ambiente**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   NEXT_PUBLIC_API_URL=https://api.dominio.com
   NODE_ENV=production
   ```

4. **Domínio e SSL**
   - Domínio: `app.seudominio.com`
   - SSL: Ativar Let's Encrypt

### 3. Deploy Automatizado

Use o script fornecido:

```bash
cd frontend
./deploy-easypanel.sh
```

## Deploy com Docker Compose

```yaml
version: '3.8'
services:
  frontend:
    image: shopflow-frontend:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
```

## Deploy Manual na VPS

### 1. Preparar Servidor

```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Instalar Docker Compose
sudo apt-get install docker-compose-plugin
```

### 2. Clonar e Configurar

```bash
# Clonar repositório
git clone https://github.com/seu-repo/shopcam.git
cd shopcam/frontend

# Configurar variáveis
cp .env.example .env.production
nano .env.production  # Editar com suas variáveis
```

### 3. Build e Run

```bash
# Build
docker build -t shopflow-frontend:latest .

# Run
docker run -d \
  --name shopflow-frontend \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env.production \
  shopflow-frontend:latest
```

### 4. Configurar Nginx (Opcional)

```nginx
server {
    listen 80;
    server_name app.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Verificação Pós-Deploy

### 1. Health Check
```bash
curl https://seudominio.com/api/health
# Resposta esperada: {"status":"ok","timestamp":"..."}
```

### 2. Logs
```bash
# Docker logs
docker logs shopflow-frontend

# Easypanel logs
# Acessar pelo painel web
```

### 3. Métricas
- Tempo de resposta: < 200ms
- Memory usage: ~150MB
- CPU usage: < 5% idle

## Troubleshooting

### Problema: Build falha com erro de memória
**Solução:**
```bash
# Aumentar memória do Node
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Problema: Imagens não carregam
**Solução:**
- Verificar domínios em `next.config.js`
- Adicionar domínio do Supabase

### Problema: WebSocket não conecta
**Solução:**
- Verificar NEXT_PUBLIC_WS_URL
- Certificar que Nginx permite upgrade de conexão

### Problema: Variáveis de ambiente não funcionam
**Solução:**
- Rebuild da imagem com --build-arg
- Verificar se começam com NEXT_PUBLIC_

## Rollback

Em caso de problemas:

```bash
# Docker
docker stop shopflow-frontend
docker run shopflow-frontend:previous-version

# Easypanel
# Use interface para reverter para versão anterior
```

## Monitoramento

Recomendado configurar:
- Uptime monitoring (UptimeRobot, Pingdom)
- Error tracking (opcional: Sentry)
- Analytics (opcional: Vercel Analytics)

## Suporte

- Documentação: `/frontend/docs/`
- Issues: GitHub Issues
- Logs: `docker logs shopflow-frontend`

## Checklist Final

- [ ] Variáveis de ambiente configuradas
- [ ] Build de produção testado localmente
- [ ] Docker image criada e testada
- [ ] SSL/HTTPS configurado
- [ ] Domínio apontando corretamente
- [ ] Health check respondendo
- [ ] Backup da configuração anterior
- [ ] Monitoramento configurado

---

**Última atualização:** 10 de Novembro de 2025
**Versão:** 0.1.0
**Status:** PRONTO PARA PRODUÇÃO ✅