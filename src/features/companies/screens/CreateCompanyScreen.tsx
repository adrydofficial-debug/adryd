

// src/features/companies/screens/CompanyDetailScreen.tsx

import React, {useState, useMemo} from 'react';
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
  Modal,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {launchImageLibrary} from 'react-native-image-picker';
import CustomButton from '../../../components/CustomButton';
import CustomInput from '../../../components/CustomInput';
import BusinessCategoryDropdown from '../../../components/BusinessCategoryDropdown';
import {Company} from '../types';
// import {AppScreens} from '../../../app/navigation/AppNavigator';
import {useCreateCompany, useCompanyCategoryGroups} from '../hooks';
import {supabase} from '../../../services/supabase';

const {width, height} = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

// Using BusinessCategoryDropdown component with react-native-element-dropdown

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
  fileName?: string;
  fileSize?: number;
}

const CompanyDetailScreen: React.FC<CompanyDetailScreenProps> = ({
  navigation,
  company,
  onSave,
}) => {
  const [companyName, setCompanyName] = useState(company?.company_name || 'Adryd');
  const [businessName, setBusinessName] = useState(company?.company_name || '');
  const [companyNTN, setCompanyNTN] = useState(company?.company_ntn || '');
  const [companyAddress, setCompanyAddress] = useState(company?.address || '');
  const [companyEmail, setCompanyEmail] = useState(company?.email || '');
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [selectedBusinessCategory, setSelectedBusinessCategory] = useState<string>('');
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState<{
    companyName: boolean;
    businessName: boolean;
    businessCategory: boolean;
    companyEmail: boolean;
    companyAddress: boolean;
    companyNTN: boolean;
  }>({
    companyName: false,
    businessName: false,
    businessCategory: false,
    companyEmail: false,
    companyAddress: false,
    companyNTN: false,
  });

  // Debug validation errors state changes
  React.useEffect(() => {
    console.log('Validation errors state updated:', validationErrors);
  }, [validationErrors]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Initialize the create company mutation hook
  const createCompanyMutation = useCreateCompany();
  
  // Fetch business categories for dropdown
  const { data: categoriesData, isLoading: categoriesLoading } = useCompanyCategoryGroups();
  
  // Prepare business category data for dropdown
  const businessCategoryData = useMemo(() => {
    console.log('Categories Data:', categoriesData);
    console.log('Categories Loading:', categoriesLoading);
    
    // Fallback test data if API data is not available
    const testData = [
      { label: 'Restaurant', value: '1' },
      { label: 'Cafe', value: '2' },
      { label: 'Fast Food', value: '3' },
      { label: 'Fine Dining', value: '4' },
      { label: 'Food Drink', value: '5' },
        { label: 'Fast ', value: '6' },
      { label: 'Fine Dinings', value: '7' },
      { label: 'Food Trucks', value: '8' },
    ];
    
    if (!categoriesData || categoriesData.length === 0) {
      console.log('Using test data');
      return testData;
    }
    
    const data = categoriesData.flatMap(group => 
      group.categories?.map(category => ({
        label: category.name,
        value: category.id.toString(),
      })) || []
    );
    console.log('Business Category Data:', data);
    return data.length > 0 ? data : testData;
  }, [categoriesData, categoriesLoading]);

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

  const handleNext = async (): Promise<void> => {
    console.log('=== VALIDATION DEBUG ===');
    console.log('companyName:', companyName);
    console.log('businessName:', businessName);
    console.log('selectedBusinessCategory:', selectedBusinessCategory);
    console.log('companyEmail:', companyEmail);
    
    // Reset validation errors
    setValidationErrors({
      companyName: false,
      businessName: false,
      businessCategory: false,
      companyEmail: false,
      companyAddress: false,
      companyNTN: false,
    });

    // Validate required fields
    const errors = {
      companyName: !companyName.trim(),
      businessName: !businessName.trim(),
      companyAddress: !companyAddress.trim(),
      companyNTN: !companyNTN.trim(),
      businessCategory: !selectedBusinessCategory,
      companyEmail: !companyEmail.trim() || !isValidEmail(companyEmail),
    };

    console.log('Validation errors:', errors);

    // Check if there are any validation errors
    const hasErrors = Object.values(errors).some(error => error);
    console.log('Has errors:', hasErrors);
    
    if (hasErrors) {
      setValidationErrors(errors);
      console.log('Missing fields:', errors);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Current user:', user);
      console.log('User error:', userError);
      
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        Alert.alert(
          'Authentication Required',
          'Please log in to create a company. You will be redirected to the login screen.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to login screen or handle authentication
                navigation.navigate('LoginScreen');
              },
            },
          ]
        );
        return;
      }
      
      // Also check the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session:', session);
      console.log('Session error:', sessionError);
      
      // Prepare company data for API
      const companyData = {
        company_name: companyName.trim(),
        company_category_id: parseInt(selectedBusinessCategory) || 1,
        company_ntn: companyNTN.trim() || '0000000-0', // Default if empty
        address: companyAddress.trim() || 'Not provided',
        email: companyEmail.trim(),
        contact_number: '+923000000000', // Default contact number
        logo_url: selectedImage?.uri || 'https://via.placeholder.com/150',
        logo_filename: selectedImage?.fileName || 'logo.png',
        logo_size: selectedImage?.fileSize || 0,
        logo_type: selectedImage?.type || 'image/jpeg',
      };

      // Call the API using the clean service
      console.log('createCompany payload:', companyData);
      const result = await createCompanyMutation.mutateAsync(companyData);
      
      // Navigate to CampaignUploadFiles screen on success
      navigation.navigate('CampaignUploadFiles');
      
    } catch (error: any) {
      console.error('Create company error:', error);
      
      let errorMessage = 'Failed to create company. Please try again.';
      
      if (error?.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error?.response?.status === 403) {
        errorMessage = 'You do not have permission to create a company.';
      } else if (error?.response?.status === 400) {
        errorMessage = 'Invalid company data. Please check your input.';
      } else if (error?.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Email validation helper function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
                onChangeText={(text) => {
                  setCompanyName(text);
                  // Clear validation error when user starts typing
                  if (validationErrors.companyName) {
                    setValidationErrors(prev => ({ ...prev, companyName: false }));
                  }
                }}
                containerStyle={styles.customInputContainer}
                error={validationErrors.companyName}
              />
              
              <CustomInput
                label="Business Name"
                placeholder="Enter business name"
                value={businessName}
                onChangeText={(text) => {
                  setBusinessName(text);
                  // Clear validation error when user starts typing
                  if (validationErrors.businessName) {
                    setValidationErrors(prev => ({ ...prev, businessName: false }));
                  }
                }}
                containerStyle={styles.customInputContainer}
                error={validationErrors.businessName}
              />
              
              {/* Business Category Input Field with Element Dropdown */}
              <View style={styles.customInputContainer}>
                <Text style={styles.inputLabel}>
                  Business Category 
                      </Text>
                <BusinessCategoryDropdown
                  label=""
                  data={businessCategoryData}
                  value={selectedBusinessCategory}
                  onSelect={(value) => {
                    console.log('Category selected:', value);
                    setSelectedBusinessCategory(value);
                    // Clear validation error when user selects
                    if (validationErrors.businessCategory) {
                      setValidationErrors(prev => ({ ...prev, businessCategory: false }));
                    }
                  }}
                  placeholder="Select business category"
                  required={true}
                  containerStyle={styles.dropdownWrapper}
                  error={validationErrors.businessCategory}
                />
                      </View>
              
              <CustomInput
                label="Company NTN"
                placeholder="Optional"
                value={companyNTN}
                onChangeText={(text) => {
                  setCompanyNTN(text);
                  // Clear validation error when user starts typing
                  if (validationErrors.companyNTN) {
                    setValidationErrors(prev => ({ ...prev, companyNTN: false }));
                  }
                }}
                containerStyle={styles.customInputContainer}
                error={validationErrors.companyNTN}
              />
              <CustomInput
                label="Company Address"
                placeholder="Optional"
                value={companyAddress}
                onChangeText={(text) => {
                  setCompanyAddress(text);
                  // Clear validation error when user starts typing
                  if (validationErrors.companyAddress) {
                    setValidationErrors(prev => ({ ...prev, companyAddress: false }));
                  }
                }}
                containerStyle={styles.customInputContainer}
                error={validationErrors.companyAddress}
              />
              <CustomInput
                label="Company Email"
                placeholder="Enter company email"
                value={companyEmail}
                onChangeText={(text) => {
                  setCompanyEmail(text);
                  // Clear validation error when user starts typing
                  if (validationErrors.companyEmail) {
                    setValidationErrors(prev => ({ ...prev, companyEmail: false }));
                  }
                }}
                keyboardType="email-address"
                containerStyle={styles.customInputContainer}
                error={validationErrors.companyEmail}
              />
                </View>
          </View>
        </ScrollView>
        <View style={styles.buttonContainer}>
          <CustomButton
            title={isSubmitting ? "Creating..." : "Next"}
            onPress={handleNext}
            variant="primary"
            size="medium"
            buttonStyle={StyleSheet.flatten([
              styles.nextButton,
              isSubmitting ? styles.disabledButton : null
            ])}
                  disabled={isSubmitting}
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
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
    fontStyle: 'italic',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6f6666ff',
    marginBottom: 8,
  },
  dropdownWrapper: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownContainer: {
    marginBottom: 0, // Remove default margin since it's inside input container
  },
  loadingContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
  },
  testButton: {
    backgroundColor: '#ff6b6b',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CompanyDetailScreen;

