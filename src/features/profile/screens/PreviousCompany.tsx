import React, { useState, useEffect } from 'react';
import {
  Alert,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../app/navigation/AppNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { AddIcon, Images } from '../../../assets/images';
import { useCompanies } from '../../companies/hooks/useCompanies';
import { Company as ApiCompany } from '../../companies/domain/entities';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import NoInternet from '../../../components/NoInternet';
import Header from '../../../components/Header';
import CompanyEmptyState from '../../companies/components/CompanyEmptyState';
import PrimaryButton from '../../../components/PrimaryButton';
const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;
// Base dimensions for responsive scaling
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;
// Responsive scaling functions
const scaleWidth = (size: number) => (width / BASE_WIDTH) * size;
const scaleHeight = (size: number) => (height / BASE_HEIGHT) * size;
const scaleFont = (size: number) => (width / BASE_WIDTH) * size;
interface Company {
  id: string;
  name: string;
  logo: any; // Image source
  color: string;
  business: string;
  ntn: string;
  address: string;
  email: string;
  number: string;
  location?: string; // Company location/city
}
interface PreviousCompanyScreenProps {
  onCompanySelect?: (company: Company) => void;
  onAddNewCompany?: () => void;
  isSelectable?: boolean;
}
type NavigationProp = NativeStackNavigationProp<AppStackParamList>;
const PreviousCompanyScreen: React.FC<PreviousCompanyScreenProps> = ({
  onCompanySelect,
  onAddNewCompany,
  isSelectable = false,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { t, i18n } = useTranslation('profile');
  const [languageKey, setLanguageKey] = useState(0);
  const selectableFromRoute =
    typeof route?.params?.isSelectable === 'boolean' ? route.params.isSelectable : undefined;
  const effectiveIsSelectable = selectableFromRoute ?? isSelectable ?? false;
  useEffect(() => {
    const onLang = () => setLanguageKey(prev => prev + 1);
    i18n.on('languageChanged', onLang);
    return () => {
      i18n.off('languageChanged', onLang);
    };
  }, [i18n]);
  // Use the companies API hook
  const { data: apiCompanies, isLoading, error, refetch } = useCompanies();
  // Convert API companies to the local Company interface
  const companies: Company[] = React.useMemo(() => {
    if (!apiCompanies) return [];
    console.log('PreviousCompanyScreen - API Companies:', apiCompanies);
    return apiCompanies.map((apiCompany: ApiCompany) => {
      // Extract location from address or use a default
      const extractLocation = (addr: string | null | undefined): string => {
        if (!addr) return 'N/A';
        // Try to extract city name from address (simple heuristic)
        const cityMatch = addr.match(/\b(Lahore|Karachi|Islamabad|Rawalpindi|Faisalabad|Multan|Peshawar|Quetta)\b/i);
        return cityMatch ? cityMatch[1] : addr.split(',')[0] || 'N/A';
      };
      return {
        id: apiCompany.id.toString(),
        name: apiCompany.company_name,
        logo: apiCompany.logo_url ? { uri: apiCompany.logo_url } : Images.adrydLogo, // Fallback to default logo
        color: '#C539A5', // Default color, could be dynamic based on category
        business: apiCompany.category?.name || 'Business',
        ntn: apiCompany.company_ntn || 'N/A',
        address: apiCompany.address || 'N/A',
        email: apiCompany.email || 'N/A',
        number: apiCompany.contact_number || 'N/A',
        location: extractLocation(apiCompany.address),
      };
    });
  }, [apiCompanies]);
  // Debug logging
  React.useEffect(() => {
    console.log('PreviousCompanyScreen - State:', {
      isLoading,
      error: error?.message,
      companiesCount: companies.length,
      apiCompaniesCount: apiCompanies?.length || 0,
    });
  }, [isLoading, error, companies.length, apiCompanies?.length]);
  const handleBackPress = () => {
    navigation.goBack();
  };
  const handleAddNewCompany = () => {
    console.log(':white_check_mark: handleAddNewCompany called');
    // Navigate FIRST, before calling onAddNewCompany (in case it interferes)
    console.log(':rocket: Attempting to navigate to ChooseOptionScreen...');
    try {
      (navigation as any).navigate('ChooseOptionScreen' as never);
      console.log(':white_check_mark: Navigation call completed successfully');
    } catch (error: any) {
      console.error(':x: Navigation error:', error);
      Alert.alert('Navigation Error', error?.message || 'Failed to navigate');
    }
    // Call onAddNewCompany after navigation
    onAddNewCompany?.();
  };
  const handleCompanySelect = (company: Company) => {
    onCompanySelect?.(company);
    if (effectiveIsSelectable) {
      navigation.navigate('AdvertismentCreateScreen' as never, { flow: 'business' } as never);
    } else {
      console.log('Company selected:', company.name);
    }
  };
  const toggleExpanded = (companyId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };
  const isExpanded = (companyId: string) => expandedItems.has(companyId);
  const renderAddCompanyCard = () => (
    <TouchableOpacity
      style={styles.addCompanyCard}
      onPress={handleAddNewCompany}
      activeOpacity={0.8}>
      <View style={styles.addCompanyIconContainer}>
        <AddIcon
          width={scaleFont(32)}
          height={scaleFont(32)}
        // color="#9E9E9E"
        />
      </View>
    </TouchableOpacity>
  );
  const renderCompanyCard = (company: Company) => {
    const expanded = isExpanded(company.id);
    return (
      <View style={styles.companyCard}>
        {/* Header Section - Always Visible */}
        {/* Header Section - Show only when not expanded */}
        {!expanded && (
          <TouchableOpacity
            style={styles.companyCardHeader}
            onPress={() => toggleExpanded(company.id)}
            activeOpacity={0.8}
          >
            <View style={styles.companyCardContent}>
              {/* Company Logo */}
              <View style={styles.companyLogoContainer}>
                <Image
                  source={company.logo}
                  style={styles.companyLogoImage}
                  resizeMode="cover"
                />
              </View>

              {/* Company Name */}
              <View style={styles.companyInfoContainer}>
                <Text style={styles.companyName}>{company.name}</Text>
              </View>

              {/* Chevron */}
              <View style={styles.chevronContainer}>
                <Ionicons
                  name="chevron-down"
                  size={scaleFont(16)}
                  color="#18181B"
                />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Expandable Details Section */}
        {expanded && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => toggleExpanded(company.id)}
            style={styles.companyDetailsSection}
          >
            {/* Top Company Card Section */}
            <View style={styles.topCompanyCard}>
              <View style={styles.topCompanyCardContent}>
                <View style={styles.topCompanyLogoContainer}>
                  <Image
                    source={company.logo}
                    style={styles.topCompanyLogoImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.topCompanyInfo}>
                  <Text style={styles.topCompanyName}>{company.name}</Text>
                  <Text style={styles.topCompanySubtext}>Your Save Company</Text>
                </View>
                <View style={styles.checkmarkContainer}>
                  <Ionicons name="checkmark-circle" size={scaleFont(20)} color="#4CAF50" />
                </View>
              </View>
            </View>
            {/* Company Detail Section */}
            <View style={styles.companyDetailCard}>
              <Text style={styles.companyDetailTitle}>Company Detail</Text>
              <View style={styles.detailFieldsContainer}>
                <View style={styles.detailFieldRow}>
                  <Text style={styles.detailFieldLabel}>Company Name</Text>
                  <Text style={styles.detailFieldValue}>{company.name}</Text>
                </View>
                <View style={styles.detailFieldRow}>
                  <Text style={styles.detailFieldLabel}>Business Category</Text>

                  <Text style={styles.detailFieldValue}>{company.business}</Text>
                </View>
                <View style={styles.detailFieldRow}>
                  <Text style={styles.detailFieldLabel}>Company Location</Text>

                  <Text style={styles.detailFieldValue}>{company.location || 'N/A'}</Text>
                </View>
                <View style={styles.detailFieldRow}>
                  <Text style={styles.detailFieldLabel}>Company Number</Text>

                  <Text style={styles.detailFieldValue}>{company.number}</Text>
                </View>
                <View style={styles.detailFieldRow}>
                  <Text style={styles.detailFieldLabel}>Company NTN</Text>

                  <Text style={styles.detailFieldValue}>{company.ntn}</Text>
                </View>
                <View style={styles.detailFieldRow}>
                  <Text style={styles.detailFieldLabel}>Company Address</Text>

                  <Text style={styles.detailFieldValue}>{company.address}</Text>
                </View>
              </View>
              {/* Gradient Continue Button */}
              <PrimaryButton
                title="Lets Continue"
                onPress={() => handleCompanySelect(company)}
                buttonStyle={{
                  width: 161,
                  borderRadius: scaleWidth(12),
                  height: 50,
                  marginTop: hp(2),
                  alignSelf: "center"
                }}
                textStyle={{
                  fontSize: scaleFont(14),
                  fontWeight: '500',
                  color: "#F8F8F8",
                }}
              />

            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container} key={languageKey}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Header - Show for loading, error, or when companies exist. Hide only when showing empty state animation */}
      {(!isLoading && !error && companies.length === 0) ? null : (
        <Header
          title={t('previousCompany.select')}
          onBackPress={handleBackPress}
          showBackButton={true}
          showRightIcon={false}
        // containerStyle={{ paddingVertical: 5}}
        />
      )}
      {/* Content */}
      <View style={styles.content}>
        {/* Only show add company card when there are companies */}
        {!isLoading && !error && companies.length > 0 && renderAddCompanyCard()}
        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#C539A5" />
            <Text style={styles.loadingText}>{t('previousCompany.loading')}</Text>
          </View>
        )}
        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{t('previousCompany.error')}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refetch()}
            >
              <Text style={styles.retryButtonText}>{t('previousCompany.retry')}</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Companies List */}
        {!isLoading && !error && (
          companies.length === 0 ? (
            <CompanyEmptyState onCreateCompany={handleAddNewCompany} />
          ) : (
            <ScrollView
              style={styles.companyList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {companies.map((company) => (
                <View key={company.id}>
                  {renderCompanyCard(company)}
                </View>
              ))}
            </ScrollView>
          )
        )}
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },

  content: {
    flex: 1,
    marginTop: 10,
  },
  addCompanyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scaleWidth(12),
    height: scaleHeight(81),
    width: '93%',
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: "#E5E7EB",


    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  addCompanyIconContainer: {
    width: scaleWidth(40),
    height: scaleWidth(48),
    borderRadius: scaleWidth(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  companyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scaleWidth(12),
    marginBottom: hp(1.5),
    borderWidth: 0.7,
    borderColor: "#E5E7EB",
    overflow: 'hidden',
  },
  companyCardHeader: {
    minHeight: scaleHeight(70),
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: scaleWidth(12),
    borderTopRightRadius: scaleWidth(12),
  },
  companyCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  companyLogoContainer: {
    width: scaleWidth(48),
    height: scaleWidth(48),
    borderRadius: scaleWidth(24),
    // backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
    padding: scaleWidth(4),
  },
  companyLogoImage: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: scaleWidth(20),
  },
  companyInfoContainer: {
    flex: 1,
  },
  companyName: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#000000',
    paddingHorizontal: wp(2),
  },
  chevronContainer: {
    width: scaleWidth(24),
    height: scaleWidth(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyDetailsSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
    paddingBottom: hp(2),
  },
  topCompanyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scaleWidth(12),
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    padding: wp(4),
    marginBottom: hp(2),
  },
  topCompanyCardContent: {
    alignItems: 'center',
  },
  topCompanyLogoContainer: {
    width: scaleWidth(56),
    height: scaleWidth(56),
    borderRadius: scaleWidth(28),
    backgroundColor: '#FFFF',
    alignItems: 'center',
    justifyContent: 'center',

  },
  topCompanyLogoImage: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: scaleWidth(20),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB"
  },
  topCompanyInfo: {
    flex: 1,
    alignItems: "center",
  },
  topCompanyName: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    color: '#18181B',
    marginBottom: hp(0.5),

  },
  topCompanySubtext: {
    fontSize: scaleFont(8),
    fontWeight: '400',

    color: '#70737D',
  },
  checkmarkContainer: {
    marginTop: hp(1),
  },
  companyDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scaleWidth(12),
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    padding: wp(4),

  },
  companyDetailTitle: {
    fontSize: scaleFont(13),
    fontWeight: '500',
    color: '#18181B',
    marginBottom: hp(2),
    alignSelf: "center",
  },
  detailFieldsContainer: {
    marginBottom: hp(2),
  },
  detailFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.2),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailFieldLabel: {
    fontSize: scaleFont(10),
    fontWeight: '400',
    color: '#70737D',
    width: scaleWidth(120),
  },
  detailFieldValue: {
    fontSize: scaleFont(10),
    fontWeight: '500',
    color: '#70737D',
    flex: 1,
    textAlign: "right",

  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(4),
  },
  loadingText: {
    fontSize: scaleFont(16),
    color: '#666',
    marginTop: hp(1),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(4),
    paddingHorizontal: wp(4),
  },
  errorText: {
    fontSize: scaleFont(16),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp(2),
  },
  retryButton: {
    backgroundColor: '#C539A5',
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: scaleFont(8),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFont(16),
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(8),
    paddingHorizontal: wp(4),
  },
  emptyText: {
    fontSize: scaleFont(18),
    color: '#333',
    fontWeight: '600',
    marginBottom: hp(1),
  },
  emptySubtext: {
    fontSize: scaleFont(14),
    color: '#666',
    textAlign: 'center',
  },
});
export default PreviousCompanyScreen;