import React, { useState } from 'react';
import {
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
import { UploadIcon } from '../../../assets/images';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PrimaryButton from '../../../components/PrimaryButton';
import { useTranslation } from 'react-i18next';
import { useCampaignStore } from '../../../store/campaignStore';
import { useUploadAdvertisementFiles, useAddAdvertisementMedia, useChangeAdvertisementStatus, useAdvertisement } from '../hooks/hooks';
import { AdvertisementStatus } from '../domain/entities';
import  ProgressBar from '../../../components/ProgressBar';
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
  isDocument?: boolean;
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
  const [uploadError, setUploadError] = useState<boolean>(false);

  const advertisementData = useCampaignStore(state => state.advertisementData);
  const setAdvertisementData = useCampaignStore(state => state.setAdvertisementData);

  // Extract params - could be direct string or nested in object
  const params = typeof route?.params === 'string'
    ? { uploadUrl: route.params }
    : (route?.params as any) || {};

  const uploadUrl = params.uploadUrl;
  const campaignId = params.campaignId ? parseInt(params.campaignId, 10) : null;
  const publicUrl = params.publicUrl;
  const flow = params.flow || 'business';

  // Hook to change campaign status
  const changeStatusMutation = useChangeAdvertisementStatus(campaignId || 0);

  // Fetch campaign details for navigation
  const { data: campaign } = useAdvertisement(campaignId || undefined);

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

  const detectFileType = (fileName: string, mimeType: string = ''): { isImage: boolean; isVideo: boolean; isDocument: boolean; type: string } => {
    const fileExtension = fileName.toLowerCase().split('.').pop() || '';
    const lowerMimeType = mimeType.toLowerCase();

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic', 'heif'];
    const isImage =
      lowerMimeType.startsWith('image/') ||
      imageExtensions.includes(fileExtension);

    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', '3gp', 'm4v'];
    const isVideo =
      lowerMimeType.startsWith('video/') ||
      videoExtensions.includes(fileExtension);

    const documentExtensions = ['pdf', 'psd', 'ai'];
    const isDocument =
      lowerMimeType.includes('pdf') ||
      lowerMimeType.includes('psd') ||
      lowerMimeType.includes('illustrator') ||
      documentExtensions.includes(fileExtension);

    let detectedType = mimeType;
    if (!detectedType) {
      if (isImage) {
        detectedType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
      } else if (isVideo) {
        detectedType = `video/${fileExtension}`;
      } else if (fileExtension === 'pdf') {
        detectedType = 'application/pdf';
      } else if (fileExtension === 'psd') {
        detectedType = 'image/vnd.adobe.photoshop';
      } else if (fileExtension === 'ai') {
        detectedType = 'application/postscript';
      } else {
        detectedType = 'application/octet-stream';
      }
    }

    return { isImage, isVideo, isDocument, type: detectedType };
  };

  const openDocumentPicker = async () => {
    if (!isDocumentPickerAvailable()) {
      console.warn('⚠️ [CampaignUploadFiles] Document picker not available');
      openImageVideoPicker();
      return;
    }

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

    try {
      // Use allFiles type to allow all formats, then filter by extension
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: false,
        copyTo: 'cachesDirectory',
        presentationStyle: 'fullScreen',
        readContent: false,
      });

      setIsPickerOpen(false);

      if (results && results.length > 0) {
        const file = results[0];
        const fileName = file.name || `file_${Date.now()}`;
        const fileSize = file.size || 0;
        const maxSize = 25 * 1024 * 1024;

        if (fileSize > maxSize) {
          console.warn(`⚠️ [CampaignUploadFiles] File "${fileName}" exceeds 25MB`);
          return;
        }

        const fileTypeInfo = detectFileType(fileName, file.type || '');

        // Validate supported formats
        const supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'pdf', 'psd', 'ai'];
        const fileExtension = fileName.toLowerCase().split('.').pop() || '';

        if (!supportedExtensions.includes(fileExtension)) {
          console.warn(`⚠️ [CampaignUploadFiles] Unsupported file format: ${fileExtension}`);
          return;
        }

        const newFile: FileItem = {
          id: Date.now(),
          uri: file.fileCopyUri || file.uri,
          name: fileName,
          type: fileTypeInfo.type,
          size: fileSize,
          progress: 100,
          isImage: fileTypeInfo.isImage,
          isVideo: fileTypeInfo.isVideo,
          isDocument: fileTypeInfo.isDocument,
        };

        console.log('✅ [CampaignUploadFiles] File selected:', {
          name: newFile.name,
          type: newFile.type,
          isImage: newFile.isImage,
          isVideo: newFile.isVideo,
          isDocument: newFile.isDocument,
          uri: newFile.uri.substring(0, 50) + '...',
        });

        setSelectedFiles([newFile]);
        setUploadError(false);

        if (advertisementData) {
          setAdvertisementData({
            ...advertisementData,
            previewImage: (newFile.isImage && !newFile.isDocument) ? newFile.uri : advertisementData.previewImage,
            mediaUri: newFile.uri,
            mediaType: newFile.type,
            isVideo: !!newFile.isVideo,
          });
        }
      }
    } catch (err: any) {
      setIsPickerOpen(false);
      if (err.cancel !== true) {
        console.error('❌ [CampaignUploadFiles] Document picker error:', err);
        // Fallback to image picker on error
        openImageVideoPicker();
      } else {
        console.log('ℹ️ [CampaignUploadFiles] User cancelled document selection');
      }
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

        const fileName = asset.fileName || asset.uri || '';
        const fileTypeInfo = detectFileType(fileName, asset.type || '');

        const newFile: FileItem = {
          id: Date.now(),
          uri: asset.uri,
          name: asset.fileName || `file_${Date.now()}`,
          type: fileTypeInfo.type,
          size: fileSize,
          progress: 100,
          isImage: fileTypeInfo.isImage,
          isVideo: fileTypeInfo.isVideo,
          isDocument: fileTypeInfo.isDocument,
        };

        console.log('✅ [CampaignUploadFiles] File selected:', {
          name: newFile.name,
          type: newFile.type,
          isImage: newFile.isImage,
          isVideo: newFile.isVideo,
          isDocument: newFile.isDocument,
          uri: newFile.uri.substring(0, 50) + '...',
        });

        // Replace existing files with the new one (only one file allowed)
        setSelectedFiles([newFile]);
        setUploadError(false);

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

  const openFilePicker = async () => {
    // Try document picker first (supports all formats)
    // If not available or fails, fallback to image picker
    if (isDocumentPickerAvailable()) {
      await openDocumentPicker();
    } else {
      await openImageVideoPicker();
    }
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
      openFilePicker();
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
      <View
        style={styles.container}
      >
        <StatusBar backgroundColor="#F8F8F8" barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={wp(6)} color="#70737D" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('uploadFiles.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.progressContainer}>
          <ProgressBar currentStep={2}/>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Upload Campaign Design Section - Text outside the card */}
          <View style={styles.uploadTextSection}>
            <Text style={styles.uploadSectionTitle}>Upload Campaign Design</Text>
            <Text style={styles.uploadSectionSubtitle}>
              Supported formats: JPEG, PNG, GIF, MP4, PDF, PSD, AI & Max file size: 25 MB
            </Text>
          </View>

          <View>
            {/* Upload Area - Outer wrapper */}
            <View style={styles.uploadSection}>
              <PanGestureHandler
                onHandlerStateChange={onDragHandler}
                onGestureEvent={onDragHandler}
                onEnded={onDropHandler}
              >
                <TouchableOpacity
                  style={[
                    styles.uploadArea,
                    isDragOver && styles.uploadAreaDragOver,
                    selectedFiles.length > 0 && styles.uploadAreaWithImage,
                    uploadError && { borderColor: '#EF4444', borderWidth: 1.5 },
                  ]}
                  onPress={openFilePicker}
                  activeOpacity={0.8}
                >
                  {selectedFiles.length > 0 && selectedFiles[0] ? (
                    <>
                      {selectedFiles[0].isImage || selectedFiles[0].isVideo ? (
                        <Image
                          source={{ uri: selectedFiles[0].uri }}
                          style={styles.uploadAreaImage}
                          resizeMode="cover"
                        />
                      ) : selectedFiles[0].isDocument ? (
                        <View style={styles.documentPreview}>
                          <Ionicons
                            name={selectedFiles[0].name.toLowerCase().endsWith('.pdf') ? 'document-text' : 'document'}
                            size={60}
                            color="#C539A5"
                          />
                          <Text style={styles.documentPreviewText} numberOfLines={1}>
                            {selectedFiles[0].name.split('.').pop()?.toUpperCase()}
                          </Text>
                          <Text style={styles.documentPreviewName} numberOfLines={1}>
                            {selectedFiles[0].name}
                          </Text>
                        </View>
                      ) : null}
                      <TouchableOpacity
                        style={styles.uploadAreaRemoveButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          removeFile(selectedFiles[0].id);
                        }}
                      >
                        <Ionicons
                          name="close-circle"
                          size={28}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.uploadButton}>
                      <UploadIcon width={width * 0.06} height={width * 0.06} />
                      <Text style={styles.uploadButtonText}>Upload</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </PanGestureHandler>

              {/* Uploaded Section - Inside upload box */}
              {selectedFiles.filter(f => f.progress === 100).length > 0 && (
                <View style={styles.uploadedSection}>
                  <Text style={styles.uploadedSectionTitle}>Uploaded</Text>
                  {selectedFiles
                    .filter((file) => file.progress === 100)
                    .map((file) => (
                      <View key={file.id} style={styles.uploadedFileItem}>
                        <Text style={styles.uploadedFileName} numberOfLines={1}>
                          {file.name}
                        </Text>
                        <TouchableOpacity
                          style={styles.uploadedDeleteButton}
                          onPress={() => removeFile(file.id)}
                        >
                          <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                </View>
              )}
            </View>
            {uploadError && (
              <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
                Please upload a file before continuing
              </Text>
            )}
            {/* Uploading Section */}
            {selectedFiles.filter(f => f.progress > 0 && f.progress < 100).length > 0 && (
              <View style={styles.statusSection}>
                <Text style={styles.sectionTitle}>
                  Uploading - {selectedFiles.filter(f => f.progress > 0 && f.progress < 100).length}/{selectedFiles.filter(f => f.progress > 0 && f.progress < 100).length} files
                </Text>
                {selectedFiles
                  .filter((file) => file.progress > 0 && file.progress < 100)
                  .map((file) => (
                    <View key={file.id} style={styles.uploadingFileItem}>
                      <View style={styles.uploadingFileContent}>
                        <Text style={styles.uploadingFileName} numberOfLines={1}>
                          {file.name}
                        </Text>
                        <View style={styles.uploadingProgressContainer}>
                          <View
                            style={[
                              styles.uploadingProgressBar,
                              { width: `${file.progress}%` },
                            ]}
                          />
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.uploadingCancelButton}
                        onPress={() => removeFile(file.id)}
                      >
                        <Ionicons name="close" size={16} color="#666" />
                      </TouchableOpacity>
                    </View>
                  ))}
              </View>
            )}

            {/* Error Files Section */}
            {selectedFiles.filter(f => f.progress < 0).length > 0 && (
              <View style={styles.errorSection}>
                <Text style={styles.sectionTitle}>Error Files</Text>
                {selectedFiles
                  .filter((file) => file.progress < 0)
                  .map((file) => (
                    <View key={file.id} style={styles.errorFileItem}>
                      <View style={styles.errorFileContent}>
                        <Text style={styles.errorFileName} numberOfLines={1}>
                          {file.name}
                        </Text>
                        <Text style={styles.errorMessage}>
                          This document is not supported, please delete and upload another file.
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.errorRemoveButton}
                        onPress={() => removeFile(file.id)}
                      >
                        <Ionicons name="close" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
              </View>
            )}

          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={
              isPending || isAddingMedia || isUploading
                ? t('uploadFiles.uploadingFiles')
                : t('createScreen.next')
            }
            disabled={isPending || isAddingMedia}
            loading={isPending || isAddingMedia || isUploading}
            onPress={async () => {
              if (!uploadUrl) return;

              // ✅ Fix 1: Remove duplicate, keep only this
              if (selectedFiles.length === 0) {
                setUploadError(true);
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
                console.log('✅ Files uploaded to storage');

                if (campaignId && publicUrl) {
                  const mediaArray = formattedFiles.map(file => ({
                    url: publicUrl,
                    filename: file.name,
                    size: selectedFiles.find(f => f.uri === file.uri)?.size || 0,
                    type: file.type || 'image/jpeg',
                  }));

                  try {
                    await addMedia(mediaArray); // ✅ Fix 2: restore this line
                    console.log('✅ Media registered successfully');
                  } catch (mediaError: any) {
                    console.error('❌ Failed to register media:', mediaError?.response?.data);
                  }
                }

                // Navigate
                if (campaignId) {
                  const board = campaign?.board as any;
                  const campaignName = campaign?.title || board?.title || 'Campaign';
                  const boardLocation = typeof board?.location === 'string'
                    ? board.location
                    : board?.location?.name || 'Unknown Location';

                  navigation.reset({
                    index: 0,
                    routes: [
                      { name: 'BottomTab' },
                      { name: 'CampaignChatDetail', params: { campaignId, campaignName, boardLocation } },
                    ],
                  });
                } else {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'BottomTab' }, { name: 'InboxScreen' }],
                  });
                }

              } catch (error: any) {
                console.error('❌ Upload failed:', error?.message);
              } finally {
                setIsUploading(false);
              }
            }}
            buttonStyle={styles.nextButton}
          />
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
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
  headerTitle: { fontSize: 15, fontWeight: 'bold', color: '#202020' },
  headerSpacer: { width: wp(10) },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
    paddingBottom: height * 0.03,
    marginBottom: 15,
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
  uploadTextSection: {
    marginBottom: 30,
    paddingHorizontal: 0,
    alignItems: 'center',
  },
  uploadSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#181D27',
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadSectionSubtitle: {
    fontSize: 12,
    color: '#70737D',
    lineHeight: 18,
    fontWeight: '400',
    textAlign: 'center',
    width: '70%',
  },
  uploadSection: {
    marginBottom: height * 0.03,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 15,
    width: '100%',
    alignSelf: 'center',
  },
  uploadArea: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    minHeight: 134,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  uploadAreaWithImage: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: width * 0.6,
    minHeight: 200,
    maxHeight: height * 0.3,
  },
  uploadAreaDragOver: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  uploadAreaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  documentPreview: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 20,
  },
  documentPreviewText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#C539A5',
    textTransform: 'uppercase',
  },
  documentPreviewName: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '400',
    color: '#70737D',
    textAlign: 'center',
  },
  uploadAreaRemoveButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 14,
    padding: 4,
    zIndex: 10,
  },
  uploadButton: {
    marginTop: 8,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 5,
  },
  uploadedPreviewSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  uploadedPreviewContainer: {
    flexDirection: 'row',
    paddingRight: 10,
  },
  thumbnailContainer: {
    width: 98,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    position: 'relative',
    marginRight: 10,
    paddingTop: 5,
    paddingRight: 4,
    paddingBottom: 5,
    paddingLeft: 4,
    backgroundColor: '#FFFFFF',
  },
  thumbnailImage: {
    width: 90,
    height: 90,
    borderRadius: 6,
  },
  documentThumbnail: {
    width: 90,
    height: 90,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentThumbnailText: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    color: '#C539A5',
    textTransform: 'uppercase',
  },
  thumbnailRemoveButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusSection: {
    marginBottom: hp(2),
  },
  uploadingFileItem: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  uploadingFileContent: {
    flex: 1,
    marginRight: 12,
  },
  uploadingFileName: {
    fontSize: 14,
    color: '#000',
    fontWeight: '400',
    marginBottom: 8,
  },
  uploadingProgressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  uploadingProgressBar: {
    height: '100%',
    backgroundColor: '#C539A5',
    borderRadius: 2,
  },
  uploadingCancelButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  errorSection: {
    marginBottom: hp(2),
  },
  errorFileItem: {
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorFileContent: {
    flex: 1,
    marginRight: 12,
  },
  errorFileName: {
    fontSize: 14,
    color: '#000',
    fontWeight: '400',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '400',
  },
  errorRemoveButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedSection: {
    marginTop: 16,
    paddingTop: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  uploadedSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',

  },
  uploadedFileItem: {
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  uploadedFileName: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    fontWeight: '400',
    marginRight: 12,
  },
  uploadedDeleteButton: {
    padding: 4,
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
