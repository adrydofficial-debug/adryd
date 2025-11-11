import React from 'react';
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
import CustomButton from '../../../components/CustomButton';
import { useCampaign } from '../hooks/useCampaign';

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

const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'N/A';
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
  return parsed.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const CompanyWithInfoScreen: React.FC<any> = ({ navigation }) => {
  const { companyData, advertisementData } = useCampaign();

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

  const firstDate = (() => {
    if (advertisementData?.selectedDays?.length) {
      return formatDate(advertisementData.selectedDays[0]);
    }
    return formatDate(advertisementData?.startDate);
  })();

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFF7FB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={wp(6)} color="#1E1E1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmation</Text>
        <View style={styles.headerSpacer} />
      </View>

    

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Snapshot Cards */}
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

          <View style={styles.linkBadge}>
            <Ionicons name="link" size={wp(5)} color="#FFFFFF" />
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

        {/* Company Details */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Company Detail</Text>
          <View style={styles.detailGrid}>
            <DetailRow label="Name" value={companyData?.companyName || 'N/A'} />
            <DetailRow label="Business" value={companyData?.businessName || 'N/A'} />
            <DetailRow label="NTN" value={companyData?.companyNTN || 'N/A'} />
            <DetailRow label="Address" value={companyData?.companyAddress || 'N/A'} />
            <DetailRow label="Email" value={companyData?.companyEmail || 'N/A'} />
            <DetailRow label="Number" value={companyData?.companyNumber || 'N/A'} />
          </View>
        </View>

        {/* Campaign Detail */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Campaign Ad</Text>
          <View style={styles.detailGrid}>
            <DetailRow label="Name" value={advertisementData?.campaignName || 'N/A'} />
            <DetailRow label="Days" value={totalDays} />
            <DetailRow label="Category" value={advertisementData?.category || 'N/A'} />
            <DetailRow label="Type" value={advertisementData?.type || 'N/A'} />
            <DetailRow label="Location" value={advertisementData?.location || 'N/A'} />
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.paymentCard}>
          <View style={styles.paymentRow}>
            <View style={styles.paymentAvatar}>
              <Ionicons name="card-outline" size={wp(7)} color="#FF5BA5" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentLabel}>******{maskPhone(companyData?.companyNumber).slice(-4)}</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>Paid</Text>
              </View>
            </View>
            <Text style={styles.paymentAmount}>
              {formatCurrency(advertisementData?.totalPayment || 20000)}
            </Text>
          </View>

          <View style={styles.divider} />

          <DetailRow label="Date" value={firstDate} compact />
          <DetailRow
            label="Tax"
            value={formatCurrency(advertisementData?.tax || 20000)}
            compact
          />

          <View style={[styles.divider, { marginTop: hp(1.5) }]} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(advertisementData?.totalPayment || 30000)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <CustomButton
          title="Confirmation"
          onPress={() => navigation.navigate('BottomTab', { tab: 'Home' })}
          variant="primary"
          size="large"
          buttonStyle={styles.confirmButton}
        />
      </View>
    </LinearGradient>
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
    <Text style={[styles.detailValueText, compact && styles.detailValueCompact]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(6),
    paddingTop: hp(5),
    paddingBottom: hp(2),
  },
  backButton: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(5.5),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: {
    fontSize: wp(5.2),
    fontWeight: '700',
    color: '#1E1E1E',
  },
  headerSpacer: {
    width: wp(11),
  },
  progressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(8),
    paddingBottom: hp(2),
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
    paddingHorizontal: wp(6),
    paddingBottom: hp(12),
    gap: hp(2.5),
  },
  cardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    marginBottom: hp(2.5),
  },
  summaryCard: {
    width: '45%',
    minHeight: hp(18),
    backgroundColor: '#FFFFFF',
    borderRadius: wp(4),
    paddingVertical: hp(3),
    paddingHorizontal: wp(2.5),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  companyCard: {},
  campaignCard: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#C539A5',
    backgroundColor: '#FFF7FB',
  },
  summaryImageWrapper: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
    borderWidth: 2,
    borderColor: '#E5D7EF',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: hp(1.2),
  },
  campaignImageWrapper: {
    borderColor: '#C539A5',
    backgroundColor: '#FDEBFA',
  },
  summaryImage: {
    width: '100%',
    height: '100%',
  },
  summaryTitle: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#2D2D2D',
    textAlign: 'center',
  },
  campaignTitle: {
    color: '#C539A5',
  },
  summarySubtitle: {
    fontSize: wp(3.1),
    color: '#A1A1A1',
    marginTop: hp(0.3),
  },
  campaignSubtitle: {
    color: '#C539A5',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: wp(9),
    backgroundColor: '#C539A5',
    justifyContent: 'center',
    alignItems: 'center',
    gap: hp(0.5),
  },
  videoLabel: {
    color: '#FFFFFF',
    fontSize: wp(3),
    fontWeight: '600',
  },
  linkBadge: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -wp(3) }, { translateY: -wp(3) }],
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: '#C539A5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C539A5',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(4),
    paddingVertical: hp(2.5),
    paddingHorizontal: wp(5),
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeading: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: hp(1.5),
  },
  detailGrid: {
    gap: hp(1.2),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: wp(4),
  },
  detailRowCompact: {
    marginTop: hp(0.5),
  },
  detailKey: {
    fontSize: wp(3.2),
    fontWeight: '600',
    color: '#848484',
    minWidth: wp(20),
  },
  detailKeyCompact: {
    fontSize: wp(3),
    minWidth: wp(18),
  },
  detailValueText: {
    flex: 1,
    fontSize: wp(3.4),
    color: '#2D2D2D',
    textAlign: 'right',
  },
  detailValueCompact: {
    fontSize: wp(3.2),
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(4),
    paddingVertical: hp(2.5),
    paddingHorizontal: wp(5),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4,
    gap: hp(1.2),
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
  },
  paymentAvatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: '#FFE5F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: wp(3.6),
    color: '#2D2D2D',
    fontWeight: '600',
  },
  statusPill: {
    marginTop: hp(0.6),
    alignSelf: 'flex-start',
    backgroundColor: '#E6FAEE',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(3),
  },
  statusText: {
    fontSize: wp(3),
    color: '#2BB673',
    fontWeight: '600',
  },
  paymentAmount: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: '#2D2D2D',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#A1A1A1',
  },
  totalValue: {
    fontSize: wp(5),
    fontWeight: '700',
    color: '#C539A5',
  },
  bottomBar: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(3.5),
    paddingTop: hp(1),
    backgroundColor: 'transparent',
  },
  confirmButton: {
    width: '100%',
    borderRadius: wp(4),
    paddingVertical: hp(2.2),
  },
});

export default CompanyWithInfoScreen;

