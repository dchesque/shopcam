#!/bin/bash
# =============================================================================
# ShopFlow Backend - Docker Build & Test Script
# =============================================================================

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de output
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# Configurações
IMAGE_NAME="shopflow-backend"
IMAGE_TAG="latest"
CONTAINER_NAME="shopflow-backend-test"
FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"

echo "======================================================================"
echo "🏪 ShopFlow Backend - Docker Build & Test"
echo "======================================================================"
echo ""

# =============================================================================
# FASE 1: Verificações
# =============================================================================
print_info "Verificando pré-requisitos..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker não encontrado! Instale: https://docs.docker.com/get-docker/"
    exit 1
fi
print_success "Docker instalado: $(docker --version)"

# Verificar arquivos necessários
if [ ! -f "Dockerfile" ]; then
    print_error "Dockerfile não encontrado!"
    exit 1
fi
print_success "Dockerfile encontrado"

if [ ! -f "requirements.txt" ]; then
    print_error "requirements.txt não encontrado!"
    exit 1
fi
print_success "requirements.txt encontrado"

if [ ! -f ".env.example" ] && [ ! -f ".env" ]; then
    print_warning ".env não encontrado - container pode falhar sem variáveis de ambiente"
fi

echo ""

# =============================================================================
# FASE 2: Build
# =============================================================================
print_info "Iniciando build da imagem Docker..."
echo ""

BUILD_START=$(date +%s)

docker build \
    --no-cache \
    --progress=plain \
    -t "${FULL_IMAGE}" \
    -f Dockerfile \
    . 2>&1 | tee build.log

BUILD_STATUS=$?
BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))

echo ""
if [ $BUILD_STATUS -eq 0 ]; then
    print_success "Build concluído em ${BUILD_TIME}s"
else
    print_error "Build falhou! Verifique build.log para detalhes"
    exit 1
fi

# Verificar tamanho da imagem
IMAGE_SIZE=$(docker images "${FULL_IMAGE}" --format "{{.Size}}")
print_info "Tamanho da imagem: ${IMAGE_SIZE}"

echo ""

# =============================================================================
# FASE 3: Teste do Container
# =============================================================================
print_info "Testando container..."

# Remover container antigo se existir
if docker ps -a | grep -q "${CONTAINER_NAME}"; then
    print_info "Removendo container antigo..."
    docker rm -f "${CONTAINER_NAME}" > /dev/null 2>&1
fi

# Criar arquivo .env mínimo para teste
if [ ! -f ".env" ]; then
    print_warning "Criando .env de teste (com valores placeholder)"
    cat > .env.test << EOF
SUPABASE_URL=https://placeholder.supabase.co
SUPABASE_SERVICE_KEY=placeholder_key_for_testing
API_HOST=0.0.0.0
API_PORT=8001
CAMERA_RTSP_URL=rtsp://placeholder
EOF
    ENV_FILE=".env.test"
else
    ENV_FILE=".env"
fi

# Iniciar container
print_info "Iniciando container de teste..."
docker run -d \
    --name "${CONTAINER_NAME}" \
    --env-file "${ENV_FILE}" \
    -p 8001:8001 \
    "${FULL_IMAGE}"

# Aguardar inicialização
print_info "Aguardando inicialização (30s)..."
sleep 30

# Verificar se está rodando
if ! docker ps | grep -q "${CONTAINER_NAME}"; then
    print_error "Container parou inesperadamente!"
    print_info "Últimos logs:"
    docker logs "${CONTAINER_NAME}" | tail -50
    docker rm -f "${CONTAINER_NAME}" > /dev/null 2>&1
    [ -f ".env.test" ] && rm .env.test
    exit 1
fi

# Testar health endpoint
print_info "Testando health endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/api/health)

if [ "$HEALTH_RESPONSE" = "200" ]; then
    print_success "Health check passou! (HTTP 200)"
else
    print_error "Health check falhou! (HTTP ${HEALTH_RESPONSE})"
    print_info "Logs do container:"
    docker logs "${CONTAINER_NAME}" | tail -50
    docker rm -f "${CONTAINER_NAME}" > /dev/null 2>&1
    [ -f ".env.test" ] && rm .env.test
    exit 1
fi

echo ""

# =============================================================================
# FASE 4: Informações
# =============================================================================
print_success "===================================================================="
print_success "🎉 BUILD E TESTES CONCLUÍDOS COM SUCESSO!"
print_success "===================================================================="
echo ""
print_info "Imagem criada: ${FULL_IMAGE}"
print_info "Tamanho: ${IMAGE_SIZE}"
print_info "Build time: ${BUILD_TIME}s"
echo ""
print_info "Container de teste rodando: ${CONTAINER_NAME}"
print_info "Porta: http://localhost:8001"
print_info "Health: http://localhost:8001/api/health"
print_info "Docs: http://localhost:8001/docs"
echo ""

# =============================================================================
# FASE 5: Comandos úteis
# =============================================================================
echo "📝 Comandos úteis:"
echo "   Ver logs:        docker logs -f ${CONTAINER_NAME}"
echo "   Entrar no bash:  docker exec -it ${CONTAINER_NAME} bash"
echo "   Parar:           docker stop ${CONTAINER_NAME}"
echo "   Remover:         docker rm -f ${CONTAINER_NAME}"
echo ""
echo "🚀 Para fazer deploy:"
echo "   docker tag ${FULL_IMAGE} seu-registry/${IMAGE_NAME}:${IMAGE_TAG}"
echo "   docker push seu-registry/${IMAGE_NAME}:${IMAGE_TAG}"
echo ""

# Perguntar se quer manter rodando
read -p "Deseja manter o container de teste rodando? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Parando e removendo container de teste..."
    docker rm -f "${CONTAINER_NAME}" > /dev/null 2>&1
    print_success "Container removido"
fi

# Limpar .env.test se foi criado
[ -f ".env.test" ] && rm .env.test

print_success "Concluído!"