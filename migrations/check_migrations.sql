-- ============================================================================
-- ShopFlow - Migration Status Checker
-- Execute este script no Supabase SQL Editor para verificar o status
-- ============================================================================

DO $$
DECLARE
    v_cameras_exists BOOLEAN;
    v_camera_events_exists BOOLEAN;
    v_employees_exists BOOLEAN;
    v_profiles_exists BOOLEAN;
    v_total_tables INTEGER;
    rec RECORD;
BEGIN
    RAISE NOTICE E'\n============================================';
    RAISE NOTICE '🔍 ShopFlow - Migration Status Check';
    RAISE NOTICE E'============================================\n';

    -- Verificar tabelas
    SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'cameras'
    ) INTO v_cameras_exists;

    SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'camera_events'
    ) INTO v_camera_events_exists;

    SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'employees'
    ) INTO v_employees_exists;

    SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) INTO v_profiles_exists;

    -- Contar tabelas públicas
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = 'public'
    INTO v_total_tables;

    -- Exibir status
    RAISE NOTICE '📊 TABELAS OBRIGATÓRIAS:';
    RAISE NOTICE '-----------------------------------------';

    IF v_profiles_exists THEN
        RAISE NOTICE '✅ profiles          (usuários)';
    ELSE
        RAISE NOTICE '❌ profiles          FALTANDO!';
    END IF;

    IF v_cameras_exists THEN
        RAISE NOTICE '✅ cameras           (câmeras RTSP)';
    ELSE
        RAISE NOTICE '❌ cameras           FALTANDO!';
    END IF;

    IF v_camera_events_exists THEN
        RAISE NOTICE '✅ camera_events     (analytics)';
    ELSE
        RAISE NOTICE '❌ camera_events     FALTANDO!';
    END IF;

    IF v_employees_exists THEN
        RAISE NOTICE '✅ employees         (reconhecimento)';
    ELSE
        RAISE NOTICE '❌ employees         FALTANDO!';
    END IF;

    RAISE NOTICE E'\n-----------------------------------------';
    RAISE NOTICE 'Total de tabelas públicas: %', v_total_tables;
    RAISE NOTICE E'-----------------------------------------\n';

    -- Verificar políticas RLS
    RAISE NOTICE '🔒 ROW LEVEL SECURITY (RLS):';
    RAISE NOTICE '-----------------------------------------';

    FOR rec IN (
        SELECT tablename,
               CASE WHEN rowsecurity THEN '✅ Habilitado' ELSE '❌ Desabilitado' END as status
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename IN ('profiles', 'cameras', 'camera_events', 'employees')
        ORDER BY tablename
    ) LOOP
        RAISE NOTICE '  % : %', RPAD(rec.tablename, 20), rec.status;
    END LOOP;

    -- Contagem de políticas
    SELECT COUNT(*) INTO v_total_tables
    FROM pg_policies
    WHERE schemaname = 'public';

    RAISE NOTICE E'\nTotal de políticas RLS: %', v_total_tables;
    RAISE NOTICE E'-----------------------------------------\n';

    -- Resumo final
    IF v_profiles_exists AND v_cameras_exists AND v_camera_events_exists AND v_employees_exists THEN
        RAISE NOTICE '🎉 RESULTADO: Todas as migrations obrigatórias foram aplicadas!';
        RAISE NOTICE E'   Seu banco está pronto para uso.\n';
    ELSE
        RAISE NOTICE '⚠️  AÇÃO NECESSÁRIA: Algumas migrations ainda não foram aplicadas!';
        RAISE NOTICE E'   Consulte migrations/README.md para instruções.\n';
    END IF;

    RAISE NOTICE E'============================================\n';

END $$;

-- Listar todas as tabelas públicas
SELECT
    table_name AS "Tabela",
    CASE
        WHEN table_name IN ('profiles', 'cameras', 'camera_events', 'employees') THEN '✅ Obrigatória'
        ELSE '📦 Opcional'
    END AS "Status"
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY
    CASE WHEN table_name IN ('profiles', 'cameras', 'camera_events', 'employees') THEN 1 ELSE 2 END,
    table_name;
