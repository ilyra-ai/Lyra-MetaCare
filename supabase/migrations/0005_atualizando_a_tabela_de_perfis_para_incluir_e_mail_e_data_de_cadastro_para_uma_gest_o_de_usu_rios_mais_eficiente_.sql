-- 1. Adiciona as colunas de email e data de criação na tabela de perfis
ALTER TABLE public.profiles ADD COLUMN email TEXT;
ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE;

-- 2. Cria um índice na coluna de email para otimizar buscas
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- 3. Preenche os dados para usuários já existentes, buscando da tabela de autenticação
UPDATE public.profiles p
SET
  email = u.email,
  created_at = u.created_at
FROM auth.users u
WHERE p.id = u.id;

-- 4. Atualiza a função de criação de usuário para incluir os novos campos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, created_at, onboarding_completed)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.email, -- Adiciona o email
    new.created_at, -- Adiciona a data de criação
    FALSE
  );
  RETURN new;
END;
$$;

-- 5. Reativa o gatilho para garantir que a nova função seja usada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();