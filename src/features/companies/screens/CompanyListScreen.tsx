import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
// import { useTranslation } from 'react-i18next';
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { AppStackParamList } from '../../../app/navigation/AppNavigator';
import { AddIcon, Images } from '../../../assets/images';
import Header from '../../../components/Header';
import Loader from '../../../components/Loader';
import PrimaryButton from '../../../components/PrimaryButton';
import { useCampaignFlowStore } from '../../../store/campaignFlowStore';
import CompanyEmptyState from '../components/CompanyEmptyState';
import { Company as ApiCompany } from '../domain/entities';
import { useCompanies } from '../hooks/useCompanies';

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
  const boardData = route?.params?.boardData;
  const selectedBoard = useCampaignFlowStore(s => s.selectedBoard);
  const setSelectedCompany = useCampaignFlowStore(s => s.setSelectedCompany);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [logoColors, setLogoColors] = useState<Map<string, string>>(new Map());

  // const { t, i18n } = useTranslation('profile');

  // Compute language once
  // const currentLanguage: 'en' | 'ur' = i18n.language.startsWith('ur')
  //   ? 'ur'
  //   : 'en';
  // const isRTL = currentLanguage === 'ur';

  // useEffect(() => {
  //   const handleLangChange = (lang: string) => {
  //     setCurrentLanguage(getLang(lang));
  //   };
  //   i18n.on('languageChanged', handleLangChange);
  //   return () => i18n.off('languageChanged', handleLangChange);
  // }, []);




  
  const selectableFromRoute =
    typeof route?.params?.isSelectable === 'boolean'
      ? route.params.isSelectable
      : undefined;
  const effectiveIsSelectable = selectableFromRoute ?? isSelectable ?? false;

  // Use the companies API hook
  const { data: apiCompanies, isLoading, error, refetch } = useCompanies();

  // Generate colors based on company ID (deterministic color assignment)
  useEffect(() => {
    if (!apiCompanies || apiCompanies.length === 0) return;

    const colorMap = new Map<string, string>();
    const fallbackColors = [
      '#C539A5',
      '#4A90E2',
      '#4CAF50',
      '#FF6B6B',
      '#FFA500',
      '#9B59B6',
      '#FFD700',
      '#00BCD4',
      '#E91E63',
      '#795548',
      '#607D8B',
      '#FF5722',
    ];

    for (const apiCompany of apiCompanies) {
      const companyId = apiCompany.id.toString();
      const hash = companyId
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const color = fallbackColors[hash % fallbackColors.length];
      colorMap.set(companyId, color);
    }

    setLogoColors(colorMap);
  }, [apiCompanies]);

  // Convert API companies to local Company interface
  const companies: Company[] = useMemo(() => {
    if (!apiCompanies) return [];
    return apiCompanies.map((apiCompany: ApiCompany) => {
      const extractLocation = (addr: string | null | undefined): string => {
        if (!addr) return 'N/A';
        const cityMatch = addr.match(
          /\b(Lahore|Karachi|Islamabad|Rawalpindi|Faisalabad|Multan|Peshawar|Quetta)\b/i,
        );
        return cityMatch ? cityMatch[1] : addr.split(',')[0] || 'N/A';
      };
      const companyId = apiCompany.id.toString();
      const extractedColor = logoColors.get(companyId) || '#C539A5';

      return {
        id: companyId,
        name: apiCompany.company_name,
        logo: apiCompany.logo_url
          ? { uri: apiCompany.logo_url }
          : Images.adrydLogo,
        color: extractedColor,
        business: apiCompany.category?.name || 'Business',
        ntn: apiCompany.company_ntn || 'N/A',
        address: apiCompany.address || 'N/A',
        email: apiCompany.email || 'N/A',
        number: apiCompany.contact_number || 'N/A',
        location: extractLocation(apiCompany.address),
      };
    });
  }, [apiCompanies, logoColors]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleAddNewCompany = () => {
    try {
      const board = boardData || selectedBoard;
      (navigation as any).navigate('CreateCompanyScreen', {
        flow: 'business',
        boardData: board,
      } as never);
    } catch (error: any) {
      Alert.alert('Navigation Error', error?.message || 'Failed to navigate');
    }
    onAddNewCompany?.();
  };

  const handleCompanySelect = (company: Company) => {
    onCompanySelect?.(company);

    if (!effectiveIsSelectable) return;

    setSelectedCompany(company as any);

    const companyId = parseInt(company.id);
    const hasExplicitBoardData = boardData !== undefined && boardData !== null;

    if (hasExplicitBoardData) {
      (navigation as any).navigate('AdvertismentCreateScreen', {
        flow: 'business',
        companyId,
        boardData,
      });
    } else {
      const setSelectedChoice =
        useCampaignFlowStore.getState().setSelectedChoice;
      setSelectedChoice('business');

      try {
        (navigation as any).navigate('SearchLocation', {
          autoSelectSeeAll: true,
        });
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }
  };

  const toggleExpanded = (companyId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.has(companyId) ? newSet.delete(companyId) : newSet.add(companyId);
      return newSet;
    });
  };

  const isExpanded = (companyId: string) => expandedItems.has(companyId);

  const renderAddCompanyCard = () => (
    <TouchableOpacity
      style={styles.addCompanyCard}
      onPress={handleAddNewCompany}
      activeOpacity={0.8}
    >
      <View style={styles.addCompanyIconContainer}>
        <AddIcon width={scaleFont(32)} height={scaleFont(32)} />
      </View>
    </TouchableOpacity>
  );

  const renderCompanyCard = (company: Company) => {
    const expanded = isExpanded(company.id);
    const companyColor = company.color || '#C539A5';

    return (
      <View style={styles.companyCard}>
        {!expanded && (
          <TouchableOpacity
            style={styles.companyCardHeader}
            onPress={() => toggleExpanded(company.id)}
            activeOpacity={0.8}
          >
            <View
              style={[styles.colorBar, { backgroundColor: companyColor }]}
            />
            <View style={styles.companyCardContent}>
              <View style={styles.companyLogoContainer}>
                <Image
                  source={company.logo}
                  style={styles.companyLogoImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.companyInfoContainer}>
                <Text style={styles.companyName}>{company.name}</Text>
                <View style={styles.tagsContainer}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Company</Text>
                  </View>
                  <View style={styles.tagSeparator} />
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      {company.business} / {company.location || 'Lahore'}
                    </Text>
                  </View>
                </View>
              </View>
              {/* <View style={styles.chevronContainer}>
                <Ionicons
                  name="chevron-up"
                  size={scaleFont(20)}
                  color="#18181B"
                />
              </View> */}
            </View>
          </TouchableOpacity>
        )}

        {expanded && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => toggleExpanded(company.id)}
            style={styles.companyDetailsSection}
          >
            {/* Top company card + details + continue button */}
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
                  <Text style={styles.topCompanySubtext}>
                    Your Save Company
                  </Text>
                </View>
                <View style={styles.checkmarkContainer}>
                  <Ionicons
                    name="checkmark-circle"
                    size={scaleFont(20)}
                    color="#4CAF50"
                  />
                </View>
              </View>
            </View>

            <View style={styles.companyDetailCard}>
              <Text style={styles.companyDetailTitle}>Company Detail</Text>
              <View style={styles.detailFieldsContainer}>
                {[
                  { label: 'Company Name', value: company.name },
                  { label: 'Business Category', value: company.business },
                  {
                    label: 'Company Location',
                    value: company.location || 'N/A',
                  },
                  { label: 'Company Number', value: company.number },
                  { label: 'Company NTN', value: company.ntn },
                  { label: 'Company Address', value: company.address },
                ].map((field, index) => (
                  <View style={styles.detailFieldRow} key={index}>
                    <Text style={styles.detailFieldLabel}>{field.label}</Text>
                    <Text style={styles.detailFieldValue}>{field.value}</Text>
                  </View>
                ))}
              </View>
              <PrimaryButton
                title="Lets Continue"
                onPress={() => handleCompanySelect(company)}
                buttonStyle={{
                  width: 161,
                  borderRadius: scaleWidth(12),
                  height: 50,
                  marginTop: hp(2),
                  alignSelf: 'center',
                }}
                textStyle={{
                  fontSize: scaleFont(14),
                  fontWeight: '500',
                  color: '#F8F8F8',
                }}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {!isLoading && !error && companies.length === 0 ? null : (
        <Header
          title="Companies"
          onBackPress={handleBackPress}
          showBackButton
          showRightIcon={false}
          // isRTL={isRTL}
        />
      )}
      <View style={styles.content}>
        {!isLoading && !error && companies.length > 0 && renderAddCompanyCard()}
        {isLoading && <Loader />}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{t('previousCompany.error')}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refetch()}
            >
              <Text style={styles.retryButtonText}>
                {t('previousCompany.retry')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {!isLoading &&
          !error &&
          (companies.length === 0 ? (
            <CompanyEmptyState onCreateCompany={handleAddNewCompany} />
          ) : (
            <View style={styles.whiteContainer}>
              <ScrollView
                style={styles.companyList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                nestedScrollEnabled
                bounces
              >
                {companies.map(company => (
                  <View key={company.id}>{renderCompanyCard(company)}</View>
                ))}
              </ScrollView>
            </View>
          ))}
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
    borderColor: '#E5E7EB',

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
    paddingHorizontal: wp(2),
    paddingBottom: hp(1),
    paddingTop: hp(0.5),
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: scaleWidth(12),
    marginHorizontal: wp(3.5),
    marginTop: hp(1),
    marginBottom: hp(2),
    paddingVertical: hp(1.5),
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  companyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scaleWidth(12),
    marginBottom: hp(1.2),
    marginHorizontal: wp(1),
    borderWidth: 0.7,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  companyCardHeader: {
    minHeight: scaleHeight(80),
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: scaleWidth(12),
    borderTopRightRadius: scaleWidth(12),
    flexDirection: 'row',
  },
  colorBar: {
    width: scaleWidth(4),
    borderTopLeftRadius: scaleWidth(12),
    borderBottomLeftRadius: scaleWidth(12),
  },
  companyCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
  },
  companyLogoContainer: {
    width: scaleWidth(48),
    height: scaleWidth(48),
    borderRadius: scaleWidth(24),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
    padding: scaleWidth(2),
    borderWidth: 0,
  },
  companyLogoImage: {
    width: scaleWidth(44),
    height: scaleWidth(44),
    borderRadius: scaleWidth(22),
  },
  companyInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  companyName: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#000000',
    marginBottom: hp(0.8),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    marginTop: hp(0.3),
  },
  tag: {
    backgroundColor: '#E5E7EB',
    borderRadius: scaleWidth(6),
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.4),
  },
  tagText: {
    fontSize: scaleFont(10),
    fontWeight: '400',
    color: '#70737D',
  },
  tagSeparator: {
    width: '3%',
    height: 3,
    backgroundColor: '#D1D5DB',
    marginTop: hp(0.8),
    marginBottom: hp(0.8),
  },
  chevronContainer: {
    width: scaleWidth(24),
    height: scaleWidth(24),
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: wp(2),
    paddingTop: hp(0.5),
    alignSelf: 'flex-start',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  topCompanyLogoContainer: {
    width: scaleWidth(56),
    height: scaleWidth(56),
    borderRadius: scaleWidth(28),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(3),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  topCompanyLogoImage: {
    width: scaleWidth(48),
    height: scaleWidth(48),
    borderRadius: scaleWidth(24),
  },
  topCompanyInfo: {
    flex: 1,
  },
  topCompanyName: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#18181B',
    marginBottom: hp(0.3),
  },
  topCompanySubtext: {
    fontSize: scaleFont(11),
    fontWeight: '400',
    color: '#70737D',
  },
  checkmarkContainer: {
    marginLeft: wp(2),
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
    alignSelf: 'center',
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
    textAlign: 'right',
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
