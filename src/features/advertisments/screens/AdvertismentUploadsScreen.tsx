import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import {
  ImagePickerResponse,
  launchImageLibrary,
  MediaType,
} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomButton from '../../../components/CustomButton';
import { useUploadAdvertisementFiles } from '../hooks/hooks';

// Types for navigation
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
type RootStackParamList = {
  CompaignUploadConfirmation: undefined;
  [key: string]: any;
};
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

let DocumentPicker: any;
try {
  DocumentPicker = require('@react-native-documents/picker');
  if (DocumentPicker.default) {
    DocumentPicker = DocumentPicker.default;
  }
} catch (error) {
  console.error('Failed to import DocumentPicker:', error);
  DocumentPicker = null;
}

if (!DocumentPicker) {
  try {
    const {
      DocumentPicker: AltDocumentPicker,
    } = require('@react-native-documents/picker');
    DocumentPicker = AltDocumentPicker;
  } catch (altError) {
    console.error('Alternative DocumentPicker import failed:', altError);
  }
}

const isDocumentPickerAvailable = (): boolean => {
  return DocumentPicker && typeof DocumentPicker.pick === 'function';
};

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface FileItem {
  id: number;
  uri: string;
  name: string;
  type: string;
  size: number;
  progress: number;
  isImage?: boolean;
  isVideo?: boolean;
}

interface Props {
  navigation: any;
  route: { params?: { uploadUrl?: string } };
}

const CampaignUploadFiles: React.FC<Props> = ({ navigation, route }) => {
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const uploadUrl = route?.params;

  const { mutateAsync: uploadFiles, isPending } = useUploadAdvertisementFiles();

  React.useEffect(() => {
    console.log('🔍 [CampaignUploadFiles] Params received:', route?.params);
    if (uploadUrl) {
      console.log('✅ Upload URL:', uploadUrl);
    } else {
      console.warn('⚠️ No upload URL or ID received in route params');
    }
  }, [route?.params, uploadUrl]);

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        ]);
        return Object.values(granted).every(
          p => p === PermissionsAndroid.RESULTS.GRANTED,
        );
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to storage to select files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  };

  const openImageVideoPicker = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Storage permission is required to select images and videos.',
      );
      return;
    }

    const options = {
      mediaType: 'mixed' as MediaType,
      includeBase64: false,
      selectionLimit: 10,
      quality: 0.8 as const,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) return;

      if (response.assets?.length) {
        const newFiles = response.assets
          .map((asset, index) => {
            if (!asset.uri) return null;
            const fileSize = asset.fileSize || 0;
            const maxSize = 25 * 1024 * 1024;
            if (fileSize > maxSize) {
              Alert.alert(
                'File Too Large',
                `File "${asset.fileName}" exceeds 25MB.`,
              );
              return null;
            }
            return {
              id: Date.now() + index,
              uri: asset.uri,
              name: asset.fileName || `file_${index}`,
              type: asset.type || 'unknown',
              size: fileSize,
              progress: 100,
              isImage: asset.type?.startsWith('image/'),
              isVideo: asset.type?.startsWith('video/'),
            };
          })
          .filter((f): f is FileItem => f !== null);
        if (newFiles.length) setSelectedFiles(prev => [...prev, ...newFiles]);
      }
    });
  };

  const removeFile = (fileId: number) =>
    setSelectedFiles(files => files.filter(f => f.id !== fileId));

  const onDragHandler = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) setIsDragOver(true);
    else if (
      event.nativeEvent.state === State.END ||
      event.nativeEvent.state === State.CANCELLED
    )
      setIsDragOver(false);
  };

  const onDropHandler = () => {
    setIsDragOver(false);
    openImageVideoPicker();
  };

  const renderProgressStep = (
    stepNumber: number,
    isActive: boolean,
    isCompleted: boolean,
  ) => (
    <View style={styles.progressStepContainer}>
      <View
        style={[
          styles.progressStep,
          isActive && styles.activeStep,
          isCompleted && styles.completedStep,
        ]}
      >
        <Text
          style={[
            styles.progressStepText,
            (isActive || isCompleted) && styles.completedStepText,
          ]}
        >
          {stepNumber}
        </Text>
      </View>
      {stepNumber < 3 && (
        <View
          style={[styles.progressLine, isActive && styles.activeProgressLine]}
        />
      )}
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#FFF4FD', '#fef3f9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <StatusBar backgroundColor="#FFF4FD" barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={wp(6)} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Campaign Detail</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.progressContainer}>
          {renderProgressStep(1, false, true)}
          {renderProgressStep(2, true, false)}
          {renderProgressStep(3, false, false)}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            <View style={styles.uploadSection}>
              <PanGestureHandler
                onHandlerStateChange={onDragHandler}
                onGestureEvent={onDragHandler}
                onEnded={onDropHandler}
              >
                <TouchableOpacity
                  style={[
                    styles.uploadContainer,
                    isDragOver && styles.uploadContainerDragOver,
                  ]}
                  onPress={openImageVideoPicker}
                >
                  <Ionicons
                    name="cloud-upload-outline"
                    size={width * 0.08}
                    color={isDragOver ? '#FF6B9D' : '#C539A5'}
                  />
                  <Text
                    style={[
                      styles.uploadText,
                      isDragOver && styles.uploadTextDragOver,
                    ]}
                  >
                    {isDragOver ? 'Drop files here' : 'Drag & drop files or '}
                    {!isDragOver && (
                      <Text style={styles.browseText}>Browse</Text>
                    )}
                  </Text>
                  <Text style={styles.fileTypesText}>Images & Videos</Text>
                  <Text style={styles.fileSizeText}>Max file size: 25 MB</Text>
                </TouchableOpacity>
              </PanGestureHandler>
            </View>

            {selectedFiles.length > 0 && (
              <View style={styles.statusSection}>
                <Text style={styles.statusText}>
                  {isUploading ? 'Uploading' : 'Ready to Upload'} -{' '}
                  {selectedFiles.length} file
                  {selectedFiles.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}

            {selectedFiles.length > 0 && (
              <View style={styles.filesSection}>
                {selectedFiles.map(file => (
                  <View key={file.id} style={styles.fileItem}>
                    <View style={styles.fileNameContainer}>
                      <View style={styles.fileInfo}>
                        <View style={styles.fileNameRow}>
                          <Ionicons
                            name={
                              file.isImage
                                ? 'image-outline'
                                : file.isVideo
                                ? 'videocam-outline'
                                : 'document-outline'
                            }
                            size={wp(4)}
                            color="#C539A5"
                          />
                          <Text style={styles.fileName} numberOfLines={1}>
                            {file.name}
                          </Text>
                        </View>
                        <Text style={styles.fileSize}>
                          {formatFileSize(file.size)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeFile(file.id)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={wp(5)}
                          color="#999"
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${file.progress}%` },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <CustomButton
            title={isPending ? 'UPLOADING...' : 'UPLOAD FILES'}
            disabled={isPending}
            onPress={async () => {
              if (!uploadUrl) {
                Alert.alert('Missing Upload URL', 'No upload URL provided.');
                return;
              }
              if (selectedFiles.length === 0) {
                Alert.alert('No Files', 'Please select files to upload.');
                return;
              }
              try {
                setIsUploading(true);
                const formattedFiles = selectedFiles.map(f => ({
                  uri: f.uri,
                  type: f.type,
                  name: f.name,
                }));
                await uploadFiles({ uploadUrl, files: formattedFiles });
                Alert.alert('Success', 'Files uploaded successfully!');
                navigation.navigate('CompaignUploadConfirmation');
              } catch (error: any) {
                console.error('Upload failed:', error);
                Alert.alert(
                  'Upload Failed',
                  error.message || 'Something went wrong.',
                );
              } finally {
                setIsUploading(false);
              }
            }}
            variant="primary"
            size="medium"
            buttonStyle={styles.nextButton}
          />
          {isUploading && (
            <ActivityIndicator
              size="small"
              color="#C539A5"
              style={{ marginTop: 10 }}
            />
          )}
        </View>
      </LinearGradient>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingTop: hp(5),
    paddingBottom: height * 0.03,
  },
  backButton: {
    backgroundColor: '#fff',
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: width * 0.055, fontWeight: 'bold', color: '#000' },
  headerSpacer: { width: wp(10) },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
    paddingBottom: height * 0.03,
  },
  progressStepContainer: { flexDirection: 'row', alignItems: 'center' },
  progressStep: {
    width: width * 0.08,
    height: width * 0.08,
    borderRadius: width * 0.04,
    backgroundColor: '#C12C9F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: { backgroundColor: '#C12C9F' },
  completedStep: { backgroundColor: '#4CAF50' },
  progressStepText: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: '#999',
  },
  completedStepText: { color: '#fff' },
  progressLine: {
    width: width * 0.15,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: width * 0.02,
  },
  activeProgressLine: { backgroundColor: '#C12C9F' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: width * 0.05, paddingBottom: 280 },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: width * 0.04,
    padding: width * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadSection: { marginBottom: height * 0.03 },
  uploadContainer: {
    borderWidth: 2,
    borderColor: '#FF6B9D',
    borderStyle: 'dashed',
    borderRadius: width * 0.03,
    backgroundColor: '#FFF4FD',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.15,
    marginBottom: height * 0.02,
  },
  uploadContainerDragOver: {
    borderColor: '#C539A5',
    backgroundColor: '#F8E8F5',
    borderStyle: 'solid',
  },
  uploadText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    marginBottom: height * 0.005,
  },
  uploadTextDragOver: { color: '#C539A5', fontWeight: 'bold' },
  browseText: { color: '#C539A5', fontWeight: 'bold' },
  fileTypesText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: height * 0.005,
  },
  fileSizeText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    fontWeight: '400',
  },
  statusSection: { marginBottom: hp(2) },
  statusText: { fontSize: wp(4), color: '#666', fontWeight: '500' },
  filesSection: { marginBottom: hp(2) },
  fileItem: {
    backgroundColor: '#fff',
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(1),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  fileNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  fileInfo: { flex: 1, marginRight: wp(2) },
  fileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  fileName: { fontSize: wp(4), color: '#333', fontWeight: '500', flex: 1 },
  fileSize: { fontSize: wp(3.2), color: '#666', fontWeight: '400' },
  removeButton: { padding: wp(1) },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: { height: '100%', backgroundColor: '#C539A5', borderRadius: 2 },
  buttonContainer: {
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: { width: '90%' },
});

export default CampaignUploadFiles;
