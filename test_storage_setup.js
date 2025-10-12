// Test script to verify Supabase Storage setup
// Run this in your browser console after setting up the storage bucket

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorageSetup() {
  console.log('🧪 Testing Supabase Storage setup...');
  
  try {
    // Test 1: Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }
    
    const chatFilesBucket = buckets.find(bucket => bucket.id === 'chat-files');
    
    if (!chatFilesBucket) {
      console.error('❌ chat-files bucket not found! Please run setup_storage_bucket.sql');
      return;
    }
    
    console.log('✅ chat-files bucket found:', chatFilesBucket);
    
    // Test 2: Try to upload a test file
    const testFile = new File(['Hello World!'], 'test.txt', { type: 'text/plain' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('chat-files')
      .upload('test-conversation/test.txt', testFile);
    
    if (uploadError) {
      console.error('❌ Error uploading test file:', uploadError);
      return;
    }
    
    console.log('✅ Test file uploaded successfully:', uploadData);
    
    // Test 3: Try to get public URL
    const { data: urlData } = supabase.storage
      .from('chat-files')
      .getPublicUrl(uploadData.path);
    
    console.log('✅ Public URL generated:', urlData.publicUrl);
    
    // Test 4: Clean up test file
    const { error: deleteError } = await supabase.storage
      .from('chat-files')
      .remove([uploadData.path]);
    
    if (deleteError) {
      console.warn('⚠️ Error deleting test file:', deleteError);
    } else {
      console.log('✅ Test file cleaned up successfully');
    }
    
    console.log('🎉 Storage setup test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testStorageSetup();
