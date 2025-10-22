import { supabase } from './supabase';
import { uploadToSignedUrl } from './uploadFile';
import { ensureAvatarsBucket, testStorageConnectivity } from './storageSetup';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

export interface UploadedImage {
  url: string;
  path: string;
  publicUrl: string;
}

/**
 * Upload an image to Supabase Storage and return the public URL
 */
export async function uploadProfileImage(
  imageUri: string,
  userId: string
): Promise<UploadedImage> {
  try {
    console.log('📸 Starting profile image upload for user:', userId);
    console.log('📸 Image URI:', imageUri);
    
    // Check if Supabase is properly configured
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = imageUri.split('.').pop() || 'jpg';
    const fileName = `profile-${userId}-${timestamp}.${fileExtension}`;
    const filePath = `avatars/${fileName}`;

    console.log('📁 File path:', filePath);

    // Prepare file for upload
    const fileUri = Platform.OS === 'android' 
      ? imageUri.replace('file://', '') 
      : imageUri;

    console.log('📂 Reading file from:', fileUri);
    
    // Check if file exists
    const fileExists = await RNFS.exists(fileUri);
    if (!fileExists) {
      throw new Error(`File does not exist: ${fileUri}`);
    }

    const base64Data = await RNFS.readFile(fileUri, 'base64');
    console.log('📦 File read successfully, size:', base64Data.length);
    
    // Convert base64 to blob
    const response = await fetch(`data:image/${fileExtension};base64,${base64Data}`);
    const blob = await response.blob();
    console.log('📦 Blob created, size:', blob.size);

    // Test storage connectivity first
    const isStorageAvailable = await testStorageConnectivity();
    if (!isStorageAvailable) {
      throw new Error('Supabase Storage is not available');
    }

    // Ensure avatars bucket exists
    const bucketExists = await ensureAvatarsBucket();
    if (!bucketExists) {
      throw new Error('Failed to create or access avatars bucket');
    }

    console.log('📤 Uploading to Supabase Storage...');
    console.log('📤 Bucket: avatars');
    console.log('📤 Path:', filePath);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        contentType: `image/${fileExtension}`,
        upsert: true, // Replace if exists
      });

    if (error) {
      console.error('❌ Upload error details:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error,
        data: error.data
      });
      throw new Error(`Upload failed: ${error.message} (Status: ${error.statusCode})`);
    }

    console.log('✅ Upload successful:', data);

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;
    console.log('🔗 Public URL:', publicUrl);

    return {
      url: publicUrl,
      path: filePath,
      publicUrl: publicUrl,
    };
  } catch (error) {
    console.error('💥 Profile image upload error:', error);
    console.error('💥 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Delete a profile image from Supabase Storage
 */
export async function deleteProfileImage(filePath: string): Promise<void> {
  try {
    console.log('🗑️ Deleting profile image:', filePath);
    
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) {
      console.error('❌ Delete error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }

    console.log('✅ Image deleted successfully');
  } catch (error) {
    console.error('💥 Delete profile image error:', error);
    throw error;
  }
}

/**
 * Check if a URL is a local file URI
 */
export function isLocalFileUri(uri: string): boolean {
  return uri.startsWith('file://') || uri.startsWith('content://');
}

/**
 * Check if a URL is a Supabase Storage URL
 */
export function isSupabaseStorageUrl(uri: string): boolean {
  return uri.includes('supabase') && uri.includes('storage');
}
