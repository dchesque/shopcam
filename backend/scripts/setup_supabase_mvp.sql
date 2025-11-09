-- ============================================
-- SHOPFLOW MVP - SUPABASE DATABASE SETUP
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Dashboard → SQL Editor → New Query → Paste → Run

-- ============================================
-- 1. TABELA: camera_events (Eventos da Câmera)
-- ============================================

CREATE TABLE IF NOT EXISTS camera_events (
  id BIGSERIAL PRIMARY KEY,

  -- Timestamp e identificação
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  camera_id TEXT NOT NULL DEFAULT 'camera1',

  -- Contagens básicas (MVP)
  total_people INTEGER NOT NULL DEFAULT 0,
  employees_count INTEGER NOT NULL DEFAULT 0,
  groups_count INTEGER NOT NULL DEFAULT 0,
  potential_customers INTEGER NOT NULL DEFAULT 0,

  -- Detalhes de grupos (JSON simples)
  groups_detail JSONB,

  -- Performance
  processing_time_ms INTEGER,

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentários
COMMENT ON TABLE camera_events IS 'Eventos processados pela câmera com detecções de IA';
COMMENT ON COLUMN camera_events.total_people IS 'Total de pessoas detectadas no frame';
COMMENT ON COLUMN camera_events.employees_count IS 'Funcionários identificados';
COMMENT ON COLUMN camera_events.groups_count IS 'Número de grupos detectados';
COMMENT ON COLUMN camera_events.potential_customers IS 'Clientes potenciais calculados';
COMMENT ON COLUMN camera_events.groups_detail IS 'Array JSON com detalhes de cada grupo';

-- ============================================
-- 2. INDEXES para Performance
-- ============================================

-- Index por timestamp (queries ordenadas por tempo)
CREATE INDEX IF NOT EXISTS idx_camera_events_timestamp
ON camera_events(timestamp DESC);

-- Index composto (queries filtradas por câmera + tempo)
CREATE INDEX IF NOT EXISTS idx_camera_events_camera_time
ON camera_events(camera_id, timestamp DESC);

-- Index para busca de eventos recentes
CREATE INDEX IF NOT EXISTS idx_camera_events_created
ON camera_events(created_at DESC);

-- ============================================
-- 3. TABELA: employees (Funcionários)
-- ============================================

CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dados básicos
  name TEXT NOT NULL,
  employee_id TEXT UNIQUE,  -- Email ou ID customizado
  department TEXT,
  position TEXT,

  -- Embedding facial (array de floats)
  embedding FLOAT8[] NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'active',

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentários
COMMENT ON TABLE employees IS 'Funcionários cadastrados para reconhecimento facial';
COMMENT ON COLUMN employees.embedding IS 'Embedding facial (128 dimensões) para reconhecimento';
COMMENT ON COLUMN employees.status IS 'Status: active ou inactive';

-- ============================================
-- 4. INDEXES para Employees
-- ============================================

-- Index por status (filtros de ativos/inativos)
CREATE INDEX IF NOT EXISTS idx_employees_status
ON employees(status);

-- Index por data de criação
CREATE INDEX IF NOT EXISTS idx_employees_created
ON employees(created_at DESC);

-- ============================================
-- 5. FUNCTION: Update timestamp automático
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para employees
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. RLS (Row Level Security) - Opcional
-- ============================================
-- Descomente se quiser ativar RLS para segurança adicional

-- ALTER TABLE camera_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Política: Permitir todas operações com service_role
-- CREATE POLICY "Enable all for service role"
-- ON camera_events FOR ALL
-- USING (auth.role() = 'service_role');

-- CREATE POLICY "Enable all for service role"
-- ON employees FOR ALL
-- USING (auth.role() = 'service_role');

-- ============================================
-- 7. REALTIME (Opcional)
-- ============================================
-- Habilitar realtime para camera_events se quiser updates ao vivo

-- ALTER PUBLICATION supabase_realtime ADD TABLE camera_events;

-- ============================================
-- 8. DADOS DE TESTE (Opcional)
-- ============================================
-- Inserir alguns eventos de teste para verificar

INSERT INTO camera_events (
  timestamp,
  camera_id,
  total_people,
  employees_count,
  groups_count,
  potential_customers,
  groups_detail,
  processing_time_ms
) VALUES
  (
    NOW() - INTERVAL '1 hour',
    'camera1',
    5,
    1,
    1,
    2,
    '[{"group_id": 0, "size": 4, "potential_customers": 1, "label": "Grupo de 4"}]'::jsonb,
    150
  ),
  (
    NOW() - INTERVAL '30 minutes',
    'camera1',
    8,
    2,
    2,
    3,
    '[{"group_id": 0, "size": 3, "potential_customers": 1}, {"group_id": 1, "size": 3, "potential_customers": 1}]'::jsonb,
    180
  ),
  (
    NOW() - INTERVAL '10 minutes',
    'camera1',
    3,
    1,
    0,
    2,
    '[]'::jsonb,
    120
  );

-- ============================================
-- 9. VERIFICAÇÃO
-- ============================================
-- Verificar se tudo foi criado corretamente

-- Listar tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('camera_events', 'employees');

-- Contar registros de teste
SELECT COUNT(*) as total_events FROM camera_events;

-- Verificar indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('camera_events', 'employees')
ORDER BY tablename, indexname;

-- ============================================
-- 10. LIMPEZA (se necessário)
-- ============================================
-- Use com cuidado! Isso apaga TODOS os dados

-- DROP TABLE IF EXISTS camera_events CASCADE;
-- DROP TABLE IF EXISTS employees CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================
-- SETUP COMPLETO! ✅
-- ============================================

-- Próximos passos:
-- 1. ✅ Execute este script no Supabase SQL Editor
-- 2. ✅ Verifique se as tabelas foram criadas
-- 3. ✅ Copie a URL e Service Key do Supabase
-- 4. ✅ Configure no backend/.env
