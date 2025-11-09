# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.0.0] - 2025-11-09 - MVP Release 🎉

### ✨ Added
- **Backend MVP Completo**
  - RTSP Processor para captura direta de câmera
  - YOLO11n para detecção de pessoas em tempo real
  - DBSCAN para agrupamento automático de clientes
  - Face recognition para identificação de funcionários
  - API REST completa (analytics, câmera, funcionários)
  - Stream MJPEG com bounding boxes e labels
  - Supabase integration para persistência de dados
  - Docker + Docker Compose para deploy

- **Frontend MVP Completo**
  - Dashboard com métricas em tempo real
  - Visualização de stream MJPEG ao vivo
  - Gerenciamento de funcionários (cadastro, listagem, delete)
  - Gráficos de histórico 24h (Recharts)
  - Interface responsiva (Tailwind CSS)
  - Deploy Vercel-ready

- **Infraestrutura**
  - Guia completo de deploy para produção
  - Suporte Tailscale VPN para acesso seguro à câmera
  - Scripts de setup automatizados
  - Docker Compose para desenvolvimento e produção

- **Testes**
  - Suite completa de testes de integração (pytest)
  - Testes manuais bash scripts
  - 10 cenários de teste reais documentados
  - Testes de performance e stress

- **Documentação**
  - README completo e consolidado
  - Setup guide detalhado
  - Referência de API
  - Guias de deploy e testes
  - Troubleshooting guide

### 🔄 Changed
- Migração de arquitetura Bridge → RTSP direto
- Simplificação do frontend (removidos componentes não usados)
- Consolidação de documentação (38 → 11 arquivos)

### 🗑️ Removed
- Sistema Bridge local (substituído por RTSP direto)
- 150+ linhas de código obsoleto
- 15 dependências npm não utilizadas
- 27 arquivos de documentação redundantes

### 🐛 Fixed
- Performance otimizada (4-5 FPS estável)
- Memory leaks no processamento de vídeo
- Race conditions no face recognition
- CORS issues no deployment

### 🔒 Security
- Service Key do Supabase protegida (nunca exposta)
- Variáveis de ambiente via .env
- Firewall UFW configurado
- HTTPS automático via Vercel
- Face recognition privacy-first (apenas embeddings)

---

## [0.9.0] - 2025-11-09 - Limpeza e Consolidação

### 🧹 Changed
- Consolidação de 38 arquivos .md para 11
- Redução de 18.723 linhas para ~4.000 linhas (78%)
- Movido 15 arquivos históricos para `/docs/archive/`
- Deletados 7 arquivos obsoletos do frontend

### 📝 Added
- CHANGELOG.md (este arquivo)
- Estrutura organizada de documentação
- Links entre documentos relacionados

---

## [0.8.0] - 2025-11-09 - Remoção Bridge

### 🗑️ Removed
- Pasta `bridge/` completa (5 arquivos, ~110KB)
- Endpoint POST `/api/camera/process` (obsoleto)
- Endpoint POST `/api/camera/test` (obsoleto)
- Função `verify_bridge_auth()`
- Variável `BRIDGE_API_KEY` de todos os configs

### 🔄 Changed
- Arquitetura simplificada (RTSP direto)
- Diagrama de arquitetura atualizado
- Endpoints de API atualizados
- README com nova arquitetura

### ✨ Added
- `/api/camera/stream` - Stream MJPEG nativo
- `/api/camera/stats` - Estatísticas da câmera
- Documentação `REMOCAO_BRIDGE.md`

### 📊 Performance
- Latência reduzida (1 hop ao invés de 2)
- Menos pontos de falha
- Deploy mais simples

---

## [0.7.0] - 2025-11-08 - Fase 4: Testes Completos

### 🧪 Added
- Suite completa de testes de integração
- Testes manuais bash scripts
- 10 cenários de teste reais
- Testes de performance
- Stress test 24h contínuo
- Documentação completa de testes

### ✅ Tested
- Detecção de pessoas (múltiplos cenários)
- Agrupamento de clientes
- Face recognition
- API endpoints
- Performance sob carga
- Recuperação de erros

---

## [0.6.0] - 2025-11-07 - Fase 3: Infraestrutura

### 🚀 Added
- Guia completo de deploy produção
- Docker Compose para backend
- Configuração Tailscale VPN
- Scripts de setup Supabase
- Templates .env para produção
- Guia de monitoramento

### 🔧 Changed
- Backend otimizado para produção
- Frontend otimizado para Vercel
- Database schema finalizado
- Variáveis de ambiente organizadas

---

## [0.5.0] - 2025-11-06 - Fase 2: Frontend MVP

### ✨ Added
- Dashboard com métricas em tempo real
- Página de visualização de câmera
- Página de gerenciamento de funcionários
- Stream MJPEG integration
- Gráficos de histórico 24h
- UI components (Radix UI)
- Responsive design (Tailwind)

### 🔄 Changed
- Removidos componentes não usados
- Simplificado para 3 páginas MVP
- Otimizado bundle size

---

## [0.4.0] - 2025-11-05 - Fase 1: Backend MVP

### ✨ Added
- RTSP Processor para captura de vídeo
- YOLO11n integration para detecção
- DBSCAN para agrupamento
- Face recognition manager
- Smart Analytics Engine (4 módulos)
- API REST completa
- Supabase integration
- Stream MJPEG endpoint

### 🔧 Changed
- Migrado de bridge local para RTSP direto
- Otimizado processamento de vídeo
- Melhorado face recognition accuracy

---

## [0.3.0] - 2025-11-04 - Etapas 2.5-2.7

### ✨ Added
- Group detection com DBSCAN
- Cálculo de clientes potenciais
- Métricas de analytics
- Histórico 24h

---

## [0.2.0] - 2025-11-03 - Etapas 2.2-2.4

### ✨ Added
- Face recognition integration
- Employee management API
- Database schema Supabase
- CRUD endpoints

---

## [0.1.0] - 2025-11-02 - Setup Inicial

### ✨ Added
- Estrutura inicial do projeto
- Setup FastAPI backend
- Setup Next.js frontend
- Configuração básica
- Repositório Git

---

## Legenda

- ✨ **Added** - Novas features
- 🔄 **Changed** - Mudanças em features existentes
- 🗑️ **Removed** - Features/código removidos
- 🐛 **Fixed** - Bug fixes
- 🔒 **Security** - Melhorias de segurança
- 📊 **Performance** - Melhorias de performance
- 📝 **Documentation** - Mudanças em documentação
- 🧪 **Testing** - Adição/mudanças em testes

---

## Links

- **Código fonte:** [GitHub](https://github.com/dchesque/shopcam)
- **Documentação:** [README.md](README.md)
- **Issues:** [GitHub Issues](https://github.com/dchesque/shopcam/issues)
