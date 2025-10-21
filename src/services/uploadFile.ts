import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { toByteArray } from 'react-native-quick-base64';

export async function uploadToSignedUrl(
  signedUrl: string,
  file: { uri: string; type: string; name: string },
): Promise<void> {
  try {
    const fileUri =
      Platform.OS === 'android' ? file.uri.replace('file://', '') : file.uri;

    console.log('📂 Reading file from:', fileUri);
    const base64Data = await RNFS.readFile(fileUri, 'base64');
    console.log('📦 File read, bytes:', base64Data.length);

    // Decode base64 → Uint8Array
    const binary = toByteArray(base64Data);

    console.log('📤 Uploading...');
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: binary,
    });

    if (!uploadResponse.ok) {
      const errText = await uploadResponse.text();
      throw new Error(
        `Upload failed (${uploadResponse.status}): ${errText.slice(0, 200)}`,
      );
    }

    console.log('✅ File uploaded successfully');
  } catch (error) {
    console.error('💥 Error uploading file:', error);
    throw error;
  }
}
