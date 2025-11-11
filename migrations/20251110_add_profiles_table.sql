-- ============================================================================
-- ShopFlow - Profiles Table Migration
-- Date: 2025-11-10
-- Description: Criação da tabela de perfis de usuários
-- ============================================================================

BEGIN;

-- ============================================================================
-- TABLE: profiles
-- ============================================================================
-- Armazena perfis dos usuários autenticados
-- Extende os dados de autenticação do Supabase Auth

CREATE TABLE IF NOT EXISTS public.profiles (
    -- Primary Key (referência ao auth.users)
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Informações do usuário
    email TEXT NOT NULL,
    full_name TEXT,

    -- Role/Função
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager')),

    -- Avatar (opcional)
    avatar_url TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentários
COMMENT ON TABLE public.profiles IS 'Perfis dos usuários do sistema';
COMMENT ON COLUMN public.profiles.id IS 'ID do usuário (referência ao auth.users)';
COMMENT ON COLUMN public.profiles.role IS 'Função do usuário no sistema';

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================================

-- Reusar função existente ou criar se não existe
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seu próprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Service role tem acesso completo
DROP POLICY IF EXISTS "Service role has full access" ON public.profiles;
CREATE POLICY "Service role has full access" ON public.profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Permitir inserção de perfis após cadastro
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- FUNCTION: Auto-create profile on user signup
-- ============================================================================

-- Função para criar perfil automaticamente quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- ============================================================================
-- VALIDATION
-- ============================================================================

DO $$
BEGIN
    ASSERT (SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
    )), 'Profiles table not created';

    RAISE NOTICE '✅ Profiles table migration completed successfully';
    RAISE NOTICE '   - profiles table created';
    RAISE NOTICE '   - RLS policies applied';
    RAISE NOTICE '   - Auto-creation trigger configured';
END $$;

COMMIT;
