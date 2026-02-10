// src/features/companies/screens/CompanyDetailScreen.tsx
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Dimensions,
  I18nManager,
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UploadIcon } from '../../../assets/images';
import BusinessCategoryDropdown from '../../../components/BusinessCategoryDropdown';
import CustomInput from '../../../components/CustomInput';
import Header from '../../../components/Header';
import PrimaryButton from '../../../components/PrimaryButton';
import { Company } from '../domain/entities';
// import {AppScreens} from '../../../app/navigation/AppNavigator';
import NoInternet from '../../../components/NoInternet';
import { supabase } from '../../../services/supabase';
import { useCampaignStore } from '../../../store/campaignStore';
import { useCities } from '../../locations/hooks/hooks';
import {
  useCompanyCategoryGroups,
  useCreateCompany,
} from '../hooks/useCompanies';
const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;
interface CompanyDetailScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
  route?: { params?: { flow?: 'individual' | 'business' } };
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
  route,
  company,
}) => {
  const { t, i18n: i18nInstance } = useTranslation('companies');
  const setCompanyData = useCampaignStore(state => state.setCompanyData);
  const flow = route?.params?.flow ?? 'business';
  const boardData = route?.params?.boardData;
  const [companyName, setCompanyName] = useState(company?.company_name);
  const [companyNTN, setCompanyNTN] = useState(company?.company_ntn || '');
  const [companyAddress, setCompanyAddress] = useState(company?.address || '');
  const [companyEmail, setCompanyEmail] = useState(company?.email || '');
  const [companyNumber, setCompanyNumber] = useState(
    company?.contact_number || '+92',
  );
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );
  const [languageKey, setLanguageKey] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState(i18nInstance.language);
  const [selectedBusinessCategory, setSelectedBusinessCategory] =
    useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);

  // Validation states
  const [validationErrors, setValidationErrors] = useState<{
    companyName: boolean;
    businessCategory: boolean;
    city: boolean;
    companyEmail: boolean;
    companyAddress: boolean;
    companyNTN: boolean;
    companyNumber: boolean;
  }>({
    companyName: false,
    businessCategory: false,
    city: false,
    companyEmail: false,
    companyAddress: false,
    companyNTN: false,
    companyNumber: false,
  });

  // Debug validation errors state changes
  React.useEffect(() => {
    console.log('Validation errors state updated:', validationErrors);
  }, [validationErrors]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const createCompanyMutation = useCreateCompany();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCompanyCategoryGroups();
  const businessCategoryData = useMemo(() => {
    console.log('Categories Data:', categoriesData);
    console.log('Categories Loading:', categoriesLoading);
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

    if (
      !categoriesData ||
      !categoriesData.groups ||
      categoriesData.groups.length === 0
    ) {
      console.log('Using test data');
      return testData;
    }
    const data = categoriesData.groups.flatMap(
      (group: any) =>
        group.categories?.map((category: any) => ({
          label: category.name,
          value: category.id.toString(),
        })) || [],
    );
    console.log('Business Category Data:', data);
    return data.length > 0 ? data : testData;
  }, [categoriesData, categoriesLoading]);

  const { data: citiesData, isLoading: citiesLoading } = useCities();
  const cityOptions = useMemo(() => {
    if (!citiesData || citiesData.length === 0) {
      return [];
    }
    return citiesData.map(city => ({
      label: city.province_name
        ? `${city.name}, ${city.province_name}`
        : city.name,
      value: String(city.id),
    }));
  }, [citiesData]);

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
          ('');
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          const maxSize = 25 * 1024 * 1024; // 25MB
          if (asset.fileSize && asset.fileSize > maxSize) {
            Alert.alert(
              'File Too Large',
              'Please select an image smaller than 25MB.',
            );
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
        ]}
      >
        <Text
          style={[
            styles.progressStepText,
            isActive && styles.activeStepText,
            isCompleted && styles.completedStepText,
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

  // Phone number validation helper
  const isValidPhoneNumber = (phone: string): boolean => {
    if (!phone || !phone.trim()) return false;
    const phoneRegex = /^\+92[0-9]{10}$/;
    return phoneRegex.test(phone.trim());
  };

  const handleNext = async (): Promise<void> => {
    const errors = {
      companyName: !companyName.trim(),
      companyAddress: !companyAddress.trim(),
      companyNTN: !companyNTN.trim(),
      businessCategory: !selectedBusinessCategory,
      city: !selectedCityId,
      companyEmail: !companyEmail.trim() || !isValidEmail(companyEmail),
      companyNumber:
        !companyNumber ||
        companyNumber.trim() === '+92' ||
        !isValidPhoneNumber(companyNumber),
    };

    console.log('Validation errors:', errors);
    const hasErrors = Object.values(errors).some(error => error);
    console.log('Has errors:', hasErrors);

    // Set all validation errors immediately (will show red borders)
    setValidationErrors(errors);

    if (hasErrors) {
      return;
    }

    const parsedCategoryId = Number(selectedBusinessCategory);
    if (!Number.isFinite(parsedCategoryId)) {
      console.warn(
        'Invalid company category selection:',
        selectedBusinessCategory,
      );
      setValidationErrors(prev => ({
        ...prev,
        businessCategory: true,
      }));
      Alert.alert(
        'Invalid Category',
        'Please select a valid business category from the list.',
      );
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  // Extract submission logic to be called after confirmation
  const handleSubmit = async (): Promise<void> => {
    const parsedCategoryId = Number(selectedBusinessCategory);

    try {
      setIsSubmitting(true);
      setShowConfirmModal(false);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
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
          ],
        );
        return;
      }

      // Also check the current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      console.log('Current session:', session);
      console.log('Session error:', sessionError);

      // Prepare company data for API
      const companyData = {
        company_name: companyName.trim(),
        company_category_id: parsedCategoryId,
        company_ntn: companyNTN.trim() || '0000000-0', // Default if empty
        address: companyAddress.trim() || 'Not provided',
        email: companyEmail.trim(),
        contact_number: companyNumber.trim() || '+923000000000',
        city_id: selectedCityId ? Number(selectedCityId) : undefined,
        logo_url: selectedImage?.uri || 'https://via.placeholder.com/150',
        logo_filename: selectedImage?.fileName || 'logo.png',
        logo_size: selectedImage?.fileSize || 0,
        logo_type: selectedImage?.type || 'image/jpeg',
      };

      // Call the API using the clean service
      console.log('createCompany payload:', companyData);
      const result = await createCompanyMutation.mutateAsync({
        data: companyData,
        file: selectedImage
          ? {
              uri: selectedImage.uri,
              type: selectedImage.type,
              name: selectedImage.name,
            }
          : undefined,
      });

      // Save company data to store before navigating
      setCompanyData({
        companyName: companyName.trim(),
        businessName: companyName.trim(),
        businessCategory: selectedBusinessCategory,
        cityId: selectedCityId,
        companyEmail: companyEmail.trim(),
        companyAddress: companyAddress.trim(),
        companyNTN: companyNTN.trim() || '0000000-0',
        companyNumber: companyNumber.trim() || '+923000000000',
        logoUri:
          selectedImage?.uri ||
          'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&q=80',
        logoType: selectedImage?.type,
        logoName: selectedImage?.name,
      });
      navigation.goBack();

      // navigation.navigate('AdvertismentCreateScreen', {
      //   flow,
      //   companyId: result.id,
      //   boardData: boardData,
      // });
    } catch (error: any) {
      console.error('Create company error:', error);

      let errorMessage = 'Failed to create company. Please try again.';

      if (error?.response?.data) {
        console.error(
          'Create company error response:',
          JSON.stringify(error.response.data, null, 2),
        );
      }

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

      // On API error, set all fields to show red borders
      setValidationErrors({
        companyName: true,
        businessCategory: true,
        city: true,
        companyEmail: true,
        companyAddress: true,
        companyNTN: true,
        companyNumber: true,
      });

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

  // Phone number change handler (same as login screen)
  const handlePhoneNumberChange = (text: string) => {
    const cleaned = text.replace(/[^0-9+]/g, '');
    if (!cleaned.startsWith('+92')) {
      setCompanyNumber('+92');
      return;
    }
    if (cleaned.length <= 13) {
      setCompanyNumber(cleaned);
      // Clear validation error when user starts typing
      if (validationErrors.companyNumber) {
        setValidationErrors(prev => ({
          ...prev,
          companyNumber: false,
        }));
      }
    }
  };
  useFocusEffect(
    useCallback(() => {
      const lang = i18nInstance.language;
      setCurrentLanguage(lang);
      const rtlLangs = new Set<string>(['ar', 'ur', 'he', 'fa']);
      setIsRTL(rtlLangs.has(lang));
      setLanguageKey(prev => prev + 1);
      return () => {};
    }, [i18nInstance.language]),
  );
  const handleBackPress = () => {
    navigation.goBack();
  };

  const formatNTN = (text: string) => {
    // Strip everything except numbers
    const digitsOnly = text.replace(/\D/g, '');

    // Limit to 8 digits max
    const limited = digitsOnly.slice(0, 8);

    // Insert dash after 7 digits
    if (limited.length > 7) {
      return `${limited.slice(0, 7)}-${limited.slice(7)}`;
    }

    return limited;
  };

  return (
    <View style={styles.container}>
      {/* <StatusBar backgroundColor="#FFF4FD" barStyle="dark-content" /> */}
      <Header
        title={t('create.title', { lng: currentLanguage })}
        onBackPress={handleBackPress}
        showBackButton
        // showRightIcon
        // containerStyle={{
        //   flexDirection: isRTL ? 'row-reverse' : 'row',
        //   paddingHorizontal: 0,
        //   // marginBottom: hp(2),
        // }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* <View style={styles.progressContainer}>
          <ProgressBar currentStep={1} />
        </View> */}
        <View style={styles.formCard}>
          <TouchableOpacity
            style={styles.uploadSection}
            onPress={openImagePicker}
            activeOpacity={0.9}
          >
            <View
              style={[
                styles.uploadContainer,
                !selectedImage && styles.uploadContainerEmpty,
              ]}
            >
              {selectedImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: selectedImage.uri }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.deleteImageButton}
                    onPress={() => setSelectedImage(null)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="trash"
                      size={width * 0.06}
                      color="#ff4444"
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.uploadButton}>
                    <UploadIcon width={width * 0.06} height={width * 0.06} />
                    <Text style={styles.uploadButtonText}>
                      {t('create.uploadAction')}
                    </Text>
                  </View>
                  <Text style={styles.uploadTitle}>
                    {t('create.uploadLogo')}
                  </Text>
                  <Text style={styles.uploadHint}>
                    {t('create.uploadFormat')}
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.formFields}>
            <CustomInput
              label={t('create.companyName')}
              placeholder={'Name Of Company'}
              value={companyName}
              onChangeText={text => {
                setCompanyName(text);
                // Clear validation error when user starts typing
                if (validationErrors.companyName) {
                  setValidationErrors(prev => ({
                    ...prev,
                    companyName: false,
                  }));
                }
              }}
              containerStyle={styles.customInputContainer}
              error={validationErrors.companyName}
            />

            {/* Business Category Input Field with Element Dropdown */}
            <View style={styles.customInputContainer}>
              <Text style={styles.inputLabel}>{t('create.category')}</Text>
              <BusinessCategoryDropdown
                label=""
                data={businessCategoryData}
                value={selectedBusinessCategory}
                onSelect={value => {
                  console.log('Category selected:', value);
                  setSelectedBusinessCategory(value);
                  // Clear validation error when user selects
                  if (validationErrors.businessCategory) {
                    setValidationErrors(prev => ({
                      ...prev,
                      businessCategory: false,
                    }));
                  }
                }}
                placeholder={t('create.selectCategory')}
                required={true}
                containerStyle={styles.dropdownWrapper}
                error={validationErrors.businessCategory}
              />
            </View>

            {/* Company Location (City) */}
            <View style={styles.customInputContainer}>
              <Text style={styles.inputLabel}>
                {t('create.city', 'Company location')}
              </Text>
              <BusinessCategoryDropdown
                label=""
                data={cityOptions}
                value={selectedCityId}
                onSelect={value => {
                  setSelectedCityId(value);
                  if (validationErrors.city) {
                    setValidationErrors(prev => ({
                      ...prev,
                      city: false,
                    }));
                  }
                }}
                placeholder={
                  citiesLoading
                    ? t('create.loading', 'Loading...')
                    : t('create.selectCity', 'Select city')
                }
                containerStyle={styles.dropdownWrapper}
                error={validationErrors.city}
              />
            </View>

            {/* Company Number Input - Same as Login Screen */}
            <CustomInput
              label={t('create.companyNumber')}
              placeholder="3XXXXXXXXX"
              keyboardType="phone-pad"
              value={companyNumber}
              onChangeText={handlePhoneNumberChange}
              onBlur={() => setFocusedField(null)}
              onFocus={() => setFocusedField('companyNumber')}
              focused={focusedField === 'companyNumber'}
              error={!!validationErrors.companyNumber}
              showErrorText={false}
              containerStyle={styles.customInputContainer}
            />
            <CustomInput
              label={t('create.email')}
              placeholder={t('create.enterEmail')}
              value={companyEmail}
              onChangeText={text => {
                setCompanyEmail(text);
                // Clear validation error when user starts typing
                if (validationErrors.companyEmail) {
                  setValidationErrors(prev => ({
                    ...prev,
                    companyEmail: false,
                  }));
                }
              }}
              keyboardType="email-address"
              containerStyle={styles.customInputContainer}
              error={validationErrors.companyEmail}
            />
            <CustomInput
              label={t('create.ntn')}
              placeholder={t('create.enterNtn')}
              value={companyNTN}
              onChangeText={text => {
                const formatted = formatNTN(text);
                setCompanyNTN(formatted);

                if (validationErrors.companyNTN) {
                  setValidationErrors(prev => ({
                    ...prev,
                    companyNTN: false,
                  }));
                }
              }}
              keyboardType="number-pad"
              containerStyle={styles.customInputContainer}
              error={validationErrors.companyNTN}
            />

            <CustomInput
              label={t('create.address')}
              placeholder={t('create.enterAddress')}
              value={companyAddress}
              onChangeText={text => {
                setCompanyAddress(text);
                // Clear validation error when user starts typing
                if (validationErrors.companyAddress) {
                  setValidationErrors(prev => ({
                    ...prev,
                    companyAddress: false,
                  }));
                }
              }}
              containerStyle={styles.customInputContainer}
              error={validationErrors.companyAddress}
            />
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={isSubmitting ? t('create.saving') : t('create.save')}
            onPress={handleNext}
            loading={isSubmitting}
            disabled={isSubmitting}
            buttonStyle={styles.nextButton}
          />
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Are you sure you want to create this company?
            </Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowConfirmModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalYesButton}
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.modalYesButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <NoInternet />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingTop: hp(5),
    paddingBottom: height * 0.03,
    backgroundColor: '#FFFFFF',
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
    fontSize: 13,
    fontWeight: 'bold',
    color: '#202020',
  },
  headerSpacer: {
    width: wp(10),
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
    paddingBottom: height * 0.04,
    paddingTop: height * 0.04,
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
    paddingHorizontal: width * 0.12,
    paddingBottom: 20,
  },
  formCard: {
    // backgroundColor: '#fff',
    // borderRadius: width * 0.04,
    // padding: width * 0.05,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 5,
  },
  uploadSection: {
    marginBottom: hp(3),
    marginTop: hp(4),
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  uploadContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.2,
    paddingVertical: 28,
    paddingHorizontal: 16,
    width: '100%',
  },
  uploadContainerEmpty: {
    backgroundColor: '#F5F5F5',
  },
  uploadHeader: {
    alignItems: 'center',
    marginBottom: 18,
  },
  uploadTitle: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter',
    color: '#18181B',
    letterSpacing: 0,
    textAlign: 'center',
    textTransform: 'capitalize',
    marginTop: 10,
  },
  uploadHint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  uploadButton: {
    marginTop: 8,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    // borderWidth: 1,
    // borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    // elevation: 1,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    maxWidth: '100%',
    maxHeight: '100%',
  },
  previewImage: {
    width: width * 0.6,
    height: height * 0.18,
    borderRadius: width * 0.04,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  deleteImageButton: {
    position: 'absolute',
    bottom: -width * 0.02,
    right: -width * 0.02,
    backgroundColor: '#fff',
    borderRadius: width * 0.03,
    padding: width * 0.008,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
  errorContainer: {
    borderWidth: 0.5,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingTop: 10,
    paddingRight: 16,
    paddingBottom: 10,
    paddingLeft: 16,
  },
  buttonContainer: {
    // paddingHorizontal: width * 0.0005,
    paddingTop: 16,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    width: '100%',
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
    fontFamily: 'Inter',
    color: '#18181B',
    lineHeight: 15,
    letterSpacing: -0.154, // -1.1% of 14px
    marginBottom: 8,
  },
  dropdownWrapper: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 12,
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
  },
  dropdownContainer: {
    marginBottom: 0, // Remove default margin since it's inside input container
  },
  loadingContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 0.6,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: width * 0.85,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    fontFamily: 'Inter',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  modalYesButton: {
    flex: 1,
    backgroundColor: '#C539A5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C539A5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalYesButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
});

export default CompanyDetailScreen;
