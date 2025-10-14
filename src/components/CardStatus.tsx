import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;
export interface CardStatusProps {
  id: number;
  title: string;
  location: string;
  date: string;
  status: string;
  statusColor: string;
  isExpanded?: boolean;
  onPress?: () => void;
  cardType: 'campaign' | 'payment' | 'recent';
  backgroundColor?: string;
  textColor?: string;
  daysLeft?: string;
  details?: any;
  payment?: {
    date: string;
    tax: string;
    total: string;
  };
  ad?: {
    logo?: string;
    title?: string;
    location?: string;
    date?: string;
    status?: string;
    statusColor?: string;
    statusDot?: string;
  };
}
const CardStatus: React.FC<CardStatusProps> = ({
  id,
  title,
  location,
  date,
  status,
  statusColor,
  isExpanded = false,
  onPress,
  cardType,
  backgroundColor = '#FFFFFF',
  textColor = '#333',
  daysLeft,
  details,
  payment,
  ad,
}) => {
  const isActive = status === 'Active';
  const isReview = status === 'Review';
  const isBlocked = status === 'Blocked';
  const isRecentHistory = status === 'Recent History';

  const renderCampaignCard = () => (
    <View style={[
      styles.campaignCard,
      isActive && styles.activeCard,
      isReview && styles.reviewCard,
      isBlocked && styles.blockedCard,
      isRecentHistory && styles.recentHistoryCard,
    ]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardContent}>
          <Text style={styles.campaignTitle}>{title}</Text>
          <View style={styles.locationRow}>
            <Ionicons 
              name="location" 
              size={wp(3.5)} 
              color="#666" 
              style={styles.locationIcon} 
            />
            <Text style={styles.locationText}>{location}</Text>
          </View>
          <Text style={styles.dateText}>{date}</Text>
        </View>
        <View style={styles.cardRight}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        </View>
      </View>
      
      <View style={styles.statusSection}>
        <View style={[styles.statusLine, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>
          {daysLeft || status}
        </Text>
      </View>

      {/* Timeline for Active cards */}
      {isActive && (
        <View style={styles.timelineSection}>
          <Text style={styles.timelineLabel}>Timeline</Text>
          <View style={styles.timelineContainer}>
          
            <View style={[styles.timelineLine, { backgroundColor: statusColor }]} />
              <View style={[styles.timelineLine, { backgroundColor: 'white' }]} />
              <View style={[styles.timelineLine, { backgroundColor: 'white' }]} />
              <View style={[styles.timelineLine, { backgroundColor: 'white' }]} />
              <View style={[styles.timelineLine, { backgroundColor: 'white' }]} />
              <View style={[styles.timelineLine, { backgroundColor: 'white' }]} />
              <View style={[styles.timelineLine, { backgroundColor: 'white' }]} />
             
          
            
          </View>
        </View>
      )}

      {isExpanded && details && (
        <View style={styles.expandedContent}>
          <View style={styles.detailsSection}>
            <Text style={styles.detailText}>Name: {details.name}</Text>
            <Text style={styles.detailText}>Days: {details.days}</Text>
            <Text style={styles.detailText}>Category: {details.category}</Text>
            <Text style={styles.detailText}>Location: {details.location}</Text>
            <Text style={styles.detailText}>Review Time: {details.reviewTime}</Text>
            <Text style={styles.detailText}>Review Status: {details.reviewStatus}</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>Details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.trackButton}>
              <Text style={styles.trackButtonText}>Track</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.expandButton} onPress={onPress}>
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={wp(4)} 
          color={statusColor} 
        />
      </TouchableOpacity>
    </View>
  );

  const renderPaymentCard = () => (
    <View style={[styles.paymentCard, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.paymentCardHeader, { backgroundColor }]}>
        <Text style={[styles.paymentHeaderTitle, { color: textColor }]}>{title}</Text>
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
          <View style={[styles.paymentStatusDot, { backgroundColor: ad?.statusDot || statusColor }]} />
        </View>
        
        <Text style={styles.paymentAdTitle}>{ad?.title || title}</Text>
        
        <View style={styles.paymentLocationRow}>
          <Ionicons name="location" size={wp(3.5)} color="#666" />
          <Text style={styles.paymentLocationText}>{ad?.location || location}</Text>
        </View>
        
        <Text style={styles.paymentDateText}>{ad?.date || date}</Text>
        <Text style={[styles.paymentStatusText, { color: ad?.statusColor || statusColor }]}>
          {ad?.status || status}
        </Text>
      </View>
      
      {/* Separator */}
      <View style={styles.paymentSeparator} />
      
      {/* Payment Summary */}
      {payment && (
        <View style={styles.paymentSummary}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Date</Text>
            <Text style={styles.paymentValue}>{payment.date}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>TAX</Text>
            <Text style={styles.paymentValue}>{payment.tax}</Text>
          </View>
        </View>
      )}
      
      {/* Total Bar */}
      <View style={[styles.paymentTotalRow, {}]}>
        <Text style={styles.paymentTotalLabel}>TOTAL</Text>
        <Text style={styles.paymentTotalValue}>{payment?.total || 'PKR 0.000'}</Text>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.paymentButtonContainer}>
        <TouchableOpacity style={styles.paymentCancelButton}>
          <Text style={styles.paymentCancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.paymentActionButton, { backgroundColor: ad?.statusColor || statusColor }]}>
          <Text style={styles.paymentActionButtonText}>Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentHistoryCard = () => (
    <View style={[
      styles.campaignCard,
      styles.recentHistoryCard,
    ]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardContent}>
          <Text style={styles.campaignTitle}>{title}</Text>
          <View style={styles.locationRow}>
            <Ionicons 
              name="location" 
              size={wp(3.5)} 
              color="#666" 
              style={styles.locationIcon} 
            />
            <Text style={styles.locationText}>{location}</Text>
          </View>
          <Text style={styles.dateText}>{date}</Text>
        </View>
        <View style={styles.cardRight}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        </View>
      </View>
      
      <View style={styles.statusSection}>
        <View style={[styles.statusLine, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>
          {daysLeft || status}
        </Text>
      </View>
    </View>
  );

  switch (cardType) {
    case 'payment':
      return renderPaymentCard();
    case 'recent':
      return renderRecentHistoryCard();
    case 'campaign':
    default:
      return renderCampaignCard();
  }
};
const styles = StyleSheet.create({
  campaignCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(4),
    marginBottom: hp(2),
    padding: wp(4),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeCard: {
    backgroundColor: '#E8F5E8',
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
  },
  campaignTitle: {
    fontSize: wp(4.2),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(0.5),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.3),
  },
  locationIcon: {
    marginRight: wp(1.5),
  },
  locationText: {
    fontSize: wp(3.8),
    color: '#666',
  },
  dateText: {
    fontSize: wp(3.8),
    color: '#666',
    marginBottom: hp(0.5),
  },
  cardRight: {
    alignItems: 'center',
  },
  statusDot: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  statusLine: {
    width: wp(2),
    height: wp(0.3),
    marginRight: wp(2),
    borderRadius: wp(0.15),
  },
  statusText: {
    fontSize: wp(3.5),
    fontWeight: '600',
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
    width: wp(8),
    height: wp(1),
    marginRight: wp(2),
    borderRadius: wp(0.15),
  },
  expandedContent: {
    marginTop: hp(1),
    paddingTop: hp(1),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  detailsSection: {
    marginBottom: hp(1.5),
  },
  detailText: {
    fontSize: wp(3.5),
    color: '#666',
    marginBottom: hp(0.3),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsButton: {
    backgroundColor: '#F3E5F5',
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.8),
    borderRadius: wp(2),
    flex: 1,
    marginRight: wp(2),
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#9C27B0',
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  trackButton: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.8),
    borderRadius: wp(2),
    flex: 1,
    alignItems: 'center',
  },
  trackButtonText: {
    color: '#4CAF50',
    fontSize: wp(3.5),
    fontWeight: '600',
  },
  expandButton: {
    position: 'absolute',
    top: wp(25),
    right: wp(4),
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
  },
  paymentAdTitle: {
    fontSize: wp(4.2),
    fontWeight: 'bold',
    color: '#000',
    marginBottom: hp(0.5),
  },
  paymentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.3),
  },
  paymentLocationText: {
    fontSize: wp(3.8),
    color: '#666',
    marginLeft: wp(1.5),
  },
  paymentDateText: {
    fontSize: wp(3.8),
    color: '#666',
    marginBottom: hp(0.5),
  },
  paymentStatusText: {
    fontSize: wp(3.8),
    fontWeight: '600',
  },
  paymentSeparator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: wp(4),
  },
  paymentSummary: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(0.5),
  },
  paymentLabel: {
    fontSize: wp(3.8),
    fontWeight: '600',
    color: '#333',
  },
  paymentValue: {
    fontSize: wp(3.8),
    color: '#666',
  },
  paymentTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  paymentTotalLabel: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: '#000',
  },
  paymentTotalValue: {
    fontSize: wp(4),
    fontWeight: 'bold',
    color: '#000',
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
  paymentCancelButtonText: {
    fontSize: wp(3.8),
    fontWeight: '600',
    color: '#666',
  },
});
export default CardStatus;
