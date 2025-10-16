-- Permite que o admin leia todos os perfis
CREATE POLICY "Admin can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.email() = 'douglas@ilyra.com.br');

-- Permite que o admin leia todos os usuários da tabela de autenticação
CREATE POLICY "Admin can view all users"
ON auth.users
FOR SELECT
TO authenticated
USING (auth.email() = 'douglas@ilyra.com.br');