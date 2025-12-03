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
import Ionicons from 'react-native-vector-icons/Ionicons';
import PrimaryButton from '../../../components/PrimaryButton';
import { useCampaign } from '../hooks/useCampaign';
import ProgressBar from '../../../components/ProgressBar';
import FramesIcon from '../../../assets/images/frames1.png';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

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
    date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  return `${format(startDate)} to ${format(endDate)}`;
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

const CompanyWithoutInfoScreen: React.FC<any> = ({ navigation }) => {
  const { advertisementData } = useCampaign();

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
  const taxAmount = advertisementData?.tax ?? 10000;
  const grandTotal = subtotal + taxAmount;
  
  const firstDate = formatDateDisplay(advertisementData?.startDate);

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
        <View style={styles.heroCardContainer}>
          <View style={styles.heroCard}>
            <View style={styles.heroImageWrapper}>
              {isCampaignVideo ? (
                <View style={styles.videoPreview}>
                  <Ionicons name="play-circle" size={wp(8)} color="#FFFFFF" />
                  <Text style={styles.videoLabel}>Video</Text>
                </View>
              ) : (
                <Image source={campaignImageSource} style={styles.heroImage} />
              )}
            </View>
            <Text style={styles.heroTitle}>{campaignName}</Text>
            <Text style={styles.heroSubtitle}>Your Campaign Board</Text>
          </View>
          
          {/* Frames Icon below card */}
          <Image source={FramesIcon} style={styles.framesIcon} resizeMode="contain" />
        </View>

        {/* Main White Container */}
        <View style={styles.mainContainer}>
          {/* Campaign Detail */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Campaign Ad</Text>
            <View style={styles.detailGrid}>
              <DetailRow label="Name" value={campaignName} />
              <DetailRow label="Size" value={advertisementData?.size || 'N/A'} />
              <DetailRow label="Type" value={campaignType} />
              <DetailRow label="Category" value={campaignCategory} />
              <DetailRow label="City" value={advertisementData?.location || 'N/A'} />
              <DetailRow label="Area" value={advertisementData?.area || 'N/A'} />
              <DetailRow label="Duration" value={campaignDays} />
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
                <View>
                  <Text style={styles.cardMasked}>*******35454</Text>
                  <Text style={styles.cardNumber}>5411</Text>
                </View>
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
    backgroundColor: '#F8F8F8',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
    paddingBottom: height * 0.02,
    marginBottom: hp(1),
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(12),
  },
  heroCardContainer: {
    alignItems: 'center',
    marginBottom: hp(1),
  },
  heroCard: {
    width: 158,
    height: 125,
    borderRadius: 20,
    borderWidth: 0.7,
    borderStyle: 'dashed',
    borderColor: '#C539A5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(2),
    justifyContent: 'center',
  },
  heroImageWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#C539A5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: hp(0.8),
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroTitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#18181B',
    textAlign: 'center',
  },
  heroSubtitle: {
    marginTop: 2,
    fontSize: 9,
    color: '#A1A1A1',
    textAlign: 'center',
  },
  framesIcon: {
    width: wp(7),
    height: wp(7),
    marginTop: hp(0.5),
    marginBottom: hp(0.5),
  },
  mainContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingTop: 15,
    paddingHorizontal: 15,
    paddingBottom: 25,
    gap: 20,
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
  detailKey: {
    fontSize: 12,
    fontWeight: '400',
    color: '#70737D',
    minWidth: 70,
    lineHeight: 27.5,
  },
  detailValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400',
    color: '#1F2937',
    textAlign: 'right',
    lineHeight: 27.5,
  },
  paymentCard: {
    backgroundColor: '#FFF9EC',
    borderRadius: 12,
    paddingVertical: hp(3),
    paddingHorizontal: wp(3),
    borderWidth: 1,
    borderColor: '#FFE8B8',
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
  cardMasked: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  cardNumber: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
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
  paymentRightSection: {
    alignItems: 'flex-end',
  },
  priceCurrency: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8A8A8A',
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  dashedDivider: {
    borderStyle: 'dashed',
    borderWidth: 0.8,
    borderColor: '#E5E7EB',
    marginVertical: 5,
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
  videoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
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
});

export default CompanyWithoutInfoScreen;
