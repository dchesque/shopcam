# Migrations do ShopFlow

Guia para aplicar as migrations do banco de dados no Supabase.

## 📋 Ordem de Execução

Execute as migrations **nesta ordem** no SQL Editor do Supabase Dashboard:

### 1️⃣ Schema Inicial (Obrigatório)
```bash
migrations/20251109_initial_schema.sql
```
**Cria:**
- Tabela `camera_events` (eventos processados pela IA)
- Tabela `employees` (funcionários para reconhecimento facial)
- Extensões (uuid-ossp, pgcrypto)
- Políticas RLS
- Triggers e funções base

### 2️⃣ Tabela de Câmeras (Obrigatório)
```bash
frontend/migrations/001_create_cameras_table.sql
```
**Cria:**
- Tabela `cameras` (configuração das câmeras RTSP)
- Índices de performance
- Trigger para `updated_at`
- 4 câmeras de exemplo (opcional, pode remover)

### 3️⃣ Tabela de Perfis (Obrigatório)
```bash
migrations/20251110_add_profiles_table.sql
```
**Cria:**
- Tabela `profiles` (perfis de usuários)
- Políticas RLS para segurança
- Trigger automático para criar perfil ao registrar
- Função `handle_new_user()`

---

**✅ Pronto! Apenas 3 migrations necessárias.**

Migrations desnecessárias foram removidas (funcionalidades futuras não implementadas).

---

## 🚀 Como Aplicar

### Método 1: Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **+ New Query**
5. Copie e cole o conteúdo da migration
6. Clique em **Run** (ou F5)
7. Verifique se aparece "✅ Migration completed successfully"

### Método 2: Supabase CLI

```bash
# Se estiver usando Supabase CLI localmente
supabase db reset
supabase db push
```

---

## ✅ Verificação

Após executar as migrations obrigatórias, verifique se as tabelas foram criadas:

```sql
-- Listar todas as tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Deve retornar:
-- - cameras
-- - camera_events
-- - employees
-- - profiles
```

### Testar Políticas RLS

```sql
-- Verificar políticas RLS
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

---

## 📝 Status das Tabelas

| Tabela | Status | Necessário Para |
|--------|--------|----------------|
| `profiles` | ✅ Criada | Autenticação, página de perfil |
| `cameras` | ✅ Criada | Gerenciamento de câmeras RTSP |
| `camera_events` | ✅ Criada | Analytics em tempo real |
| `employees` | ✅ Criada | Reconhecimento facial |

---

## 🔒 Segurança (RLS)

Todas as tabelas possuem **Row Level Security (RLS)** habilitado:

### `profiles`
- ✅ Usuários só veem seu próprio perfil
- ✅ Usuários só podem editar seu próprio perfil
- ✅ Service role tem acesso completo

### `cameras`
- ✅ Todos usuários autenticados podem ler/escrever
- ✅ Ideal para MVP (ajustar permissões depois)

### `camera_events` e `employees`
- ✅ Apenas service_role (backend) tem acesso
- ✅ Frontend não acessa diretamente

---

## 🐛 Troubleshooting

### Erro: "relation already exists"
A tabela já foi criada. Pule essa migration ou use:
```sql
DROP TABLE IF EXISTS nome_da_tabela CASCADE;
```

### Erro: "permission denied"
Verifique se está usando uma connection string com permissões de `service_role`.

### Erro: "constraint violation"
Limpe os dados existentes ou ajuste a migration para não inserir dados de exemplo.

---

## 📚 Documentação

- [Supabase Migrations](https://supabase.com/docs/guides/database/migrations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL Editor](https://supabase.com/docs/guides/database/overview)
