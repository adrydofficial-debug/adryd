// src/features/companies/screens/CompanyDetailScreen.tsx

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Platform,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {launchImageLibrary} from 'react-native-image-picker';
import CustomButton from '../../../components/CustomButton';
import CustomInput from '../../../components/CustomInput';
import {Company} from '../types';
import {AppScreens} from '../../../app/navigation/AppNavigator';

const {width, height} = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

interface CompanyDetailScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
  company?: Company;
  onSave?: (companyData: Partial<Company>) => void;
}

interface SelectedImage {
  uri: string;
  type: string;
  name: string;
  size: number;
}

const CompanyDetailScreen: React.FC<CompanyDetailScreenProps> = ({
  navigation,
  company,
  onSave,
}) => {
  const [companyName, setCompanyName] = useState(company?.company_name || 'Adryd');
  const [companyNTN, setCompanyNTN] = useState(company?.company_ntn || '');
  const [companyAddress, setCompanyAddress] = useState(company?.address || '');
  const [companyEmail, setCompanyEmail] = useState(company?.email || '');
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

  const requestAndroidPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const androidVersion = Platform.Version;
        if (androidVersion >= 33) {
          return true;
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'App needs access to your storage to select images',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const openImagePicker = async (): Promise<void> => {
    let hasPermission = false;

    if (Platform.OS === 'android') {
      hasPermission = await requestAndroidPermission();
    } else {
      hasPermission = true;
    }

    const options = {
      mediaType: 'photo' as const,
      quality: 0.8 as const,
      maxWidth: 3000,
      maxHeight: 3000,
      includeBase64: false,
    };

    if (hasPermission) {
      launchImageLibrary(options, (response: any) => {
        if (response.didCancel) {
          return;
        } else if (response.errorMessage) {
          Alert.alert(
            'Error',
            'Failed to access image library. Please check your permissions and try again.',
          );
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          const maxSize = 25 * 1024 * 1024; // 25MB
          if (asset.fileSize && asset.fileSize > maxSize) {
            Alert.alert('File Too Large', 'Please select an image smaller than 25MB.');
            return;
          }
          setSelectedImage({
            uri: asset.uri || '',
            type: asset.type || 'image/jpeg',
            name: asset.fileName || 'image.jpg',
            size: asset.fileSize || 0,
          });
        }
      });
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
        ]}>
        <Text
          style={[
            styles.progressStepText,
            isActive && styles.activeStepText,
            isCompleted && styles.completedStepText,
          ]}>
          {stepNumber}
        </Text>
      </View>
      {stepNumber < 3 && (
        <View
          style={[
            styles.progressLine,
            isActive && styles.activeProgressLine,
          ]}
        />
      )}
    </View>
  );

  const handleNext = (): void => {
    const companyData = {
      company_name: companyName,
      company_ntn: companyNTN,
      address: companyAddress,
      email: companyEmail,
      logo: selectedImage?.uri,
    };

    onSave?.(companyData);
    navigation.navigate(AppScreens.Details);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFF4FD" barStyle="dark-content" />
      <LinearGradient
        colors={['#FFF4FD', '#fef3f9']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={wp(6)} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Company Detail</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.progressContainer}>
          {renderProgressStep(1, true, false)}
          {renderProgressStep(2, false, false)}
          {renderProgressStep(3, false, false)}
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.formCard}>
            <TouchableOpacity style={styles.uploadSection} onPress={openImagePicker}>
              <View style={styles.uploadContainer}>
                {selectedImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{uri: selectedImage.uri}} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.deleteImageButton}
                      onPress={() => setSelectedImage(null)}>
                      <Ionicons name="trash" size={width * 0.06} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Ionicons
                      name="cloud-upload"
                      size={width * 0.08}
                      style={styles.uploadIcon}
                    />
                    <Text style={styles.uploadText}>Upload Company Logo</Text>
                    <Text style={styles.uploadSubtext}>
                      Format: .jpeg, .png & Max file size: 25 MB
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.formFields}>
              <CustomInput
                label="Company Name"
                placeholder="Enter company name"
                value={companyName}
                onChangeText={setCompanyName}
                containerStyle={styles.customInputContainer}
              />
              <CustomInput
                label="Company NTN"
                placeholder="Optional"
                value={companyNTN}
                onChangeText={setCompanyNTN}
                containerStyle={styles.customInputContainer}
              />
              <CustomInput
                label="Company Address"
                placeholder="Optional"
                value={companyAddress}
                onChangeText={setCompanyAddress}
                containerStyle={styles.customInputContainer}
              />
              <CustomInput
                label="Company Email"
                placeholder="Enter company email"
                value={companyEmail}
                onChangeText={setCompanyEmail}
                keyboardType="email-address"
                containerStyle={styles.customInputContainer}
              />
            </View>
          </View>
        </ScrollView>
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Next"
            onPress={handleNext}
            variant="primary"
            size="medium"
            buttonStyle={styles.nextButton}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
  headerTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSpacer: {
    width: wp(10),
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
    paddingBottom: height * 0.03,
  },
  progressStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStep: {
    width: width * 0.08,
    height: width * 0.08,
    borderRadius: width * 0.04,
    backgroundColor: '#C12C9F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: '#C12C9F',
  },
  completedStep: {
    backgroundColor: '#4CAF50',
  },
  progressStepText: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: '#999',
  },
  activeStepText: {
    color: '#fff',
  },
  completedStepText: {
    color: '#fff',
  },
  progressLine: {
    width: width * 0.15,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: width * 0.02,
  },
  activeProgressLine: {
    backgroundColor: '#C12C9F',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 280,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: width * 0.04,
    padding: width * 0.05,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadSection: {
    marginBottom: height * 0.03,
  },
  uploadContainer: {
    borderWidth: 2,
    borderColor: '#FF6B9D',
    borderStyle: 'dashed',
    borderRadius: width * 0.03,
    backgroundColor: '#FFF4FD',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.15,
  },
  uploadIcon: {},
  uploadText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    marginBottom: height * 0.005,
  },
  uploadSubtext: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    fontWeight: '400',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    maxWidth: '100%',
    maxHeight: '100%',
  },
  previewImage: {
    width: 310,
    height: 160,
    borderRadius: width * 0.02,
  },
  deleteImageButton: {
    position: 'absolute',
    bottom: -width * 0.02,
    right: -width * 0.02,
    backgroundColor: '#fff',
    borderRadius: width * 0.03,
    padding: width * 0.008,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formFields: {
    marginTop: height * 0.01,
  },
  customInputContainer: {
    marginBottom: height * 0.025,
  },
  buttonContainer: {
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    width: '90%',
  },
});

export default CompanyDetailScreen;
