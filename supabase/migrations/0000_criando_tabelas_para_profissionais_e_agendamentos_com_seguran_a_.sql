-- Tabela para armazenar os profissionais de saúde
CREATE TABLE public.professionals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  avatar_url TEXT,
  rating NUMERIC(2, 1) CHECK (rating >= 0 AND rating <= 5),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para a tabela de profissionais
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- Política: Permitir que todos os usuários (autenticados ou não) leiam os dados dos profissionais
CREATE POLICY "Public can read professionals" ON public.professionals
FOR SELECT USING (true);

-- Inserir alguns profissionais de exemplo
INSERT INTO public.professionals (name, specialty, avatar_url, rating, bio) VALUES
('Dr. Ana Costa', 'Cardiologista', 'https://i.pravatar.cc/150?img=1', 4.9, 'Especialista em saúde cardíaca preventiva e longevidade.'),
('Dr. Bruno Martins', 'Nutricionista Esportivo', 'https://i.pravatar.cc/150?img=2', 4.8, 'Focado em otimização metabólica e performance através da dieta.'),
('Dra. Carla Dias', 'Endocrinologista', 'https://i.pravatar.cc/150?img=3', 4.9, 'Ajuda a regular seus hormônios para uma vida mais saudável e equilibrada.'),
('Dr. Daniel Fogaça', 'Fisioterapeuta', 'https://i.pravatar.cc/150?img=4', 4.7, 'Especialista em recuperação de lesões e otimização do movimento para longevidade.');

-- Tabela para armazenar os agendamentos
CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  appointment_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled
  meeting_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para a tabela de agendamentos
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Políticas: Garantir que os usuários só possam gerenciar seus próprios agendamentos
CREATE POLICY "Users can only see their own appointments" ON public.appointments
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own appointments" ON public.appointments
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own appointments" ON public.appointments
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own appointments" ON public.appointments
FOR DELETE TO authenticated USING (auth.uid() = user_id);