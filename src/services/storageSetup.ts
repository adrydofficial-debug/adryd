import { supabase } from './supabase';

/**
 * Check if the avatars bucket exists and create it if it doesn't
 */
export async function ensureAvatarsBucket(): Promise<boolean> {
  try {
    console.log('🔍 Checking if avatars bucket exists...');
    
    // Try to list files in the bucket to check if it exists
    const { data, error } = await supabase.storage
      .from('avatars')
      .list('', { limit: 1 });

    if (error) {
      console.log('❌ Bucket does not exist or access denied:', error.message);
      
      // Try to create the bucket
      console.log('📦 Creating avatars bucket...');
      const { data: createData, error: createError } = await supabase.storage
        .createBucket('avatars', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          fileSizeLimit: 5242880, // 5MB
        });

      if (createError) {
        console.error('❌ Failed to create bucket:', createError);
        return false;
      }

      console.log('✅ Bucket created successfully:', createData);
      return true;
    }

    console.log('✅ Bucket exists and is accessible');
    return true;
  } catch (error) {
    console.error('💥 Error checking bucket:', error);
    return false;
  }
}

/**
 * Test Supabase Storage connectivity
 */
export async function testStorageConnectivity(): Promise<boolean> {
  try {
    console.log('🧪 Testing Supabase Storage connectivity...');
    
    // Try to get storage info
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Storage connectivity test failed:', error);
      return false;
    }

    console.log('✅ Storage connectivity test passed, buckets:', data);
    return true;
  } catch (error) {
    console.error('💥 Storage connectivity test error:', error);
    return false;
  }
}












