# 🧪 SHOPFLOW MVP - CENÁRIOS DE TESTE REAIS

**Versão:** MVP 1.0
**Data:** 2025-11-08
**Objetivo:** Validar o sistema em cenários do mundo real

---

## 📋 ÍNDICE

1. [Cenário 1: Loja Vazia](#cenário-1-loja-vazia)
2. [Cenário 2: Cliente Sozinho](#cenário-2-cliente-sozinho)
3. [Cenário 3: Grupo de 2 Clientes](#cenário-3-grupo-de-2-clientes)
4. [Cenário 4: Grupo de 4 Clientes](#cenário-4-grupo-de-4-clientes)
5. [Cenário 5: Funcionário Sozinho](#cenário-5-funcionário-sozinho)
6. [Cenário 6: Funcionário + Cliente](#cenário-6-funcionário--cliente)
7. [Cenário 7: Funcionário + Grupo](#cenário-7-funcionário--grupo)
8. [Cenário 8: Múltiplos Grupos](#cenário-8-múltiplos-grupos)
9. [Cenário 9: Hora de Pico](#cenário-9-hora-de-pico)
10. [Cenário 10: Reconhecimento Facial](#cenário-10-reconhecimento-facial)

---

## ✅ CHECKLIST PRÉ-TESTES

Antes de executar os testes, verifique:

- [ ] Backend rodando e acessível
- [ ] Supabase configurado com tabelas criadas
- [ ] Câmera IP conectada e streamando
- [ ] Frontend acessível
- [ ] Pelo menos 1 funcionário cadastrado no sistema
- [ ] Dashboard carregando métricas
- [ ] Stream ao vivo visível na página de Câmera

---

## 🎯 CENÁRIO 1: Loja Vazia

### **Descrição:**
Nenhuma pessoa na área de visão da câmera. Testa se o sistema detecta corretamente ausência de pessoas.

### **Setup:**
1. Posicionar câmera apontando para área vazia
2. Aguardar 10 segundos para estabilização
3. Observar métricas

### **Resultado Esperado:**

**Dashboard (Métricas):**
```json
{
  "total_people": 0,
  "potential_customers": 0,
  "employees_count": 0,
  "groups_count": 0
}
```

**Stream:**
- ✅ Imagem sem bounding boxes
- ✅ Sem labels de detecção
- ✅ Stream fluido (sem lag)

**Supabase (camera_events):**
```sql
SELECT * FROM camera_events
ORDER BY timestamp DESC
LIMIT 1;

-- Deve retornar:
-- total_people: 0
-- employees_count: 0
-- groups_count: 0
-- potential_customers: 0
```

### **Validações:**
- [ ] Métricas zeradas
- [ ] Sem bounding boxes no stream
- [ ] Evento registrado no Supabase
- [ ] Processing time < 200ms

---

## 🎯 CENÁRIO 2: Cliente Sozinho

### **Descrição:**
1 pessoa (não cadastrada) entra no campo de visão. Testa detecção básica de pessoa.

### **Setup:**
1. Posicionar 1 pessoa na frente da câmera
2. Pessoa deve permanecer parada por 5 segundos
3. Observar detecção

### **Resultado Esperado:**

**Dashboard:**
```json
{
  "total_people": 1,
  "potential_customers": 1,
  "employees_count": 0,
  "groups_count": 0
}
```

**Stream:**
- ✅ 1 bounding box verde ao redor da pessoa
- ✅ Label: "Person 0.95" (ou similar com confidence)
- ✅ Sem cor vermelha (não é funcionário)

**Supabase:**
```sql
-- Última entrada deve ter:
-- total_people: 1
-- potential_customers: 1
-- employees_count: 0
-- groups_count: 0
```

### **Validações:**
- [ ] Pessoa detectada com confidence > 0.5
- [ ] Classificada como cliente (não funcionário)
- [ ] Bounding box visível e estável
- [ ] Métricas atualizadas em tempo real

---

## 🎯 CENÁRIO 3: Grupo de 2 Clientes

### **Descrição:**
2 pessoas próximas (distância < 1.5m). Testa detecção de grupo pequeno.

### **Setup:**
1. Posicionar 2 pessoas juntas (a menos de 1.5m)
2. Aguardar 5 segundos
3. Observar agrupamento

### **Resultado Esperado:**

**Dashboard:**
```json
{
  "total_people": 2,
  "potential_customers": 2,
  "employees_count": 0,
  "groups_count": 1
}
```

**Stream:**
- ✅ 2 bounding boxes verdes
- ✅ Pessoas conectadas por linha ou cor diferente (indicando grupo)
- ✅ Label: "Grupo de 2"

**Supabase:**
```sql
-- groups_detail deve conter:
[
  {
    "group_id": 0,
    "size": 2,
    "potential_customers": 2,
    "label": "Grupo de 2"
  }
]
```

### **Validações:**
- [ ] 2 pessoas detectadas
- [ ] Agrupadas corretamente (DBSCAN)
- [ ] Contagem de grupos = 1
- [ ] Groups_detail no JSON correto

---

## 🎯 CENÁRIO 4: Grupo de 4 Clientes

### **Descrição:**
4 pessoas juntas. Testa detecção de grupo maior e lógica de clientes potenciais.

### **Setup:**
1. Posicionar 4 pessoas juntas
2. Aguardar 5 segundos
3. Verificar cálculo de clientes potenciais

### **Resultado Esperado:**

**Dashboard:**
```json
{
  "total_people": 4,
  "potential_customers": 2,  // (4 - 0) / 2 = 2
  "employees_count": 0,
  "groups_count": 1
}
```

**Lógica de Cálculo:**
```
potential_customers = (group_size - employees_in_group) / 2
                    = (4 - 0) / 2
                    = 2
```

**Stream:**
- ✅ 4 bounding boxes
- ✅ Label: "Grupo de 4"

### **Validações:**
- [ ] 4 pessoas detectadas
- [ ] Clientes potenciais = 2 (lógica correta)
- [ ] Todos no mesmo grupo

---

## 🎯 CENÁRIO 5: Funcionário Sozinho

### **Descrição:**
1 funcionário cadastrado sozinho na loja. Testa reconhecimento facial.

### **Setup:**
1. Cadastrar funcionário no sistema (com foto)
2. Funcionário entra no campo de visão
3. Aguardar reconhecimento

### **Resultado Esperado:**

**Dashboard:**
```json
{
  "total_people": 1,
  "potential_customers": 0,  // Funcionário não conta
  "employees_count": 1,
  "groups_count": 0
}
```

**Stream:**
- ✅ 1 bounding box VERMELHO
- ✅ Label: "João Silva" (nome do funcionário)
- ✅ Confidence do reconhecimento facial

### **Validações:**
- [ ] Funcionário reconhecido
- [ ] Nome exibido corretamente
- [ ] Cor vermelha no bounding box
- [ ] Não contado como cliente potencial

---

## 🎯 CENÁRIO 6: Funcionário + Cliente

### **Descrição:**
1 funcionário + 1 cliente próximos. Testa diferenciação funcionário/cliente.

### **Setup:**
1. Funcionário cadastrado + 1 pessoa não cadastrada
2. Ambos próximos (< 1.5m)
3. Observar classificação

### **Resultado Esperado:**

**Dashboard:**
```json
{
  "total_people": 2,
  "potential_customers": 1,  // Apenas o cliente
  "employees_count": 1,
  "groups_count": 1
}
```

**Stream:**
- ✅ 1 bounding box VERMELHO (funcionário)
- ✅ 1 bounding box VERDE (cliente)
- ✅ Ambos no mesmo grupo

**Supabase:**
```sql
-- groups_detail:
[
  {
    "group_id": 0,
    "size": 2,
    "potential_customers": 1,  // (2 - 1) / 2 = 0.5 -> arredonda para 1
    "label": "Grupo de 2"
  }
]
```

### **Validações:**
- [ ] Funcionário identificado corretamente
- [ ] Cliente classificado como potencial
- [ ] Grupo formado com ambos

---

## 🎯 CENÁRIO 7: Funcionário + Grupo

### **Descrição:**
1 funcionário atendendo 3 clientes. Testa cálculo de clientes potenciais em grupo misto.

### **Setup:**
1. 1 funcionário cadastrado
2. 3 pessoas não cadastradas
3. Todos juntos (< 1.5m)

### **Resultado Esperado:**

**Dashboard:**
```json
{
  "total_people": 4,
  "potential_customers": 1,  // (4 - 1) / 2 = 1.5 -> arredonda para 1
  "employees_count": 1,
  "groups_count": 1
}
```

**Cálculo:**
```
Grupo de 4 pessoas (1 funcionário + 3 clientes)
potential_customers = (4 - 1) / 2 = 1.5 ≈ 1
```

### **Validações:**
- [ ] 1 funcionário identificado
- [ ] 3 clientes detectados
- [ ] Clientes potenciais = 1
- [ ] Todos no mesmo grupo

---

## 🎯 CENÁRIO 8: Múltiplos Grupos

### **Descrição:**
2 grupos separados na loja. Testa detecção de múltiplos clusters.

### **Setup:**
1. Grupo A: 3 pessoas à esquerda
2. Grupo B: 2 pessoas à direita (distância > 1.5m do Grupo A)
3. Observar separação de grupos

### **Resultado Esperado:**

**Dashboard:**
```json
{
  "total_people": 5,
  "potential_customers": 2,  // Grupo A: 1 + Grupo B: 1
  "employees_count": 0,
  "groups_count": 2
}
```

**Supabase:**
```sql
-- groups_detail:
[
  {
    "group_id": 0,
    "size": 3,
    "potential_customers": 1,
    "label": "Grupo de 3"
  },
  {
    "group_id": 1,
    "size": 2,
    "potential_customers": 1,
    "label": "Grupo de 2"
  }
]
```

### **Validações:**
- [ ] 2 grupos distintos detectados
- [ ] Pessoas corretamente agrupadas
- [ ] DBSCAN separando corretamente (distância > 1.5m)

---

## 🎯 CENÁRIO 9: Hora de Pico

### **Descrição:**
10+ pessoas na loja simultaneamente. Testa performance e acurácia sob carga.

### **Setup:**
1. 10 ou mais pessoas no campo de visão
2. Incluir 2 funcionários cadastrados
3. Formar 2-3 grupos

### **Resultado Esperado:**

**Exemplo (12 pessoas, 2 funcionários, 3 grupos):**
```json
{
  "total_people": 12,
  "potential_customers": 5,  // Depende dos grupos
  "employees_count": 2,
  "groups_count": 3
}
```

**Performance:**
- ✅ Processing time < 500ms por frame
- ✅ FPS >= 3-5
- ✅ Stream sem lag significativo
- ✅ Todas as detecções visíveis

### **Validações:**
- [ ] Todas as pessoas detectadas (tolerância: ±1)
- [ ] Funcionários reconhecidos
- [ ] Grupos formados corretamente
- [ ] Performance aceitável (< 500ms)

---

## 🎯 CENÁRIO 10: Reconhecimento Facial

### **Descrição:**
Testar robustez do reconhecimento facial em diferentes condições.

### **Subcenários:**

### **10.1 - Distância Próxima:**
- Funcionário a ~1m da câmera
- ✅ Deve reconhecer instantaneamente

### **10.2 - Distância Média:**
- Funcionário a ~3m da câmera
- ✅ Deve reconhecer em 1-2 segundos

### **10.3 - Distância Longe:**
- Funcionário a ~5m da câmera
- ⚠️ Pode não reconhecer (depende da resolução da câmera)

### **10.4 - Ângulo Lateral:**
- Funcionário de lado (45°)
- ⚠️ Reconhecimento pode ser intermitente

### **10.5 - Múltiplos Funcionários:**
- 2 funcionários cadastrados simultaneamente
- ✅ Deve reconhecer ambos

### **10.6 - Iluminação Baixa:**
- Ambiente com pouca luz
- ⚠️ Reconhecimento pode degradar

### **Validações:**
- [ ] Taxa de reconhecimento > 80% em condições ideais
- [ ] Falsos positivos < 5%
- [ ] Nome correto exibido
- [ ] Bounding box vermelho consistente

---

## 📊 MATRIZ DE RESULTADOS

| Cenário | Total Pessoas | Clientes Potenciais | Funcionários | Grupos | Status |
|---------|---------------|---------------------|--------------|--------|--------|
| 1. Loja Vazia | 0 | 0 | 0 | 0 | ⏳ |
| 2. Cliente Sozinho | 1 | 1 | 0 | 0 | ⏳ |
| 3. Grupo de 2 | 2 | 2 | 0 | 1 | ⏳ |
| 4. Grupo de 4 | 4 | 2 | 0 | 1 | ⏳ |
| 5. Funcionário Sozinho | 1 | 0 | 1 | 0 | ⏳ |
| 6. Funcionário + Cliente | 2 | 1 | 1 | 1 | ⏳ |
| 7. Funcionário + Grupo | 4 | 1 | 1 | 1 | ⏳ |
| 8. Múltiplos Grupos | 5 | 2 | 0 | 2 | ⏳ |
| 9. Hora de Pico | 12 | 5 | 2 | 3 | ⏳ |
| 10. Reconhecimento Facial | - | - | - | - | ⏳ |

**Legenda:**
- ⏳ Não testado
- ✅ Passou
- ⚠️ Passou com ressalvas
- ❌ Falhou

---

## 🔍 VALIDAÇÕES CROSS-PLATFORM

### **Para cada cenário, verificar:**

1. **Dashboard (Frontend):**
   - [ ] Métricas atualizam em tempo real
   - [ ] Gráfico temporal mostra histórico correto
   - [ ] Preview da câmera exibe stream ao vivo

2. **Página Câmera (Frontend):**
   - [ ] Stream em fullscreen funcionando
   - [ ] Bounding boxes visíveis
   - [ ] Labels corretas (nomes/IDs)
   - [ ] Cores corretas (verde=cliente, vermelho=funcionário)

3. **Backend (API):**
   - [ ] `/api/analytics/metrics` retorna valores corretos
   - [ ] `/api/analytics/history` contém eventos recentes
   - [ ] `/api/camera/stats` mostra FPS atual

4. **Supabase (Database):**
   - [ ] Tabela `camera_events` inserindo eventos
   - [ ] Campos `total_people`, `potential_customers`, etc. corretos
   - [ ] JSON `groups_detail` bem formatado
   - [ ] Timestamps corretos

---

## 🐛 TROUBLESHOOTING DURANTE TESTES

### **Problema: Pessoas não sendo detectadas**
```bash
# Verificar:
- Iluminação suficiente
- Câmera focada
- Confidence threshold (YOLO_CONFIDENCE=0.5)
- Logs do backend: docker-compose logs -f backend | grep "YOLO"
```

### **Problema: Funcionário não reconhecido**
```bash
# Verificar:
- Funcionário cadastrado no Supabase
- Face tolerance adequado (FACE_TOLERANCE=0.6)
- Qualidade da foto de cadastro
- Distância da câmera
- Ângulo do rosto
- Logs: grep "face_recognition" logs/backend.log
```

### **Problema: Grupos não formando corretamente**
```bash
# Ajustar parâmetros:
- GROUP_MAX_DISTANCE (padrão: 1.5m)
- GROUP_MIN_SIZE (padrão: 2)
- Testar diferentes distâncias entre pessoas
```

### **Problema: Performance ruim (FPS baixo)**
```bash
# Otimizar:
- Reduzir CAMERA_FPS_PROCESS (padrão: 5)
- Usar YOLO_DEVICE=cuda (se tiver GPU)
- Reduzir resolução do stream RTSP
- Verificar CPU/RAM: docker stats
```

---

## 📝 TEMPLATE DE REPORTE

Para cada cenário testado, preencher:

```markdown
### CENÁRIO X: [Nome]
- **Data:** [YYYY-MM-DD HH:MM]
- **Testador:** [Nome]
- **Ambiente:** [Local / VPS]

**Resultado:**
- Total Pessoas: [Esperado: X | Obtido: Y]
- Clientes Potenciais: [Esperado: X | Obtido: Y]
- Funcionários: [Esperado: X | Obtido: Y]
- Grupos: [Esperado: X | Obtido: Y]

**Performance:**
- Processing Time: [Xms]
- FPS: [X]
- Latência Stream: [Xms]

**Status:** ✅ Passou / ⚠️ Passou com ressalvas / ❌ Falhou

**Observações:**
[Notas adicionais, problemas encontrados, etc.]

**Screenshots:**
[Anexar se necessário]
```

---

## ✅ CRITÉRIOS DE SUCESSO GERAL

Para considerar o MVP aprovado em testes, deve:

- [ ] **90%+ dos cenários básicos (1-8) passando**
- [ ] **Cenário 9 (hora de pico) com performance aceitável** (< 500ms)
- [ ] **Reconhecimento facial > 80% de acurácia** em condições ideais
- [ ] **Zero crashes** durante 1 hora de operação contínua
- [ ] **Dados persistindo corretamente no Supabase**
- [ ] **Frontend exibindo métricas em tempo real**

---

**PRÓXIMOS PASSOS:**
1. Executar cada cenário sequencialmente
2. Preencher matriz de resultados
3. Documentar problemas encontrados
4. Ajustar parâmetros conforme necessário
5. Re-testar cenários que falharam

**BOA SORTE NOS TESTES! 🚀**
