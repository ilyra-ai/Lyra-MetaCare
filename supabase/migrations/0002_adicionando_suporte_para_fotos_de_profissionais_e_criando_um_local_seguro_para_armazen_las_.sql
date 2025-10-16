-- Adiciona a coluna para a URL do avatar na tabela de profissionais, se ainda não existir.
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Cria o bucket de armazenamento para os avatares dos profissionais, se ainda não existir.
INSERT INTO storage.buckets (id, name, public)
VALUES ('professional_avatars', 'professional_avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Política de Segurança: Permite que qualquer pessoa veja os avatares (leitura pública).
CREATE POLICY "Public read access for professional avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'professional_avatars' );

-- Política de Segurança: Permite que usuários autenticados adicionem avatares.
CREATE POLICY "Authenticated users can insert avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'professional_avatars' );

-- Política de Segurança: Permite que usuários atualizem seus próprios avatares.
-- A segurança é garantida verificando se o ID do usuário está no caminho do arquivo (ex: 'user_id/avatar.png').
CREATE POLICY "Users can update their own professional avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING ( auth.uid() = (storage.foldername(name))[1]::uuid );