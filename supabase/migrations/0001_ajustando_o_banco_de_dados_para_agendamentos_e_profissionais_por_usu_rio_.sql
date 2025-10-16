-- Remove as colunas desnecessárias da tabela de profissionais
ALTER TABLE public.professionals DROP COLUMN IF EXISTS rating;
ALTER TABLE public.professionals DROP COLUMN IF EXISTS bio;
ALTER TABLE public.professionals DROP COLUMN IF EXISTS avatar_url;

-- Adiciona as colunas 'user_id' e 'contact'
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.professionals ADD COLUMN IF NOT EXISTS contact TEXT;

-- Limpa os dados de exemplo que eram públicos
DELETE FROM public.professionals;

-- Remove a política de leitura pública antiga
DROP POLICY IF EXISTS "Public can read professionals" ON public.professionals;

-- Cria novas políticas de segurança para que cada usuário gerencie apenas seus próprios profissionais
CREATE POLICY "Users can manage their own professionals" ON public.professionals
FOR ALL TO authenticated USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Garante que a tabela de agendamentos tenha a política correta (já deve existir, mas é bom garantir)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only see their own appointments" ON public.appointments;
CREATE POLICY "Users can only see their own appointments" ON public.appointments
FOR SELECT TO authenticated USING (auth.uid() = user_id);