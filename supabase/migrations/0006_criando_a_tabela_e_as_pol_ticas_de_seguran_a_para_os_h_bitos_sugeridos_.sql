-- 1. Cria a nova tabela para armazenar os hábitos sugeridos
CREATE TABLE public.suggested_habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  frequency TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilita a Segurança a Nível de Linha (RLS)
ALTER TABLE public.suggested_habits ENABLE ROW LEVEL SECURITY;

-- 3. Cria as políticas de segurança
-- Política para usuários: Permite que usuários autenticados leiam os hábitos ativos.
CREATE POLICY "Allow authenticated read access to suggested habits"
ON public.suggested_habits
FOR SELECT
TO authenticated
USING (is_active = true);

-- Política para admin: Concede controle total (criar, ler, atualizar, deletar) ao administrador.
CREATE POLICY "Admin can manage suggested habits"
ON public.suggested_habits
FOR ALL
TO authenticated
USING (auth.email() = 'douglas@ilyra.com.br')
WITH CHECK (auth.email() = 'douglas@ilyra.com.br');

-- 4. Popula a tabela com os hábitos que antes estavam no código
INSERT INTO public.suggested_habits (name, frequency)
VALUES
  ('Meditar 10 minutos', 'Diário'),
  ('Beber 2L de água', 'Diário'),
  ('Caminhar 30 minutos', 'Diário'),
  ('Desligar telas 1h antes de dormir', 'Diário'),
  ('Treino de força', 'Semanal (2x)');