# ✅ ShopFlow Backend - Checklist de Deploy

Use este checklist para garantir que nada foi esquecido no deploy.

---

## 📋 PRÉ-DEPLOY

### Ambiente de Desenvolvimento
- [ ] Código testado localmente com `python main.py`
- [ ] Todos os testes passam
- [ ] Health endpoint retorna 200: `curl http://localhost:8001/api/health`
- [ ] Stream MJPEG funciona: `http://localhost:8001/api/camera/stream`
- [ ] Commit no Git: `git commit -am "feat: deploy ready"`
- [ ] Push para repositório: `git push origin main`

### Arquivos Necessários
- [ ] `Dockerfile` presente e atualizado
- [ ] `docker-compose.yml` configurado
- [ ] `.dockerignore` criado
- [ ] `requirements.txt` completo
- [ ] `.env.example` como template
- [ ] `README.md` atualizado

---

## 🔐 CONFIGURAÇÃO DE SEGURANÇA

### Secrets e Variáveis
- [ ] `.env` criado (NÃO commitado!)
- [ ] `.env` adicionado ao `.gitignore`
- [ ] Verificar se nenhuma key está no Git: `git grep SUPABASE_SERVICE_KEY`
- [ ] Chaves Supabase obtidas: URL + service_role key
- [ ] URL RTSP formatada corretamente
- [ ] Senhas fortes geradas (se aplicável)

### Supabase
- [ ] Projeto criado em https://supabase.com
- [ ] Database SQL aplicado (migrations)
- [ ] RLS policies configuradas
- [ ] Service key copiada (Settings > API)
- [ ] URL do projeto anotada
- [ ] Testar conexão: `curl $SUPABASE_URL/rest/v1/`

### Câmera RTSP
- [ ] IP da câmera anotado
- [ ] Porta RTSP verificada (padrão: 554)
- [ ] Credenciais da câmera conhecidas
- [ ] Stream path correto para modelo da câmera
- [ ] Testar RTSP: `ffplay "rtsp://..."`
- [ ] Se Tailscale: VPN conectada e testada

---

## 🐳 BUILD DOCKER

### Testes Locais
- [ ] Docker instalado: `docker --version`
- [ ] Docker Compose instalado: `docker-compose --version`
- [ ] Build passa: `docker build -t shopflow-backend:latest .`
- [ ] Tamanho da imagem aceitável (<2GB ideal)
- [ ] Script de teste executado: `./build-and-test.sh`
- [ ] Container inicia: `docker-compose up -d`
- [ ] Health check passa: `curl localhost:8001/api/health`
- [ ] Logs sem erros: `docker-compose logs`

### Otimizações
- [ ] `.dockerignore` exclui arquivos desnecessários
- [ ] Multi-stage build implementado
- [ ] Dependências em cache quando possível
- [ ] Usuário não-root configurado
- [ ] Imagem baseada em slim/alpine

---

## ☁️ DEPLOY PRODUÇÃO

### VPS/Servidor
- [ ] SSH configurado: `ssh user@servidor.com`
- [ ] Docker instalado no servidor
- [ ] Docker Compose instalado no servidor
- [ ] Firewall configurado (porta 8001 ou 80/443)
- [ ] Domínio apontado para servidor (se aplicável)
- [ ] Certificado SSL configurado (se aplicável)

### Configuração Servidor
- [ ] Repositório clonado: `git clone ...`
- [ ] `.env` criado no servidor
- [ ] Variáveis de produção configuradas
- [ ] Build executado: `docker-compose up -d --build`
- [ ] Container rodando: `docker ps | grep shopflow`
- [ ] Logs verificados: `docker-compose logs -f`

### Networking
- [ ] Porta exposta corretamente
- [ ] CORS configurado para domínio frontend
- [ ] Reverse proxy configurado (Nginx/Caddy)
- [ ] SSL/TLS ativo (HTTPS)
- [ ] WebSocket funcionando (se aplicável)

---

## 🧪 TESTES PÓS-DEPLOY

### Endpoints
- [ ] Health: `curl https://api.seudominio.com/api/health`
- [ ] Docs: `https://api.seudominio.com/docs`
- [ ] Camera stream: `https://api.seudominio.com/api/camera/stream`
- [ ] Camera stats: `https://api.seudominio.com/api/camera/stats`

### Funcionalidades
- [ ] Detecção de pessoas funcionando
- [ ] Grupos sendo detectados
- [ ] Métricas salvando no Supabase
- [ ] Face recognition ativo (se habilitado)
- [ ] Stream MJPEG acessível
- [ ] Frontend consegue conectar

### Performance
- [ ] CPU usage aceitável (<80%)
- [ ] RAM usage aceitável (<2GB)
- [ ] FPS estável (~5 FPS)
- [ ] Latência baixa (<200ms)
- [ ] Sem memory leaks após 1h

---

## 📊 MONITORAMENTO

### Logging
- [ ] Logs persistem em volume: `docker-compose logs`
- [ ] Rotação de logs configurada
- [ ] Nível de log apropriado (INFO em prod)
- [ ] Erros aparecem no dashboard

### Alerts
- [ ] Health check automático configurado
- [ ] Notificação se container cair
- [ ] Monitoring de recursos (CPU/RAM/Disk)
- [ ] Alert se RTSP desconectar

### Backups
- [ ] Backup de face_embeddings configurado
- [ ] Backup de configurações (.env)
- [ ] Plano de disaster recovery definido
- [ ] Teste de restore executado

---

## 📚 DOCUMENTAÇÃO

### Interna
- [ ] README atualizado
- [ ] API documentada (Swagger)
- [ ] Arquitetura documentada
- [ ] Variáveis de ambiente documentadas
- [ ] Troubleshooting guide criado

### Externa (se aplicável)
- [ ] Documentação para cliente
- [ ] Manual de uso
- [ ] FAQs criadas
- [ ] Vídeo tutorial (opcional)

---

## 🔄 CI/CD (Opcional)

### GitHub Actions
- [ ] Workflow de build configurado
- [ ] Workflow de testes configurado
- [ ] Secrets configurados no GitHub
- [ ] Auto-deploy em merge para main
- [ ] Notificações de deploy

### Exemplo workflow:
```yaml
name: Deploy Backend
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker
        run: docker build -t shopflow-backend .
      - name: Deploy
        run: |
          # Seu script de deploy aqui
```

---

## 🚨 ROLLBACK PLAN

### Se algo der errado:
- [ ] Procedimento de rollback documentado
- [ ] Backup da versão anterior disponível
- [ ] Comando de rollback testado:
  ```bash
  docker-compose down
  git checkout <commit-anterior>
  docker-compose up -d --build
  ```

### Contatos de Emergência:
- [ ] Equipe técnica notificada
- [ ] Suporte Supabase disponível
- [ ] Acesso a logs garantido

---

## ✅ DEPLOY COMPLETO

### Checklist Final:
- [ ] Tudo acima verificado ✓
- [ ] Stakeholders notificados
- [ ] Documentação entregue
- [ ] Período de monitoramento iniciado (24-48h)
- [ ] Feedback coletado
- [ ] Melhorias anotadas para próxima versão

---

## 📝 Notas Importantes

### Lembrar:
1. **NUNCA** commite `.env` no Git
2. **SEMPRE** use HTTPS em produção
3. **TESTE** backup e restore antes de precisar
4. **MONITORE** recursos nas primeiras 48h
5. **DOCUMENTE** qualquer problema encontrado

### Comandos Úteis:
```bash
# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f

# Restart
docker-compose restart

# Rebuild
docker-compose up -d --build

# Cleanup
docker system prune -a
```

---

**🎉 Deploy Concluído com Sucesso!**

Data: ___/___/___
Versão: 2.0-mvp
Responsável: __________
Servidor: __________

---

## 📞 Suporte

Em caso de problemas:
1. Verificar logs: `docker-compose logs`
2. Consultar [DOCKER_TROUBLESHOOTING.md](DOCKER_TROUBLESHOOTING.md)
3. Consultar [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)
4. Abrir issue no GitHub
5. Contatar equipe técnica

**Bom deploy! 🚀**