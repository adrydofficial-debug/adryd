import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  Asset,
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { isLocalFileUri, uploadProfileImage } from '../services/imageUpload';
import { uploadProfileImageFallback } from '../services/imageUploadFallback';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');

interface ProfileUserProps {
  username?: string;
  avatarUri?: string;
  onImageSelected?: (imageUri: string) => void;
  onImageUploaded?: (uploadedImage: {
    url: string;
    path: string;
    publicUrl: string;
  }) => void;
  containerStyle?: any;
}

const ProfileUser: React.FC<ProfileUserProps> = ({
  username = '',
  avatarUri,
  onImageSelected,
  onImageUploaded,
  containerStyle,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    avatarUri || null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuthStore();

  // Update selectedImage when avatarUri changes
  useEffect(() => {
    setSelectedImage(avatarUri || null);
  }, [avatarUri]);

  const getInitials = (username: string): string => {
    const firstInitial = username.charAt(0).toUpperCase();
    return firstInitial;
  };

  const requestGalleryPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      const androidVersion = Number(Platform.Version);
      if (androidVersion >= 33) return true; // Android 13+ doesn’t need this anymore

      const permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      const hasPermission = await PermissionsAndroid.check(permission);
      if (hasPermission) return true;

      const status = await PermissionsAndroid.request(permission, {
        title: 'Photo Library Access',
        message:
          'We need access to your photos to update your profile picture.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
        buttonNeutral: 'Ask Me Later',
      });

      return status === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Permission request error:', err);
      return false;
    }
  };

  const pickImage = async () => {
    const permitted = await requestGalleryPermission();
    if (!permitted) {
      Alert.alert(
        'Permission required',
        'Please allow photo access to select an image.',
      );
      return;
    }

    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    launchImageLibrary(options, async response => {
      if (response.didCancel || response.errorMessage) {
        console.warn(
          'Image picker cancelled or failed:',
          response.errorMessage,
        );
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const asset: Asset = response.assets[0];

        if (asset.uri) {
          // Update local state immediately
          setSelectedImage(asset.uri);
          onImageSelected?.(asset.uri);

          // Upload to Supabase Storage if we have a user
          if (user?.id && isLocalFileUri(asset.uri)) {
            setIsUploading(true);
            try {
              console.log('📤 Uploading profile image...');

              // Try Supabase Storage first, fallback to user metadata
              let uploadedImage;
              try {
                uploadedImage = await uploadProfileImage(asset.uri, user.id);
                console.log(
                  '✅ Profile image uploaded to Supabase Storage:',
                  uploadedImage.publicUrl,
                );
              } catch (storageError) {
                console.warn(
                  '⚠️ Supabase Storage failed, using fallback method:',
                  storageError,
                );
                uploadedImage = await uploadProfileImageFallback(
                  asset.uri,
                  user.id,
                );
                console.log(
                  '✅ Profile image stored in user metadata:',
                  uploadedImage.publicUrl,
                );
              }

              // Update with the public URL
              setSelectedImage(uploadedImage.publicUrl);
              onImageUploaded?.(uploadedImage);
            } catch (error) {
              console.error('❌ Upload failed:', error);
              Alert.alert(
                'Upload Failed',
                'Failed to upload image. Please try again.',
              );
              // Revert to local image
              setSelectedImage(asset.uri);
            } finally {
              setIsUploading(false);
            }
          }
        }
      }
    });
  };

  const initials = getInitials(username);
  const displayName = username.trim() || 'Your Username';

  return (
    <View style={[styles.headerCard, containerStyle]}>
      <View>
        <TouchableOpacity
          style={styles.avatarOuter}
          activeOpacity={0.85}
          onPress={pickImage}
        >
          <View style={styles.avatarInner}>
            {isUploading ? (
              <ActivityIndicator size="large" color="#C539A5" />
            ) : selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={pickImage}
          activeOpacity={0.8}
          style={styles.cameraBadge}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.cameraCircle}>
            <Ionicons name="camera" size={18} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.nameText}>{displayName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerCard: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  avatarOuter: {
    position: 'relative',
    marginBottom: 15,
  },
  avatarInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 47,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#C539A5',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
  },
  cameraCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C539A5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});

export default ProfileUser;
