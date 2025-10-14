import React, { useState } from 'react';
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
import CustomButton from '../../../components/CustomButton';
import CustomInput from '../../../components/CustomInput';
import CustomDropdown, { DropdownOption } from '../../../components/CustomDropdown';
import BusinessCategoryDropdown, { DropdownData } from '../../../components/BusinessCategoryDropdown';
import { launchImageLibrary, ImageLibraryOptions, Asset } from 'react-native-image-picker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  CompanyDetail: undefined;
  CampaignDetail: undefined;
};

type CompanyDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CompanyDetail'
>;

interface Props {
  navigation: CompanyDetailScreenNavigationProp;
}

interface SelectedImage {
  uri: string;
  type?: string;
  name: string;
  size?: number;
}

const AdvertismentCreateScreen: React.FC<Props> = ({ navigation }) => {
  const [companyName, setCompanyName] = useState<string>('Adryd');
  const [companyNTN, setCompanyNTN] = useState<string>('');
  const [companyAddress, setCompanyAddress] = useState<string>('');
  const [companyEmail, setCompanyEmail] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  // Sample dropdown options for library dropdown
  const categoryOptions: DropdownData[] = [
    // Food & Service Industry
    { label: 'Restaurant / Cafe', value: 'restaurant_cafe' },
    { label: 'Hotel / Travel', value: 'hotel_travel' },
    { label: 'Shopping / Retail Store', value: 'shopping_retail' },
    { label: 'Beauty Salon / Spa', value: 'beauty_salon' },
    { label: 'Doctor / Clinic / Hospital', value: 'doctor_clinic' },
    
    // Business & Professional
    { label: 'Small Business', value: 'small_business' },
    { label: 'Corporate Office', value: 'corporate_office' },
    { label: 'School / College / University', value: 'education' },
    { label: 'Non-Profit Organization', value: 'non_profit' },
    { label: 'Government Organization', value: 'government' },
    
    // Products & Retail
    { label: 'Clothing / Apparel', value: 'clothing' },
    { label: 'Electronics', value: 'electronics' },
    { label: 'Food & Beverages', value: 'food_beverages' },
    { label: 'Cars / Vehicles', value: 'vehicles' },
    { label: 'Health & Beauty Products', value: 'health_beauty' },
    
    // Professional Services
    { label: 'Marketing Agency', value: 'marketing' },
    { label: 'Consulting Business', value: 'consulting' },
    { label: 'Legal Services', value: 'legal' },
    { label: 'Financial Advisor', value: 'financial' },
    
    // Health & Fitness
    { label: 'Gym / Fitness Center', value: 'gym' },
    { label: 'Yoga Studio', value: 'yoga' },
    { label: 'Personal Trainer', value: 'personal_trainer' },
    { label: 'Nutritionist', value: 'nutritionist' },
    { label: 'Pharmacy', value: 'pharmacy' },
    
    // Events & Entertainment
    { label: 'Event Planner', value: 'event_planner' },
    { label: 'Wedding Services', value: 'wedding' },
    { label: 'Photographer / Videographer', value: 'photography' },
    
    // Education & Training
    { label: 'Coaching Center', value: 'coaching' },
    { label: 'Online Learning Platform', value: 'online_learning' },
    { label: 'Training Institute', value: 'training' },
    
    // Media & Communication
    { label: 'News / Media Company', value: 'news_media' },
    { label: 'Podcast', value: 'podcast' },
    { label: 'Radio Station', value: 'radio' },
    { label: 'Magazine / Blog', value: 'magazine_blog' },
    
    // Creative & Arts
    { label: 'Artist / Designer', value: 'artist' },
    { label: 'Musician / Band', value: 'musician' },
    { label: 'Writer / Author', value: 'writer' },
    { label: 'Actor / Model', value: 'actor_model' },
    { label: 'Politician / Public Speaker', value: 'politician' },
    
    // Entertainment & Media
    { label: 'TV Show', value: 'tv_show' },
    { label: 'Movie / Cinema', value: 'movie_cinema' },
    { label: 'Book / Magazine', value: 'book_magazine' },
    { label: 'Games / Apps', value: 'games_apps' },
    
    // Community & Social
    { label: 'Charity', value: 'charity' },
    { label: 'Social Group', value: 'social_group' },
    { label: 'Religious Organization', value: 'religious' },
    { label: 'Community Service', value: 'community_service' },
  ];

  const locationOptions: DropdownOption[] = [
    { label: 'Lahore', value: 'lahore', group: 'Major Cities' },
    { label: 'Karachi', value: 'karachi', group: 'Major Cities' },
    { label: 'Islamabad', value: 'islamabad', group: 'Major Cities' },
    { label: 'Rawalpindi', value: 'rawalpindi', group: 'Major Cities' },
    { label: 'Faisalabad', value: 'faisalabad', group: 'Major Cities' },
    { label: 'Multan', value: 'multan', group: 'Major Cities' },
    { label: 'Peshawar', value: 'peshawar', group: 'Major Cities' },
    { label: 'Quetta', value: 'quetta', group: 'Major Cities' },
    { label: 'Sialkot', value: 'sialkot', group: 'Other Cities' },
    { label: 'Gujranwala', value: 'gujranwala', group: 'Other Cities' },
    { label: 'Hyderabad', value: 'hyderabad', group: 'Other Cities' },
    { label: 'Sukkur', value: 'sukkur', group: 'Other Cities' },
    { label: 'Larkana', value: 'larkana', group: 'Other Cities' },
    { label: 'Nawabshah', value: 'nawabshah', group: 'Other Cities' },
  ];

  const requestAndroidPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const androidVersion = Platform.Version as number;
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
            }
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
    let hasPermission = Platform.OS === 'android'
      ? await requestAndroidPermission()
      : true;

    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 3000,
      maxHeight: 3000,
      includeBase64: false,
    };

    if (hasPermission) {
      launchImageLibrary(options, (response) => {
        if (response.didCancel) return;
        if (response.errorMessage) {
          Alert.alert('Error', 'Failed to access image library.');
        } else if (response.assets && response.assets[0]) {
          const asset: Asset = response.assets[0];
          const maxSize = 25 * 1024 * 1024; // 25MB
          if (asset.fileSize && asset.fileSize > maxSize) {
            Alert.alert('File Too Large', 'Please select an image smaller than 25MB.');
            return;
          }
          setSelectedImage({
            uri: asset.uri ?? '',
            type: asset.type,
            name: asset.fileName || 'image.jpg',
            size: asset.fileSize,
          });
        }
      });
    }
  };

  const renderProgressStep = (
    stepNumber: number,
    isActive: boolean,
    isCompleted: boolean
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
        <View style={[styles.progressLine, isActive && styles.activeProgressLine]} />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFF4FD" barStyle="dark-content" />
      <LinearGradient
        colors={['#FFF4FD', '#fef3f9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
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
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            <TouchableOpacity style={styles.uploadSection} onPress={openImagePicker}>
              <View style={styles.uploadContainer}>
                {selectedImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: selectedImage.uri }}
                      style={styles.previewImage}
                    />
                    <TouchableOpacity
                      style={styles.deleteImageButton}
                      onPress={() => setSelectedImage(null)}
                    >
                      <Ionicons name="trash" size={width * 0.06} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={width * 0.08} style={styles.uploadIcon} />
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
              
              <BusinessCategoryDropdown
                label="Business Category"
                placeholder="Select business category"
                data={categoryOptions}
                value={selectedCategory}
                onSelect={setSelectedCategory}
                required={true}
                containerStyle={styles.customInputContainer}
              />

              <CustomDropdown
                label="Location"
                placeholder="Select location"
                options={locationOptions}
                selectedValue={selectedLocation}
                onSelect={setSelectedLocation}
                required={false}
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
            onPress={() => navigation.navigate('CampaignDetail')}
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
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.05,
    paddingBottom: height * 0.03,
  },
  backButton: {
    backgroundColor: '#fff',
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: width * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: width * 0.055, fontWeight: 'bold', color: '#000' },
  headerSpacer: { width: width * 0.1 },
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
  progressStepText: { fontSize: width * 0.04, fontWeight: 'bold', color: '#999' },
  activeStepText: { color: '#fff' },
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
  },
  uploadIcon: {},
  uploadText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    marginBottom: height * 0.005,
  },
  uploadSubtext: { fontSize: 10, color: '#999', textAlign: 'center', fontWeight: '400' },
  imagePreviewContainer: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  previewImage: { width: 310, height: 160, borderRadius: width * 0.02 },
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
  formFields: { marginTop: height * 0.01 },
  customInputContainer: { marginBottom: height * 0.025 },
  buttonContainer: {
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: { width: '90%' },
});

export default AdvertismentCreateScreen;
