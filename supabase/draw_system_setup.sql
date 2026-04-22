-- Create scores table for user performance logs
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Clean up old config tables to ensure new schema applies
DROP TABLE IF EXISTS public.draw_config CASCADE;
DROP TABLE IF EXISTS public.prize_pools CASCADE;

-- Create draw_config table for global draw settings
CREATE TABLE public.draw_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_mode TEXT DEFAULT 'random', -- 'random' or 'algorithmic'
  contribution_per_subscriber NUMERIC DEFAULT 49.00,
  jackpot_rollover NUMERIC DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create prize_pools table for historical draw records
CREATE TABLE public.prize_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id TEXT, -- Logical ID like DRAW-123456
  total_pool NUMERIC NOT NULL,
  jackpot_amount NUMERIC NOT NULL,
  winning_numbers INTEGER[] NOT NULL,
  draw_mode TEXT NOT NULL,
  is_rollover BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create winnings table for individual user prizes
CREATE TABLE IF NOT EXISTS public.winnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  draw_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  match_count INTEGER NOT NULL,
  tier TEXT NOT NULL, -- 'jackpot', 'tier2', 'tier3'
  payout_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'paid'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert initial draw configuration
INSERT INTO public.draw_config (draw_mode, contribution_per_subscriber, jackpot_rollover)
VALUES ('random', 49.00, 0.00)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winnings ENABLE ROW LEVEL SECURITY;

-- 1. Policies for draw_config
DROP POLICY IF EXISTS "Admins can do everything on draw_config" ON public.draw_config;
DROP POLICY IF EXISTS "Everyone can read draw_config" ON public.draw_config;
CREATE POLICY "Admins can do everything on draw_config" ON public.draw_config 
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Everyone can read draw_config" ON public.draw_config FOR SELECT USING (true);

-- 2. Policies for prize_pools
DROP POLICY IF EXISTS "Admins can do everything on prize_pools" ON public.prize_pools;
DROP POLICY IF EXISTS "Everyone can read prize_pools" ON public.prize_pools;
CREATE POLICY "Admins can do everything on prize_pools" ON public.prize_pools 
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Everyone can read prize_pools" ON public.prize_pools FOR SELECT USING (true);

-- 3. Policies for winnings
DROP POLICY IF EXISTS "Users can read their own winnings" ON public.winnings;
DROP POLICY IF EXISTS "Admins can do everything on winnings" ON public.winnings;
CREATE POLICY "Users can read their own winnings" ON public.winnings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can do everything on winnings" ON public.winnings 
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. Policies for scores
DROP POLICY IF EXISTS "Users can manage their own scores" ON public.scores;
DROP POLICY IF EXISTS "Admins can read all scores" ON public.scores;
CREATE POLICY "Users can manage their own scores" ON public.scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all scores" ON public.scores 
  FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ==========================================
-- CLIENT DELIVERY HELPER
-- ==========================================
-- Run this in the Supabase SQL Editor to ensure your user is an Admin
-- UPDATE public.profiles SET role = 'admin' WHERE id = auth.uid();
