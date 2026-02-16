-- Mentors table: links auth users (profiles) who are mentors, with optional mentor-specific fields
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

-- Anyone can read mentors (to show mentor list)
CREATE POLICY "Anyone can view mentors" ON mentors
  FOR SELECT USING (true);

-- Only the user can update their own mentor row (e.g. is_available, last_seen)
CREATE POLICY "Mentors can update own row" ON mentors
  FOR UPDATE USING (auth.uid() = user_id);

-- Only authenticated users can insert themselves as mentor (or admin; for now allow insert for own user_id)
CREATE POLICY "Users can register as mentor" ON mentors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ensure profiles has last_seen for "active" indicator (already added in previous migration; add if missing)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen timestamptz DEFAULT now();

-- Seed: make these two profiles mentors by email (2023bcs001@axiscolleges.in, 2023bcs014@axiscolleges.in)
INSERT INTO mentors (user_id, rating, bio, skills, is_available, response_time)
SELECT p.user_id, 4.8, COALESCE(p.bio, 'Mentor from Studex.'), ARRAY['General']::text[], true, 'Within 24 hours'
FROM profiles p
WHERE p.email IN ('2023bcs001@axiscolleges.in', '2023bcs014@axiscolleges.in')
ON CONFLICT (user_id) DO NOTHING;
