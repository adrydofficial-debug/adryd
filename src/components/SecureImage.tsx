// src/components/SecureImage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Image,
  ActivityIndicator,
  View,
  StyleSheet,
  ImageStyle,
  TouchableOpacity,
  Text,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getSecureImageUri, isLocalUri } from '../utils/secureMedia';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SecureImageProps {
  uri: string;
  style?: ImageStyle | any;
  resizeMode?: 'cover' | 'contain' | 'stretch';
  showRetry?: boolean;       // show retry button on error (default: true)
  fallbackIcon?: string;     // ionicon name for error state (default: 'image-outline')
  onLoadSuccess?: () => void;
  onLoadError?: (error: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const SecureImage: React.FC<SecureImageProps> = ({
  uri,
  style,
  resizeMode = 'cover',
  showRetry = true,
  fallbackIcon = 'image-outline',
  onLoadSuccess,
  onLoadError,
}) => {
  const [secureUri, setSecureUri] = useState<string | null>(
    isLocalUri(uri) ? uri : null,
  );
  const [loading, setLoading] = useState(!isLocalUri(uri));
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRIES = 3;

  // ─── Load Image ─────────────────────────────────────────────────────────────

  const loadImage = useCallback(async () => {
    if (!uri) return;

    // Local URI — use directly, no need to fetch
    if (isLocalUri(uri)) {
      setSecureUri(uri);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);

      const result = await getSecureImageUri(uri);

      setSecureUri(result);
      onLoadSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(true);
      onLoadError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [uri, retryCount]);

  // ─── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!uri) return;

      if (isLocalUri(uri)) {
        if (mounted) {
          setSecureUri(uri);
          setLoading(false);
        }
        return;
      }

      try {
        if (mounted) {
          setLoading(true);
          setError(false);
        }

        const result = await getSecureImageUri(uri);

        if (mounted) {
          setSecureUri(result);
          onLoadSuccess?.();
        }
      } catch (err) {
        if (mounted) {
          const errorMessage =
            err instanceof Error ? err.message : 'Unknown error';
          setError(true);
          onLoadError?.(errorMessage);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [uri, retryCount]);

  // ─── Retry Handler ───────────────────────────────────────────────────────────

  const handleRetry = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
    }
  }, [retryCount]);

  // ─── Loading State ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[style, styles.center, styles.loadingContainer]}>
        <ActivityIndicator size="small" color="#C539A5" />
      </View>
    );
  }

  // ─── Error State ─────────────────────────────────────────────────────────────

  if (error || !secureUri) {
    return (
      <View style={[style, styles.center, styles.errorContainer]}>
        <Ionicons name={fallbackIcon} size={28} color="#9CA3AF" />
        {showRetry && retryCount < MAX_RETRIES && (
          <TouchableOpacity
            onPress={handleRetry}
            style={styles.retryButton}
            activeOpacity={0.8}>
            <Ionicons name="refresh-outline" size={14} color="#FFFFFF" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
        {retryCount >= MAX_RETRIES && (
          <Text style={styles.failedText}>Failed to load</Text>
        )}
      </View>
    );
  }

  // ─── Success State ───────────────────────────────────────────────────────────

  return (
    <Image
      source={{ uri: secureUri }}
      style={style}
      resizeMode={resizeMode}
      onError={e => {
        setError(true);
        onLoadError?.(e.nativeEvent.error);
      }}
      onLoad={() => onLoadSuccess?.()}
    />
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#F3F4F6',
  },
  errorContainer: {
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C539A5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    marginTop: 4,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  failedText: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 4,
  },
});

export default SecureImage;