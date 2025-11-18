import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GreenTickIcon } from '../../../assets/images';
import CustomButton from '../../../components/CustomButton';
import { useGenerateUploadUrl } from '../hooks/hooks';
const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;
export interface CompanyDetail {
  name?: string;
  business?: string;
  location?: string;
  number?: string;
  ntn?: string;
  address?: string;
  email?: string;
  logoUri?: string;
}

export interface CampaignDetail {
  name?: string;
  size?: string;
  category?: string;
  type?: string;
  location?: string;
  area?: string;
  boardImageUri?: string;
}

export interface PaymentDetail {
  method?: string;
  accountNumber?: string;
  status?: 'Paid' | 'Pending' | 'Failed';
  amount?: string;
  date?: string;
  tax?: string;
  total?: string;
}

export interface StatusCardProps {
  id: number;
  title: string;
  status:
    | 'Publish'
    | 'Schedule'
    | 'Review'
    | 'Payment Pending'
    | 'Draft'
    | 'Completed'
    | 'InProgress'
    | 'Blocked';
  statusColor?: string;
  adType?: string[];
  purchaseDuration?: string;
  location?: string;
  locationDetail?: string;
  // startDate?: string;
  // endDate?: string;
  timelineProgress?: number; // 0-100
  isExpanded?: boolean;
  onPress?: () => void;
  navigation?: any; // Navigation prop for Draft status button
  // Expanded content props
  companyDetail?: CompanyDetail;
  campaignDetail?: CampaignDetail;
  paymentDetail?: PaymentDetail;
  showCompanyDetail?: boolean; // Control whether to show company detail section with boxes
}

const StatusCard: React.FC<StatusCardProps> = ({
  id,
  title,
  status = 'Publish',
  statusColor = '#4CAF50',
  adType = ['Static', 'Billboard'],
  purchaseDuration = '15 days',
  location = 'Lahore',
  locationDetail = 'Area DHA Phase 4 DD',
  // startDate = '01.12. Dec',
  // endDate = '22.12. Dec',
  timelineProgress = 65,
  isExpanded = false,
  onPress,
  navigation,
  companyDetail,
  campaignDetail,
  paymentDetail,
  showCompanyDetail = true,
}) => {
  const { mutateAsync: generateUploadUrl, isPending: isGeneratingUrl } = useGenerateUploadUrl();
  const [isLoading, setIsLoading] = useState(false);
  const isPaymentPending = status === 'Payment Pending';
  const isActiveStatus = status === 'Publish';
  const statusBadgeTextColor = isPaymentPending ? '#BD8700' : '#FFFFFF';
  const typeTagTextColor = isPaymentPending ? '#BD8700' : '#FFFFFF';
  const cardContainerStatusStyle = isPaymentPending ? styles.paymentPendingCardContainer : undefined;
  // Get campaign card background color based on status
  const getCampaignCardBackground = () => {
    if (status === 'InProgress') {
      return '#F5E8FA'; // Light version of #ECBDF3
    }
    if (status === 'Blocked') {
      return '#FCE8E8'; // Light version of #F25255
    }
    if (status === 'Draft') {
      return '#F8F8F8'; // Light gray for Draft status
    }
    if (status === 'Schedule') {
      return '#F5E8FF';
    }
    return '#F0F8F0'; // Default green tint for Publish
  };

  

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Header Section */}
      <View style={styles.header}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          {isActiveStatus && (
            <GreenTickIcon width={wp(4)} height={wp(4)} />
          )}
          <Text style={[styles.statusText, { color: statusBadgeTextColor }]}>{status}</Text>
        </View>
        {/* Info Icon */}
        <TouchableOpacity style={styles.alertIcon}>
          <Ionicons name="information-circle-outline" size={wp(5)} color="#9E9E9E" />
        </TouchableOpacity>
      </View>
      <View style={styles.bodyContainer}>
      <View style={styles.timelineWrapper}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.typeTags}>
            {adType.map((type, index) => (
              <View key={index} style={[styles.typeTag, { backgroundColor: statusColor }]}>
                <Text style={[styles.typeTagText, isPaymentPending && styles.typeTagTextPayment]}>{type}</Text>
              </View>
            ))}
          </View>
        </View>
        {/* Details Section */}
        <View style={styles.detailsSection}>
          {/* Purchase Duration */}
          <View style={styles.detailRow}>
            <View style={styles.detailTag}>
              <Ionicons name="checkmark-circle" size={wp(3.5)} color="#9E9E9E" />
              <Text style={styles.detailTagText}>Board purchased for</Text>
            </View>
            <View style={styles.detailValueTag}>
              <Text style={styles.detailValueText}>{purchaseDuration}</Text>
            </View>
          </View>
          {/* Location */}
          {location && location !== 'N/A' && (
            <View style={styles.locationRow}>
              <Ionicons 
                name="location" 
                size={wp(3.5)} 
                color="#666" 
                style={styles.locationIcon} 
              />
              <Text style={styles.locationText}>
                {location}
              </Text>
            </View>
          )}
        </View>
       </View> 

        {/* Timeline Section with Expand Icon */}
        {/* <View style={styles.timelineWrapper}> */}
          <View style={styles.timelineSectionWithIcon}>
            <View style={styles.timelineSection}>
              <View style={styles.timelineHeader}>
                <Ionicons name="time-outline" size={wp(3.5)} color="#666" />
                <Text style={styles.timelineLabel}>Timeline</Text>
              </View>
              <View style={styles.progressBarContainer}>
                {isActiveStatus && (
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${timelineProgress}%`, backgroundColor: statusColor },
                    ]}
                  />
                )}
              </View>
            </View>
            {/* Expand/Collapse Icon */}
            <TouchableOpacity style={styles.expandIcon} onPress={onPress}>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={wp(5)}
                color="#1E1E1E"
              />
            </TouchableOpacity>
          </View>
        {/* </View> */}
      </View>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* CompanyWithInfoScreen Layout - Two side-by-side cards with link badge */}
          {showCompanyDetail && companyDetail && (
            <>
              {/* Snapshot Cards Row - Matching CompanyWithInfoScreen */}
              <View style={styles.cardsRow}>
                {/* Company Card */}
                <View style={[styles.summaryCard, styles.companyCard, cardContainerStatusStyle]}>
                  <View style={styles.summaryImageWrapper}>
                    {companyDetail.logoUri ? (
                      <Image source={{ uri: companyDetail.logoUri }} style={styles.summaryImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.logoPlaceholder}>
                        <Text style={[styles.logoText, { color: statusColor }]}>
                          {companyDetail.name?.charAt(0).toUpperCase() || 'T'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.summaryTitle}>
                    {companyDetail.name || 'Your Company'}
                  </Text>
                  <Text style={styles.summarySubtitle}>Your Company</Text>
                </View>

                {/* Link Badge - Matching CompanyWithInfoScreen */}
                <View style={styles.linkBadge}>
                  <Ionicons name="link" size={wp(5)} color="#FFFFFF" />
                </View>

                {/* Campaign Card */}
                <View style={[styles.summaryCard, styles.campaignCard, cardContainerStatusStyle]}>
                  <View style={[styles.summaryImageWrapper, styles.campaignImageWrapper]}>
                    {campaignDetail?.boardImageUri ? (
                      <Image source={{ uri: campaignDetail.boardImageUri }} style={styles.summaryImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.boardImagePlaceholder}>
                        <Ionicons name="image-outline" size={wp(8)} color="#999" />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.summaryTitle, styles.campaignTitle]}>
                    {campaignDetail?.name || 'Banner Board'}
                  </Text>
                  <Text style={[styles.summarySubtitle, styles.campaignSubtitle]}>
                    Your Campaign Board
                  </Text>
                </View>
              </View>

              {/* Company Details Card - Matching CompanyWithInfoScreen */}
              <View style={styles.confirmationCard}>
                <Text style={styles.cardHeading}>Company Detail</Text>
                <View style={styles.detailGrid}>
                  <DetailRow label="Name" value={companyDetail.name || 'N/A'} />
                  <DetailRow label="Business" value={companyDetail.business || 'N/A'} />
                  <DetailRow label="NTN" value={companyDetail.ntn || 'N/A'} />
                  <DetailRow label="Address" value={companyDetail.address || 'N/A'} />
                  <DetailRow label="Email" value={companyDetail.email || 'N/A'} />
                  <DetailRow label="Number" value={companyDetail.number || 'N/A'} />
                </View>
              </View>
            </>
          )}

          {/* CompanywithoutInfoScreen Layout - Single centered hero card */}
          {!showCompanyDetail && (
            <View style={styles.heroCardContainer}>
              <View style={[styles.heroCard, cardContainerStatusStyle]}>
                <View style={styles.heroImageWrapper}>
                  {campaignDetail?.boardImageUri ? (
                    <Image source={{ uri: campaignDetail.boardImageUri }} style={styles.heroImage} />
                  ) : (
                    <View style={styles.boardImagePlaceholder}>
                      <Ionicons name="image-outline" size={wp(10)} color="#999" />
                    </View>
                  )}
                </View>
                <Text style={styles.heroTitle}>{campaignDetail?.name || title}</Text>
                <Text style={styles.heroSubtitle}>Your Campaign Board</Text>
              </View>
              <View style={styles.heroTickWrapper}>
                <GreenTickIcon width={wp(5)} height={wp(5)} />
              </View>
            </View>
          )}

          {/* Campaign Detail Card - Always show when expanded - Matching both screens */}
          <View style={styles.confirmationCard}>
            <Text style={styles.cardHeading}>Campaign Detail</Text>
            <View style={styles.detailGrid}>
              <DetailRow label="Name" value={campaignDetail?.name || title} isFirst />
              <DetailRow label="Size" value={campaignDetail?.size || 'N/A'} />
              <DetailRow label="Category" value={campaignDetail?.category || 'N/A'} />
              <DetailRow label="Type" value={campaignDetail?.type || 'N/A'} />
              <DetailRow label="Location" value={campaignDetail?.location || 'N/A'} />
              <DetailRow label="Area" value={campaignDetail?.area || 'N/A'} />
            </View>
          </View>
          {/* Payment Summary Card */}
          {paymentDetail && status !== 'Draft' && (
            <View style={[styles.paymentCard, status === 'Payment Pending' && styles.paymentCardPending]}>
              {/* <View
                style={[
                  styles.paymentDetails,
                  status === 'Payment Pending' && styles.paymentDetailsCompact,
                ]}
              > */}
                {/* <DetailRow label="Tax" value={paymentDetail.tax || 'PKR 20000'} /> */}
              {/* </View> */}
              <View style={styles.paymentTotalRow}>
                <Text style={styles.paymentTotalLabel}>Total</Text>
                <Text style={styles.paymentTotalValue}>
                  {paymentDetail.total || 'PKR 30,000'}
                </Text>
              </View>

              {status === 'Payment Pending' && (
                <CustomButton
                  title="Pay Now"
                  variant="primary"
                  size="medium"
                  buttonStyle={styles.payNowButton}
                  textStyle={styles.payNowButtonText}
                  onPress={() => {
                    if (!navigation) return;
                    navigation.navigate?.('PaymentScreen', { campaignId: id });
                  }}
                />
              )}
            </View>
          )}

          {/* Let's Continue Button - Only for Draft status and when card is expanded */}
          {status === 'Draft' && (
            <CustomButton
              title="Let's Continue"
              onPress={async () => {
                if (!navigation) {
                  Alert.alert('Error', 'Navigation is not available');
                  return;
                }

                try {
                  setIsLoading(true);
                  console.log('🚀 [StatusCard] Generating upload URL for campaign:', id);
                  
                  // Generate a filename with timestamp
                  const timestamp = Date.now();
                  const filename = `${timestamp}-banner.png`;
                  const contentType = 'image/png'; // Default, will be updated when file is selected
                  
                  // Call the upload-url API with advertisement ID for existing draft
                  const uploadResponse = await generateUploadUrl({
                    filename,
                    contentType,
                    advertisement_id: id, // Include advertisement ID for existing drafts
                  });
                  
                  console.log('✅ [StatusCard] Upload URL generated:', uploadResponse);
                  
                  // Navigate to CampaignUploadFiles with the upload info
                  navigation.navigate('CampaignUploadFiles', {
                    campaignId: id.toString(),
                    uploadUrl: uploadResponse.uploadUrl,
                    publicUrl: uploadResponse.publicUrl,
                    key: uploadResponse.key,
                    flow: 'business', // Default flow, can be made configurable
                  });
                } catch (error: any) {
                  console.error('❌ [StatusCard] Failed to generate upload URL:', error);
                  console.error('❌ [StatusCard] Error details:', {
                    message: error?.message,
                    response: error?.response?.data,
                    status: error?.response?.status,
                    statusText: error?.response?.statusText,
                  });
                  
                  const errorMessage = error?.response?.data?.message 
                    || error?.response?.data?.error 
                    || error?.message 
                    || 'Failed to generate upload URL. Please try again.';
                  
                  Alert.alert(
                    'Error',
                    errorMessage
                  );
                } finally {
                  setIsLoading(false);
                }
              }}
              variant="primary"
              size="medium"
              disabled={isLoading || isGeneratingUrl}
              loading={isLoading || isGeneratingUrl}
              buttonStyle={styles.continueButton}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// Detail Row Component - Matching confirmation screens
const DetailRow: React.FC<{ label: string; value: string; compact?: boolean; isFirst?: boolean }> = ({ label, value, compact, isFirst }) => (
  <View style={[
    styles.confirmationDetailRow,
    compact && styles.detailRowCompact,
    isFirst && styles.confirmationDetailRowFirst,
  ]}>
    <Text style={[styles.detailKey, compact && styles.detailKeyCompact]}>{label}</Text>
    <Text style={[styles.detailValue, compact && styles.detailValueCompact]} numberOfLines={2} ellipsizeMode="clip">
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(4),
    padding: wp(2.5),
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(1.5),
  },
  alertIcon: {
    padding: wp(1),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: wp(6),
    gap: wp(1.5),
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(0.3),
    gap: wp(2),
  },
  bodyContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: wp(3),
    marginBottom: hp(0.4),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    // paddingHorizontal: wp(2),
    paddingVertical: -hp(6),
  },
  title: {
    flex: 1,
    fontSize: wp(3.6),
    fontWeight: '700',
    color: '#1E1E1E',
    lineHeight: wp(5.4),
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.4),
  },
  typeTags: {
    flexDirection: 'row',
    gap: wp(0.7),
    flexShrink: 0,
    paddingHorizontal: wp(1.5),
    paddingVertical: hp(0.2),
  },
  typeTag: {
    paddingHorizontal: wp(1.6),
    paddingVertical: hp(0.25),
    borderRadius: wp(3),
  },
  typeTagText: {
    color: '#FFFFFF',
    fontSize: wp(2.8),
    fontWeight: '600',
  },
  typeTagTextPayment: {
    color: '#BD8700',
  },
  detailsSection: {
    gap: hp(0.4),
    marginBottom: hp(0.15),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: wp(0.9),
  },
  detailTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: wp(1.8),
    borderRadius: wp(3),
  },
  detailTagText: {
    color: '#666',
    fontSize: wp(3),
    fontWeight: '500',
  },
  detailValueTag: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: wp(1.8),
    paddingVertical: hp(0.35),
    borderRadius: wp(3),
  },
  detailValueText: {
    color: '#1E1E1E',
    fontSize: wp(3),
    fontWeight: '500',
  },
  dateTags: {
    flexDirection: 'row',
    gap: wp(1.5),
    flexWrap: 'wrap',
  },
  timelineSectionWithIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: hp(0.2),
    marginBottom: hp(1),
  },
  timelineSection: {
    flex: 1,
    marginRight: wp(2),
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    marginBottom: hp(0.8),
    alignSelf: 'flex-start',
    paddingHorizontal: wp(2),
  },
  timelineLabel: {
    marginTop: hp(0.1),
    fontSize: wp(3),
    fontWeight: '600',
    color: '#666',
  },
  progressBarContainer: {
    height: hp(0.8),
   backgroundColor: '#E0E0E0',
    borderRadius: wp(2),
    overflow: 'hidden',
    position: 'relative',
    width: '90%',
    alignSelf: 'center',
  },
  timelineWrapper: {
    backgroundColor: '#F8F8F8',
    borderRadius: wp(2.5),
    padding: wp(2.3),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: hp(0),
    // paddingHorizontal: wp(3),
  },
  progressBarFill: {
    height: '100%',
    borderRadius: wp(2),
    position: 'absolute',
    left: 0,
    top: 0,
  },
  expandIcon: {
    alignSelf: 'flex-end',
    marginTop: -hp(0.5),
    padding: wp(0.8),
    paddingHorizontal: wp(2),
  },
  // Expanded Content Styles
  expandedContent: {
    marginTop: hp(3),
    gap: hp(2.5),
  },
  // CompanyWithInfoScreen Layout Styles
  cardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    marginBottom: hp(2.5),
    position: 'relative',
  },
  summaryCard: {
    width: '51%',
    minHeight: hp(22),
    maxHeight: hp(22),
    backgroundColor: '#FFFFFF',
    borderRadius: wp(4),
    // paddingVertical: hp(3),
    // paddingHorizontal: wp(2.5),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    alignSelf: 'center',
    textAlign: 'center',
    marginLeft: wp(-3),
    marginRight: wp(-3),
  },
  companyCard: {},
  paymentPendingCardContainer: {
    backgroundColor: '#FDD46C',
    borderColor: '#FDD46C',
  },
  campaignCard: {
    borderWidth: 1,
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
    fontSize: wp(2.8),
    color: '#A1A1A1',
    marginTop: hp(0.3),
  },
  campaignSubtitle: {
    color: '#C539A5',
  },
  linkBadge: {
    position: 'absolute',
    left: '55%',
    top: '50%',
    transform: [{ translateX: -wp(3) }, { translateY: -wp(3) }],
    width: wp(7),
    height: wp(7),
    borderRadius: wp(3),
    backgroundColor: '#C539A5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C539A5',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 15,
    zIndex: 10,
  },
  // CompanywithoutInfoScreen Layout Styles
  heroCardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: hp(1.5),
  },
  heroCard: {
    width: '65%',
    borderRadius: wp(5),
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#74C391',
    backgroundColor: '#E6F9ED',
    alignItems: 'center',
    paddingVertical: hp(3),
    paddingHorizontal: wp(4),
    justifyContent: 'center',
    alignSelf: 'center',
  },
  heroImageWrapper: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
    borderWidth: 2,
    borderColor: '#B7E8C7',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#74C391',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroTitle: {
    marginTop: hp(1.4),
    fontSize: wp(4),
    fontWeight: '700',
    color: '#0F172A',
  },
  heroSubtitle: {
    marginTop: hp(0.2),
    fontSize: wp(3),
    color: '#6B7280',
  },
  heroTickWrapper: {
    marginTop: -hp(0.9),
  },
  // Confirmation Card Styles (matching both screens)
  confirmationCard: {
    backgroundColor: '#FDFDFD',
    borderRadius: wp(5),
    paddingVertical: hp(2.2),
    paddingHorizontal: wp(3),
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    marginTop: hp(0.5),
    shadowColor: '#E5E7EB',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 0,
  },
  cardHeading: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: hp(1.5),
    textAlign: 'center',
  },
  detailGrid: {
    borderRadius: wp(3.5),
    // backgroundColor: '#FAFAFA',
    // borderWidth: 1,
    // borderColor: '#E5E7EB',
    // overflow: 'hidden',
    // paddingHorizontal: wp(2),
  },
  detailCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: wp(3),
    padding: wp(4),
    marginTop: hp(1),
  },
  detailCardTitle: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: '#1E1E1E',
    textAlign: 'center',
    marginBottom: hp(2),
  },
  connectionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(2.5),
    paddingHorizontal: wp(0),
    position: 'relative',
    gap: wp(3),
  },
  // Old connection section styles - kept for backward compatibility but not used in new layout
  oldCompanyCard: {
    width: wp(38),
    height: wp(38),
    backgroundColor: '#FFFFFF',
    borderRadius: wp(3.5),
    paddingVertical: hp(2.5),
    paddingHorizontal: wp(3),
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  oldCampaignCard: {
    width: wp(38),
    height: wp(38),
    backgroundColor: '#F0F8F0',
    borderRadius: wp(3.5),
    paddingVertical: hp(2.5),
    paddingHorizontal: wp(3),
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  campaignCardSolo: {
    width: wp(60),
    height: wp(36),
    alignSelf: 'center',
  },
  campaignCardSoloBox: {
    backgroundColor: '#E9FDF1',
    borderColor: '#7ACB99',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderRadius: wp(6),
    paddingVertical: hp(3),
  },
  campaignCardSoloContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  soloTickWrapper: {
    marginTop: hp(-1.8),
  },
  singleCampaignWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(2),
  },
  singleCampaignExpanded: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(2),
  },
  connectionIconContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    zIndex: 10,
    transform: [{ translateX: -wp(4) }, { translateY: -wp(4) }],
  },
  connectionCheckIcon: {
    width: wp(8),
    height: wp(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoFrame: {
    width: wp(19),
    height: wp(19),
    borderRadius: wp(11),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: hp(1.5),
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  boardImagePlaceholder: {
    width: '80%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  logoText: {
    fontSize: wp(9),
    fontWeight: '700',
  
  },
  companyName: {
    fontSize: wp(3),
    fontWeight: '700',
    color: '#1E1E1E',
    textAlign: 'center',
    marginBottom: hp(0.5),
    textTransform: 'capitalize',
  },
  companySubLabel: {
    fontSize: wp(3),
    color: '#999',
    textAlign: 'center',
    fontWeight: '400',
  },
  campaignName: {
    fontSize: wp(3),
    fontWeight: '700',
    color: '#1E1E1E',
    textAlign: 'center',
    marginBottom: hp(0.5),
  },
  campaignSubLabel: {
    fontSize: wp(3),
    color: '#999',
    textAlign: 'center',
    fontWeight: '400',
  },
  // Old detailsGrid style - kept for backward compatibility
  detailsGrid: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(2.5),
    padding: wp(3.5),
    gap: hp(1),
  },
  detailRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: hp(0.8),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailRowLabel: {
    fontSize: wp(3.2),
    fontWeight: '600',
    color: '#848484',
    minWidth: wp(25),
  },
  detailRowValue: {
    fontSize: wp(3.4),
    fontWeight: '500',
    color: '#1E1E1E',
    flex: 1,
    textAlign: 'right',
  },
  // Detail Row Styles matching confirmation screens
  confirmationDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1.1),
    paddingHorizontal: wp(3),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  confirmationDetailRowFirst: {
    borderTopWidth: 0,
  },
  detailRowCompact: {
    marginTop: hp(0.1),
  },
  detailKey: {
    fontSize: wp(3),
    fontWeight: '500',
    color: '#6B7280',
  
  },
  detailKeyCompact: {
    fontSize: wp(2.8),
  },
  detailValue: {
    fontSize: wp(3),
    fontWeight: '600',
    color: '#1F2937',
  },
  detailValueCompact: {
    fontSize: wp(2.9),
  },
  // Payment Card Styles
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(3),
    padding: wp(4),
    marginTop: hp(0.8),
  },
  paymentCardPending: {
    marginTop: 0,
    paddingTop: hp(1.2),
  },
  paymentStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.2),
  },
  paymentStatusBadge: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(4),
    marginBottom: hp(0.8),
  },
  paymentStatusText: {
    color: '#FFFFFF',
    fontSize: wp(3),
    fontWeight: '600',
  },
  paymentAmount: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: '#1E1E1E',
  },
  paymentDetails: {
    marginTop: hp(1.5),
    paddingTop: hp(1.5),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: hp(0.8),
  },
  paymentDetailsCompact: {
    marginTop: hp(0.3),
    paddingTop: hp(0.3),
    borderTopColor: '#D8D8D8',
    borderStyle: 'dashed',
    gap: hp(0.4),
  },
  paymentTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(0),
    paddingTop: hp(1.5),
    borderTopWidth: 0,
    backgroundColor:'#F8F8F8',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderTopColor: '#E5E7EB',
    borderRadius: wp(2)
  },
  paymentTotalLabel: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#70737D',
  },
  paymentTotalValue: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: '#70737D',
  },
  payNowButton: {
    marginTop: hp(1.5),
    width: '100%',
    borderRadius: wp(3),
    backgroundColor: '#FDD46C',
  },
  payNowButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.35),
    borderRadius: wp(3.5),
    gap: wp(1),
    marginBottom: hp(0.6),
    alignSelf: 'flex-start',
  },
  locationIcon: {
    fontSize: wp(3.5),
  },
  locationText: {
    fontSize: wp(3),
    color: '#666',
    fontWeight: '500',
  },
  dateText: {
    fontSize: wp(3),
    color: '#666',
    fontWeight: '500',
  },
  continueButton: {
    marginTop: hp(2),
    width: '100%',
  },
});

export default StatusCard;


