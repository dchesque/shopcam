-- =====================================================
-- SCRIPT DE CONFIGURAÇÃO DO SUPABASE AUTH
-- ShopFlow - Sistema de Autenticação
-- =====================================================

-- Este script deve ser executado no SQL Editor do Supabase
-- para configurar as tabelas e políticas de segurança

-- =====================================================
-- 1. TABELA DE PERFIS
-- =====================================================

-- Criar tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. POLÍTICAS DE SEGURANÇA (RLS)
-- =====================================================

-- Política: Usuários podem ler seus próprios perfis
CREATE POLICY "Usuários podem ler seus próprios perfis"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Política: Usuários podem atualizar seus próprios perfis
CREATE POLICY "Usuários podem atualizar seus próprios perfis"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Política: Permitir inserção durante registro
CREATE POLICY "Permitir inserção durante registro"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 3. FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
-- =====================================================

-- Função que cria um perfil quando um novo usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. TRIGGER PARA CRIAÇÃO AUTOMÁTICA DE PERFIL
-- =====================================================

-- Trigger que executa a função quando um usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 5. FUNÇÃO PARA ATUALIZAR updated_at
-- =====================================================

-- Função que atualiza automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que atualiza updated_at quando o perfil é modificado
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 6. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índice no email para buscas rápidas
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- Índice no role para filtragem
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- =====================================================
-- 7. GRANTS (PERMISSÕES)
-- =====================================================

-- Permitir que usuários autenticados acessem a tabela
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- =====================================================
-- 8. CONFIGURAÇÃO DE AUTENTICAÇÃO
-- =====================================================

-- Execute no Dashboard do Supabase em Authentication > Settings:

-- Email confirmação: ENABLED
-- Confirm email: ENABLED
-- Secure password: ENABLED (min 8 caracteres)
-- Email templates: Configure conforme necessário

-- =====================================================
-- 9. VERIFICAÇÃO
-- =====================================================

-- Verificar se tudo foi criado corretamente
DO $$
BEGIN
  -- Verificar tabela
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    RAISE NOTICE '✓ Tabela profiles criada';
  ELSE
    RAISE EXCEPTION '✗ Erro: Tabela profiles não foi criada';
  END IF;

  -- Verificar RLS
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles' AND rowsecurity = true) THEN
    RAISE NOTICE '✓ Row Level Security habilitado';
  ELSE
    RAISE EXCEPTION '✗ Erro: RLS não está habilitado';
  END IF;

  -- Verificar políticas
  IF EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles') THEN
    RAISE NOTICE '✓ Políticas de segurança criadas';
  ELSE
    RAISE WARNING '⚠ Aviso: Nenhuma política encontrada';
  END IF;

  -- Verificar função
  IF EXISTS (SELECT FROM pg_proc WHERE proname = 'handle_new_user') THEN
    RAISE NOTICE '✓ Função handle_new_user criada';
  ELSE
    RAISE EXCEPTION '✗ Erro: Função não foi criada';
  END IF;

  -- Verificar trigger
  IF EXISTS (SELECT FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    RAISE NOTICE '✓ Trigger on_auth_user_created criado';
  ELSE
    RAISE EXCEPTION '✗ Erro: Trigger não foi criado';
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!';
  RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- 10. SEED DE TESTE (OPCIONAL)
-- =====================================================

-- Descomente para criar um usuário admin de teste
-- IMPORTANTE: Mude a senha antes de usar em produção!

/*
-- Criar usuário admin (só funciona se você já tiver criado via UI)
-- Depois de criar o usuário pelo signup, execute:

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@shopflow.com';
*/

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
