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
import ProgressBar from '../../../components/ProgressBar';
const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

const STEP_ITEMS = ['Upload', 'Review', 'Confirmation'] as const;
const CURRENT_STEP_INDEX = STEP_ITEMS.length - 1;

const maskPhone = (phone?: string) => {
  if (!phone) return '******35454';
  const clean = phone.replace(/\s/g, '');
  if (clean.length < 4) return phone;
  return `${'•'.repeat(Math.max(clean.length - 4, 2))}${clean.slice(-4)}`;
};

const formatCurrency = (value?: number) => {
  if (!value) return 'PKR 0';
  return `PKR ${value.toLocaleString()}`;
};

const formatRange = (start?: Date | string, end?: Date | string) => {
  if (!start || !end) return 'N/A';
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 'N/A';
  }
  const format = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${format(startDate)} - ${format(endDate)}`;
};

const CompanyWithoutInfoScreen: React.FC<any> = ({ navigation }) => {
  const { companyData, advertisementData } = useCampaign();

  const defaultCampaignImage =
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80';

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

  const campaignName = advertisementData?.campaignName || 'Banner Board';
  const campaignDays = formatRange(
    advertisementData?.startDate,
    advertisementData?.endDate,
  );
  const campaignCategory = advertisementData?.category || 'Statics';
  const campaignType = advertisementData?.type || 'Banner Board';

  const subtotal = advertisementData?.totalPayment ?? 20000;
  const taxAmount = advertisementData?.tax ?? 1000;
  const grandTotal = subtotal + taxAmount;

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

      {/* Progress */}
   
  <View style={styles.progressContainer}>
           <ProgressBar currentStep={5}/>
        </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Campaign Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroImageWrapper}>
            {isCampaignVideo ? (
              <View style={styles.videoPreview}>
                <Ionicons name="play-circle" size={wp(10)} color="#FFFFFF" />
                <Text style={styles.videoLabel}>Video</Text>
              </View>
            ) : (
              <Image source={campaignImageSource} style={styles.heroImage} />
            )}
          </View>
          <Text style={styles.heroTitle}>{campaignName}</Text>
          <Text style={styles.heroSubtitle}>Your Campaign Board</Text>
        </View>

        {/* Campaign Detail */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Campaign Ad</Text>
          <View style={styles.detailGrid}>
            <DetailRow label="Name" value={campaignName} />
            <DetailRow label="Days" value={campaignDays} />
            <DetailRow label="Category" value={campaignCategory} />
            <DetailRow label="Type" value={campaignType} />
          </View>
        </View>

        {/* Payment Summary */}
        {/* <View style={styles.paymentCard}>
          <View style={styles.paymentRow}>
            <View style={styles.paymentAvatar}>
              <Ionicons name="card-outline" size={wp(7)} color="#FF5BA5" />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentMasked}>{maskPhone(companyData?.companyNumber)}</Text>
              <Text style={styles.paymentNumber}>5411</Text>
            </View>
            <View style={styles.paymentStatusPill}>
              <Text style={styles.paymentStatusText}>Paid</Text>
            </View>
            <Text style={styles.paymentAmount}>{formatCurrency(subtotal)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.paymentMetaRow}>
            <Text style={styles.paymentMetaLabel}>Date</Text>
            <Text style={styles.paymentMetaValue}>{campaignDays}</Text>
          </View>
          <View style={styles.paymentMetaRow}>
            <Text style={styles.paymentMetaLabel}>Tax</Text>
            <Text style={styles.paymentMetaValue}>{formatCurrency(taxAmount)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(grandTotal)}</Text>
          </View>
        </View> */}
      </ScrollView>

      <View style={styles.bottomBar}>
        <CustomButton
          title="Confirmation"
          onPress={() => navigation.navigate('AdvertismentCongratulateScreen')}
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
};

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailKey}>{label}</Text>
    <Text style={styles.detailValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
   progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
    paddingBottom: height * 0.03,
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
  heroCard: {
    width: '60%',
    borderRadius: wp(5),
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#C539A5',
    backgroundColor: '#FFF7FB',
    alignItems: 'center',
    paddingVertical: hp(3),
    paddingHorizontal: wp(4),
    justifyContent:"center",
    alignSelf:"center"
  },
  heroImageWrapper: {
    width: wp(28),
    height: wp(28),
    borderRadius: wp(14),
    borderWidth: 3,
    borderColor: '#FFD6EC',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#C539A5',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroTitle: {
    marginTop: hp(2),
    fontSize: wp(4.2),
    fontWeight: '700',
    color: '#1E1E1E',
  },
  heroSubtitle: {
    marginTop: hp(0.3),
    fontSize: wp(3.1),
    color: '#A1A1A1',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(4),
    paddingVertical: hp(2.2),
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
    borderRadius: wp(3),
    backgroundColor: '#F9FAFB',
    paddingVertical: hp(1.6),
    paddingHorizontal: wp(3),
    gap: hp(0.8),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailKey: {
    fontSize: wp(3.1),
    fontWeight: '600',
    color: '#8F8F8F',
  },
  detailValue: {
    fontSize: wp(3.2),
    fontWeight: '600',
    color: '#2D2D2D',
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
  paymentInfo: {
    flex: 1,
  },
  paymentMasked: {
    fontSize: wp(3.6),
    color: '#2D2D2D',
    fontWeight: '600',
  },
  paymentNumber: {
    fontSize: wp(3.1),
    color: '#8F8F8F',
    marginTop: hp(0.2),
  },
  paymentStatusPill: {
    backgroundColor: '#E6FAEE',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(3),
  },
  paymentStatusText: {
    fontSize: wp(3),
    fontWeight: '600',
    color: '#2BB673',
  },
  paymentAmount: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: '#2D2D2D',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
  },
  paymentMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMetaLabel: {
    fontSize: wp(3.2),
    color: '#8F8F8F',
  },
  paymentMetaValue: {
    fontSize: wp(3.2),
    color: '#2D2D2D',
    fontWeight: '600',
  },
  totalRow: {
    marginTop: hp(1.2),
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
  videoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: wp(14),
    backgroundColor: '#C539A5',
    justifyContent: 'center',
    alignItems: 'center',
    gap: hp(0.6),
  },
  videoLabel: {
    color: '#FFFFFF',
    fontSize: wp(3.2),
    fontWeight: '600',
  },
});

export default CompanyWithoutInfoScreen;


