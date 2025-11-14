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
  status: 'Active' | 'Review' | 'Payment Pending' | 'Draft' | 'Completed' | 'InProgress' | 'Blocked';
  statusColor?: string;
  adType?: string[];
  purchaseDuration?: string;
  location?: string;
  locationDetail?: string;
  startDate?: string;
  endDate?: string;
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
  status = 'Active',
  statusColor = '#4CAF50',
  adType = ['Static', 'Billboard'],
  purchaseDuration = '15 days',
  location = 'Lahore',
  locationDetail = 'Area DHA Phase 4 DD',
  startDate = '01.12. Dec',
  endDate = '22.12. Dec',
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
    return '#F0F8F0'; // Default green tint for Active
  };

  const renderCampaignCardBox = (isSolo = false) => (
    <View style={isSolo ? styles.campaignCardSoloContainer : undefined}>
      <View
        style={[
          styles.campaignCard,
          { borderColor: statusColor, backgroundColor: getCampaignCardBackground() },
          isSolo && styles.campaignCardSolo,
          isSolo && styles.campaignCardSoloBox,
        ]}
      >
        <View style={styles.logoFrame}>
          {campaignDetail?.boardImageUri ? (
            <Image source={{ uri: campaignDetail.boardImageUri }} style={styles.logoImage} />
          ) : (
            <View style={styles.boardImagePlaceholder}>
              <Ionicons name="image-outline" size={wp(8)} color="#999" />
            </View>
          )}
        </View>
        <Text style={styles.campaignName}>
          {campaignDetail?.name || 'Banner Board'}
        </Text>
        <Text style={styles.campaignSubLabel}>Your Campaing Board</Text>
      </View>
      {isSolo && (
        <View style={styles.soloTickWrapper}>
          <GreenTickIcon width={wp(6)} height={wp(6)} />
        </View>
      )}
    </View>
  );

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
          <Ionicons name="checkmark" size={wp(3.5)} color="#FFFFFF" />
          <Text style={styles.statusText}>{status}</Text>
        </View>
        {/* Alert Icon */}
        <TouchableOpacity style={styles.alertIcon}>
          <Ionicons name="information-circle-outline" size={wp(5)} color="#9E9E9E" />
        </TouchableOpacity>
      </View>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.typeTags}>
          {adType.map((type, index) => (
            <View key={index} style={[styles.typeTag, { backgroundColor: statusColor }]}>
              <Text style={styles.typeTagText}>{type}</Text>
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
        {/* Campaign Period */}
        <View style={styles.detailRow}>
          <View style={styles.detailTag}>
            <Ionicons name="calendar" size={wp(3.5)} color="#9E9E9E" />
            <Text style={styles.detailTagText}>Campaign Period</Text>
          </View>
          <View style={styles.dateTags}>
            <View style={styles.detailValueTag}>
              <Text style={styles.detailValueText}>Start Date {startDate}</Text>
            </View>
            <View style={styles.detailValueTag}>
              <Text style={styles.detailValueText}>End Date {endDate}</Text>
            </View>
          </View>
        </View>
      </View>
      {/* Timeline Section with Expand Icon */}
      <View style={styles.timelineSectionWithIcon}>
        <View style={styles.timelineSection}>
          <View style={styles.timelineHeader}>
            <Ionicons name="time-outline" size={wp(4)} color="#666" />
            <Text style={styles.timelineLabel}>Timeline</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${timelineProgress}%`, backgroundColor: statusColor },
              ]}
            />
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

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Company Detail Card - Only show if showCompanyDetail is true */}
          {showCompanyDetail && companyDetail && (
            <View style={styles.detailCard}>
              <Text style={styles.detailCardTitle}>Company Detail</Text>

              {/* Company & Campaign Board Connection */}
              <View style={styles.connectionSection}>
                {/* Company Card */}
                <View style={[styles.companyCard, { borderColor: '#C539A5' }]}>
                  <View style={styles.logoFrame}>
                    {companyDetail.logoUri ? (
                      <Image source={{ uri: companyDetail.logoUri }} style={styles.logoImage} />
                    ) : (
                      <View style={styles.logoPlaceholder}>
                        <Text style={[styles.logoText, { color: statusColor }]}>T</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.companyName}>
                    {companyDetail.name || 'N/A'}
                  </Text>
                  <Text style={styles.companySubLabel}>Your Company</Text>
                </View>

                {/* Connection Icon - Green Checkmark */}
                <View style={styles.connectionIconContainer}>
                  <View style={styles.connectionCheckIcon}>
                    <GreenTickIcon width={wp(9)} height={wp(9)} />
                  </View>
                </View>

                {/* Campaign Board Card */}
                {renderCampaignCardBox()}
              </View>

              {/* Company Details Grid - Only show if company data exists */}
              <View style={styles.detailsGrid}>
                <DetailRow label="Name" value={companyDetail.name || 'N/A'} />
                <DetailRow label="Business" value={companyDetail.business || 'N/A'} />
                <DetailRow label="Location" value={companyDetail.location || 'N/A'} />
                <DetailRow label="Number" value={companyDetail.number || 'N/A'} />
                <DetailRow label="NTN" value={companyDetail.ntn || 'N/A'} />
                <DetailRow label="Address" value={companyDetail.address || 'N/A'} />
              </View>
            </View>
          )}

          {!showCompanyDetail && (
            <View style={styles.singleCampaignExpanded}>{renderCampaignCardBox(true)}</View>
          )}

          {/* Campaign Detail Card - Always show when expanded */}
          <View style={styles.detailCard}>
            <Text style={styles.detailCardTitle}>Campaign Detail</Text>
            <View style={styles.detailsGrid}>
              <DetailRow label="Name" value={campaignDetail?.name || title} />
              <DetailRow label="Size" value={campaignDetail?.size || 'N/A'} />
              <DetailRow label="Category" value={campaignDetail?.category || 'N/A'} />
              <DetailRow label="Type" value={campaignDetail?.type || 'N/A'} />
              {campaignDetail?.location && campaignDetail.location !== 'N/A' && (
                <DetailRow label="Location" value={campaignDetail.location} />
              )}
              {campaignDetail?.area && campaignDetail.area !== 'N/A' && (
                <DetailRow label="Area" value={campaignDetail.area} />
              )}
            </View>
          </View>

          {/* Payment Summary Card - Hide for Draft status */}
          {paymentDetail && status !== 'Draft' && (
            <View style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <View style={styles.paymentMethodSection}>
                  <View style={styles.paymentLogoContainer}>
                    <Text style={styles.paymentLogoText}>JC</Text>
                  </View>
                  <Text style={styles.paymentMethodName}>
                    {paymentDetail.method || 'JazzCash'}
                  </Text>
                  <Text style={styles.paymentAccountNumber}>
                    {paymentDetail.accountNumber || '*******31'}
                  </Text>
                </View>
                <View style={styles.paymentStatusSection}>
                  <View style={[styles.paymentStatusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.paymentStatusText}>
                      {paymentDetail.status || 'Paid'}
                    </Text>
                  </View>
                  <Text style={styles.paymentAmount}>
                    {paymentDetail.amount || 'PKR 20000'}
                  </Text>
                </View>
              </View>

              <View style={styles.paymentDetails}>
                <DetailRow label="Date" value={paymentDetail.date || 'Sep 22.2025'} />
                <DetailRow label="Tax" value={paymentDetail.tax || 'PKR 20000'} />
              </View>

              <View style={styles.paymentTotalRow}>
                <Text style={styles.paymentTotalLabel}>Total</Text>
                <Text style={styles.paymentTotalValue}>
                  {paymentDetail.total || 'PKR 30,000'}
                </Text>
              </View>
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

// Detail Row Component
const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.detailRowItem}>
    <Text style={styles.detailRowLabel}>{label}</Text>
    <Text style={styles.detailRowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(4),
    padding: wp(4),
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
  alertIcon: {
    padding: wp(1),
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(1.5),
    gap: wp(2),
  },
  title: {
    flex: 1,
    fontSize: wp(3.7),
    fontWeight: '700',
    color: '#1E1E1E',
    lineHeight: wp(6),
  },
  typeTags: {
    flexDirection: 'row',
    gap: wp(1.5),
    flexShrink: 0,
  },
  typeTag: {
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.4),
    borderRadius: wp(4),
  },
  typeTagText: {
    color: '#FFFFFF',
    fontSize: wp(2.8),
    fontWeight: '600',
  },
  detailsSection: {
    gap: hp(1),
    marginBottom: hp(1.5),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: wp(1.5),
  },
  detailTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    borderRadius: wp(4),
    gap: wp(1.5),
  },
  detailTagText: {
    color: '#666',
    fontSize: wp(3),
    fontWeight: '500',
  },
  detailValueTag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    borderRadius: wp(4),
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
    marginTop: hp(1),
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
  },
  timelineLabel: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: '#666',
  },
  progressBarContainer: {
    height: hp(0.8),
    backgroundColor: '#E0E0E0',
    borderRadius: wp(2),
    overflow: 'hidden',
    position: 'relative',
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
    marginTop: hp(1),
    padding: wp(1),
  },
  // Expanded Content Styles
  expandedContent: {
    marginTop: hp(2),
    gap: hp(2),
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
  companyCard: {
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
  campaignCard: {
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
  // Payment Card Styles
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(3),
    padding: wp(4),
    marginTop: hp(1),
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(2),
  },
  paymentMethodSection: {
    flex: 1,
  },
  paymentLogoContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(0.8),
  },
  paymentLogoText: {
    fontSize: wp(5),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  paymentMethodName: {
    fontSize: wp(3.8),
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: hp(0.3),
  },
  paymentAccountNumber: {
    fontSize: wp(3.2),
    color: '#666',
  },
  paymentStatusSection: {
    alignItems: 'flex-end',
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
  paymentTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(1.5),
    paddingTop: hp(1.5),
    borderTopWidth: 2,
    borderTopColor: '#E0E0E0',
  },
  paymentTotalLabel: {
    fontSize: wp(4),
    fontWeight: '600',
    color: '#1E1E1E',
  },
  paymentTotalValue: {
    fontSize: wp(4.5),
    fontWeight: '700',
    color: '#1E1E1E',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    borderRadius: wp(4),
    gap: wp(1.5),
    marginBottom: hp(1),
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


