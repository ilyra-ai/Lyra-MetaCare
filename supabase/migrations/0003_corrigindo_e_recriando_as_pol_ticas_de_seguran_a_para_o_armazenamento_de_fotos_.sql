-- Adiciona a coluna para armazenar a URL da foto do profissional, se ainda não existir
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Garante que o bucket de armazenamento exista
INSERT INTO storage.buckets (id, name, public)
VALUES ('professional_avatars', 'professional_avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Remove políticas existentes antes de criá-las novamente para evitar conflitos
DROP POLICY IF EXISTS "Public read access for professional avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload professional avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own professional avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own professional avatars" ON storage.objects;

-- Define as políticas de segurança para o bucket
-- Permite que qualquer pessoa veja as fotos (necessário para exibir no app)
CREATE POLICY "Public read access for professional avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'professional_avatars');

-- Permite que usuários autenticados enviem fotos
CREATE POLICY "Users can upload professional avatars" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'professional_avatars');

-- Permite que usuários atualizem apenas suas próprias fotos (baseado no caminho do arquivo)
CREATE POLICY "Users can update their own professional avatars" ON storage.objects
FOR UPDATE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Permite que usuários deletem apenas suas próprias fotos
CREATE POLICY "Users can delete their own professional avatars" ON storage.objects
FOR DELETE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);