import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { launchImageLibrary, ImageLibraryOptions, Asset } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

interface ProfileUserProps {
  firstName?: string;
  lastName?: string;
  avatarUri?: string;
  onImageSelected?: (imageUri: string) => void;
  containerStyle?: any;
}

const ProfileUser: React.FC<ProfileUserProps> = ({
  firstName = '',
  lastName = '',
  avatarUri,
  onImageSelected,
  containerStyle,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(avatarUri || null);

  const getInitials = (first: string, last: string): string => {
    const firstInitial = first.charAt(0).toUpperCase();
    const lastInitial = last.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };

  const pickImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const asset: Asset = response.assets[0];
        if (asset.uri) {
          setSelectedImage(asset.uri);
          onImageSelected?.(asset.uri);
        }
      }
    });
  };

  const initials = getInitials(firstName, lastName);
  const displayName = `${firstName} ${lastName}`.trim() || 'Your Name';

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
              <Image source={{ uri: selectedImage }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={pickImage} 
          activeOpacity={0.8} 
          style={styles.cameraBadge}
        >
          <View style={styles.cameraCircle}>
            <Ionicons name="camera" size={16} color="#fff" />
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
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
