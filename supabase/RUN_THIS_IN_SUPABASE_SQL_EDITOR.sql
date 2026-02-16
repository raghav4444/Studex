-- =============================================================================
-- RUN THIS IN SUPABASE: SQL Editor → New query → Paste all → Run
-- This creates the mentors table and adds 2023bcs001@axiscolleges.in and
-- 2023bcs014@axiscolleges.in as mentors.
-- =============================================================================

-- 1. Create mentors table
CREATE TABLE IF NOT EXISTS mentors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating numeric(2,1) DEFAULT 4.5,
  bio text,
  skills text[] DEFAULT '{}',
  is_available boolean DEFAULT true,
  experience text[] DEFAULT '{}',
  achievements text[] DEFAULT '{}',
  response_time text DEFAULT 'Within 24 hours',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_mentors_user_id ON mentors(user_id);
CREATE INDEX IF NOT EXISTS idx_mentors_is_available ON mentors(is_available);

ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;

-- 2. Policies (drop first if re-running to avoid "already exists")
DROP POLICY IF EXISTS "Anyone can view mentors" ON mentors;
DROP POLICY IF EXISTS "Mentors can update own row" ON mentors;
DROP POLICY IF EXISTS "Users can register as mentor" ON mentors;

CREATE POLICY "Anyone can view mentors" ON mentors
  FOR SELECT USING (true);

CREATE POLICY "Mentors can update own row" ON mentors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can register as mentor" ON mentors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Ensure profiles has last_seen (for "Active now" / "Away")
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen timestamptz DEFAULT now();

-- 4. Add the two profiles as mentors (by email)
INSERT INTO mentors (user_id, rating, bio, skills, is_available, response_time)
SELECT p.user_id, 4.8, COALESCE(p.bio, 'Mentor from Studex.'), ARRAY['General']::text[], true, 'Within 24 hours'
FROM profiles p
WHERE p.email IN ('2023bcs001@axiscolleges.in', '2023bcs014@axiscolleges.in')
ON CONFLICT (user_id) DO NOTHING;
