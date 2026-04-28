// src/utils/secureMedia.ts
import { supabase } from '../services/supabase';
import RNFS from 'react-native-fs';
import base64js from 'base64-js';

// ─── Constants ───────────────────────────────────────────────────────────────
const SIGNED_URL_EXPIRY_SECONDS = 43200; // 12 hours
const CACHE_EXPIRY_MS = 12 * 60 * 60 * 1000; // 12 hours in ms
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const isVideoUrl = (url: string): boolean => {
  return /\.(mp4|mov|avi|webm)(\?.*)?$/i.test(url);
};

export const isSupabaseUrl = (url: string): boolean => {
  return url.includes('supabase.co') || url.includes('supabase.in');
};

export const isLocalUri = (url: string): boolean => {
  return url.startsWith('file://') || url.startsWith('content://');
};

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

const isCacheExpired = async (filePath: string): Promise<boolean> => {
  try {
    const stat = await RNFS.stat(filePath);
    const fileAgeMs = Date.now() - new Date(stat.mtime).getTime();
    return fileAgeMs > CACHE_EXPIRY_MS;
  } catch {
    return true;
  }
};

export const extractSupabasePath = (
  mediaUrl: string,
): { bucketName: string; filePath: string } | null => {
  try {
    const urlParts = mediaUrl.split('/storage/v1/object/');
    if (urlParts.length < 2) return null;

    const pathPart = urlParts[1]
      .replace('public/', '')
      .replace('authenticated/', '');

    const [bucketName, ...filePathParts] = pathPart.split('/');
    const filePath = filePathParts.join('/');

    if (!bucketName || !filePath) return null;

    return { bucketName, filePath };
  } catch {
    return null;
  }
};

// ─── Session ─────────────────────────────────────────────────────────────────

const getAccessToken = async (): Promise<string | null> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
};

// ─── Retry Wrapper ────────────────────────────────────────────────────────────

const withRetry = async <T>(
  fn: () => Promise<T>,
  attempts: number = MAX_RETRY_ATTEMPTS,
): Promise<T> => {
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) {
        await sleep(RETRY_DELAY_MS * (i + 1));
      }
    }
  }

  throw lastError;
};

// ─── Secure Image ─────────────────────────────────────────────────────────────

export const getSecureImageUri = async (mediaUrl: string): Promise<string> => {
  try {
    if (isLocalUri(mediaUrl)) return mediaUrl;
    if (!isSupabaseUrl(mediaUrl)) return mediaUrl;

    const token = await getAccessToken();
    if (!token) return mediaUrl;

    const paths = extractSupabasePath(mediaUrl);
    if (!paths) return mediaUrl;

    return await withRetry(async () => {
      const fileName = paths.filePath.split('/').pop() || 'image.jpg';
      const localPath = `${RNFS.CachesDirectoryPath}/img_${fileName}`;

      // Check cache first
      const exists = await RNFS.exists(localPath);
      const expired = exists ? await isCacheExpired(localPath) : true;

      if (exists && !expired) {
        return `file://${localPath}`;
      }

      // Delete expired cache
      if (exists && expired) {
        await RNFS.unlink(localPath);
      }

      // Download from Supabase storage
      const { data, error } = await supabase.storage
        .from(paths.bucketName)
        .download(paths.filePath);

      if (error || !data) {
        throw new Error(error?.message || 'Download failed');
      }

      // ✅ React Native safe conversion (no FileReader, no btoa)
      const arrayBuffer = await new Response(data).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64 = base64js.fromByteArray(uint8Array);

      // Write to cache
      await RNFS.writeFile(localPath, base64, 'base64');

      return `file://${localPath}`;
    });
  } catch (error) {
    return mediaUrl;
  }
};

// ─── Secure Video ─────────────────────────────────────────────────────────────

export const getSecureVideoUri = async (mediaUrl: string): Promise<string> => {
  try {
    if (isLocalUri(mediaUrl)) return mediaUrl;
    if (!isSupabaseUrl(mediaUrl)) return mediaUrl;

    const token = await getAccessToken();
    if (!token) return mediaUrl;

    const paths = extractSupabasePath(mediaUrl);
    if (!paths) return mediaUrl;

    const fileName = paths.filePath.split('/').pop() || 'video.mp4';
    const cacheKey = `vid_${fileName}`;
    const localPath = `${RNFS.CachesDirectoryPath}/${cacheKey}`;

    // Check cache + expiry
    const exists = await RNFS.exists(localPath);
    const expired = exists ? await isCacheExpired(localPath) : true;

    if (exists && !expired) {
      return `file://${localPath}`;
    }

    // Delete expired cache
    if (exists && expired) {
      await RNFS.unlink(localPath);
    }

    return await withRetry(async () => {
      // ✅ 12 hours signed URL instead of 1 hour
      const { data: signedData, error: signedError } = await supabase.storage
        .from(paths.bucketName)
        .createSignedUrl(paths.filePath, SIGNED_URL_EXPIRY_SECONDS);

      if (signedError || !signedData?.signedUrl) {
        throw new Error(signedError?.message || 'Signed URL failed');
      }

      const result = await RNFS.downloadFile({
        fromUrl: signedData.signedUrl,
        toFile: localPath,
        background: true,
        discretionary: true,
      }).promise;

      if (result.statusCode !== 200) {
        throw new Error(`Download failed with status: ${result.statusCode}`);
      }

      return `file://${localPath}`;
    });
  } catch (error) {
    return mediaUrl;
  }
};

// ─── Cache Management ─────────────────────────────────────────────────────────

export const clearMediaCache = async (): Promise<void> => {
  try {
    const files = await RNFS.readDir(RNFS.CachesDirectoryPath);
    const mediaFiles = files.filter(
      f => f.name.startsWith('img_') || f.name.startsWith('vid_'),
    );
    await Promise.all(mediaFiles.map(f => RNFS.unlink(f.path)));
  } catch (error) {
    console.error('❌ clearMediaCache error:', error);
  }
};

export const getMediaCacheSize = async (): Promise<string> => {
  try {
    const files = await RNFS.readDir(RNFS.CachesDirectoryPath);
    const mediaFiles = files.filter(
      f => f.name.startsWith('img_') || f.name.startsWith('vid_'),
    );
    const totalBytes = mediaFiles.reduce((sum, f) => sum + Number(f.size), 0);
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
    return `${totalMB} MB`;
  } catch {
    return '0 MB';
  }
};