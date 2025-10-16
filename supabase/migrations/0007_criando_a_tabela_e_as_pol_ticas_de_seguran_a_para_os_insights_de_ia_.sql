-- 1. Cria a tabela para armazenar os Insights de IA
CREATE TABLE public.ai_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilita a Segurança a Nível de Linha (RLS)
ALTER TABLE public.ai_tips ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Segurança
-- Permite que usuários autenticados leiam os insights ativos.
CREATE POLICY "Allow authenticated read access to active AI tips"
ON public.ai_tips
FOR SELECT
TO authenticated
USING (is_active = true);

-- Concede controle total ao administrador.
CREATE POLICY "Admin can manage AI tips"
ON public.ai_tips
FOR ALL
TO authenticated
USING (auth.email() = 'douglas@ilyra.com.br')
WITH CHECK (auth.email() = 'douglas@ilyra.com.br');

-- 4. Popula a tabela com os insights que antes eram estáticos no código
INSERT INTO public.ai_tips (title, detail, category)
VALUES
  ('Otimize o Sono Profundo', 'Seu padrão de sono sugere que 15 minutos de meditação antes de dormir podem aumentar o sono REM em 10%.', 'Sono'),
  ('Aumente a Proteína', 'Para suportar seus objetivos de massa muscular, adicione 20g de proteína no café da manhã.', 'Nutrição'),
  ('Alerta de Hidratação', 'Seu nível de atividade hoje exige 500ml extras de água para evitar fadiga.', 'Hidratação');