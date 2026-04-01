// src/components/SecureVideo.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Video, { OnLoadData, OnProgressData } from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getSecureVideoUri, isLocalUri } from '../utils/secureMedia';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SecureVideoProps {
  uri: string;
  style?: any;
  paused?: boolean;
  controls?: boolean;
  muted?: boolean;
  resizeMode?: 'cover' | 'contain' | 'stretch';
  showRetry?: boolean;
  onLoadSuccess?: () => void;
  onLoadError?: (error: string) => void;
  onProgress?: (progress: OnProgressData) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const SecureVideo: React.FC<SecureVideoProps> = ({
  uri,
  style,
  paused = true,
  controls = false,
  muted = true,
  resizeMode = 'cover',
  showRetry = true,
  onLoadSuccess,
  onLoadError,
  onProgress,
}) => {
  const [secureUri, setSecureUri] = useState<string | null>(
    isLocalUri(uri) ? uri : null,
  );
  const [loading, setLoading] = useState(!isLocalUri(uri));
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [videoLoading, setVideoLoading] = useState(true); // video buffering state
  const mountedRef = useRef(true);

  const MAX_RETRIES = 3;

  // ─── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!uri) return;

    // Local URI — use directly
    if (isLocalUri(uri)) {
      setSecureUri(uri);
      setLoading(false);
      return;
    }

    let mounted = true;

    const load = async () => {
      try {
        if (mounted) {
          setLoading(true);
          setError(false);
          setVideoLoading(true);
        }

        const result = await getSecureVideoUri(uri);

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

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleRetry = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      setError(false);
      setSecureUri(null);
      setRetryCount(prev => prev + 1);
    }
  }, [retryCount]);

  const handleVideoLoad = useCallback(
    (_data: OnLoadData) => {
      setVideoLoading(false);
      onLoadSuccess?.();
    },
    [onLoadSuccess],
  );

  const handleVideoError = useCallback(
    (e: any) => {
      setVideoLoading(false);
      setError(true);
      onLoadError?.(e?.error?.errorString || 'Video playback failed');
    },
    [onLoadError],
  );

  const handleProgress = useCallback(
    (data: OnProgressData) => {
      onProgress?.(data);
    },
    [onProgress],
  );

  // ─── Loading State (fetching secure URI) ─────────────────────────────────────

  if (loading) {
    return (
      <View style={[style, styles.center, styles.loadingContainer]}>
        <ActivityIndicator size="small" color="#C539A5" />
        <Text style={styles.loadingText}>Loading video...</Text>
      </View>
    );
  }

  // ─── Error State ─────────────────────────────────────────────────────────────

  if (error || !secureUri) {
    return (
      <View style={[style, styles.center, styles.errorContainer]}>
        <Ionicons name="videocam-off-outline" size={32} color="#9CA3AF" />
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
          <Text style={styles.failedText}>Failed to load video</Text>
        )}
      </View>
    );
  }

  // ─── Success State ───────────────────────────────────────────────────────────

  return (
    <View style={style}>
      <Video
        source={{ uri: secureUri }}
        style={StyleSheet.absoluteFill}
        resizeMode={resizeMode}
        paused={paused}
        controls={controls}
        muted={muted}
        onLoad={handleVideoLoad}
        onError={handleVideoError}
        onProgress={handleProgress}
        repeat={false}
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch="ignore"
      />

      {/* Video buffering overlay */}
      {videoLoading && (
        <View style={[StyleSheet.absoluteFill, styles.center, styles.bufferingOverlay]}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.bufferingText}>Buffering...</Text>
        </View>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#000000',
    gap: 8,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#1a1a1a',
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
  bufferingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    gap: 6,
  },
  bufferingText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
});

export default SecureVideo;