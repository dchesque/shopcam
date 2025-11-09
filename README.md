# 🛒 ShopFlow MVP

**Sistema de Análise de Clientes com IA para Lojas Físicas**

[![Status](https://img.shields.io/badge/status-production-green.svg)](https://github.com/dchesque/shopcam)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📋 O Que É

**ShopFlow** é um sistema de análise comportamental para lojas físicas que usa visão computacional e IA para:

- 🎥 **Detectar pessoas** em tempo real com YOLO11n
- 👥 **Identificar grupos** de clientes automaticamente
- 👤 **Reconhecer funcionários** cadastrados via face recognition
- 📊 **Calcular clientes potenciais** com lógica inteligente
- 📈 **Visualizar métricas** em dashboard ao vivo

**Arquitetura:** Câmera RTSP → Backend (FastAPI + Docker) → Frontend (Next.js) → Supabase

---

## 🎯 Features Principais

### 1. Detecção Inteligente
- ✅ YOLO11n para detecção de pessoas (4-5 FPS)
- ✅ DBSCAN para agrupamento automático
- ✅ Face recognition para funcionários
- ✅ Cálculo de clientes potenciais

### 2. Visualização em Tempo Real
- ✅ Stream MJPEG com bounding boxes coloridos
- ✅ Dashboard com métricas atualizadas (5s)
- ✅ Gráficos de histórico 24h
- ✅ Interface responsiva e moderna

### 3. Gestão de Funcionários
- ✅ Cadastro com upload de foto
- ✅ Validação automática de face
- ✅ Listagem e gerenciamento
- ✅ Privacy-first (apenas embeddings)

---

## 🚀 Quick Start (5 minutos)

### Pré-requisitos
- Docker + Docker Compose
- Node.js 18+
- Conta Supabase (free tier)
- Câmera IP com RTSP

### Backend
```bash
cd backend
cp .env.production.template .env
# Edite .env com suas credenciais Supabase
docker-compose up -d
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Acessar
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001/docs

**👉 Para setup completo:** [SETUP.md](SETUP.md)

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│          Frontend (Next.js)             │
│   Dashboard | Câmera | Funcionários     │
└─────────────────────────────────────────┘
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────┐
│       Backend (FastAPI + Docker)        │
│  YOLO11n | DBSCAN | Face Recognition   │
│       RTSP Processor | MJPEG Stream     │
└─────────────────────────────────────────┘
       │                        │
       │ RTSP                   │ PostgreSQL
       ▼                        ▼
┌──────────────┐      ┌──────────────────┐
│  Câmera IP   │      │  Supabase DB     │
└──────────────┘      └──────────────────┘
```

**👉 Detalhes técnicos:** [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 📦 Stack Tecnológico

### Backend
- **Framework:** FastAPI 0.115.0
- **IA:** YOLO11n, DBSCAN, face_recognition
- **Video:** OpenCV, RTSP
- **Database:** Supabase PostgreSQL
- **Deploy:** Docker Compose

### Frontend
- **Framework:** Next.js 15.5.2
- **UI:** React 18, TypeScript, Tailwind
- **Gráficos:** Recharts
- **Deploy:** Vercel

### Infraestrutura
- **VPS:** Contabo/DigitalOcean (4 vCPU, 8GB RAM)
- **Database:** Supabase (Free/Pro tier)
- **VPN:** Tailscale (acesso câmera)

---

## 💰 Custos Mensais

| Componente | Opção | Custo |
|------------|-------|-------|
| **VPS Backend** | Contabo VPS M | R$ 48/mês |
| **Database** | Supabase Free | R$ 0 |
| **Frontend** | Vercel Free | R$ 0 |
| **VPN** | Tailscale Free | R$ 0 |
| **TOTAL** | | **R$ 48/mês** |

*Escalável para múltiplas lojas com custos proporcionais*

---

## 📚 Documentação

### Primeiros Passos
- 📖 **[SETUP.md](SETUP.md)** - Setup completo (dev + produção)
- 🏗️ **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitetura técnica detalhada

### Referência Técnica
- 🔌 **[docs/API.md](docs/API.md)** - Referência completa da API
- 🚀 **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Deploy em produção
- 🧪 **[docs/TESTING.md](docs/TESTING.md)** - Testes e validação
- 🔧 **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Solução de problemas

### Outros
- 📝 **[CHANGELOG.md](CHANGELOG.md)** - Histórico de versões
- 📁 **[docs/archive/](docs/archive/)** - Documentação histórica

---

## 🎯 Roadmap

### ✅ v1.0.0 - MVP (COMPLETO)
- [x] Detecção de pessoas (YOLO11n)
- [x] Agrupamento de clientes (DBSCAN)
- [x] Reconhecimento facial de funcionários
- [x] Dashboard em tempo real
- [x] Stream MJPEG ao vivo
- [x] Deploy production-ready

### 🔮 v1.1.0 - Melhorias (Planejado)
- [ ] Suporte multi-câmera
- [ ] Heatmap de movimento
- [ ] Análise de tempo de permanência
- [ ] Relatórios PDF exportáveis
- [ ] Alertas em tempo real (WhatsApp/Email)

### 🚀 v2.0.0 - Escalabilidade (Futuro)
- [ ] Microservices (separar IA, API, Stream)
- [ ] Redis cache
- [ ] Load balancer
- [ ] CDN para stream

---

## 🧪 Performance

### Benchmarks (VPS 4 vCPU, 8GB RAM)

| Métrica | Valor | Alvo |
|---------|-------|------|
| Response Time (avg) | 150ms | < 500ms ✅ |
| FPS Processamento | 4-5 | > 3 ✅ |
| CPU Usage | 45-60% | < 80% ✅ |
| RAM Usage | 50-55% | < 80% ✅ |
| Processing/Frame | 180-220ms | < 500ms ✅ |

### Capacidade
- ✅ 1-2 câmeras simultâneas
- ✅ Até 20 pessoas por frame
- ✅ 10+ funcionários cadastrados
- ✅ Operação 24/7 contínua

---

## 🔒 Segurança & Privacidade

### Implementado
- ✅ Service Key do Supabase nunca exposta no frontend
- ✅ CORS configurado corretamente
- ✅ Firewall UFW na VPS
- ✅ Tailscale VPN para acesso câmera
- ✅ HTTPS automático no Vercel
- ✅ Variáveis de ambiente não commitadas
- ✅ Face recognition: apenas embeddings (sem fotos armazenadas)

### Recomendações Futuras
- [ ] Rate limiting na API
- [ ] JWT authentication para endpoints sensíveis
- [ ] Backup automático do Supabase
- [ ] SSL/TLS no backend (Let's Encrypt)
- [ ] Monitoramento com Sentry

---

## 🤝 Contribuindo

### Como Contribuir
1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Reportar Bugs
Abra uma issue descrevendo:
- Comportamento esperado
- Comportamento atual
- Steps to reproduce
- Logs relevantes

### Sugerir Features
Abra uma issue com:
- Descrição da feature
- Caso de uso
- Mockups (se aplicável)

---

## 📞 Suporte

- 📖 **Documentação:** [docs/](docs/)
- 🐛 **Issues:** [GitHub Issues](https://github.com/dchesque/shopcam/issues)
- 💬 **Discussões:** [GitHub Discussions](https://github.com/dchesque/shopcam/discussions)

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🙏 Agradecimentos

- **[YOLO](https://github.com/ultralytics/ultralytics)** (Ultralytics) - Detecção de objetos
- **[face_recognition](https://github.com/ageitgey/face_recognition)** (Adam Geitgey) - Reconhecimento facial
- **[Supabase](https://supabase.com)** - Database managed
- **[Vercel](https://vercel.com)** - Hospedagem frontend
- **[FastAPI](https://fastapi.tiangolo.com)** - Framework backend
- **[Next.js](https://nextjs.org)** - Framework frontend

---

## 📊 Status do Projeto

```
✅ FASE 1: BACKEND         100% ✅
✅ FASE 2: FRONTEND        100% ✅
✅ FASE 3: INFRAESTRUTURA  100% ✅
✅ FASE 4: TESTES          100% ✅
✅ FASE 5: DOCUMENTAÇÃO    100% ✅
```

**🎉 MVP PRONTO PARA PRODUÇÃO! 🚀**

---

<div align="center">

**[⬆ Voltar ao topo](#-shopflow-mvp)**

Made with ❤️ using Claude Code

**v1.0.0** | 2025-11-09

</div>
