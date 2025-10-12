-- Create call_invitations table for WebRTC signaling
CREATE TABLE IF NOT EXISTS call_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id TEXT NOT NULL,
  to_user_id TEXT NOT NULL,
  call_type TEXT NOT NULL CHECK (call_type IN ('audio', 'video')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'ended')),
  offer JSONB,
  answer JSONB,
  ice_candidates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_call_invitations_to_user_id ON call_invitations(to_user_id);
CREATE INDEX IF NOT EXISTS idx_call_invitations_from_user_id ON call_invitations(from_user_id);
CREATE INDEX IF NOT EXISTS idx_call_invitations_status ON call_invitations(status);

-- Add RLS (Row Level Security)
ALTER TABLE call_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own call invitations" ON call_invitations
  FOR SELECT USING (
    from_user_id = auth.uid()::text OR 
    to_user_id = auth.uid()::text
  );

CREATE POLICY "Users can insert call invitations" ON call_invitations
  FOR INSERT WITH CHECK (from_user_id = auth.uid()::text);

CREATE POLICY "Users can update their own call invitations" ON call_invitations
  FOR UPDATE USING (
    from_user_id = auth.uid()::text OR 
    to_user_id = auth.uid()::text
  );

CREATE POLICY "Users can delete their own call invitations" ON call_invitations
  FOR DELETE USING (
    from_user_id = auth.uid()::text OR 
    to_user_id = auth.uid()::text
  );

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_call_invitations_updated_at 
  BEFORE UPDATE ON call_invitations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
-- INSERT INTO call_invitations (from_user_id, to_user_id, call_type, status) 
-- VALUES 
--   ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'audio', 'pending'),
--   ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'video', 'pending');
