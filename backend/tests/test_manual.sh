#!/bin/bash

# ============================================
# SHOPFLOW MVP - TESTES MANUAIS
# ============================================
# Script para testar endpoints do backend manualmente
#
# Uso:
#   ./tests/test_manual.sh                    # Testa localhost:8001
#   ./tests/test_manual.sh http://vps:8001    # Testa URL customizada
#
# Pré-requisitos:
#   - curl instalado
#   - jq instalado (opcional, para formatar JSON)
#   - Backend rodando
# ============================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuração
BACKEND_URL=${1:-"http://localhost:8001"}
TIMEOUT=10

# Função para printar com cor
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Função para testar endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}

    echo -n "Testing $name... "

    response=$(curl -s -w "\n%{http_code}" --max-time $TIMEOUT "$url" 2>&1)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" = "$expected_status" ]; then
        print_success "OK ($http_code)"

        # Formatar JSON se jq estiver disponível
        if command -v jq &> /dev/null && [ -n "$body" ]; then
            echo "$body" | jq '.' 2>/dev/null || echo "$body"
        else
            echo "$body"
        fi
        return 0
    else
        print_error "FAIL (esperado: $expected_status, recebido: $http_code)"
        echo "$body"
        return 1
    fi
}

# ============================================
# INÍCIO DOS TESTES
# ============================================

print_header "SHOPFLOW MVP - TESTES MANUAIS"
print_info "Backend URL: $BACKEND_URL"
print_info "Timeout: ${TIMEOUT}s"

# Contador de testes
TOTAL=0
PASSED=0
FAILED=0

# ============================================
# 1. HEALTH CHECK
# ============================================

print_header "1. HEALTH CHECK"

((TOTAL++))
if test_endpoint "Health Endpoint" "$BACKEND_URL/health" 200; then
    ((PASSED++))
else
    ((FAILED++))
fi

# ============================================
# 2. ANALYTICS - METRICS
# ============================================

print_header "2. ANALYTICS - METRICS"

((TOTAL++))
if test_endpoint "Metrics Endpoint" "$BACKEND_URL/api/analytics/metrics" 200; then
    ((PASSED++))
else
    ((FAILED++))
fi

# ============================================
# 3. ANALYTICS - HISTORY
# ============================================

print_header "3. ANALYTICS - HISTORY"

((TOTAL++))
if test_endpoint "History Endpoint" "$BACKEND_URL/api/analytics/history" 200; then
    ((PASSED++))
else
    ((FAILED++))
fi

# ============================================
# 4. CAMERA - STREAM (apenas verificar se inicia)
# ============================================

print_header "4. CAMERA - STREAM"

echo -n "Testing Stream Endpoint... "
stream_response=$(curl -s -w "%{http_code}" --max-time 3 "$BACKEND_URL/api/camera/stream" -o /tmp/stream_test.jpg 2>&1 | tail -n1)

if [ "$stream_response" = "200" ]; then
    print_success "OK (stream iniciou)"
    if [ -f /tmp/stream_test.jpg ]; then
        file_size=$(wc -c < /tmp/stream_test.jpg)
        print_info "Primeiros bytes recebidos: ${file_size} bytes"
        rm /tmp/stream_test.jpg
    fi
    ((PASSED++))
else
    print_error "FAIL (status: $stream_response)"
    ((FAILED++))
fi
((TOTAL++))

# ============================================
# 5. CAMERA - STATS
# ============================================

print_header "5. CAMERA - STATS"

((TOTAL++))
if test_endpoint "Stats Endpoint" "$BACKEND_URL/api/camera/stats" 200; then
    ((PASSED++))
else
    ((FAILED++))
fi

# ============================================
# 6. EMPLOYEES - LIST
# ============================================

print_header "6. EMPLOYEES - LIST"

((TOTAL++))
if test_endpoint "List Employees" "$BACKEND_URL/api/employees/list" 200; then
    ((PASSED++))
else
    ((FAILED++))
fi

# ============================================
# 7. EMPLOYEES - REGISTER (sem foto - deve falhar)
# ============================================

print_header "7. EMPLOYEES - REGISTER (sem foto)"

echo -n "Testing Register without photo (should fail)... "
register_response=$(curl -s -w "%{http_code}" --max-time $TIMEOUT \
    -X POST "$BACKEND_URL/api/employees/register" \
    -F "name=Test User" \
    -F "employee_id=test@test.com" 2>&1 | tail -n1)

((TOTAL++))
if [ "$register_response" = "400" ] || [ "$register_response" = "422" ]; then
    print_success "OK (rejeitado corretamente: $register_response)"
    ((PASSED++))
else
    print_error "FAIL (deveria rejeitar, mas retornou: $register_response)"
    ((FAILED++))
fi

# ============================================
# 8. EMPLOYEES - DELETE (ID inválido - deve falhar)
# ============================================

print_header "8. EMPLOYEES - DELETE (ID inválido)"

echo -n "Testing Delete with invalid ID (should fail)... "
delete_response=$(curl -s -w "%{http_code}" --max-time $TIMEOUT \
    -X DELETE "$BACKEND_URL/api/employees/00000000-0000-0000-0000-000000000000" 2>&1 | tail -n1)

((TOTAL++))
if [ "$delete_response" = "404" ] || [ "$delete_response" = "400" ]; then
    print_success "OK (rejeitado corretamente: $delete_response)"
    ((PASSED++))
else
    print_error "FAIL (deveria rejeitar, mas retornou: $delete_response)"
    ((FAILED++))
fi

# ============================================
# 9. PERFORMANCE - RESPONSE TIME
# ============================================

print_header "9. PERFORMANCE - RESPONSE TIME"

echo -n "Testing Health response time... "
start_time=$(date +%s%N)
curl -s --max-time $TIMEOUT "$BACKEND_URL/health" > /dev/null
end_time=$(date +%s%N)
elapsed_ms=$(( (end_time - start_time) / 1000000 ))

((TOTAL++))
if [ $elapsed_ms -lt 1000 ]; then
    print_success "OK (${elapsed_ms}ms < 1000ms)"
    ((PASSED++))
else
    print_error "SLOW (${elapsed_ms}ms >= 1000ms)"
    ((FAILED++))
fi

# ============================================
# RESUMO
# ============================================

print_header "RESUMO DOS TESTES"

echo "Total de testes: $TOTAL"
echo -e "${GREEN}Passou: $PASSED${NC}"
echo -e "${RED}Falhou: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    print_success "TODOS OS TESTES PASSARAM! ✓"
    exit 0
else
    print_error "ALGUNS TESTES FALHARAM!"
    exit 1
fi
