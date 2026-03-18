import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAdvertisements } from '../../advertisments/hooks/useAdvertisements';
import Loader from '../../../components/Loader';
import { Images } from '../../../assets/images';
import Header from '../../../components/Header';
import { useNotificationsStore } from '../../notifications/store/notifications';

const { width, height } = Dimensions.get('window');

const BOTTOM_PADDING = Math.max(50, height * 0.10);

interface CampaignChat {
  id: number;
  campaignId: number;
  campaignName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  status: string;
  boardLocation?: string;
}

// Helper function to format campaign status for display
const formatStatusForDisplay = (status: string): string => {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'PAYMENT_PENDING':
      return 'Payment Pending';
    case 'IN_REVIEW':
    case 'UNDER_REVIEW':
      return 'In Review';
    case 'SCHEDULED':
      return 'Scheduled';
    case 'PUBLISHED':
      return 'Active';
    case 'COMPLETED':
      return 'Completed';
    case 'BLOCKED':
      return 'Blocked';
    default:
      return status || 'Draft';
  }
};

const InboxScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { notifications } = useNotificationsStore();

  const {
    advertisements: campaigns,
    loading,
    error,
    refetch,
  } = useAdvertisements({ limit: 1000, page: 1, status: undefined });

  // Helper function to get unread notification count for a campaign
  const getUnreadNotificationCount = (campaignId: number): number => {
    return notifications.filter(n => {
      if (n.read) return false;
      const notificationAdId = n.data?.advertisement_id || n.data?.advertisementId;
      const adId = typeof notificationAdId === 'string'
        ? parseInt(notificationAdId, 10)
        : notificationAdId;
      return adId === campaignId;
    }).length;
  };

  // Transform campaigns into chat list format (ONE chat per campaign)
  const campaignChats: CampaignChat[] = useMemo(() => {
    if (!campaigns || campaigns.length === 0) return [];

    // Group by campaign ID to ensure one chat per campaign
    const chatMap = new Map<number, CampaignChat>();

    campaigns.forEach((campaign: any) => {
      // Only create one chat per campaign
      if (!chatMap.has(campaign.id)) {
        // Extract campaign name from board
        const board = campaign.board || {};

        const campaignName =
          campaign.title ||         // check campaign title FIRST
          board.title ||
          board.name ||
          `${board.location?.name || board.location || 'Board'} ${board.category?.name || ''}`.trim() ||
          'Campaign';

        // Get board location
        const boardLocation =
          typeof board.location === 'string'
            ? board.location
            : board.location?.name || 'Unknown Location';

        // Format last message time
        const lastMessageTime = campaign.last_message_time
          ? new Date(campaign.last_message_time).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
          : campaign.updated_at
            ? new Date(campaign.updated_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })
            : 'Just now';

        // Combine unread count from messages and notifications
        const messageUnreadCount = campaign.unread_count || 0;
        const notificationUnreadCount = getUnreadNotificationCount(campaign.id);
        const totalUnreadCount = messageUnreadCount + notificationUnreadCount;

        // Get campaign status
        const campaignStatus = campaign.status || 'DRAFT';

        // If there's no last message, show the formatted status instead
        const lastMessage = campaign.last_message
          ? campaign.last_message
          : formatStatusForDisplay(campaignStatus);

        chatMap.set(campaign.id, {
          id: campaign.id,
          campaignId: campaign.id,
          campaignName,
          lastMessage,
          lastMessageTime,
          unreadCount: totalUnreadCount,
          status: campaignStatus,
          boardLocation,
        });
      }
    });

    return Array.from(chatMap.values());
  }, [campaigns, notifications]);


  const handleCampaignPress = (chat: CampaignChat) => {
    navigation.navigate('CampaignChatDetail', {
      campaignId: chat.campaignId,
      campaignName: chat.campaignName,
      boardLocation: chat.boardLocation,
    });
  };


  const renderMessageItem = ({ item }: { item: CampaignChat }) => {
    const isUnread = (item.unreadCount || 0) > 0;

    return (
      <TouchableOpacity
        style={[
          styles.messageCard,
          isUnread && styles.highlightedCard,
        ]}
        onPress={() => handleCampaignPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={[
            styles.iconContainer,
            isUnread ? styles.welcomeIconContainer : { backgroundColor: '#F5F5F5' }
          ]}>
            <Image
              source={Images.dp}
              style={styles.welcomeIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <View style={styles.titleWithBadge}>
                <Text style={[
                  styles.campaignName,
                  isUnread && styles.campaignNameUnread
                ]} numberOfLines={1}>
                  {item.campaignName}
                </Text>
                {isUnread && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>
                      {item.unreadCount > 99 ? '99+' : item.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[
                styles.messageTime,
                isUnread && styles.messageTimeUnread
              ]} numberOfLines={1}>
                {item.lastMessageTime}
              </Text>
            </View>
            <Text style={[
              styles.lastMessage,
              isUnread && styles.lastMessageUnread
            ]} numberOfLines={2}>
              {item.lastMessage}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Image
          source={Images.chat}
          style={styles.emptyIcon}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.emptyTitle}>You don't have any message yet</Text>
      <Text style={styles.emptySubtitle}>
        Start your first campaign to view insights, results, and performance here.
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('ChooseOptionScreen')}
      >
        <Text style={styles.createButtonText}>Create Campaign</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <Header
        title="Inbox"
        showBackButton={false}
        showRightIcon={false}
      />

      <View style={styles.listContainer}>
        {campaignChats.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={campaignChats}
            renderItem={renderMessageItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: BOTTOM_PADDING, // Account for FAB + bottom nav + spacing
  },
  messageCard: {
    backgroundColor: '#fff',
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.04,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#E5E7EB',
  },
  highlightedCard: {
    borderWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    backgroundColor: '#FDE7FB',
    borderColor: '#E5E7EB',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.04,
    backgroundColor: '#F5F5F5',
  },
  welcomeIconContainer: {
    backgroundColor: '#C539A5',
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.04,
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: width * 0.025,
    fontWeight: 'bold',
  },
  welcomeIcon: {
    width: width * 0.14,
    height: width * 0.2,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: height * 0.008,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: width * 0.02,
  },
  campaignName: {
    fontSize: width * 0.035,
    fontWeight: 'bold',
    color: '#18181B',
    flex: 1,
  },
  campaignNameUnread: {
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: '#C539A5',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  messageTime: {
    fontSize: 8,
    color: '#18181B',
    fontWeight: '500',
  },
  messageTimeUnread: {
    fontWeight: '600',
    color: '#C539A5',
  },
  lastMessage: {
    fontSize: width * 0.030,
    color: '#18181B',
    lineHeight: width * 0.045,
  },
  lastMessageUnread: {
    fontWeight: '600',
    color: '#374151',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    tintColor: '#D1D5DB',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: '#C539A5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InboxScreen;

