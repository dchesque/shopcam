-- ============================================================================
-- Fix: Criar perfis para usuários existentes
-- Execute este SQL no Supabase para usuários cadastrados antes da migration
-- ============================================================================

-- Criar perfis para usuários que ainda não têm
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', u.email) as full_name,
    'user' as role
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Verificar resultado
SELECT
    COUNT(*) as total_users,
    (SELECT COUNT(*) FROM public.profiles) as profiles_created
FROM auth.users;
