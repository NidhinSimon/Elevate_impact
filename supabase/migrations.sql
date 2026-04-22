-- 1. Create verification_status enum
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Create payout_status enum
CREATE TYPE payout_status AS ENUM ('pending', 'paid');

-- 3. Create winner_verifications table
CREATE TABLE IF NOT EXISTS winner_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  draw_id TEXT NOT NULL,
  proof_url TEXT NOT NULL,
  status verification_status DEFAULT 'pending',
  payout_status payout_status DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT
);

-- 4. Add payout_status to winnings table
-- Assuming winnings table already exists
ALTER TABLE winnings ADD COLUMN IF NOT EXISTS payout_status payout_status DEFAULT 'pending';

-- 5. Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id), -- Nullable for guest
  charity_id INTEGER REFERENCES charities(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  donated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Add draw_mode to prize_pools table
ALTER TABLE prize_pools ADD COLUMN IF NOT EXISTS draw_mode TEXT DEFAULT 'random';

-- 7. Add RLS policies (Optional but recommended)
ALTER TABLE winner_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own verifications" ON winner_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own verifications" ON winner_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all verifications" ON winner_verifications FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update verifications" ON winner_verifications FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own donations" ON donations FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins can view all donations" ON donations FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
