-- Setup Supabase Storage bucket for chat files
-- Run this in your Supabase Dashboard SQL Editor

-- Create the chat-files bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-files',
  'chat-files',
  true, -- Make it public so files can be accessed via URL
  10485760, -- 10MB file size limit
  ARRAY[
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
);

-- Create storage policies for the bucket
CREATE POLICY "Users can upload files to their conversation folders" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-files' AND 
  auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can view files in conversations they participate in" ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat-files' AND (
    -- User can view files in conversations they participate in
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.user_id = auth.uid()::text
      AND cp.conversation_id::text = (storage.foldername(name))[2]
    )
  )
);

CREATE POLICY "Users can delete their own uploaded files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'chat-files' AND 
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Note: The folder structure will be: conversation_{conversation_id}/{filename}
-- This allows files to be organized by conversation and ensures proper access control
