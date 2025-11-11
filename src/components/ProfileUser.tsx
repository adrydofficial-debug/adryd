import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Asset,
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { isLocalFileUri } from '../services/imageUpload';
import { useAuthStore } from '../store/authStore';

interface ProfileUserProps {
  username?: string;
  avatarUri?: string;
  onImageSelected?: (image: { uri: string; name: string; type: string }) => void;
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
  containerStyle,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    avatarUri || null,
  );
  const { user } = useAuthStore();

  // Update local state when avatarUri changes
  useEffect(() => {
    setSelectedImage(avatarUri || null);
  }, [avatarUri]);

  const getInitials = (username: string): string => {
    return username.charAt(0).toUpperCase() || 'U';
  };

  const requestGalleryPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      const androidVersion = Number(Platform.Version);
      if (androidVersion >= 33) return true; // Android 13+ no need

      const permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      const hasPermission = await PermissionsAndroid.check(permission);
      if (hasPermission) return true;

      const status = await PermissionsAndroid.request(permission, {
        title: 'Photo Library Access',
        message: 'We need access to your photos to update your profile picture.',
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
        console.warn('Image picker cancelled or failed:', response.errorMessage);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const asset: Asset = response.assets[0];
        if (asset.uri) {
          const file = {
            uri: asset.uri,
            name: asset.fileName || 'avatar.jpg',
            type: asset.type || 'image/jpeg',
          };

          // Update local preview
          setSelectedImage(file.uri);

          // Notify parent (UpdateProfile) with file object
          onImageSelected?.(file);

          // Skip upload here; parent handles upload on Save
          if (user?.id && isLocalFileUri(asset.uri)) {
            return;
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
            {selectedImage ? (
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
