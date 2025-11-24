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
import { AddIcon, Images } from '../../../assets/images';
import { useCompanies } from '../../companies/hooks/useCompanies';
import { Company as ApiCompany } from '../../companies/domain/entities';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import NoInternet from '../../../components/NoInternet';
import Header from '../../../components/Header';
import CompanyEmptyState from '../../companies/components/CompanyEmptyState';
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
    
    return apiCompanies.map((apiCompany: ApiCompany) => ({
      id: apiCompany.id.toString(),
      name: apiCompany.company_name,
      logo: apiCompany.logo_url ? { uri: apiCompany.logo_url } : Images.adrydLogo, // Fallback to default logo
      color: '#C539A5', // Default color, could be dynamic based on category
      business: apiCompany.category?.name || 'Business',
      ntn: apiCompany.company_ntn || 'N/A',
      address: apiCompany.address || 'N/A',
      email: apiCompany.email || 'N/A',
      number: apiCompany.contact_number || 'N/A',
    }));
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
    console.log('✅ handleAddNewCompany called');
    
    // Navigate FIRST, before calling onAddNewCompany (in case it interferes)
    console.log('🚀 Attempting to navigate to ChooseOptionScreen...');
    try {
      (navigation as any).navigate('ChooseOptionScreen' as never);
      console.log('✅ Navigation call completed successfully');
    } catch (error: any) {
      console.error('❌ Navigation error:', error);
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
        {/* Header Section */}
        <TouchableOpacity
          style={styles.companyCardHeader}
          onPress={() => toggleExpanded(company.id)}
          activeOpacity={0.8}>
          <View style={styles.companyCardContent}>
            {/* Company Logo */}
            <View style={[styles.companyLogoContainer, { backgroundColor: '#FFFFFF' }]}>
              <Image 
                source={company.logo} 
                style={styles.companyLogoImage}
                resizeMode="contain"
              />
            </View>

            {/* Company Name */}
            <View style={styles.companyInfoContainer}>
              <Text style={styles.companyName}>{company.name}</Text>
            </View>

            {/* Chevron Indicator */}
            <View style={styles.chevronContainer}>
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={scaleFont(16)}
               color={expanded ? "#999" : "#C539A5"} 
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Expandable Details Section */}
        {expanded && (
          <View style={styles.companyDetailsSection}>
            <View style={styles.detailsContainer}>
              <View style={styles.pinkLine} />
              <View style={styles.detailsContent}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('previousCompany.business')}</Text>
                  <Text style={styles.detailValue}>{company.business}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('previousCompany.ntn')}</Text>
                  <Text style={styles.detailValue}>{company.ntn}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('previousCompany.address')}</Text>
                  <Text style={styles.detailValue}>{company.address}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('previousCompany.email')}</Text>
                  <Text style={styles.detailValue}>{company.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('previousCompany.number')}</Text>
                  <Text style={styles.detailValue}>{company.number}</Text>
                </View>
              </View>
            </View>
            
            {/* Continue Business Button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => handleCompanySelect(company)}
              activeOpacity={0.8}>
              <Text style={styles.continueButtonText}>{t('previousCompany.continueBusiness')}</Text>
            </TouchableOpacity>
          </View>
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
          containerStyle={{ paddingVertical: 5}} 
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
    backgroundColor: '#FFFFFF',
    paddingVertical:25
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: scaleHeight(2),
  },
  headerSubtitle: {
    fontSize: scaleFont(14),
    fontWeight: '400',
    color: '#666666',
  },
  headerSpacer: {
    width: scaleWidth(40),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
  },
  addCompanyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scaleWidth(12),
    height: scaleHeight(67),
    width: '93%',
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  addCompanyIconContainer: {
    width: scaleWidth(40),
    height: scaleWidth(48),
    borderRadius: scaleWidth(24),
    // backgroundColor: '#F5F5F5',
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  companyCardHeader: {
    minHeight: scaleHeight(70),
    backgroundColor: '#ffffff',
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
    // width: scaleWidth(48),
    // height: scaleWidth(48),
    // borderRadius: scaleWidth(24),
    // alignItems: 'center',
    // justifyContent: 'center',
    // marginRight: wp(4),
    // padding: scaleWidth(8),
  },
  companyLogoImage: {
    width: scaleWidth(48),
    height: scaleWidth(48),
    borderRadius: scaleWidth(24),
  },
  companyInfoContainer: {
    flex: 1,
  },
  companyName: {
    fontSize: scaleFont(15),
    fontWeight: '700',
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
    paddingTop: hp(1),
    paddingBottom: hp(5),
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: hp(2),
    paddingHorizontal: wp(5),
  },
  pinkLine: {
    width: scaleWidth(4),
    backgroundColor: '#C539A5',
    marginRight: wp(4),
    borderRadius: scaleWidth(2),
  },
  detailsContent: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(0.8),
    minHeight: scaleHeight(35),
  },
  detailLabel: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  detailValue: {
    fontSize: scaleFont(14),
    fontWeight: '400',
    color: '#666666',
    flex: 1,
    textAlign: 'right',
  },
  continueButton: {
    backgroundColor: '#C539A5',
    // borderRadius: scaleWidth(8),
    paddingVertical: hp(1.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(2),
    width:380,
    position:'absolute',
    bottom:0,
    // left:wp(4)
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFont(16),
    fontWeight: '600',
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
