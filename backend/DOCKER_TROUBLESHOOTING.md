# 🔧 ShopFlow Backend - Docker Troubleshooting

Guia rápido de solução de problemas com Docker.

---

## ❌ Problema 1: Build falha com erro de dependências

### Sintomas:
```
ERROR: Could not build wheels for dlib
ERROR: Failed building wheel for face-recognition
```

### Solução:
```bash
# Verificar se tem memória suficiente
docker info | grep Memory

# Aumentar memória do Docker (Docker Desktop)
# Settings > Resources > Memory: 4GB mínimo

# Limpar cache e rebuildar
docker builder prune -a
docker-compose build --no-cache
```

---

## ❌ Problema 2: Container para logo após iniciar

### Diagnóstico:
```bash
# Ver logs completos
docker logs shopflow-backend

# Verificar se container está rodando
docker ps -a | grep shopflow
```

### Causas comuns:

**A) Falta variáveis de ambiente:**
```bash
# Verificar se .env existe
ls -la .env

# Verificar se tem as variáveis obrigatórias
grep SUPABASE_URL .env
grep SUPABASE_SERVICE_KEY .env
grep CAMERA_RTSP_URL .env
```

**Solução:**
```bash
# Copiar template
cp .env.example .env

# Editar com suas credenciais
nano .env
```

**B) Erro de conexão Supabase:**
```bash
# Testar conexão manualmente
curl https://seu-projeto.supabase.co/rest/v1/

# Verificar se keys estão corretas no Supabase Dashboard
# Settings > API > Project URL e service_role key
```

**C) URL RTSP inválida:**
```bash
# Testar RTSP com ffmpeg
ffmpeg -i "rtsp://user:pass@ip:554/stream" -frames:v 1 test.jpg

# Se falhar, verificar:
# - IP correto?
# - Porta 554 aberta?
# - Credenciais corretas?
# - Substream path correto?
```

---

## ❌ Problema 3: Health check falha

### Sintomas:
```bash
docker ps
# STATUS: health: starting → unhealthy
```

### Diagnóstico:
```bash
# Testar health manualmente
curl http://localhost:8001/api/health

# Ver logs de erro
docker logs shopflow-backend | grep ERROR
```

### Soluções:

**A) Porta 8001 já em uso:**
```bash
# Ver o que está usando a porta
lsof -i :8001
# ou no Windows:
netstat -ano | findstr :8001

# Matar processo
kill -9 <PID>

# Ou mudar porta no docker-compose.yml
ports:
  - "8002:8001"
```

**B) Supabase não conecta:**
```bash
# Entrar no container
docker exec -it shopflow-backend bash

# Testar Python
python -c "from core.database import SupabaseManager; print('OK')"

# Verificar logs
tail -f /app/logs/app.log
```

---

## ❌ Problema 4: Imagem muito grande (>3GB)

### Verificar tamanho:
```bash
docker images shopflow-backend
```

### Otimizar:

**A) Usar .dockerignore:**
```bash
# Verificar se existe
ls -la .dockerignore

# Adicionar exclusões:
echo "logs/" >> .dockerignore
echo "uploads/" >> .dockerignore
echo "*.log" >> .dockerignore
```

**B) Limpar layers antigas:**
```bash
# Rebuildar do zero
docker build --no-cache -t shopflow-backend:latest .

# Comprimir camadas
docker image prune
```

**C) Multi-stage build (já implementado no Dockerfile):**
- Stage 1: Compilação (descartada)
- Stage 2: Runtime (apenas binários necessários)

---

## ❌ Problema 5: YOLO model download falha

### Sintomas:
```
ERROR: Model yolo11n.pt not found
ConnectionError: Failed to download model
```

### Solução:

**A) Download manual:**
```bash
# Baixar modelo localmente
wget https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n.pt

# Copiar para container
docker cp yolo11n.pt shopflow-backend:/app/
```

**B) Verificar internet no container:**
```bash
docker exec -it shopflow-backend bash
ping -c 3 google.com
wget -q --spider http://github.com && echo "OK" || echo "FAIL"
```

**C) Usar proxy se necessário:**
```dockerfile
# Adicionar no Dockerfile antes do wget
ENV http_proxy=http://seu-proxy:porta
ENV https_proxy=http://seu-proxy:porta
```

---

## ❌ Problema 6: Face recognition falha

### Sintomas:
```
ImportError: cannot import name 'face_recognition'
ERROR: No module named 'dlib'
```

### Solução:

**A) Verificar instalação:**
```bash
docker exec -it shopflow-backend python -c "import face_recognition; print('OK')"
docker exec -it shopflow-backend python -c "import dlib; print('OK')"
```

**B) Reinstalar se necessário:**
```bash
# Entrar no container
docker exec -it shopflow-backend bash

# Reinstalar
pip install --force-reinstall dlib face-recognition
```

**C) Se build falhar, desabilitar temporariamente:**
```env
# No .env
FACE_RECOGNITION_ENABLED=false
```

---

## ❌ Problema 7: Memória insuficiente (OOM Killed)

### Sintomas:
```
docker logs shopflow-backend
# (sem saída - container morto)

dmesg | tail
# Out of memory: Killed process...
```

### Soluções:

**A) Aumentar memória disponível:**
```yaml
# docker-compose.yml
deploy:
  resources:
    limits:
      memory: 3G  # aumentar de 2G para 3G
```

**B) Usar modelo YOLO mais leve:**
```env
YOLO_MODEL=yolo11n.pt  # já é o mais leve (8MB)
```

**C) Processar menos FPS:**
```env
CAMERA_FPS_PROCESS=3  # reduzir de 5 para 3
```

**D) Desabilitar módulos pesados:**
```env
FACE_RECOGNITION_ENABLED=false  # economiza ~500MB
```

---

## ❌ Problema 8: RTSP stream não conecta

### Diagnóstico:
```bash
# Ver logs específicos de RTSP
docker logs shopflow-backend | grep RTSP
docker logs shopflow-backend | grep rtsp_capture
```

### Soluções:

**A) Testar conectividade:**
```bash
# Do host
ffplay "rtsp://user:pass@ip:554/stream"

# Do container
docker exec -it shopflow-backend bash
ffmpeg -i "$CAMERA_RTSP_URL" -frames:v 1 test.jpg
```

**B) Verificar URL format:**
```bash
# Formato correto Intelbras:
rtsp://admin:senha@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0

# Formato correto HikVision:
rtsp://admin:senha@192.168.1.100:554/Streaming/Channels/101

# Formato correto Dahua:
rtsp://admin:senha@192.168.1.100:554/cam/realmonitor?channel=1&subtype=1
```

**C) Firewall/Network:**
```bash
# Verificar se porta 554 está acessível
telnet 192.168.1.100 554

# Se via Tailscale, verificar se está conectado
tailscale status
```

---

## 🛠️ Comandos úteis de debug

### Ver recursos:
```bash
docker stats shopflow-backend
```

### Entrar no container:
```bash
docker exec -it shopflow-backend bash
```

### Ver estrutura de arquivos:
```bash
docker exec -it shopflow-backend ls -la /app
```

### Copiar logs para fora:
```bash
docker cp shopflow-backend:/app/logs ./logs-backup
```

### Rebuild completo (limpar tudo):
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### Ver uso de disco:
```bash
docker system df
```

---

## 📞 Suporte

Se o problema persistir:

1. **Coletar informações:**
```bash
# Logs completos
docker logs shopflow-backend > logs.txt

# Docker info
docker info > docker-info.txt

# Compose config
docker-compose config > compose-config.txt
```

2. **Verificar documentação:**
- [README.md](README.md)
- [SETUP.md](../SETUP.md)
- [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)

3. **Criar issue no GitHub** com:
- Logs completos
- docker-compose.yml (sem credenciais!)
- Versão do Docker
- Sistema operacional