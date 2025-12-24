import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Loader from '../../../components/Loader';
import PrimaryButton from '../../../components/PrimaryButton';
import { useCampaign } from '../hooks/useCampaign';
import { getAdvertisement } from '../api/api';
import { CompanyData, AdvertisementData } from '../../../store/campaignStore';
import  ProgressBar  from '../../../components/ProgressBar';
import FramesIcon from '../../../assets/images/Frames.png';
const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

const STEP_ITEMS = ['Company', 'Upload', 'Review', 'Confirmation'] as const;
const CURRENT_STEP_INDEX = STEP_ITEMS.length - 1;

const maskPhone = (phone?: string) => {
  if (!phone) return 'N/A';
  const clean = phone.replace(/\s/g, '');
  if (clean.length < 4) return phone;
  return `${'•'.repeat(Math.max(clean.length - 4, 2))}${clean.slice(-4)}`;
};

const formatCurrency = (value?: number) => {
  if (!value) return 'PKR 0';
  return `PKR ${value.toLocaleString()}`;
};

const formatDateDisplay = (date: Date | string | undefined) => {
  if (!date) return 'N/A';
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateRange = (start?: Date | string, end?: Date | string) => {
  if (!start || !end) return 'N/A';
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 'N/A';
  }
  const format = (date: Date) =>
    date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  return `${format(startDate)} to ${format(endDate)}`;
};

const CompanyWithInfoScreen: React.FC<any> = ({ navigation, route }) => {
  const { companyData, advertisementData, setCompanyData, setAdvertisementData } = useCampaign();
  const [isLoading, setIsLoading] = useState(false);
  
  const campaignId = route?.params?.campaignId ? parseInt(route.params.campaignId, 10) : null;
  
  // Fetch advertisement data if not in store but campaignId is available
  useEffect(() => {
    const fetchAndPopulateData = async () => {
      if (!campaignId) return;
      
      // If we already have data in store, don't fetch
      if (advertisementData && companyData) {
        console.log('✅ [CompanyWithInfoScreen] Data already in store, skipping fetch');
        return;
      }
      
      // If we have advertisement data but no company data, try to get company from advertisement
      if (advertisementData && !companyData && campaignId) {
        console.log('⚠️ [CompanyWithInfoScreen] Has advertisement data but no company data, fetching advertisement for company info');
        setIsLoading(true);
        try {
          const response = await getAdvertisement(campaignId);
          const ad = response as any;
          
          // Extract company data from advertisement
          if (ad.company) {
            const companyInfo: CompanyData = {
              companyName: ad.company.company_name || 'N/A',
              businessName: ad.company.category?.name || 'N/A',
              businessCategory: ad.company.category?.name || 'N/A',
              companyEmail: ad.company.email || 'N/A',
              companyAddress: ad.company.address || 'N/A',
              companyNTN: ad.company.company_ntn || 'N/A',
              companyNumber: ad.company.contact_number || 'N/A',
              logoUri: ad.company.logo_url || undefined,
            };
            setCompanyData(companyInfo);
            console.log('✅ [CompanyWithInfoScreen] Company data populated from advertisement');
          }
        } catch (error) {
          console.error('❌ [CompanyWithInfoScreen] Failed to fetch advertisement:', error);
        } finally {
          setIsLoading(false);
        }
        return;
      }
      
      // If we don't have advertisement data, fetch it
      if (!advertisementData && campaignId) {
        console.log('🔄 [CompanyWithInfoScreen] No advertisement data in store, fetching from API...');
        setIsLoading(true);
        try {
          const response = await getAdvertisement(campaignId);
          const ad = response as any;
          
          // Map advertisement to store format
          const booking = ad.bookings?.[0];
          const media = ad.media?.[0];
          
          const adData: AdvertisementData = {
            campaignName: ad.title || 'N/A',
            description: ad.description || '',
            location: ad.board?.title || ad.board?.slug?.replace(/-/g, ' ') || 'N/A',
            selectedDays: booking 
              ? [booking.start_at, booking.end_at].filter(Boolean)
              : [],
            startDate: booking?.start_at || ad.created_at,
            endDate: booking?.end_at || ad.created_at,
            category: ad.board?.category?.name || 'N/A',
            type: ad.board?.category?.group?.name || 'N/A',
            size: ad.board?.width && ad.board?.height 
              ? `${ad.board.width}ft by ${ad.board.height}ft`
              : 'N/A',
            area: ad.board?.description || 'N/A',
            previewImage: media?.url || ad.board?.media?.[0]?.url || undefined,
            mediaUri: media?.url || ad.board?.media?.[0]?.url || undefined,
            mediaType: media?.type || 'image/jpeg',
            isVideo: media?.type?.toLowerCase().startsWith('video/') || false,
            totalPayment: ad.total_payment || 0,
            tax: ad.total_payment ? Math.round(ad.total_payment * 0.1) : 0,
          };
          
          setAdvertisementData(adData);
          console.log('✅ [CompanyWithInfoScreen] Advertisement data populated from API');
          
          // Also extract and set company data if available
          if (ad.company) {
            const companyInfo: CompanyData = {
              companyName: ad.company.company_name || 'N/A',
              businessName: ad.company.category?.name || 'N/A',
              businessCategory: ad.company.category?.name || 'N/A',
              companyEmail: ad.company.email || 'N/A',
              companyAddress: ad.company.address || 'N/A',
              companyNTN: ad.company.company_ntn || 'N/A',
              companyNumber: ad.company.contact_number || 'N/A',
              logoUri: ad.company.logo_url || undefined,
            };
            setCompanyData(companyInfo);
            console.log('✅ [CompanyWithInfoScreen] Company data populated from advertisement');
          }
        } catch (error) {
          console.error('❌ [CompanyWithInfoScreen] Failed to fetch advertisement:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchAndPopulateData();
  }, [campaignId, advertisementData, companyData, setAdvertisementData, setCompanyData]);

  const defaultCompanyImage =
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&q=80';
  const defaultCampaignImage =
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80';

  const companyLogoSource =
    companyData?.logoUri && companyData.logoUri !== ''
      ? { uri: companyData.logoUri }
      : { uri: defaultCompanyImage };

  const campaignMediaUri =
    advertisementData?.mediaUri ||
    advertisementData?.previewImage ||
    defaultCampaignImage;

  const isCampaignVideo =
    !!advertisementData?.isVideo ||
    !!advertisementData?.mediaType?.toLowerCase().startsWith('video/');

  const campaignImageSource = !isCampaignVideo
    ? { uri: campaignMediaUri }
    : { uri: defaultCampaignImage };

  const totalDays = (() => {
    if (advertisementData?.selectedDays?.length) {
      return `${advertisementData.selectedDays.length} Days`;
    }
    if (advertisementData?.startDate && advertisementData?.endDate) {
      const start = new Date(advertisementData.startDate);
      const end = new Date(advertisementData.endDate);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        const diff =
          Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return `${diff} Days`;
      }
    }
    return 'N/A';
  })();

  const daysRange = formatDateRange(advertisementData?.startDate, advertisementData?.endDate);

  const firstDate = (() => {
    if (advertisementData?.selectedDays?.length) {
      return formatDateDisplay(advertisementData.selectedDays[0]);
    }
    return formatDateDisplay(advertisementData?.startDate);
  })();

  const subtotal = advertisementData?.totalPayment ?? 20000;
  const taxAmount = advertisementData?.tax ?? 10000;
  const grandTotal = subtotal + taxAmount;

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
        <Loader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={wp(5)} color="#1E1E1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmation</Text>
        <View style={styles.headerSpacer} />
      </View>
<View style={styles.progressWrapper}>
  <ProgressBar currentStep={4}/>
</View>
      

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Snapshot Cards with Curve */}
        <View style={styles.cardsContainer}>
          {/* Curved Line */}
          <View style={styles.curveContainer}>
            <View style={styles.curvedLine} />
          </View>
          
          <View style={styles.cardsRow}>
            <View style={[styles.summaryCard, styles.companyCard]}>
              <View style={styles.summaryImageWrapper}>
                <Image source={companyLogoSource} style={styles.summaryImage} resizeMode="cover" />
              </View>
              <Text style={styles.summaryTitle}>
                {companyData?.companyName || 'Your Company'}
              </Text>
              <Text style={styles.summarySubtitle}>Your Company</Text>
            </View>

            {/* Link Badge between cards */}
            <View style={styles.framesIconContainer}>
              <Image source={FramesIcon} style={styles.framesIcon} resizeMode="contain" />
            </View>

            <View style={[styles.summaryCard, styles.campaignCard]}>
              <View style={[styles.summaryImageWrapper, styles.campaignImageWrapper]}>
                {isCampaignVideo ? (
                  <View style={styles.videoPreview}>
                    <Ionicons name="play-circle" size={wp(8)} color="#FFFFFF" />
                    <Text style={styles.videoLabel}>Video</Text>
                  </View>
                ) : (
                  <Image source={campaignImageSource} style={styles.summaryImage} resizeMode="cover" />
                )}
              </View>
              <Text style={[styles.summaryTitle, styles.campaignTitle]}>
                {advertisementData?.campaignName || 'Banner Board'}
              </Text>
              <Text style={[styles.summarySubtitle, styles.campaignSubtitle]}>
                Your Campaign Board
              </Text>
            </View>
          </View>
        </View>

        {/* Main White Container */}
        <View style={styles.mainContainer}>
          {/* Company Details */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Company Detail</Text>
            <View style={styles.detailGrid}>
              <DetailRow label="Name" value={companyData?.companyName || 'N/A'} />
              <DetailRow label="Category" value={companyData?.businessCategory || companyData?.businessName || 'N/A'} />
              <DetailRow label="Location" value={advertisementData?.location || 'N/A'} />
              <DetailRow label="Number" value={companyData?.companyNumber || 'N/A'} />
              <DetailRow label="Email" value={companyData?.companyEmail || 'N/A'} />
              <DetailRow label="NTN" value={companyData?.companyNTN || 'N/A'} />
              <DetailRow label="Address" value={companyData?.companyAddress || 'N/A'} />
            </View>
          </View>

          {/* Campaign Detail */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Campaign Ad</Text>
            <View style={styles.detailGrid}>
              <DetailRow label="Name" value={advertisementData?.campaignName || 'N/A'} />
              <DetailRow label="Size" value={advertisementData?.size || 'N/A'} />
              <DetailRow label="Type" value={advertisementData?.type || 'N/A'} />
              <DetailRow label="Category" value={advertisementData?.category || 'N/A'} />
              <DetailRow label="City" value={advertisementData?.location || 'N/A'} />
              <DetailRow label="Area" value={advertisementData?.area || 'N/A'} />
              <DetailRow label="Duration" value={daysRange} />
            </View>
          </View>

          {/* Payment Summary Card */}
          <View style={styles.paymentCard}>
            <View style={styles.paymentMainRow}>
              {/* Card Icon and Info */}
              <View style={styles.paymentLeftSection}>
                <View style={styles.cardIconWrapper}>
                  <View style={styles.cardChip} />
                  <View style={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons key={star} name="star" size={wp(2)} color="#FFB800" />
                    ))}
                  </View>
                </View>
                <Text style={styles.cardNumber}>₨31</Text>
              </View>

              {/* Paid Badge */}
              <View style={styles.paidBadge}>
                <Text style={styles.paidText}>Paid</Text>
              </View>

              {/* Price Section */}
              <View style={styles.paymentRightSection}>
                <Text style={styles.priceCurrency}>PKR</Text>
                <Text style={styles.priceAmount}>{subtotal.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          {/* Dashed Divider */}
          <View style={styles.dashedDivider} />

          {/* Date and Tax Section */}
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date</Text>
              <Text style={styles.summaryValue}>{firstDate}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>{formatCurrency(taxAmount)}</Text>
            </View>
          </View>

          {/* Dashed Divider */}
          <View style={styles.dashedDivider} />

          {/* Total Section */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Pk {grandTotal.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <PrimaryButton
          title="Confirmation"
          onPress={() => navigation.navigate('AdvertismentCongratulateScreen')}
          buttonStyle={styles.confirmButton}
        />
      </View>
    </View>
  );
};

type DetailRowProps = {
  label: string;
  value: string;
  compact?: boolean;
};

const DetailRow: React.FC<DetailRowProps> = ({ label, value, compact }) => (
  <View style={[styles.detailRow, compact && styles.detailRowCompact]}>
    <Text style={[styles.detailKey, compact && styles.detailKeyCompact]}>{label}</Text>
    <Text
      style={[styles.detailValueText, compact && styles.detailValueCompact]}
      numberOfLines={2}
      ellipsizeMode="clip"
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingTop: hp(5),
    paddingBottom: hp(1.5),
  },
  backButton: {
    width: wp(10),
    height: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: wp(4.2),
    fontWeight: '600',
    color: '#1E1E1E',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  headerSpacer: {
    width: wp(10),
  },
  progressWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
    paddingBottom: height * 0.02,
    marginBottom: hp(3),
  },
  progressItem: {
    alignItems: 'center',
  },
  progressCircle: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(5.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleActive: {
    shadowColor: '#FF5BA5',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  progressIndex: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#8F8F8F',
  },
  progressIndexActive: {
    color: '#FFFFFF',
  },
  progressLabel: {
    marginTop: hp(0.8),
    fontSize: wp(3),
    color: '#A7A7A7',
  },
  progressLabelActive: {
    color: '#C539A5',
    fontWeight: '600',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#DFDFDF',
    marginHorizontal: wp(2),
  },
  progressLineActive: {
    backgroundColor: '#FF76B8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(12),
  },
  mainContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingTop: 15,
    paddingHorizontal: 15,
    paddingBottom: 25,
    gap: 20,
    marginTop: hp(2),
  },
  cardsContainer: {
    position: 'relative',
    marginBottom: hp(1),
    justifyContent: 'center',
  },
  curveContainer: {
    position: 'absolute',
    top: hp(12),
    left: wp(8),
    right: wp(8),
    height: hp(4),
    zIndex: 0,
    overflow: 'hidden',
  },
  curvedLine: {
    width: '100%',
    height: hp(10),
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: wp(50),
    borderBottomWidth: 0,
    marginTop: hp(-6),
  },
  cardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  framesIconContainer: {
    zIndex: 10,
    marginHorizontal: wp(-2),
  },
  framesIcon: {
    width: wp(7),
    height: wp(7),
    marginLeft: wp(3),
    marginRight: wp(3),
  },
  summaryCard: {
    width: 158,
    height: 125,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyCard: {
    borderWidth: 0.7,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    borderRadius: 20,

  },
  campaignCard: {
    borderWidth: 0.7,
    borderStyle: 'dashed',
    borderColor: '#C539A5',
  },
  summaryImageWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: hp(0.8),
  },
  campaignImageWrapper: {
    backgroundColor: '#FFFFFF',
  },
  summaryImage: {
    width: '100%',
    height: '100%',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D2D2D',
    textAlign: 'center',
    marginTop: 4,
  },
  campaignTitle: {
    color: '#18181B',
  },
  summarySubtitle: {
    fontSize: 9,
    color: '#A1A1A1',
    marginTop: 2,
    textAlign: 'center',
  },
  campaignSubtitle: {
    color: '#A1A1A1',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: wp(7),
    backgroundColor: '#C539A5',
    justifyContent: 'center',
    alignItems: 'center',
    gap: hp(0.3),
  },
  videoLabel: {
    color: '#FFFFFF',
    fontSize: wp(2.5),
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    padding: 15,
    borderWidth: 0.7,
    borderColor: '#E5E7EB',
    gap: 10,
    width: '100%',
    alignSelf: 'stretch',
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  detailGrid: {
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 27.5,
  },
  detailRowCompact: {
    marginTop: 2,
  },
  detailKey: {
    fontSize: 12,
    fontWeight: '400',
    color: '#70737D',
    minWidth: 70,
    lineHeight: 27.5,
  },
  detailKeyCompact: {
    fontSize: 11,
    minWidth: 60,
  },
  detailValueText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400',
    color: '#1F2937',
    textAlign: 'right',
    lineHeight: 27.5,
  },
  detailValueCompact: {
    fontSize: 11,
  },
  paymentCard: {
    backgroundColor: '#FFF9EC',
    borderRadius: 12,
    paddingVertical: hp(3),
    paddingHorizontal: wp(3),
    borderWidth: 1,
    borderColor: '#FFE8B8',
  },
  paidBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    position: 'absolute',
    right: -10,
    top: -20,
  },
  paidText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  dashedDivider: {
    borderStyle: 'dashed',
    borderWidth: 0.8,
    borderColor: '#E5E7EB',
    marginVertical: 5,
  },
  paymentMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  paymentLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  cardIconWrapper: {
    width: wp(12),
    height: wp(8),
    backgroundColor: '#FFD666',
    borderRadius: wp(1.5),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(1),
  },
  cardChip: {
    width: wp(4),
    height: wp(3),
    backgroundColor: '#E6B800',
    borderRadius: wp(0.5),
    position: 'absolute',
    left: wp(1.5),
    top: wp(1.5),
  },
  ratingStars: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: wp(1),
    right: wp(1),
  },
  cardNumber: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: '#2D2D2D',
  },
  paymentRightSection: {
    alignItems: 'flex-end',
  },
  priceCurrency: {
    fontSize: wp(2.8),
    fontWeight: '500',
    color: '#8A8A8A',
  },
  priceAmount: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: '#2D2D2D',
  },
  summarySection: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  bottomBar: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(3),
    paddingTop: hp(1),
    backgroundColor: 'transparent',
  },
  confirmButton: {
    width: '100%',
    borderRadius: wp(3),
    paddingVertical: hp(2),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: wp(4),
    color: '#666',
  },
});

export default CompanyWithInfoScreen;

