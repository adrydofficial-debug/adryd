import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
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
import { useTranslation } from 'react-i18next';
import { useCampaignStore } from '../../../store/campaignStore';
import { useUploadAdvertisementFiles, useAddAdvertisementMedia } from '../hooks/hooks';

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
  const { t } = useTranslation('advertisments');
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);

  const advertisementData = useCampaignStore(state => state.advertisementData);
  const setAdvertisementData = useCampaignStore(state => state.setAdvertisementData);

  // Extract params - could be direct string or nested in object
  const params = typeof route?.params === 'string' 
    ? { uploadUrl: route.params } 
    : route?.params || {};
  
  const uploadUrl = params.uploadUrl;
  const campaignId = params.campaignId ? parseInt(params.campaignId, 10) : null;
  const publicUrl = params.publicUrl;
  const flow = params.flow || 'business';

  const { mutateAsync: uploadFiles, isPending } = useUploadAdvertisementFiles();
  const { mutateAsync: addMedia, isPending: isAddingMedia } = useAddAdvertisementMedia(campaignId || 0);

  React.useEffect(() => {
    console.log('🔍 [CampaignUploadFiles] Route params received:', JSON.stringify(route?.params, null, 2));
    console.log('🔍 [CampaignUploadFiles] Extracted params:', {
      uploadUrl,
      campaignId,
      publicUrl,
    });
    if (uploadUrl) {
      console.log('✅ [CampaignUploadFiles] Upload URL is available:', uploadUrl);
    } else {
      console.warn('⚠️ [CampaignUploadFiles] No upload URL received in route params');
    }
    if (campaignId) {
      console.log('✅ [CampaignUploadFiles] Campaign ID is available:', campaignId);
    } else {
      console.warn('⚠️ [CampaignUploadFiles] No campaign ID received in route params');
    }
    if (publicUrl) {
      console.log('✅ [CampaignUploadFiles] Public URL is available:', publicUrl);
    } else {
      console.warn('⚠️ [CampaignUploadFiles] No public URL received in route params');
    }
  }, [route?.params, uploadUrl, campaignId, publicUrl]);

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
    // Prevent multiple simultaneous picker calls
    if (isPickerOpen) {
      console.log('⚠️ [CampaignUploadFiles] Picker already open, ignoring request');
      return;
    }

    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      console.warn('⚠️ [CampaignUploadFiles] Storage permission denied');
      return;
    }

    setIsPickerOpen(true);

    const options = {
      mediaType: 'mixed' as MediaType,
      includeBase64: false,
      selectionLimit: 1, // Only allow one file selection
      quality: 0.8 as const,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      // Reset picker flag after response
      setIsPickerOpen(false);

      // Handle cancellation
      if (response.didCancel) {
        console.log('ℹ️ [CampaignUploadFiles] User cancelled file selection');
        return;
      }

      // Handle errors
      if (response.errorMessage) {
        console.error('❌ [CampaignUploadFiles] Picker error:', response.errorMessage);
        return;
      }

      // Handle successful selection
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0]; // Only process the first asset (selectionLimit: 1)
        
        if (!asset.uri) {
          console.warn('⚠️ [CampaignUploadFiles] Selected asset has no URI');
          return;
        }

        const fileSize = asset.fileSize || 0;
        const maxSize = 25 * 1024 * 1024;
        
        if (fileSize > maxSize) {
          console.warn(`⚠️ [CampaignUploadFiles] File "${asset.fileName || 'selected file'}" exceeds 25MB`);
          return;
        }

        // Better detection of image/video type
        const assetType = asset.type || '';
        const fileName = asset.fileName || asset.uri || '';
        const fileExtension = fileName.toLowerCase().split('.').pop() || '';
        
        const isImage = 
          assetType.startsWith('image/') ||
          ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic', 'heif'].includes(fileExtension);
        
        const isVideo = 
          assetType.startsWith('video/') ||
          ['mp4', 'mov', 'avi', 'mkv', 'webm', '3gp', 'm4v'].includes(fileExtension);

        const newFile: FileItem = {
          id: Date.now(),
          uri: asset.uri,
          name: asset.fileName || `file_${Date.now()}`,
          type: assetType || 'unknown',
          size: fileSize,
          progress: 100,
          isImage: isImage,
          isVideo: isVideo,
        };

        console.log('✅ [CampaignUploadFiles] File selected:', {
          name: newFile.name,
          type: newFile.type,
          isImage: newFile.isImage,
          isVideo: newFile.isVideo,
          uri: newFile.uri.substring(0, 50) + '...',
        });

        // Replace existing files with the new one (only one file allowed)
        setSelectedFiles([newFile]);

        if (advertisementData) {
          setAdvertisementData({
            ...advertisementData,
            previewImage: newFile.isVideo ? advertisementData.previewImage : newFile.uri,
            mediaUri: newFile.uri,
            mediaType: newFile.type || (newFile.isVideo ? 'video/*' : 'image/*'),
            isVideo: !!newFile.isVideo,
          });
        } else {
          console.warn(
            '⚠️ [CampaignUploadFiles] advertisementData missing in store; media preview not saved',
          );
        }
      } else {
        console.warn('⚠️ [CampaignUploadFiles] No assets in response');
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
    // Don't open picker if already open or if a file is already selected
    if (!isPickerOpen && selectedFiles.length === 0) {
      openImageVideoPicker();
    }
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
          <Text style={styles.headerTitle}>{t('uploadFiles.title')}</Text>
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
            {/* Show upload container only when no file is selected */}
            {selectedFiles.length === 0 && (
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
                      {isDragOver ? t('uploadFiles.dragDrop') : t('uploadFiles.dragDrop')}
                      {!isDragOver && (
                        <Text style={styles.browseText}>{t('uploadFiles.browse')}</Text>
                      )}
                    </Text>
                    <Text style={styles.fileTypesText}>{t('uploadFiles.imagesVideos')}</Text>
                    <Text style={styles.fileSizeText}>{t('uploadFiles.maxFileSize')}</Text>
                  </TouchableOpacity>
                </PanGestureHandler>
              </View>
            )}

            {selectedFiles.length > 0 && (
              <View style={styles.statusSection}>
                <Text style={styles.statusText}>
                  {isUploading ? t('uploadFiles.uploading') : t('uploadFiles.readyToUpload')} -{' '}
                  {selectedFiles.length} {selectedFiles.length > 1 ? t('uploadFiles.file') + 's' : t('uploadFiles.file')}
                </Text>
              </View>
            )}

            {selectedFiles.length > 0 && (
              <View style={styles.filesSection}>
                {selectedFiles.map(file => (
                  <View key={file.id} style={styles.fileItem}>
                    {/* Image/Video Preview */}
                    {(file.isImage || file.isVideo) && (
                      <View style={styles.previewContainer}>
                        <Image
                          source={{ uri: file.uri }}
                          style={styles.previewImage}
                          resizeMode="cover"
                        />
                        {file.isVideo && (
                          <View style={styles.videoOverlay}>
                            <Ionicons
                              name="play-circle"
                              size={wp(12)}
                              color="#FFFFFF"
                            />
                          </View>
                        )}
                        <TouchableOpacity
                          style={styles.removePreviewButton}
                          onPress={() => removeFile(file.id)}
                        >
                          <Ionicons
                            name="close-circle"
                            size={wp(6)}
                            color="#FFFFFF"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                    
                    {/* Replace File Button */}
                    <TouchableOpacity
                      style={styles.replaceButton}
                      onPress={openImageVideoPicker}
                    >
                      <Ionicons
                        name="refresh-outline"
                        size={wp(4)}
                        color="#C539A5"
                      />
                      <Text style={styles.replaceButtonText}>
                        {t('uploadFiles.replaceFile') || 'Replace File'}
                      </Text>
                    </TouchableOpacity>
                    
                    {/* File Info */}
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
                      {!file.isImage && !file.isVideo && (
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
                      )}
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
            title={
              isPending 
                ? t('uploadFiles.uploadingFiles') 
                : isAddingMedia 
                ? 'Registering media...' 
                : t('uploadFiles.uploadFiles')
            }
            disabled={isPending || isAddingMedia}
            onPress={async () => {
              console.log('🚀 [CampaignUploadFiles] Upload button clicked');
              console.log('📋 [CampaignUploadFiles] Upload URL:', uploadUrl);
              console.log('📋 [CampaignUploadFiles] Selected files count:', selectedFiles.length);
              
              if (!uploadUrl) {
                console.error('❌ [CampaignUploadFiles] No upload URL provided');
                return;
              }
              if (selectedFiles.length === 0) {
                console.error('❌ [CampaignUploadFiles] No files selected');
                return;
              }
              
              try {
                console.log('⏳ [CampaignUploadFiles] Starting upload process...');
                setIsUploading(true);
                
                const formattedFiles = selectedFiles.map(f => ({
                  uri: f.uri,
                  type: f.type,
                  name: f.name,
                }));
                
                console.log('📦 [CampaignUploadFiles] Formatted files:', JSON.stringify(formattedFiles, null, 2));
                console.log('🔗 [CampaignUploadFiles] Upload URL to use:', uploadUrl);
                console.log('📤 [CampaignUploadFiles] Calling uploadFiles mutation...');
                
                await uploadFiles({ uploadUrl, files: formattedFiles });
                
                console.log('✅ [CampaignUploadFiles] Files uploaded to storage successfully!');
                
                // After successful upload, register the media with the advertisement
                if (campaignId && publicUrl) {
                  console.log('📝 [CampaignUploadFiles] Registering media with advertisement...');
                  console.log('📝 [CampaignUploadFiles] Campaign ID:', campaignId);
                  console.log('📝 [CampaignUploadFiles] Public URL:', publicUrl);
                  
                  const mediaArray = formattedFiles.map(file => ({
                    url: publicUrl, // Use the public URL from the upload response
                    filename: file.name,
                    size: selectedFiles.find(f => f.uri === file.uri)?.size || 0,
                    type: file.type || 'image/jpeg',
                  }));
                  
                  console.log('📝 [CampaignUploadFiles] Media array to register:', JSON.stringify(mediaArray, null, 2));
                  
                  try {
                    await addMedia(mediaArray);
                    console.log('✅ [CampaignUploadFiles] Media registered successfully!');
                  } catch (mediaError: any) {
                    console.error('❌ [CampaignUploadFiles] Failed to register media:', mediaError);
                    console.error('❌ [CampaignUploadFiles] Media error details:', {
                      name: mediaError?.name,
                      message: mediaError?.message,
                      stack: mediaError?.stack,
                    });
                    // Don't throw - files are uploaded, just not registered
                    console.warn('⚠️ [CampaignUploadFiles] Files uploaded but failed to register media');
                  }
                } else {
                  console.warn('⚠️ [CampaignUploadFiles] Cannot register media - missing campaignId or publicUrl');
                  console.warn('⚠️ [CampaignUploadFiles] Campaign ID:', campaignId);
                  console.warn('⚠️ [CampaignUploadFiles] Public URL:', publicUrl);
                }
                
                console.log('✅ [CampaignUploadFiles] Upload process completed successfully!');
                if (flow === 'individual') {
                  navigation.navigate('CompanywithoutInfoScreen');
                } else {
                  navigation.navigate('CompanyWithInfoScreen', {
                    campaignId: campaignId?.toString() || '',
                  });
                }
              } catch (error: any) {
                console.error('❌ [CampaignUploadFiles] Upload failed with error:', error);
                console.error('❌ [CampaignUploadFiles] Error name:', error?.name);
                console.error('❌ [CampaignUploadFiles] Error message:', error?.message);
                console.error('❌ [CampaignUploadFiles] Error stack:', error?.stack);
                if (error?.response) {
                  console.error('❌ [CampaignUploadFiles] Error response:', error.response);
                }
                if (error?.request) {
                  console.error('❌ [CampaignUploadFiles] Error request:', error.request);
                }
              } finally {
                console.log('🏁 [CampaignUploadFiles] Upload process finished');
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
  completedStep: { backgroundColor: '#C12C9F' },
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
  previewContainer: {
    width: '100%',
    height: height * 0.25,
    borderRadius: wp(2),
    marginBottom: hp(1.5),
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePreviewButton: {
    position: 'absolute',
    top: wp(2),
    right: wp(2),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: wp(3),
    padding: wp(1),
  },
  replaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF4FD',
    borderWidth: 1,
    borderColor: '#C539A5',
    borderRadius: wp(2),
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    marginBottom: hp(1.5),
  },
  replaceButtonText: {
    fontSize: wp(3.8),
    color: '#C539A5',
    fontWeight: '600',
    marginLeft: wp(2),
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
