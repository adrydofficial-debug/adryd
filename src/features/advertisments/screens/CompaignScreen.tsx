import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CardStatus, { CardStatusProps } from '../../../components/CardStatus';
import BottomTab from '../../../app/navigation/BottomTab';
import { useAdvertisements } from '../hooks/useAdvertisements';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

interface AdDetails {
  logo?: string;
  title: string;
  location: string;
  date?: string;
  status?: string;
  statusColor?: string;
  statusDot?: string;
  reviewTime?: string;
  reviewStatus?: string;
}

interface PaymentInfo {
  date: string;
  tax: string;
  total: string;
}

interface ButtonType {
  title: string;
  type: 'cancel' | 'payment' | 'details' | 'track';
}

interface PaymentCard {
  id: number;
  type: string;
  title: string;
  backgroundColor: string;
  textColor: string;
  image: any;
  ad: AdDetails;
  payment: PaymentInfo;
  buttons?: ButtonType[];
}

interface CampaignCard {
  id: number;
  title: string;
  location: string;
  date: string;
  status: 'Active' | 'Review' | 'Blocked' | 'Recent History';
  statusColor: string;
  daysLeft?: string;
  estimatedTime?: string;
  isExpanded: boolean;
  details?: AdDetails;
  payment: PaymentInfo;
}

interface ActiveCampaignProps {
  navigation: {
    goBack: () => void;
  };
}

const CampaignScreen: React.FC<ActiveCampaignProps> = ({ navigation }) => {
  const [expandedCard, setExpandedCard] = useState<number | null>(1);
  const [activeBottomTab, setActiveBottomTab] = useState<string>('Boards');
  
  // Use the existing advertisements hook
  const { advertisements, loading, error, refetch } = useAdvertisements();
  
  
  const handleBottomTabPress = (tabName: string) => {
    console.log('Bottom tab pressed:', tabName);
    setActiveBottomTab(tabName);
  };
  
  // Map API status to UI status based on the correct flow
  const mapStatusToUI = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return { uiStatus: 'Draft', color: '#9E9E9E', tab: 'Draft' };
      case 'PAYMENT_PENDING':
        return { uiStatus: 'Payment Pending', color: '#FEB600', tab: 'Payment' };
      case 'IN_REVIEW':
        return { uiStatus: 'Review', color: '#E91E63', tab: 'Review' };
      case 'SCHEDULED':
        return { uiStatus: 'Scheduled', color: '#9C27B0', tab: 'Active' };
      case 'PUBLISHED':
        return { uiStatus: 'Active', color: '#4CAF50', tab: 'Active' };
      case 'COMPLETED':
        return { uiStatus: 'Recent History', color: '#9E9E9E', tab: 'Recent History' };
      case 'BLOCKED':
        return { uiStatus: 'Blocked', color: '#F44336', tab: 'Blocked' };
      default:
        return { uiStatus: 'Draft', color: '#9E9E9E', tab: 'Draft' };
    }
  };
  
  // Get status description based on API status
  const getStatusDescription = (status: string) => {
    const statusDescriptions: { [key: string]: string } = {
      'DRAFT': 'Unsubmitted advertisement, still being edited.',
      'PAYMENT_PENDING': 'Awaiting payment before review.',
      'IN_REVIEW': 'Being reviewed by the moderation team.',
      'SCHEDULED': 'Set to go live at a future date.',
      'PUBLISHED': 'Currently live and displaying content.',
      'COMPLETED': 'Ad campaign finished successfully.',
      'BLOCKED': 'Stopped before completion or rejected.',
    };
    return statusDescriptions[status] || 'Status update pending';
  };
  
  
  // Convert API advertisements to UI format
  const campaignData: CampaignCard[] = useMemo(() => {
    if (!advertisements || advertisements.length === 0) return [];
    
    return advertisements.map((ad: any) => {
      const statusInfo = mapStatusToUI(ad.status);
      const booking = ad.bookings?.[0];
      const startDate = booking ? new Date(booking.start_at) : new Date(ad.created_at);
      const endDate = booking ? new Date(booking.end_at) : null;
      
      
      return {
        id: ad.id,
        title: ad.title,
        location: ad.board?.location || 'Unknown Location',
        date: startDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        status: statusInfo.uiStatus as any,
        statusColor: statusInfo.color,
        daysLeft: endDate ? `${Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} Days Left` : 'Ongoing',
      isExpanded: false,
      details: {
          name: ad.title,
          days: booking ? `${Math.ceil((endDate!.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days Ad` : 'Ongoing',
          category: ad.board?.title || 'Advertisement',
          location: ad.board?.location || 'Unknown Location',
          reviewTime: getStatusDescription(ad.status),
          reviewStatus: statusInfo.uiStatus,
      } as any,
      payment: {
          date: startDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          tax: `PKR ${Math.round((ad.total_payment || 0) * 0.1)}`,
          total: `PKR ${(ad.total_payment || 0).toLocaleString()}`,
        },
      };
    });
  }, [advertisements]);
  
  
  // Show all campaigns without filtering
  const filteredData = campaignData;

  const toggleCardExpansion = (cardId: number) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const renderPaymentCard = (item: PaymentCard) => {
    console.log('Rendering payment card:', item.title);
    return (
      <View key={item.id} style={[styles.paymentCard, { backgroundColor: item.backgroundColor }]}>
        {/* Header */}
        <View style={[styles.paymentCardHeader, { backgroundColor: item.backgroundColor }]}>
          <Text style={[styles.paymentHeaderTitle, { color: item.textColor }]}>{item.title}</Text>
        </View>
        
        {/* Content */}
        <View style={styles.paymentAdSection}>
          <View style={styles.paymentAdHeader}>
            <View style={styles.paymentLogoContainer}>
              <View style={styles.paymentLogo}>
                <Text style={styles.paymentLogoText}>T</Text>
              </View>
              <Text style={styles.paymentLogoLabel}>TAXX OIL</Text>
            </View>
            <View style={[styles.paymentStatusDot, { backgroundColor: item.ad.statusDot }]} />
          </View>
          
          <Text style={styles.paymentAdTitle}>{item.ad.title}</Text>
          
          <View style={styles.paymentLocationRow}>
            <Ionicons name="location" size={wp(3.5)} color="#666" />
            <Text style={styles.paymentLocationText}>{item.ad.location}</Text>
          </View>
          
          <Text style={styles.paymentDateText}>{item.ad.date}</Text>
          <Text style={[styles.paymentStatusText, { color: item.ad.statusColor }]}>{item.ad.status}</Text>
        </View>
        
        {/* Separator */}
        <View style={styles.paymentSeparator} />
        
        {/* Payment Summary */}
        <View style={styles.paymentSummary}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Date</Text>
            <Text style={styles.paymentValue}>{item.payment.date}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>TAX</Text>
            <Text style={styles.paymentValue}>{item.payment.tax}</Text>
          </View>
        </View>
        
        {/* Total Bar */}
        <View style={[styles.paymentTotalRow, {}]}>
          <Text style={styles.paymentTotalLabel}>TOTAL</Text>
          <Text style={styles.paymentTotalValue}>{item.payment.total}</Text>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.paymentButtonContainer}>
          <TouchableOpacity style={styles.paymentCancelButton}>
            <Text style={styles.paymentCancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.paymentActionButton, { backgroundColor: item.ad.statusColor }]}>
            <Text style={styles.paymentActionButtonText}>Payment</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCampaignCard = (item: CampaignCard) => {
    const isExpanded = expandedCard === item.id;
    const isActive = item.status === 'Active';
    const isReview = item.status === 'Review';
    const isBlocked = item.status === 'Blocked';
    const isRecentHistory = item.status === 'Recent History';

    return (
        <View key={item.id} style={[
             styles.campaignCard,
             isActive && styles.activeCard,
             isReview && styles.reviewCard,
             isBlocked && styles.blockedCard,
             isRecentHistory && styles.recentHistoryCard,
           ]}>
             <View style={styles.cardHeader}>
               <View style={styles.cardContent}>
                 <Text style={styles.campaignTitle}>{item.title}</Text>
                 <View style={styles.locationRow}>
                   <Ionicons 
                     name="location" 
                     size={wp(3.5)} 
                     color="#666" 
                     style={styles.locationIcon} 
                   />
                   <Text style={styles.locationText}>
                     {item.location}
                   </Text>
                 </View>
                 <Text style={styles.dateText}>
                   {item.date}
                 </Text>
               </View>
               <View style={styles.cardRight}>
                 <View style={[styles.statusDot, { backgroundColor: item.statusColor }]} />
               </View>
             </View>
             <View style={styles.statusSection}>
               <View style={[styles.statusLine, { backgroundColor: item.statusColor }]} />
               <Text style={[styles.statusText, { color: item.statusColor }]}>
                 {item.daysLeft || item.estimatedTime}
               </Text>
               <TouchableOpacity 
                 onPress={() => toggleCardExpansion(item.id)}
                 style={styles.chevronButton}>
                 <Ionicons 
                   name={isExpanded ? "chevron-down" : "chevron-up"} 
                   size={wp(4.9)} 
                   color={item.statusColor} 
                 />
               </TouchableOpacity>
             </View>
             
             {/* Timeline Section - Only show for Active cards */}
             {isActive && (
               <View style={styles.timelineSection}>
                 <Text style={styles.timelineLabel}>Timeline</Text>
                 <View style={styles.timelineContainer}>
                   <View style={[styles.timelineDot, { backgroundColor: item.statusColor }]} />
                   <View style={[styles.timelineLine, { backgroundColor: item.statusColor }]} />
                   <View style={[styles.timelineDot, { backgroundColor: '#E0E0E0' }]} />
                   <View style={[styles.timelineLine, { backgroundColor: '#E0E0E0' }]} />
                   <View style={[styles.timelineDot, { backgroundColor: '#E0E0E0' }]} />
                   <View style={[styles.timelineLine, { backgroundColor: '#E0E0E0' }]} />
                   <View style={[styles.timelineDot, { backgroundColor: '#E0E0E0' }]} />
                   <View style={[styles.timelineLine, { backgroundColor: '#E0E0E0' }]} />
                   <View style={[styles.timelineDot, { backgroundColor: '#E0E0E0' }]} />
                 </View>
               </View>
             )}
             {isExpanded && item.details && (
               <View style={styles.expandedContent}>
                 <View style={styles.dashedLine} />
                 <Text style={styles.reviewTitle}>
                   YOUR <Text style={[styles.reviewHighlight, { color: item.statusColor }]}>{item.status.toUpperCase()}</Text> CAMPAIGN AD DETAILL
                 </Text>
                 <View style={styles.detailsBox}>
                   <View style={styles.detailItem}>
                     <Ionicons name="document-text" size={wp(4)} color={item.statusColor} />
                     <Text style={[styles.detailText, { color: item.statusColor }]}>Name: {item.details.name}</Text>
                   </View>
                   <View style={styles.detailItem}>
                     <Ionicons name="checkmark-circle" size={wp(4)} color={item.statusColor} />
                     <Text style={[styles.detailText, { color: item.statusColor }]}>How many days: {item.details.days}</Text>
                   </View>
                   <View style={styles.detailItem}>
                     <Ionicons name="checkmark-circle" size={wp(4)} color={item.statusColor} />
                     <Text style={[styles.detailText, { color: item.statusColor }]}>Category: {item.details.category}</Text>
                   </View>
                   <View style={styles.detailItem}>
                     <Ionicons name="location" size={wp(4)} color={item.statusColor} />
                     <Text style={[styles.detailText, { color: item.statusColor }]}>Location: {item.details.location}</Text>
                   </View>
                   <View style={styles.detailItem}>
                     <Ionicons name="time" size={wp(4)} color={item.statusColor} />
                     <Text style={[styles.detailText, { color: item.statusColor }]}>{item.details.reviewTime}</Text>
                   </View>
                   <View style={styles.detailItem}>
                     <Ionicons name="time" size={wp(4)} color={item.statusColor} />
                     <Text style={[styles.detailText, { color: item.statusColor }]}>{item.details.reviewStatus}</Text>
                   </View>
                 </View>
     
                 {/* Payment Summary */}
                 <View style={styles.paymentSummary}>
                   <View style={styles.paymentRow}>
                     <Text style={[styles.paymentLabel, { color: item.statusColor }]}>Date</Text>
                     <Text style={[styles.paymentValue, { color: item.statusColor }]}>{item.payment.date}</Text>
                   </View>
                   <View style={styles.paymentRow}>
                     <Text style={[styles.paymentLabel, { color: item.statusColor }]}>TAX</Text>
                     <Text style={[styles.paymentValue, { color: item.statusColor }]}>{item.payment.tax}</Text>
                   </View>
                 
                 </View>
               </View>
             )}
           </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFF4FD" barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={wp(6)} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          All Campaigns
        </Text>
        <View style={styles.headerSpacer} />
      </View>


        <ScrollView style={styles.cardsContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardsContent}>
         {/* Loading State */}
         {loading && (
           <View style={styles.loadingContainer}>
             <ActivityIndicator size="large" color="#C539A5" />
             <Text style={styles.loadingText}>Loading campaigns...</Text>
           </View>
         )}

         {/* Error State */}
         {error && (
           <View style={styles.errorContainer}>
             <Text style={styles.errorText}>
               Failed to load campaigns. Please try again.
             </Text>
            <TouchableOpacity 
               style={styles.retryButton}
               onPress={() => refetch()}
             >
               <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
      </View>
         )}


         {/* Campaign Data */}
         {!loading && !error && (
           <>
             {filteredData.length === 0 ? (
               <View style={styles.emptyContainer}>
                 <Text style={styles.emptyText}>No campaigns found</Text>
                 <Text style={styles.emptySubtext}>
                   Create your first campaign to get started
                 </Text>
               </View>
             ) : filteredData.map((item) => (
              <CardStatus
                key={item.id}
                id={item.id}
                title={item.title}
                location={item.location}
                date={item.date}
                status={item.status}
                statusColor={item.statusColor}
                cardType="campaign"
                isExpanded={expandedCard === item.id}
                onPress={() => toggleCardExpansion(item.id)}
                daysLeft={item.daysLeft}
                details={item.details}
              />
            ))
        }
           </>
         )}
      </ScrollView>
      
      {/* Bottom Tab Navigation */}
      {/* <BottomTab 
        activeTab={activeBottomTab} 
        onTabPress={handleBottomTabPress} 
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF4FD',
    padding:10,
  },
  cardImg:{
    width: width * 0.14, 
    height: width * 0.18,
     resizeMode: 'contain',
     borderRadius:2,
    marginRight:10},
   header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingTop: hp(5),
    paddingBottom: height * 0.03,
  },
  backButton: {
    backgroundColor: "#fff",
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSpacer: {
    width: wp(10),
  },
  cardsContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cardsContent: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    paddingBottom: hp(12), // Increased padding for bottom tab
  },
  campaignCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: wp(4),
    marginBottom: hp(2),
    padding: wp(5),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: '#E8F5E8',
  },
  activeCard: {
    backgroundColor: '#F0F8F0',
    borderColor: '#4CAF50',
  },
  reviewCard: {
    backgroundColor: '#F3E5F5',
    borderColor: '#9C27B0',
  },
  blockedCard: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  recentHistoryCard: {
    backgroundColor: '#F5F5F5',
    borderColor: '#9E9E9E',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(1),
  },
  cardContent: {
    flex: 1,
    marginRight: wp(3),
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: hp(0.7),
    lineHeight: wp(5),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0),
  },
  locationIcon: {
    marginRight: wp(1.5),
  },
  locationText: {
    fontSize: wp(3.8),
    fontWeight: '400',
    color: '#666',
  },
  dateText: {
    fontSize: wp(3.8),
    fontWeight: '400',
    color: '#666',
    marginLeft:wp(5.5),
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  statusDot: {
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
    marginBottom: hp(1),
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: hp(0.3),
    paddingVertical: hp(0.5),
  },
  statusLine: {
    width: wp(0.8),
    height: hp(5.5),
    marginRight: wp(2),
    marginLeft: wp(0.99),
    borderRadius: wp(0.4),
    position: 'absolute',
    bottom: hp(0.5),
  },
  statusText: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: '#4CAF50',
    flex: 1,
    marginLeft: wp(5.5),
  },
  chevronButton: {
    padding: wp(1),
    marginLeft: wp(2),
  },
  expandedContent: {
    marginTop: hp(1),
    marginBottom: hp(0),
  },
  dashedLine: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: hp(1),
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  reviewTitle: {
    fontSize: wp(3.8),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp(1),
  },
  reviewHighlight: {
    color: '#E91E63',
  },
  detailsBox: {
    backgroundColor: '#F8F8F8',
    borderRadius: wp(2),
    padding: wp(4),
    marginBottom: hp(1),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.8),
  },
  detailText: {
    fontSize: wp(3.5),
    color: '#666',
    marginLeft: wp(2),
    flex: 1,
  },
  paymentSummary: {
    marginTop: hp(1),
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(0.5),
  },
  paymentLabel: {
    fontSize: wp(3.5),
    color: '#666',
    fontWeight: '500',
  },
  paymentValue: {
    fontSize: wp(3.5),
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#C539A5',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(2),
    marginTop: hp(0.5),
  },
  totalLabel: {
    fontSize: wp(4),
    color: '#fff',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: wp(4),
    color: '#fff',
    fontWeight: 'bold',
  },
  // Payment Card Styles
  paymentCard: {
    borderRadius: wp(4),
    marginBottom: hp(2),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
    minHeight: hp(20),
  },
  paymentCardHeader: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderTopLeftRadius: wp(4),
    borderTopRightRadius: wp(4),
  },
  paymentHeaderTitle: {
    fontSize: wp(4),
    fontWeight: '600',
  },
  paymentAdSection: {
    padding: wp(4),
    minHeight: hp(12),
  },
  paymentAdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  paymentLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentLogo: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    marginRight: wp(2),
  },
  paymentLogoText: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: '#fff',
  },
  paymentLogoLabel: {
    fontSize: wp(3.5),
    fontWeight: '600',
    color: '#4CAF50',
  },
  paymentStatusDot: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
    position:"absolute",
    top:5,
    right:-5
  },
  paymentAdTitle: {
    fontSize: wp(3.8),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(0.2),
  },
  paymentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  paymentLocationText: {
    fontSize: wp(3.2),
    color: '#666',
    marginLeft: wp(1.5),
  },
  paymentDateText: {
    fontSize: wp(3.8),
    color: '#666',
    marginBottom: hp(0.2),
  },
  paymentStatusText: {
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  paymentDetailsSection: {
    paddingHorizontal: wp(10),
    paddingBottom: wp(4),
  },
  paymentDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(0.8),
  },
  paymentDetailsLabel: {
    fontSize: wp(3.8),
    color: '#0f0c0cff',
    fontWeight: '500',
  },
  paymentDetailsValue: {
    fontSize: wp(3.8),
    color: '#676869',
    fontWeight: '300',
  },
  paymentSeparator: {
    height: 1,
    backgroundColor: '#FEB600',
    marginVertical: hp(0.5),
  },
  paymentTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: wp(2),
    marginTop: hp(0.5),
  },
  paymentTotalLabel: {
    fontSize: wp(4),
    color: '#000',
    fontWeight: 'bold',
  },
  paymentTotalValue: {
    fontSize: wp(4),
    fontWeight: 'bold',
  },
  paymentButtonContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(4),
    paddingBottom: wp(4),
    justifyContent: 'space-between',
  },
  paymentActionButton: {
    flex: 1,
    paddingVertical: hp(1.2),
    width:'30%',
    borderRadius: wp(2),
    marginHorizontal: wp(1),
    alignItems: 'center',
  },
  paymentActionButtonText: {
    fontSize: wp(3.8),
    fontWeight: '600',
    color: '#fff',
  },
  paymentCancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width:'40%',
    paddingVertical: hp(1.2),
    borderRadius: wp(2),
    marginHorizontal: wp(1),
    alignItems: 'center',
  },
  paymentPaymentButton: {
    backgroundColor: '#FFE8E8',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  paymentDetailsButton: {
    backgroundColor: '#F3E5F5',
    borderWidth: 1,
    borderColor: '#9C27B0',
  },
  paymentTrackButton: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  paymentButtonText: {
    fontSize: wp(3.8),
    fontWeight: '600',
  },
  paymentCancelButtonText: {
    color: '#666',
  },
  paymentPaymentButtonText: {
    color: '#FF4444',
  },
  paymentDetailsButtonText: {
    color: '#9C27B0',
  },
  paymentTrackButtonText: {
    color: '#4CAF50',
  },
  timelineSection: {
    marginTop: hp(1),
    paddingTop: hp(1),
  },
  timelineLabel: {
    fontSize: wp(3.5),
    color: '#666',
    marginBottom: hp(0.8),
    marginLeft: wp(5.5),
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: wp(5.5),
  },
  timelineDot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    marginRight: wp(1),
  },
  timelineLine: {
    width: wp(3),
    height: wp(0.3),
    marginRight: wp(1),
    borderRadius: wp(0.15),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(4),
  },
  loadingText: {
    fontSize: wp(4),
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
    fontSize: wp(4),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp(2),
  },
  retryButton: {
    backgroundColor: '#C539A5',
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: wp(4),
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
    fontSize: wp(5),
    color: '#333',
    fontWeight: '600',
    marginBottom: hp(1),
  },
  emptySubtext: {
    fontSize: wp(3.5),
    color: '#666',
    textAlign: 'center',
  },
});

export default CampaignScreen;
