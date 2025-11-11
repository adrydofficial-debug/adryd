import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { toByteArray } from 'react-native-quick-base64';

export async function uploadToSignedUrl(
  signedUrl: string,
  file: { uri: string; type: string; name: string },
): Promise<void> {
  console.log('🟢 [uploadToSignedUrl] Function called');
  console.log('🟢 [uploadToSignedUrl] Signed URL:', signedUrl);
  console.log('🟢 [uploadToSignedUrl] File info:', {
    name: file.name,
    type: file.type,
    uri: file.uri.substring(0, 50) + '...',
  });
  
  try {
    const fileUri =
      Platform.OS === 'android' ? file.uri.replace('file://', '') : file.uri;

    console.log('📂 [uploadToSignedUrl] Platform:', Platform.OS);
    console.log('📂 [uploadToSignedUrl] Original URI:', file.uri);
    console.log('📂 [uploadToSignedUrl] Processing file URI:', fileUri);
    
    console.log('📖 [uploadToSignedUrl] Reading file from filesystem...');
    const base64Data = await RNFS.readFile(fileUri, 'base64');
    console.log('✅ [uploadToSignedUrl] File read successfully');
    console.log('📦 [uploadToSignedUrl] Base64 data length:', base64Data.length, 'characters');
    console.log('📦 [uploadToSignedUrl] Estimated file size:', Math.round(base64Data.length * 0.75), 'bytes');

    console.log('🔄 [uploadToSignedUrl] Converting base64 to binary...');
    // Decode base64 → Uint8Array
    const binary = toByteArray(base64Data);
    console.log('✅ [uploadToSignedUrl] Binary conversion complete');
    console.log('📦 [uploadToSignedUrl] Binary array length:', binary.length, 'bytes');

    console.log('🌐 [uploadToSignedUrl] Preparing fetch request...');
    console.log('🌐 [uploadToSignedUrl] Method: PUT');
    console.log('🌐 [uploadToSignedUrl] URL:', signedUrl);
    console.log('🌐 [uploadToSignedUrl] Content-Type:', file.type || 'application/octet-stream');
    console.log('🌐 [uploadToSignedUrl] Body size:', binary.length, 'bytes');
    
    console.log('📤 [uploadToSignedUrl] Sending fetch request...');
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: binary,
    });

    console.log('📥 [uploadToSignedUrl] Response received');
    console.log('📥 [uploadToSignedUrl] Response status:', uploadResponse.status);
    console.log('📥 [uploadToSignedUrl] Response statusText:', uploadResponse.statusText);
    console.log('📥 [uploadToSignedUrl] Response ok:', uploadResponse.ok);
    console.log('📥 [uploadToSignedUrl] Response headers:', JSON.stringify(Object.fromEntries(uploadResponse.headers.entries()), null, 2));

    if (!uploadResponse.ok) {
      console.error('❌ [uploadToSignedUrl] Upload failed - response not OK');
      const errText = await uploadResponse.text();
      console.error('❌ [uploadToSignedUrl] Error response text:', errText);
      const error = new Error(
        `Upload failed (${uploadResponse.status}): ${errText.slice(0, 200)}`,
      );
      console.error('❌ [uploadToSignedUrl] Throwing error:', error.message);
      throw error;
    }

    console.log('✅ [uploadToSignedUrl] File uploaded successfully!');
    console.log('✅ [uploadToSignedUrl] Response status:', uploadResponse.status);
  } catch (error: any) {
    console.error('💥 [uploadToSignedUrl] Error caught in uploadToSignedUrl');
    console.error('💥 [uploadToSignedUrl] Error type:', error?.constructor?.name);
    console.error('💥 [uploadToSignedUrl] Error name:', error?.name);
    console.error('💥 [uploadToSignedUrl] Error message:', error?.message);
    console.error('💥 [uploadToSignedUrl] Error stack:', error?.stack);
    
    // Check if it's a network error
    if (error?.message?.includes('Network') || error?.message?.includes('network')) {
      console.error('🌐 [uploadToSignedUrl] Network error detected!');
      console.error('🌐 [uploadToSignedUrl] This could be due to:');
      console.error('   - Invalid or expired signed URL');
      console.error('   - Network connectivity issues');
      console.error('   - CORS issues');
      console.error('   - SSL/TLS certificate problems');
    }
    
    // Check if it's a file system error
    if (error?.code === 'ENOENT' || error?.message?.includes('No such file')) {
      console.error('📁 [uploadToSignedUrl] File system error - file not found');
    }
    
    throw error;
  }
}
