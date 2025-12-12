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
import { GreenTickIcon, Images } from '../../../assets/images';
import CustomButton from '../../../components/CustomButton';
import PrimaryButton from '../../../components/PrimaryButton';
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
    | 'Active'
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
  estimatedTimeLabel?: string; // e.g. "10 to 12 days" from backend/booking
  statusMessage?: string; // dynamic status copy coming from backend mapping
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
  startDate,
  endDate,
  timelineProgress = 65,
  isExpanded = false,
  onPress,
  navigation,
  companyDetail,
  campaignDetail,
  paymentDetail,
  showCompanyDetail = true,
  estimatedTimeLabel,
  statusMessage,
}) => {
  const { mutateAsync: generateUploadUrl, isPending: isGeneratingUrl } = useGenerateUploadUrl();
  const [isLoading, setIsLoading] = useState(false);
  const isPaymentPending = status === 'Payment Pending';
  const isDraftStatus = status === 'Draft';
  const isScheduleStatus = status === 'Schedule';
  const isBlockedStatus = status === 'Blocked';
  const isCompletedStatus = status === 'Completed';
  const isInProgressStatus = status === 'InProgress';
  const isActiveStatus = status === 'Publish' || (status as string) === 'Active';
  const normalizedEstimatedTime = estimatedTimeLabel?.trim() || purchaseDuration;
  const normalizedStatusMessage = statusMessage?.trim();
  const labelAccentColor = (() => {
    if (isPaymentPending) return '#FDD46C';
    if (isDraftStatus) return '#00000033';
    if (isScheduleStatus) return '#83B1FA';
    if (isInProgressStatus) return '#ECBDF3';
    if (isBlockedStatus) return '#F25255';
    if (isCompletedStatus) return '#E5E7EB';
    if (isActiveStatus) return '#36BD79'; // Active / published accent
    return '#92400E50';
  })();
  const heroAccentColor = statusColor || labelAccentColor;
  const heroBackgroundColor = `${heroAccentColor}33`; // subtle tint
  const connectionLineAccentStyle = { backgroundColor: labelAccentColor };
  const hasCompanyDetail = showCompanyDetail && !!companyDetail;
  const isSingleCardLayout = !hasCompanyDetail;
  const statusBadgeTextColor = isCompletedStatus
    ? '#00000033'
    : isInProgressStatus
    ? '#C539A5'
    : isPaymentPending
    ? '#92400E'
    : isScheduleStatus
    ? '#0046B7'
    : '#FFFFFF';
  const typeTagTextColor = isInProgressStatus ? '#C539A5' : statusBadgeTextColor;
  const companyCardPaymentPendingStyle = isPaymentPending ? styles.companyCardPaymentPending : undefined;
  const campaignCardPaymentPendingStyle = isPaymentPending ? styles.campaignCardPaymentPending : undefined;
  const campaignCardBlockedStyle = isBlockedStatus ? styles.campaignCardBlocked : undefined;
  const campaignCardScheduleStyle = status === 'Schedule' ? styles.campaignCardSchedule : undefined;
  const campaignCardCompletedStyle = isCompletedStatus ? styles.campaignCardCompleted : undefined;
  const campaignImageWrapperCompletedStyle = isCompletedStatus ? styles.campaignImageWrapperCompleted : undefined;
  const heroCardPaymentPendingStyle =
    isPaymentPending && isSingleCardLayout ? styles.heroCardPaymentPending : undefined;
  const heroCardCompletedStyle =
    isCompletedStatus && isSingleCardLayout ? styles.heroCardCompleted : undefined;
  const boardImageContainerCompletedStyle = isCompletedStatus ? styles.boardImageContainerCompleted : undefined;
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
  const showPurchaseDurationRow =
    !isPaymentPending && !isBlockedStatus && !isDraftStatus && (isCompletedStatus || isActiveStatus);
  const showLocationRow = Boolean(!isBlockedStatus && !isDraftStatus && location && location !== 'N/A');
  const showCampaignPeriod =
    !isPaymentPending &&
    !isBlockedStatus &&
    !isDraftStatus &&
    !isScheduleStatus &&
    !isInProgressStatus &&
    (startDate || endDate);
  const statusTickImage = (() => {
    if (isDraftStatus) return Images.Draft;
    if (isInProgressStatus) return Images.inprogress;
    if (isBlockedStatus) return Images.Blocked;
    if (isScheduleStatus) return Images.Scheduled;
    return null;
  })();

  

  return (
    <TouchableOpacity
      style={[styles.card, isPaymentPending && styles.cardPaymentPending]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Header Section */}
      <View style={styles.header}>
        {/* Status Badge */}
        <View style={[
          styles.statusBadge, 
          { backgroundColor: isCompletedStatus ? '#E5E7EB' : statusColor },
          isPaymentPending && styles.statusBadgePaymentPending,
          isScheduleStatus && styles.statusBadgeSchedule
        ]}>
          <Text style={[styles.statusText, { color: statusBadgeTextColor }]}>{status}</Text>
        </View>
        {/* Info Icon */}
        <TouchableOpacity style={styles.alertIcon}>
          <Ionicons name="information-circle-outline" size={wp(5)} color="#9E9E9E" />
        </TouchableOpacity>
      </View>
      <View style={[styles.bodyContainer, isPaymentPending && styles.bodyContainerPaymentPending]}>
      <View
        style={[
          styles.timelineWrapper,
          isPaymentPending && styles.timelineWrapperPaymentPending,
          isDraftStatus && styles.timelineWrapperDraft,
        ]}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.typeTags}>
            {adType.map((type, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <View
                    style={[
                      styles.connectionLines,
                      connectionLineAccentStyle,
                    ]}
                  />
                )}
                <View
                  style={[
                    styles.typeTag,
                    { backgroundColor: statusColor },
                    isCompletedStatus && styles.typeTagCompleted,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeTagText,
                      { color: typeTagTextColor },
                    ]}
                  >
                    {type}
                  </Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>
        {/* Payment Pending Message Row */}
        {isPaymentPending && (
          <View style={styles.paymentPendingMessageRow}>
            <View style={styles.paymentBadgeSmall}>
              <Text style={styles.paymentBadgeSmallText}>Payment</Text>
            </View>
            <View style={styles.connectionLineLabel} />
            <Text style={styles.paymentPendingMessage}>Finish your payment to confirm your campaign</Text>
          </View>
        )}
        {/* Draft Message Row */}
        {isDraftStatus && (
          <View style={styles.paymentPendingMessageRow}>
            <View style={styles.draftBadgeSmall}>
              <Text style={styles.draftBadgeSmallText}>Draft</Text>
            </View>
            <View style={styles.connectionLineLabel} />
            <Text
              style={styles.draftMessage}
            >
              Continue from here whenever you're ready
            </Text>
          </View>
        )}
        {/* In Progress Message Row */}
        {isInProgressStatus && (normalizedStatusMessage || normalizedEstimatedTime) && (
          <View style={styles.statusInfoRow}>
            <View style={styles.statusInfoBadge}>
              <Text style={[styles.statusInfoBadgeText, { color: '#70737D' }]}>Estimated Time</Text>
            </View>
            <View style={styles.connectionLineLabel} />
            <Text style={styles.statusInfoMessage}>
              {normalizedStatusMessage || `Estimated Time ${normalizedEstimatedTime}`}
            </Text>
          </View>
        )}
        {/* Scheduled Message Row */}
        {isScheduleStatus && normalizedStatusMessage && (
          <View style={styles.statusInfoRow}>
            <View style={styles.statusInfoBadge}>
              <Text style={[styles.statusInfoBadgeText, { color: '#70737D' }]}>Scheduled</Text>
            </View>
            <View style={styles.connectionLineLabel} />
            <Text style={styles.statusInfoMessage}>{normalizedStatusMessage}</Text>
          </View>
        )}
        {/* Blocked Message Row */}
        {isBlockedStatus && normalizedStatusMessage && (
          <View style={styles.statusInfoRow}>
            <View style={styles.statusInfoBadge}>
              <Text style={[styles.statusInfoBadgeText, { color: '#70737D' }]}>Blocked</Text>
            </View>
            <View style={styles.connectionLineLabel} />
            <Text
              style={[styles.statusInfoMessage, { color: '#70737D' }]}
            >
              {normalizedStatusMessage}
              {normalizedEstimatedTime ? ` • Estimated Time ${normalizedEstimatedTime}` : ''}
            </Text>
          </View>
        )}
        {/* Details Section */}
        <View style={styles.detailsSection}>
          {/* Purchase Duration - Only show for active or completed states */}
          {showPurchaseDurationRow && (
            <View style={styles.detailRow}>
              <View style={[styles.detailTag, styles.detailTagIcon, isCompletedStatus && styles.detailTagCompleted]}>
                <Text
                  style={[styles.detailTagText, isCompletedStatus && styles.detailTagTextCompleted]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Board purchased for
                </Text>
              </View>
              <View style={styles.connectionLineLabel} />
              <View style={[styles.detailValueTag, isCompletedStatus && styles.detailValueTagCompleted]}>
                <Text
                  style={[styles.detailValueText, isCompletedStatus && styles.detailValueTextCompleted]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {purchaseDuration}
                </Text>
              </View>
            </View>
          )}
          {/* Location and Area */}
          {showLocationRow && (
            <View style={styles.locationBadgesRow}>
              <View
                style={[
                  styles.locationBadge,
                  styles.locationBadgeValue,
                  isCompletedStatus && styles.locationBadgeCompleted,
                ]}
              >
                <Text
                  style={[styles.locationBadgeText, isCompletedStatus && styles.locationBadgeTextCompleted]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {location}
                </Text>
              </View>
              {locationDetail && (
                <>
                  <View style={styles.connectionLineLabel} />
                  <View
                    style={[
                      styles.locationBadge,
                      styles.locationBadgeValue,
                      isCompletedStatus && styles.locationBadgeCompleted,
                    ]}
                  >
                    <Text
                      style={[styles.locationBadgeText, isCompletedStatus && styles.locationBadgeTextCompleted]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {locationDetail}
                    </Text>
                  </View>
                </>
              )}
            </View>
          )}
          {/* Campaign period start / end */}
          {showCampaignPeriod && (
            <View style={styles.dateTags}>
              <View style={styles.detailTag}>
                <Text style={styles.detailTagText} numberOfLines={1} ellipsizeMode="tail">
                  Campaign Period
                </Text>
              </View>
              {startDate && <View style={styles.connectionLineLabel} />}
              {startDate && (
                <View style={styles.detailValueTag}>
                  <Text style={styles.detailValueText} numberOfLines={1} ellipsizeMode="tail">
                    Start: {startDate}
                  </Text>
                </View>
              )}
              {endDate && <View style={styles.connectionLineLabel} />}
              {endDate && (
                <View style={styles.detailValueTag}>
                  <Text style={styles.detailValueText} numberOfLines={1} ellipsizeMode="tail">
                    End: {endDate}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View
          style={[
            styles.curvedBottomInfo,
            isPaymentPending && styles.curvedBottomInfoPayment,
          ]}
        />

        {/* Timeline Section with Expand Icon - Inside the wrapper */}
          <View style={styles.timelineSectionWithIcon}>
            <View style={styles.timelineSection}>
              <View style={styles.timelineHeader}>
                <Ionicons name="time-outline" size={wp(3.5)} color="#666" />
                <Text style={styles.timelineLabel}>Timeline</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarInner}>
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
            </View>
            {/* Expand/Collapse Icon */}
            <TouchableOpacity style={styles.expandIcon} onPress={onPress}>
              <Ionicons
                name={isExpanded ? 'chevron-down' : 'chevron-up'}
                size={wp(5)}
                color="#1E1E1E"
              />
            </TouchableOpacity>
          </View>
       </View>
      </View>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* CompanyWithInfoScreen Layout - Two side-by-side cards with link badge */}
          {hasCompanyDetail && (
            <>
              {/* Snapshot Cards Row - Matching CompanyWithInfoScreen */}
              <View style={styles.cardsRow}>
                {/* Company Card */}
                <View style={[styles.summaryCard, styles.companyCard, companyCardPaymentPendingStyle]}>
                  <View style={styles.summaryImageWrapper}>
                    {companyDetail.logoUri ? (
                      <Image source={{ uri: companyDetail.logoUri }} style={styles.summaryImage as any} resizeMode="cover" />
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

                {/* Link Badge / Payment Icon - Matching CompanyWithInfoScreen */}
                <View style={[
                  styles.linkBadge,
                  isPaymentPending && styles.paymentBadge,
                  isBlockedStatus && styles.blockedBadge,
                  status === 'Schedule' && styles.scheduleBadge,
                  isCompletedStatus && styles.completedBadge
                ]}>
                  {isPaymentPending ? (
                    <Image 
                      source={Images.paymentIcon} 
                      style={styles.paymentIconImage as any}
                      resizeMode="contain"
                    />
                  ) : isBlockedStatus ? (
                    <Image
                      source={Images.blockedIcon}
                      style={styles.blockedIconImage as any}
                      resizeMode="contain"
                    />
                  ) : status === 'Schedule' ? (
                    <Image
                      source={Images.scheduleIcon}
                      style={styles.scheduleIconImage as any}
                      resizeMode="contain"
                    />
                  ) : isCompletedStatus ? (
                    <Image
                      source={Images.completeIcon}
                      style={styles.completedIconImage as any}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons name="link" size={wp(5)} color="#FFFFFF" />
                  )}
                </View>

                {/* Campaign Card */}
                <View style={[
                  styles.summaryCard,
                  styles.campaignCard,
                  campaignCardPaymentPendingStyle,
                  campaignCardBlockedStyle,
                  campaignCardScheduleStyle,
                  campaignCardCompletedStyle
                ]}>
                  <View style={[
                    styles.summaryImageWrapper, 
                    styles.campaignImageWrapper,
                    campaignImageWrapperCompletedStyle
                  ]}>
                    <View style={[
                      styles.boardImageContainer,
                      isPaymentPending && styles.boardImageContainerPaymentPending,
                      boardImageContainerCompletedStyle
                    ]}>
                      {campaignDetail?.boardImageUri ? (
                        <Image source={{ uri: campaignDetail.boardImageUri }} style={styles.summaryImage as any} resizeMode="cover" />
                      ) : (
                        <View style={styles.boardImagePlaceholder}>
                          <Ionicons name="image-outline" size={wp(8)} color="#999" />
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={[styles.summaryTitle, styles.campaignTitle]}>
                    {campaignDetail?.name || 'Banner Board'}
                  </Text>
                  <Text style={[styles.summarySubtitle, styles.campaignSubtitle]}>
                    Your Campaign Board
                  </Text>
                </View>
              </View>

              {/* Company & Campaign Detail Cards */}
              <View style={styles.detailCardsWrapper}>
              
                {/* <View style={[styles.confirmationCard, styles.detailCardTop]}> */}
                  <Text style={styles.cardHeading}>Company Detail</Text>
               
                    <DetailRow label="Name" value={companyDetail.name || 'N/A'} isFirst />
                    <DetailRow label="Business" value={companyDetail.business || 'N/A'} />
                    <DetailRow label="NTN" value={companyDetail.ntn || 'N/A'} />
                    <DetailRow label="Address" value={companyDetail.address || 'N/A'} />
                    <DetailRow label="Email" value={companyDetail.email || 'N/A'} />
                    <DetailRow label="Number" value={companyDetail.number || 'N/A'} />
                 
                {/* </View> */}
  <View style={styles.dashedline}/>
                {/* <View style={[styles.confirmationCard, styles.detailCardBottom]}> */}
                  <Text style={styles.cardHeading}>Campaign Detail</Text>
                  {/* <View style={styles.detailGrid}> */}
                    <DetailRow label="Name" value={campaignDetail?.name || title} isFirst />
                    <DetailRow label="Size" value={campaignDetail?.size || 'N/A'} />
                    <DetailRow label="Category" value={campaignDetail?.category || 'N/A'} />
                    <DetailRow label="Type" value={campaignDetail?.type || 'N/A'} />
                    <DetailRow label="Location" value={campaignDetail?.location || 'N/A'} />
                    <DetailRow label="Area" value={campaignDetail?.area || 'N/A'} />
                  {/* </View> */}
                {/* </View> */}
              </View>
            </>
          )}

          {/* CompanywithoutInfoScreen Layout - Single centered hero card */}
          {isSingleCardLayout && (
          <View style={styles.heroCardContainer}>
            <View
              style={[
                styles.heroCard,
                heroCardPaymentPendingStyle,
                heroCardCompletedStyle,
                { borderColor: heroAccentColor, backgroundColor: heroBackgroundColor },
              ]}
            >
                <View style={[
                styles.heroImageWrapper,
                isPaymentPending && styles.heroImageWrapperPaymentPending,
                isCompletedStatus && styles.heroImageWrapperCompleted,
                { borderColor: heroAccentColor }
                ]}>
                  <View style={[
                    styles.boardImageContainer,
                    isPaymentPending && styles.boardImageContainerPaymentPending,
                    boardImageContainerCompletedStyle
                  ]}>
                    {campaignDetail?.boardImageUri ? (
                      <Image source={{ uri: campaignDetail.boardImageUri }} style={styles.heroImage as any} />
                    ) : (
                      <View style={styles.boardImagePlaceholder}>
                        <Ionicons name="image-outline" size={wp(10)} color="#999" />
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.heroTitle}>{campaignDetail?.name || title}</Text>
                <Text style={styles.heroSubtitle}>Your Campaign Board</Text>
              </View>
              <View style={[styles.verticalConnectionLineTop, { backgroundColor: heroAccentColor }]} />
              <View style={[
                styles.heroTickWrapper,
                isPaymentPending && styles.heroPaymentIconWrapper,
                isCompletedStatus && styles.heroCompletedIconWrapper
                ,
                !isPaymentPending && !isCompletedStatus && { backgroundColor: heroBackgroundColor, borderColor: heroAccentColor }
              ]}>
                {isPaymentPending ? (
                  <Image
                    source={Images.paymentIcon}
                    style={styles.heroPaymentIcon as any}
                    resizeMode="contain"
                  />
                ) : isCompletedStatus ? (
                  <Image
                    source={Images.completeIcon}
                    style={styles.heroCompletedIcon as any}
                    resizeMode="contain"
                  />
                ) : statusTickImage ? (
                  <Image
                    source={statusTickImage}
                    style={styles.heroStatusIcon as any}
                    resizeMode="contain"
                  />
                ) : (
                  <GreenTickIcon width={wp(8)} height={wp(8)} fill={heroAccentColor} />
                )}
              </View>
              <View style={[styles.verticalConnectionLineBottom]} />
            </View>
          )}

          {/* Campaign Detail Card - when no company info */}
          {!hasCompanyDetail && (
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
          )}
          {/* Payment Summary Card */}
          {paymentDetail && status !== 'Draft' && (
            <View style={[styles.paymentCard, status === 'Payment Pending' && styles.paymentCardPending]}>
              <View style={styles.paymentDashedLine} />
              
              <View style={styles.taxRow}>
                <Text style={styles.taxLabel}>Tax</Text>
                <Text style={styles.taxValue}>
                  {paymentDetail.tax || 'PKR 20000'}
                </Text>
              </View>

              {/* Dashed Separator */}
              <View style={styles.paymentDashedLine} />

              {/* Total Row */}
              <View style={styles.paymentTotalRow}>
                <Text style={styles.paymentTotalLabel}>Total</Text>
                <Text style={styles.paymentTotalValue}>
                  {paymentDetail.total || 'PKR 30,000'}
                </Text>
              </View>

              {status === 'Payment Pending' && (
                <PrimaryButton
                  title="Pay Now"
                  buttonStyle={styles.payNowButton}
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
            <PrimaryButton
              title="Let's Continue"
              disabled={isLoading || isGeneratingUrl}
              loading={isLoading || isGeneratingUrl}
              buttonStyle={styles.continueButton}
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
      <Text style={[styles.detailValue, compact && styles.detailValueCompact, styles.detailValueGray]} numberOfLines={2} ellipsizeMode="clip">
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
    position: 'relative',
    width: '100%',
    minHeight: hp(28),
    alignSelf: 'stretch',
  },
  cardPaymentPending: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    borderRadius: wp(4),
    padding: wp(2.5),
    marginBottom: hp(2),
    position: 'relative',
    width: '100%',
    minHeight: hp(28),
    alignSelf: 'stretch',
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
  statusBadgePaymentPending: {
    borderRadius: 24,
    height: 24,
    gap: 3,
  },
  statusBadgeSchedule: {
    borderRadius: 24,
    height: 22,
    paddingHorizontal: 12,
    paddingVertical: 0,
    gap: 3,
  },
  dashedline:{
    marginTop:hp(5),
    marginBottom:hp(5),
    width:'100%',
    borderTopWidth:1,
    borderTopColor:'#D1D5DB',
    borderWidth:1,
    borderColor:'#D1D5DB',
    borderStyle:'dotted',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#92400E',
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 10,
  },
  bodyContainer: {
    width: '100%',
  },
  curvedBottomInfo: {
    width: '106.7%',
    height: hp(2),
    backgroundColor: '#F8F8F8',
    alignSelf: 'center',
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    marginTop: -1,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#E5E7EB',
  },
  curvedBottomInfoPayment: {
    backgroundColor: '#F8F8F8',
    borderColor: '#E5E7EB',
  },
  bodyContainerPaymentPending: {
    width: '100%',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#18181B',
    lineHeight: 17,
    letterSpacing: -0.154,
  },
  typeTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    paddingVertical: hp(0.2),
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#0000000D',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  typeTagText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '400',
  },
  typeTagTextPayment: {
    color: '#FFFFFF',
  },
  typeTagTextDraft: {
    color: '#FFFFFF',
  },
  typeTagTextSchedule: {
    color: '#FFFFFF',
  },
  typeTagCompleted: {
    backgroundColor: '#0000000D',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  typeTagTextCompleted: {
    color: '#00000033',
  },
  detailsSection: {
    gap: hp(0.4),
    marginBottom: hp(0.15),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    paddingVertical: hp(0.2),
  },
  detailTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(1.6),
    paddingVertical: hp(0.8),
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F4F4F5',
    flexShrink: 1,
    minWidth: 0,
  },
  detailTagText: {
    color: '#70737D',
    fontSize: 10,
    fontWeight: '400',
  },
  detailTagIcon: {
    // gap: wp(0.8),
  },
  detailValueTag: {
    backgroundColor: '#F4F4F5',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    flexShrink: 1,
    minWidth: 0,
  },
  detailValueText: {
    color: '#70737D',
    fontSize: 10,
    fontWeight: '400',
  },
  detailTagCompleted: {
    backgroundColor: '#F4F4F5',
    borderColor: '#E5E7EB',
  },
  detailTagTextCompleted: {
    color: '#70737D',
  },
  detailValueTagCompleted: {
    backgroundColor: '#F4F4F5',
    borderColor: '#E5E7EB',
  },
  detailValueTextCompleted: {
    color: '#70737D',
  },
  dateTags: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
  },
  timelineSectionWithIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 0,
    backgroundColor: 'transparent',
    marginBottom: 0,
    marginTop: 4,
  },
  timelineSection: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  timelineLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  progressBarContainer: {
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    alignSelf: 'center',
    padding: 1,
  },
  progressBarInner: {
    flex: 1,
    height: 1,
    backgroundColor: '#d8d8d8',
    borderRadius: 10,
    borderWidth: 7,
    borderColor: '#FFFFFF',
  },
  timelineWrapper: {
    backgroundColor: '#F8F8F8',
    width: '100%',
    borderColor: '#E5E7EB',
    borderWidth: 0.7,
    padding: 10,
    paddingBottom: 8,
    borderRadius: 15,
  },
  timelineWrapperPaymentPending: {
    backgroundColor: '#F8F8F8',
    width: '100%',
    borderColor: '#E5E7EB',
    borderWidth: 0.7,
    padding: 10,
    paddingBottom: 8,
    borderRadius: 15,
  },
  // Draft inner card - slightly larger than base
  timelineWrapperDraft: {
    width: '100%',
    alignSelf: 'stretch',
    paddingVertical: 12,
    paddingBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: wp(2),
    position: 'absolute',
    left: 0,
    top: 0,
  },
  
  expandIcon: {
    alignSelf: 'center',
    padding: 4,
    marginBottom: -20,
    marginRight: 0,
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
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderStyle: 'dotted',
    // paddingVertical: hp(3),
    // paddingHorizontal: wp(2.5),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    textAlign: 'center',
    marginLeft: wp(-3),
    marginRight: wp(-3),
  },
  companyCard: {
    borderWidth: 1, borderColor: '#D9D9D9',
    borderStyle: 'dotted',
  },
  companyCardPaymentPending: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderStyle: 'dotted',
  },
  campaignCard: {
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: '#C539A5',
    backgroundColor: '#FFF7FB',
    
  },
  campaignCardPaymentPending: {
    backgroundColor: '#FEEFC9',
    borderColor: '#BD8700',
  },
  campaignCardBlocked: {
    backgroundColor: '#EB9A9B',
    borderColor: '#F15255',
  },
  campaignCardSchedule: {
    backgroundColor: '#D6E5FD',
    borderColor: '#3B82F6',
  },
  campaignCardCompleted: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9D9D9',
  },
  summaryImageWrapper: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
    borderWidth: 2,
    borderColor: '#D9D9D9',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: hp(1.2),
  },
  campaignImageWrapper: {
    borderColor: '#D9D9D9',
    backgroundColor: '#FFFFFF',
  },
  campaignImageWrapperPaymentPending: {
    backgroundColor: '#FEEFC9',
  },
  campaignImageWrapperCompleted: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9D9D9',
  },
  boardImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: wp(9),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: wp(0.8),
  },
  boardImageContainerPaymentPending: {
    backgroundColor: '#FEEFC9',
  },
  boardImageContainerCompleted: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9D9D9',
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
    color: '#000000',
  },
  summarySubtitle: {
    fontSize: wp(2.8),
    color: '#A1A1A1',
    marginTop: hp(0.3),
  },
  campaignSubtitle: {
    color: '#000000',
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
    zIndex: 10,
  },
  paymentBadge: {
    backgroundColor: '#FDD46C',
  },
  blockedBadge: {
    backgroundColor: '#F25255',
  },
  scheduleBadge: {
    backgroundColor: '#3B82F6',
  },
  completedBadge: {
    backgroundColor: '#D1D5DB',
  },
  paymentIconImage: {
    width: wp(3),
    height: wp(3),
  },
  blockedIconImage: {
    width: wp(3),
    height: wp(3),
  },
  scheduleIconImage: {
    width: wp(7),
    height: wp(7),
     borderRadius: wp(6),
  },
  completedIconImage: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
  },
  // CompanywithoutInfoScreen Layout Styles
  heroCardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: -17,
  },
  heroCard: {
    width: '65%',
    borderRadius: wp(5),
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: '#74C391',
    backgroundColor: '#E6F9ED',
    alignItems: 'center',
    paddingVertical: hp(3),
    paddingHorizontal: wp(4),
    justifyContent: 'center',
    alignSelf: 'center',
  },
  heroCardPaymentPending: {
    borderColor: '#FCD34D',
    backgroundColor: '#FEF9C3',
  },
  heroCardCompleted: {
    borderColor: '#D9D9D9',
    backgroundColor: '#FFFFFF',
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
  },
  heroImageWrapperPaymentPending: {
    backgroundColor: '#FEF9C3',
    borderColor: '#FCD34D',
  },
  heroImageWrapperCompleted: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9D9D9',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroTitle: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#18181B',
  },
  heroSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: '#9CA3AF',
  },
  heroTickWrapper: {
    zIndex: 10,
    padding: wp(2),
    borderRadius: wp(8),
    backgroundColor: '#E6F9ED',
    borderWidth: 0.5,
    borderColor: '#74C391',
  },
  verticalConnectionLineTop: {
    width: 2,
    height: hp(1),
    backgroundColor: '#D8D8D8',
    alignSelf: 'center',
    marginTop: hp(0),
  },
  verticalConnectionLineBottom: {
    width: 2,
    height: hp(1),
    backgroundColor: '#D8D8D8',
    alignSelf: 'center',
    marginBottom: -hp(0.5),
  },
  heroPaymentIconWrapper: {
    padding: wp(2),
    borderRadius: wp(8),
    backgroundColor: '#FEF9C3',
    borderWidth: 0.5,
    borderColor: '#FCD34D',
  },
  heroPaymentIcon: {
    width: wp(8),
    height: wp(8),
  },
  heroStatusIcon: {
    width: wp(8),
    height: wp(8),
  },
  heroCompletedIconWrapper: {
    padding: wp(2),
    borderRadius: wp(8),
    backgroundColor: '#F4F4F5',
    borderWidth: 0.5,
    borderColor: '#D1D5DB',
  },
  heroCompletedIcon: {
    width: wp(8),
    height: wp(8),
  },
  // Confirmation Card Styles (matching both screens)
  confirmationCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dotted',
  },
  detailCardsWrapper: {
    width: '100%',
    marginTop: hp(0.5),
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    borderStyle: 'dotted',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  detailCardTop: {
    marginBottom: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  detailCardBottom: {
    marginTop: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopWidth: 0,
    borderStyle: 'dotted',
    borderColor: '#D9D9D9',
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E1E1E',
    marginBottom: 16,
    textAlign: 'center',
  },
  detailGrid: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    borderStyle: 'dotted',
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
    borderStyle: 'dotted',
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
    borderStyle: 'dotted',
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
    backgroundColor: 'transparent',
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
    paddingVertical: hp(1.6),
    paddingHorizontal: wp(4),
    borderTopWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderTopColor: '#E5E7EB',
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
  detailValueGray: {
    color: '#6B7280',
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
    color: '#BD8700',
    fontSize: wp(3),
    fontWeight: '500',
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
    borderStyle: 'dotted',
    gap: hp(0.4),
  },
  paymentDashedLine: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    borderStyle: 'dashed',
    marginVertical: 12,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  taxLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#18181B',
  },
  taxValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#18181B',
  },
  paymentTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentTotalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  paymentTotalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#70737D',
  },
  payNowButton: {
    marginTop: 16,
    width: '50%',
    alignSelf: 'center',
    paddingVertical: 12,
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
  // Payment Pending specific styles - Labels matching Figma exactly
  paymentPendingMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  statusInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 4,
    flexWrap: 'nowrap',
  },
  paymentBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F5',
    padding: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 5,
  },
  paymentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  paymentBadgeSmallText: {
    fontSize: 10, 
    fontWeight: '400',
    color: '#70737D',
  },
  paymentPendingMessage: {
    fontSize: 10,
    color: '#70737D',
    fontWeight: '400',
    backgroundColor: '#F4F4F5',
    padding: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F5',
    padding: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 5,
  },
  statusInfoBadgeText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#70737D',
  },
  statusInfoMessage: {
    fontSize: 10,
    color: '#70737D',
    fontWeight: '400',
    backgroundColor: '#F4F4F5',
    paddingVertical: 3,
    paddingHorizontal: 10,
    lineHeight: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexShrink: 1,
    minWidth: 0,
  },
  draftBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F5',
    padding: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  draftBadgeSmallText: {
    fontSize: 10, 
    fontWeight: '400',
    color: '#70737D',
  },
  draftMessage: {
    fontSize: 10,
    color: '#70737D',
    fontWeight: '400',
    backgroundColor: '#F4F4F5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    lineHeight: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 0,
    flexShrink: 1,
  },
  locationBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 4,
    flexWrap: 'nowrap',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F4F4F5',
    flexShrink: 1,
    minWidth: 0,
  },
  locationBadgeValue: {
    // flex: 1,
  },
  locationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  locationBadgeText: {
    fontSize: 10,
    color: '#70737D',
    fontWeight: '400',
  },
  locationBadgeIcon: {
    gap: wp(0.8),
  },
  locationBadgeCompleted: {
    backgroundColor: '#F4F4F5',
    borderColor: '#E5E7EB',
  },
  locationBadgeTextCompleted: {
    color: '#70737D',
  },
    connectionLine: {
      width: 12,
      height: 2,
      backgroundColor: '#D8D8D8',
    },
  connectionLineLabel: {
    width: 12,
    height: 2,
    // borderRadius: 4,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
  },
     connectionLines: {
       width: 8,
       height: 2,
      //  borderRadius: 4,
       backgroundColor: '#92400E50',
     },
     connectionLinesDraft: {
        backgroundColor: '#00000033',
       },
     connectionLinesPayment: {
        backgroundColor: '#FDD46C',
       },
     connectionLinesSchedule: {
        backgroundColor: '#83B1FA',
      },
  dateText: {
    fontSize: wp(3),
    color: '#666',
    fontWeight: '500',
  },
  continueButton: {
    marginTop: hp(2),
    width: '50%',
    alignSelf: 'center',
    paddingVertical: 12,
  },
});

export default StatusCard;


