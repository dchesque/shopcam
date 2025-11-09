# 🚀 Guia de Deploy no Easypanel

Este guia irá ajudá-lo a fazer o deploy do ShopFlow (Backend + Frontend) no Easypanel usando Docker.

## 📋 Pré-requisitos

1. Conta no Easypanel
2. Servidor VPS conectado ao Easypanel
3. Conta no Supabase (ou banco de dados PostgreSQL)
4. Código do projeto em um repositório Git (GitHub, GitLab, etc.)
5. Acesso a uma câmera RTSP

## 🏗️ Arquitetura

O projeto consiste em 2 serviços:

- **Backend** (FastAPI + AI/ML): Porta 3333
- **Frontend** (Next.js): Porta 3000

## 📝 Passo a Passo

### 1. Preparar o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute os scripts SQL necessários (se houver) para criar as tabelas
3. Anote as credenciais:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`

### 2. Deploy do Backend

#### 2.1. Criar Novo Serviço no Easypanel

1. Faça login no Easypanel
2. Selecione seu projeto
3. Clique em "Create Service"
4. Escolha "Git Repository"
5. Conecte seu repositório
6. Configure:
   - **Name**: `shopflow-backend`
   - **Build Path**: `./backend`
   - **Dockerfile Path**: `./backend/Dockerfile`

#### 2.2. Configurar Variáveis de Ambiente

Na seção "Environment Variables", adicione:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# API Configuration
API_HOST=0.0.0.0
API_PORT=3333
NODE_ENV=production

# Security
JWT_SECRET=generate-a-random-secret-key
BRIDGE_API_KEY=generate-a-random-api-key

# Camera (RTSP)
CAMERA_RTSP_URL=rtsp://username:password@camera-ip:554/stream
CAMERA_FPS_PROCESS=5

# YOLO Configuration
YOLO_MODEL=yolo11n.pt
YOLO_CONFIDENCE=0.5

# AI Features
FACE_RECOGNITION_ENABLED=false

# Environment
ENVIRONMENT=production
PRODUCTION_DOMAIN=your-domain.com
```

#### 2.3. Configurar Volumes (Persistência de Dados)

Adicione volumes para persistir dados:

- `/app/logs` → `backend-logs`
- `/app/uploads` → `backend-uploads`
- `/app/face_embeddings` → `backend-face-embeddings`
- `/app/cache` → `backend-cache`

#### 2.4. Configurar Porta e Domínio

1. **Port Mapping**: `3333` (interno)
2. Configure um domínio personalizado (ex: `api.shopflow.com`)
3. Habilite HTTPS automático

### 3. Deploy do Frontend

#### 3.1. Criar Novo Serviço no Easypanel

1. Clique em "Create Service" novamente
2. Escolha "Git Repository"
3. Use o mesmo repositório
4. Configure:
   - **Name**: `shopflow-frontend`
   - **Build Path**: `./frontend`
   - **Dockerfile Path**: `./frontend/Dockerfile`

#### 3.2. Configurar Build Arguments

Na seção "Build Arguments", adicione:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://api.shopflow.com
NEXT_PUBLIC_BRIDGE_URL=https://api.shopflow.com
NEXT_PUBLIC_BRIDGE_API_KEY=same-as-backend-bridge-api-key
NODE_ENV=production
```

#### 3.3. Configurar Variáveis de Ambiente (Runtime)

```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://api.shopflow.com
NEXT_PUBLIC_BRIDGE_URL=https://api.shopflow.com
NEXT_PUBLIC_BRIDGE_API_KEY=same-as-backend-bridge-api-key
PORT=3000
```

#### 3.4. Configurar Porta e Domínio

1. **Port Mapping**: `3000` (interno)
2. Configure um domínio personalizado (ex: `app.shopflow.com`)
3. Habilite HTTPS automático

### 4. Configurar Comunicação Entre Serviços

Para que o frontend se comunique com o backend:

1. Use o domínio público do backend nas variáveis de ambiente do frontend
2. Configure CORS no backend para aceitar requisições do domínio do frontend
3. Certifique-se de que ambos os serviços estão usando HTTPS em produção

### 5. Verificar o Deploy

#### 5.1. Testar Backend

```bash
# Health check
curl https://api.shopflow.com/health

# Deve retornar algo como:
# {"status":"healthy","timestamp":"..."}
```

#### 5.2. Testar Frontend

Acesse `https://app.shopflow.com` no navegador e verifique se:
- A página carrega corretamente
- Não há erros no console
- A conexão com o backend funciona

### 6. Monitoramento

#### 6.1. Logs do Backend

No Easypanel, acesse o serviço backend e clique em "Logs" para ver:
- Inicialização do servidor
- Conexão com o banco de dados
- Processamento de vídeo RTSP
- Detecções YOLO

#### 6.2. Logs do Frontend

Acesse os logs do frontend para verificar:
- Build bem-sucedido
- Servidor rodando
- Requisições à API

### 7. Solução de Problemas Comuns

#### Backend não inicia

```bash
# Verifique os logs para ver o erro específico
# Possíveis causas:
- Credenciais do Supabase incorretas
- RTSP URL inacessível
- Modelo YOLO não baixou corretamente
```

**Solução**: Verifique as variáveis de ambiente e logs de inicialização.

#### Frontend não conecta ao Backend

```bash
# Verifique se o NEXT_PUBLIC_API_URL está correto
# Deve ser a URL pública do backend, não localhost!
```

**Solução**: Atualize as variáveis de ambiente do frontend com a URL pública do backend.

#### Erro de CORS

```bash
# O backend está bloqueando requisições do frontend
```

**Solução**: Configure corretamente a variável `PRODUCTION_DOMAIN` no backend.

#### Processamento de vídeo lento

```bash
# O servidor pode estar sobrecarregado
```

**Solução**:
- Reduza `CAMERA_FPS_PROCESS` para 3 ou 2
- Desabilite `FACE_RECOGNITION_ENABLED`
- Considere um servidor com mais CPU/GPU

### 8. Otimizações de Produção

#### 8.1. Recursos do Servidor

**Backend (Recomendado):**
- CPU: 4+ vCPUs (para processamento de vídeo)
- RAM: 8GB+ (modelos AI/ML)
- Storage: 20GB+ (logs, uploads)

**Frontend (Recomendado):**
- CPU: 1-2 vCPUs
- RAM: 1-2GB
- Storage: 5GB

#### 8.2. Escalabilidade

Para melhor performance:
1. Use um CDN para o frontend (Cloudflare, etc.)
2. Configure cache para assets estáticos
3. Use Redis para cache do backend (se necessário)

#### 8.3. Backup

Configure backup automático dos volumes:
- `backend-uploads`: Snapshots importantes
- `backend-face-embeddings`: Dados de reconhecimento facial
- `backend-logs`: Auditoria e debugging

### 9. Atualizações

Para fazer deploy de novas versões:

1. Faça push do código para o repositório Git
2. No Easypanel, clique em "Rebuild" para cada serviço
3. Aguarde o build e deploy automático
4. Verifique os logs para confirmar sucesso

### 10. Rollback

Se algo der errado:

1. No Easypanel, vá em "Deployments"
2. Selecione uma versão anterior estável
3. Clique em "Rollback"

## 🔐 Segurança

1. **Nunca** exponha as chaves do Supabase Service Key publicamente
2. Use HTTPS para todos os serviços
3. Configure firewall para restringir acesso à câmera RTSP
4. Rotacione secrets regularmente
5. Mantenha logs de auditoria habilitados

## 📚 Recursos Adicionais

- [Documentação Easypanel](https://easypanel.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs de ambos os serviços
2. Confirme todas as variáveis de ambiente
3. Teste a conectividade entre serviços
4. Consulte a documentação do Easypanel

---

**Desenvolvido com ❤️ para ShopFlow**
