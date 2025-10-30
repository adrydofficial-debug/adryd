import { supabase } from './supabase';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

export interface UploadedImage {
  url: string;
  path: string;
  publicUrl: string;
}

/**
 * Convert image to base64 and store in user metadata as fallback
 * This is a temporary solution until Supabase Storage is properly configured
 */
export async function uploadProfileImageFallback(
  imageUri: string,
  userId: string
): Promise<UploadedImage> {
  try {
    console.log('📸 Starting profile image upload (fallback method) for user:', userId);
    console.log('📸 Image URI:', imageUri);
    
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
    
    // Create data URL
    const fileExtension = imageUri.split('.').pop() || 'jpg';
    const dataUrl = `data:image/${fileExtension};base64,${base64Data}`;
    
    console.log('📤 Storing as base64 in user metadata...');
    
    // Get current user
    const { data: currentUser, error: getUserError } = await supabase.auth.getUser();
    if (getUserError || !currentUser.user) {
      throw new Error('User not authenticated');
    }

    // Update user metadata with base64 image
    const currentMetaData = currentUser.user.user_metadata || {};
    const updatedMetaData = {
      ...currentMetaData,
      avatar_url: dataUrl,
    };

    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      data: updatedMetaData
    });

    if (updateError) {
      console.error('❌ Update error:', updateError);
      throw new Error(`Update failed: ${updateError.message}`);
    }

    console.log('✅ Image stored in user metadata successfully');

    return {
      url: dataUrl,
      path: 'user_metadata',
      publicUrl: dataUrl,
    };
  } catch (error) {
    console.error('💥 Profile image upload (fallback) error:', error);
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
 * Check if a URL is a data URL (base64)
 */
export function isDataUrl(uri: string): boolean {
  return uri.startsWith('data:image/');
}




