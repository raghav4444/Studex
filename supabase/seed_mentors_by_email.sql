-- Run this in Supabase SQL Editor to make 2023bcs001@axiscolleges.in and 2023bcs014@axiscolleges.in mentors.
-- Safe to run multiple times (ON CONFLICT DO NOTHING).

INSERT INTO mentors (user_id, rating, bio, skills, is_available, response_time)
SELECT p.user_id, 4.8, COALESCE(p.bio, 'Mentor from Studex.'), ARRAY['General']::text[], true, 'Within 24 hours'
FROM profiles p
WHERE p.email IN ('2023bcs001@axiscolleges.in', '2023bcs014@axiscolleges.in')
ON CONFLICT (user_id) DO NOTHING;
