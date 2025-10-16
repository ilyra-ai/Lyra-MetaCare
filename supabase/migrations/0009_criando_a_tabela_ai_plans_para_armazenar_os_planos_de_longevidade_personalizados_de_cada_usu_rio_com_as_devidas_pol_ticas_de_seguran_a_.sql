-- Create the table to store AI-generated plans
CREATE TABLE public.ai_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (REQUIRED)
ALTER TABLE public.ai_plans ENABLE ROW LEVEL SECURITY;

-- Create policies to ensure users can only access their own plans
CREATE POLICY "Users can view their own AI plans"
ON public.ai_plans FOR SELECT
TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI plans"
ON public.ai_plans FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI plans"
ON public.ai_plans FOR UPDATE
TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI plans"
ON public.ai_plans FOR DELETE
TO authenticated USING (auth.uid() = user_id);