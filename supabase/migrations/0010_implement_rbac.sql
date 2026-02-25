-- 1. Adicionar coluna de role na tabela de perfis
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'patient';

-- 2. Atualizar o usuário administrador atual
UPDATE public.profiles SET role = 'admin' WHERE email = 'douglas@ilyra.com.br';

-- 3. Criar uma função auxiliar para verificar se o usuário é administrador
-- Usamos SECURITY DEFINER para que a função execute com os privilégios do criador (acesso à tabela profiles)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Atualizar as Políticas de Segurança (RLS) para usar a função is_admin() em vez de e-mail hardcoded

-- Atualizar políticas na tabela profiles (referência: migration 0004)
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Atualizar políticas na tabela auth.users (referência: migration 0004)
-- Nota: A tabela auth.users é gerenciada pelo Supabase Auth, mas as políticas podem ser definidas.
DROP POLICY IF EXISTS "Admin can view all users" ON auth.users;
CREATE POLICY "Admin can view all users"
ON auth.users
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Atualizar políticas na tabela suggested_habits (referência: migration 0006)
DROP POLICY IF EXISTS "Admin can manage suggested habits" ON public.suggested_habits;
CREATE POLICY "Admin can manage suggested habits"
ON public.suggested_habits
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Atualizar políticas na tabela ai_tips (referência: migration 0007)
DROP POLICY IF EXISTS "Admin can manage AI tips" ON public.ai_tips;
CREATE POLICY "Admin can manage AI tips"
ON public.ai_tips
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
