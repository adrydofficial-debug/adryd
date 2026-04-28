import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Loader from '../../../components/Loader';
import { Images } from '../../../assets/images';
import Header from '../../../components/Header';
import { useAuthStore } from '../../../store/authStore';
import { useCampaignMessages, useSendCampaignMessage, useMarkCampaignMessagesRead } from '../hooks/useCampaignChat';
import { useRealtimeCampaignMessages } from '../hooks/useRealtimeCampaignMessages';
import { useAdvertisement } from '../../advertisments/hooks/useAdvertisements';
import { GetCampaignMessagesResponse } from '../api/campaignChatApi';
import { useNotificationsStore } from '../../notifications/store/notifications';
import { markNotificationAsRead } from '../../notifications/api/api';
import { useProfile } from '../../profile/hooks/useProfile';
import { useUploadChatMedia } from '../../advertisments/hooks/hooks';
import SecureImage from '../../../components/SecureImage';
import SecureVideo from '../../../components/SecureVideo';
import { isVideoUrl } from '../../../utils/secureMedia';
import { launchImageLibrary } from 'react-native-image-picker';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

interface CampaignMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  messageType?: 'text' | 'status_update' | 'system' | 'media';
  mediaUrl?: string;
  mediaType?: string;

  statusUpdate?: {
    oldStatus: string;
    newStatus: string;
    campaignDetails?: any;
  };
  campaignDetails?: {
    status: string;
    campaignName: string;
    estimatedTime?: string;
    location?: string;
    area?: string;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  };

  media_url?: string;
  uri?: string;
  media?: Array<{ url: string } | string>;

}

const CampaignChatDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuthStore();
  const { campaignId: routeCampaignId, campaignName, boardLocation } = route.params || {};

  // Normalize campaignId to number for consistent comparison
  const campaignId = routeCampaignId
    ? (typeof routeCampaignId === 'string' ? parseInt(routeCampaignId, 10) : routeCampaignId)
    : null;

  const [inputText, setInputText] = useState('');
  const [ratingComment, setRatingComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [isWaitingForMessage, setIsWaitingForMessage] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ uri: string; type: string; name: string; fileSize?: number } | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadedMediaMessages, setUploadedMediaMessages] = useState<CampaignMessage[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const ratingCardShownRef = useRef(false);
  const { notifications, markAsRead } = useNotificationsStore();
  const uploadChatMediaMutation = useUploadChatMedia(campaignId || 0);
  const [optimisticTextMessages, setOptimisticTextMessages] = useState<CampaignMessage[]>([]);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  // Fetch user profile for avatar
  const { data: profile } = useProfile();

  // Get avatar URL with fallback
  const avatarUrl = (
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    ''
  )
    .toString()
    .trim();
  const looksLikeUrl = /^(https?:\/\/|file:\/\/|content:\/\/)/i.test(avatarUrl);
  const hasBadToken = /null|undefined/i.test(avatarUrl);
  const [avatarError, setAvatarError] = useState(false);

  // Reset avatar error when URL changes
  useEffect(() => {
    setAvatarError(false);
  }, [avatarUrl]);

  // Fetch campaign details
  const { advertisement: campaign, loading: campaignLoading } = useAdvertisement(
    campaignId || null,
  );

  // Fetch campaign messages (with error handling for missing API)
  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages,
    error: messagesError,
  } = useCampaignMessages(campaignId || null);

  // Reset rating card shown flag when messages or campaign status changes
  useEffect(() => {
    ratingCardShownRef.current = false;
  }, [messagesData, campaign?.status]);

  // Clear cache and reset when campaignId changes
  useEffect(() => {
    // Reset rating card when campaign changes
    ratingCardShownRef.current = false;
    // Clear any cached messages when switching campaigns
    if (campaignId) {
      console.log('🔄 Campaign changed, clearing cache for:', campaignId);
    }
  }, [campaignId]);



  // Debug: Log API response to see what messages are being returned
  useEffect(() => {
    if (messagesData) {
      const data = messagesData as GetCampaignMessagesResponse;
      console.log('📨 API Response - All messages:', data.messages);
      console.log('📊 Total messages from API:', data.messages?.length || 0);
      console.log('🎯 Current Campaign ID:', campaignId);

      // Check if messages have campaign_id or advertisement_id
      if (data.messages && data.messages.length > 0) {
        const firstMsg = data.messages[0] as any;
        console.log('📋 First message structure:', {
          hasCampaignId: !!firstMsg.campaign_id,
          hasAdvertisementId: !!firstMsg.advertisement_id,
          campaignId: firstMsg.campaign_id,
          advertisementId: firstMsg.advertisement_id,
          conversationId: firstMsg.conversation_id,
        });

        // Check for messages from different campaigns
        const messagesFromOtherCampaigns = data.messages.filter((m: any) => {
          const msgCampaignId = m.campaign_id || m.advertisement_id;
          return msgCampaignId && msgCampaignId !== campaignId;
        });

        if (messagesFromOtherCampaigns.length > 0) {
          console.warn('⚠️ Found messages from other campaigns:', {
            count: messagesFromOtherCampaigns.length,
            otherCampaignIds: messagesFromOtherCampaigns.map((m: any) => m.campaign_id || m.advertisement_id),
            currentCampaignId: campaignId,
          });
        }
      }

      const statusUpdates = data.messages?.filter((m: any) => m.message_type === 'status_update') || [];
      console.log('📋 Status update messages:', statusUpdates.length);
      statusUpdates.forEach((msg: any, index: number) => {
        console.log(`  ${index + 1}. ID: ${msg.id}, Status: ${msg.status_update?.old_status} → ${msg.status_update?.new_status}, Created: ${msg.created_at}`);
      });
    }
  }, [messagesData, campaignId]);

  // Send message mutation
  const sendMessageMutation = useSendCampaignMessage();

  // Mark as read
  const markAsReadMutation = useMarkCampaignMessagesRead();

  // Mark messages as read when screen is focused (only if API exists)
  useEffect(() => {
    if (campaignId && !messagesError) {
      markAsReadMutation.mutate(campaignId);
    }
  }, [campaignId, messagesError]);

  // Real-time subscription for campaign messages
  useRealtimeCampaignMessages({
    campaignId: campaignId || null,
    messagesData: messagesData, // Pass messages data to extract conversation_id
    onNewMessage: () => {
      // Only refetch if we have a valid campaignId to ensure we're fetching the right campaign
      if (campaignId) {
        console.log('🔄 Refetching messages for campaign:', campaignId);
        refetchMessages();

        // Scroll to bottom after a short delay to allow message to render
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 300);
      }
    },
  });

  // Refetch messages when screen comes into focus
  // This ensures status updates appear immediately when returning to the screen
  // Also mark notifications as read for this campaign
  useFocusEffect(
    useCallback(() => {
      if (!campaignId) return;

      // Refetch messages when screen comes into focus
      console.log('🔄 Screen focused - refetching messages');
      refetchMessages();

      // Find all unread notifications related to this campaign
      const campaignNotifications = notifications.filter(n => {
        if (n.read) return false;
        const notificationAdId = n.data?.advertisement_id || n.data?.advertisementId;
        const adId = typeof notificationAdId === 'string'
          ? parseInt(notificationAdId, 10)
          : notificationAdId;
        return adId === campaignId;
      });

      // Mark each notification as read
      if (campaignNotifications.length > 0) {
        console.log(`📬 Marking ${campaignNotifications.length} notifications as read for campaign ${campaignId}`);
        campaignNotifications.forEach(async (notification) => {
          try {
            // Mark in backend
            await markNotificationAsRead(notification.id);
            // Mark in store
            markAsRead(notification.id);
          } catch (error) {
            console.warn('Failed to mark notification as read:', error);
          }
        });
      }
    }, [campaignId, refetchMessages, notifications, markAsRead])
  );

  // Get display name for campaign (must be before useMemo that uses it)
  const displayCampaignName =
    campaign?.title ||
    campaign?.board?.title ||
    campaignName ||
    'Campaign';

  // Transform API messages to UI format
  const messages: CampaignMessage[] = React.useMemo(() => {
    // Show default status message when:
    // 1. API call failed (messagesError)
    // 2. No messages data (either not loaded yet or empty)
    // 3. Messages array is empty
    // Show it even while loading if we have campaign data
    const messagesResponseData = messagesData as GetCampaignMessagesResponse | undefined;
    const shouldShowDefault =
      messagesError ||
      !messagesResponseData ||
      !messagesResponseData.messages ||
      messagesResponseData.messages.length === 0;

    if (shouldShowDefault) {
      // Wait for campaign to load
      if (!campaign && campaignLoading) return [];
      if (!campaign) return [];

      // Always show "InProgress" status for all advertisements
      const board = campaign.board || {};
      const booking = campaign.bookings?.[0];

      let estimatedTime: string | undefined;
      if (booking) {
        const days = Math.ceil(
          (new Date(booking.end_at).getTime() - new Date(booking.start_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        estimatedTime = `${days} days`;
      } else {
        estimatedTime = '10 to 12 days';
      }

      const actualStatus = (campaign.status || 'DRAFT').toUpperCase();
      const campaignDetails = {
        status: actualStatus,
        campaignName: displayCampaignName,
        location: boardLocation || board.location?.name || board.location?.city?.name,
        area: board.description || board.slug?.replace(/-/g, ' '),
        type: board.category?.name?.toLowerCase().includes('digital') ? 'Digital' : 'Static',
        category: board.category?.name || 'Billboard',
        estimatedTime,
      };

      return [{
        id: 'default-status',
        text: actualStatus === 'IN_PROGRESS' ? `Estimated Time ${estimatedTime}` : actualStatus,
        isUser: false,
        timestamp: new Date(campaign.created_at || campaign.updated_at),
        messageType: 'status_update' as const,
        statusUpdate: {
          oldStatus: 'DRAFT',
          newStatus: actualStatus,
        },
        campaignDetails,
      }];
    }

    // Debug: Log transformed messages
    if (!messagesData) {
      return [];
    }

    const messagesResponse = messagesData as GetCampaignMessagesResponse;


    const filteredMessages = messagesResponse.messages.filter((msg: any) => {
      const msgCampaignId = msg.campaign_id || msg.advertisement_id;

      if (msgCampaignId) {
        const msgIdNum = typeof msgCampaignId === 'string' ? parseInt(msgCampaignId, 10) : msgCampaignId;
        const currentIdNum = typeof campaignId === 'string' ? parseInt(campaignId, 10) : campaignId;

        if (msgIdNum !== currentIdNum) {
          console.warn('⚠️ Filtering out message from different campaign:', {
            messageId: msg.id,
            messageCampaignId: msgCampaignId,
            messageCampaignIdNum: msgIdNum,
            currentCampaignId: campaignId,
            currentCampaignIdNum: currentIdNum,
            messageContent: msg.content?.substring(0, 50),
            conversationId: msg.conversation_id,
          });
          return false;
        }
        // Message belongs to this campaign
        return true;
      }

      // If message doesn't have campaign_id/advertisement_id, we can't verify
      // Log a warning but include it (backend should provide campaign_id)
      console.warn('⚠️ Message missing campaign_id/advertisement_id:', {
        messageId: msg.id,
        messageContent: msg.content?.substring(0, 50),
        conversationId: msg.conversation_id,
        note: 'Including message but it should have campaign_id',
      });
      return true; // Include it for now, but backend should fix this
    });

    // Log filtering results
    if (filteredMessages.length !== messagesResponse.messages.length) {
      console.warn('⚠️ Filtered out messages:', {
        originalCount: messagesResponse.messages.length,
        filteredCount: filteredMessages.length,
        removedCount: messagesResponse.messages.length - filteredMessages.length,
        campaignId,
      });
    }

    const transformedMessages = filteredMessages.map((msg: any) => {
      const isUser = msg.sender_id === user?.id;

      // Handle status update messages
      if (msg.message_type === 'status_update' && msg.status_update) {
        const statusUpdate = msg.status_update;
        const board = campaign?.board || {};

        // Use campaign_details from backend if available, otherwise fallback to local data
        const backendDetails = statusUpdate.campaign_details || {};

        // Prefer backend data, fallback to local campaign data
        const campaignDetails = {
          status: statusUpdate.new_status,
          campaignName: backendDetails.campaignName ||
            campaign?.title ||
            board.title ||
            campaignName ||
            'Campaign',
          location: backendDetails.location ||
            boardLocation ||
            board.location?.name ||
            board.location?.city?.name,
          area: backendDetails.area ||
            board.description ||
            board.slug?.replace(/-/g, ' '),
          type: backendDetails.type ||
            (board.category?.name?.toLowerCase().includes('digital') ? 'Digital' : 'Static'),
          category: backendDetails.category ||
            board.category?.name ||
            'Billboard',
          estimatedTime: backendDetails.estimatedTime,
          startDate: backendDetails.startDate,
          endDate: backendDetails.endDate,
        };

        return {
          id: msg.id.toString(),
          text: msg.content, // Use the message content from backend (already has the status message)
          isUser: false,
          timestamp: new Date(msg.created_at),
          messageType: 'status_update' as const,
          statusUpdate: {
            oldStatus: statusUpdate.old_status,
            newStatus: statusUpdate.new_status,
            campaignDetails: campaignDetails,
          },
          campaignDetails,
        };
      }

      const isMediaContent = msg.content &&
        // NEW - extension can appear anywhere in the URL path
        /https?:\/\/.+\.(jpg|jpeg|png|gif|webp|mp4|mov|avi|webm)/i.test(msg.content);
      const isVideoContent = msg.content &&
        /\.(mp4|mov|avi|webm)(\?.*)?$/i.test(msg.content);

      return {
        id: msg.id.toString(),
        text: msg.content,
        isUser,
        timestamp: new Date(msg.created_at),
        messageType: isMediaContent
          ? 'media' as const
          : (msg.message_type || 'text') as 'text' | 'status_update' | 'system',
        mediaUrl: isMediaContent ? msg.content : undefined,
        mediaType: isVideoContent ? 'video/mp4' : (isMediaContent ? 'image/jpeg' : undefined),
      };
    });

    // Debug: Log final transformed messages
    console.log('✅ Transformed messages count:', transformedMessages.length);
    const transformedStatusUpdates = transformedMessages.filter((m: any) => m.messageType === 'status_update');
    console.log('✅ Transformed status updates:', transformedStatusUpdates.length);
    transformedStatusUpdates.forEach((msg: any, index: number) => {
      console.log(`  ${index + 1}. ID: ${msg.id}, Status: ${msg.statusUpdate?.oldStatus} → ${msg.statusUpdate?.newStatus}`);
    });

    // Always prepend an "InProgress" status card at the start if campaign data is available
    if (campaign) {
      const board = campaign.board || {};
      const booking = campaign.bookings?.[0];

      // Check if first message is already a status update
      const firstMessageIsStatus = transformedMessages.length > 0 &&
        transformedMessages[0].messageType === 'status_update';

      // Only add if there's no status message at the start
      if (!firstMessageIsStatus) {
        let estimatedTime: string | undefined;
        if (booking) {
          const days = Math.ceil(
            (new Date(booking.end_at).getTime() - new Date(booking.start_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          estimatedTime = `${days} days`;
        }

        const actualStatus = (campaign.status || 'DRAFT').toUpperCase();
        const inProgressCampaignDetails = {
          status: actualStatus,
          campaignName: displayCampaignName,
          location: boardLocation || board.location?.name || board.location?.city?.name,
          area: board.description || board.slug?.replace(/-/g, ' '),
          type: board.category?.name?.toLowerCase().includes('digital') ? 'Digital' : 'Static',
          category: board.category?.name || 'Billboard',
          estimatedTime: estimatedTime || '10 to 12 days',
        };

        const inProgressMessage: CampaignMessage = {
          id: 'default-status',
          text: actualStatus === 'IN_PROGRESS' && estimatedTime
            ? `Estimated Time ${estimatedTime}`
            : actualStatus,
          isUser: false,
          timestamp: new Date(campaign.created_at || Date.now()),
          messageType: 'status_update' as const,
          statusUpdate: {
            oldStatus: 'DRAFT',
            newStatus: actualStatus,
            campaignDetails: inProgressCampaignDetails,
          },
          campaignDetails: inProgressCampaignDetails,
        };

        const extractFilename = (url: string) => {
          try { return new URL(url).pathname.split('/').pop() || url; }
          catch { return url.split('/').pop() || url; }
        };

        const serverMediaUrls = new Set(
          transformedMessages
            .filter(m => m.mediaUrl)
            .map(m => extractFilename(m.mediaUrl!))
        );

        console.log('🖼️ Server media URLs:', [...serverMediaUrls]);
        console.log('🖼️ Optimistic messages:', uploadedMediaMessages.map(m => extractFilename(m.mediaUrl || '')));

        const filteredOptimistic = uploadedMediaMessages.filter(optMsg => {
          if (!optMsg.mediaUrl) return false;
          return !serverMediaUrls.has(extractFilename(optMsg.mediaUrl));
        });

        return [inProgressMessage, ...transformedMessages, ...filteredOptimistic, ...optimisticTextMessages];
      }
    }

    const extractFilename = (url: string) => {
      try { return new URL(url).pathname.split('/').pop() || url; }
      catch { return url.split('/').pop() || url; }
    };

    const serverMediaUrls = new Set(
      transformedMessages
        .filter(m => m.mediaUrl)
        .map(m => extractFilename(m.mediaUrl!))
    );

    console.log('🖼️ Server media URLs:', [...serverMediaUrls]);
    console.log('🖼️ Optimistic messages:', uploadedMediaMessages.map(m => extractFilename(m.mediaUrl || '')));

    const allMessages: CampaignMessage[] = [...transformedMessages];

    uploadedMediaMessages.forEach(optMsg => {
      if (!optMsg.mediaUrl) return;
      if (!serverMediaUrls.has(extractFilename(optMsg.mediaUrl))) {
        allMessages.push(optMsg);
      }
    });

    return [...allMessages, ...optimisticTextMessages];
  }, [messagesData, user, campaign, campaignName, boardLocation, displayCampaignName, messagesError, campaignLoading, uploadedMediaMessages, optimisticTextMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages.length]);

  // ─── Then handlePickMedia becomes clean ───────────────────────────────────────
  const handlePickMedia = useCallback(() => {
    launchImageLibrary(
      { mediaType: 'mixed', quality: 0.8 },
      (response) => {
        if (response.didCancel || response.errorCode) return;

        const asset = response.assets?.[0];
        if (!asset?.uri) return;

        // ✅ Check file size before allowing selection
        const fileSizeMB = (asset.fileSize || 0) / (1024 * 1024);
        if (fileSizeMB > 25) {
          Alert.alert(
            'File Too Large',
            `Your file is ${fileSizeMB.toFixed(1)}MB. Maximum allowed size is 25MB.`,
          );
          return;
        }

        setSelectedMedia({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'media_file',
          fileSize: asset.fileSize, // ✅ store it here
        });
      },
    );
  }, []);
  const handleSendMedia = useCallback(async () => {
    if (!selectedMedia || !campaignId) return;

    const mediaToUpload = { ...selectedMedia };
    const tempId = `media-temp-${Date.now()}`;

    // 1. Optimistic bubble with local URI
    const optimisticMessage: CampaignMessage = {
      id: tempId,
      text: mediaToUpload.uri,
      isUser: true,
      timestamp: new Date(),
      messageType: 'media',
      mediaUrl: mediaToUpload.uri,
      mediaType: mediaToUpload.type,
    };

    setUploadedMediaMessages(prev => [...prev, optimisticMessage]);
    setSelectedMedia(null);
    setIsUploadingMedia(true);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      // 2. Upload — URL fixing now handled inside hook
      const { publicUrl } = await uploadChatMediaMutation.mutateAsync({
        uri: mediaToUpload.uri,
        type: mediaToUpload.type,
        name: mediaToUpload.name,
        fileSize: mediaToUpload.fileSize,
      });

      // 3. Update optimistic message with real URL
      setUploadedMediaMessages(prev =>
        prev.map(msg =>
          msg.id === tempId
            ? { ...msg, mediaUrl: publicUrl, text: publicUrl }
            : msg,
        ),
      );

      // 4. Send message to DB
      const numericCampaignId =
        typeof campaignId === 'string' ? parseInt(campaignId, 10) : campaignId;

      await sendMessageMutation.mutateAsync({
        campaignId: numericCampaignId,
        content: publicUrl,
        message_type: 'text',
      });

      // 5. Refetch to sync with server
      setTimeout(async () => {
        await refetchMessages();
        setIsUploadingMedia(false);
      }, 2000);

    } catch (error: any) {
      // 6. Rollback optimistic message on failure
      setUploadedMediaMessages(prev => prev.filter(msg => msg.id !== tempId));
      setSelectedMedia(mediaToUpload);
      setIsUploadingMedia(false);
      Alert.alert(
        'Upload Failed',
        error?.message || 'Could not upload media. Please try again.',
      );
    }
  }, [selectedMedia, campaignId, uploadChatMediaMutation, sendMessageMutation, refetchMessages]);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || !campaignId) {
      console.warn('⚠️ Cannot send message: missing input or campaignId', { inputText: inputText.trim(), campaignId });
      return;
    }

    const text = inputText.trim();
    const messageText = text;
    setInputText('');

    const tempMessage: CampaignMessage = {
      id: `temp-${Date.now()}`,
      text: messageText,
      isUser: true,
      timestamp: new Date(),
      messageType: 'text',
    };
    setOptimisticTextMessages(prev => [...prev, tempMessage]);

    // Ensure campaignId is a number
    const numericCampaignId = typeof campaignId === 'string' ? parseInt(campaignId, 10) : campaignId;
    if (isNaN(numericCampaignId)) {
      Alert.alert('Error', 'Invalid campaign ID');
      setInputText(messageText);
      return;
    }


    try {
      setIsWaitingForMessage(true);
      console.log('📤 Sending message:', {
        campaignId: numericCampaignId,
        campaignIdType: typeof numericCampaignId,
        content: messageText,
        requestBody: { content: messageText, message_type: 'text' }
      });
      const result = await sendMessageMutation.mutateAsync({
        campaignId: numericCampaignId,
        content: messageText,
        message_type: 'text',
      });
      console.log('✅ Message sent successfully:', result);

      // Refetch messages to get the new one
      setTimeout(async () => {
        await refetchMessages();        // wait for server
        setOptimisticTextMessages([]);  // ✅ then clear
      }, 1500);
      // Wait a bit for the message to appear in the chat, then hide loader
      setTimeout(() => {
        setIsWaitingForMessage(false);
        // Scroll to bottom
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 500);
    } catch (error: any) {
      setIsWaitingForMessage(false);
      console.error('❌ Failed to send message:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });

      // Restore input text on error
      setInputText(messageText);

      // Extract error message
      let errorMessage = 'Failed to send message. Please try again.';
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      // Show error message
      Alert.alert('Error', errorMessage);
    }
  }, [inputText, campaignId, sendMessageMutation, refetchMessages]);

  // Only show loader if we don't have campaign data yet
  // If we have campaign data, we can show default message even while loading messages
  if (campaignLoading && !campaign) {
    return <Loader />;
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderStatusMessage = (message: CampaignMessage, showMessageText: boolean = true) => {
    // Use statusUpdate details if available (from backend), otherwise use campaignDetails
    const statusUpdateDetails = message.statusUpdate?.campaignDetails;
    const messageDetails = message.campaignDetails;

    // Prefer status update details (from backend), fallback to message details, then local campaign data
    const campaignDetails = statusUpdateDetails || messageDetails || {
      status: message.statusUpdate?.newStatus || campaign?.status || 'DRAFT',
      campaignName: displayCampaignName,
      location: boardLocation || campaign?.board?.location?.name || campaign?.board?.location?.city?.name,
      area: campaign?.board?.description || campaign?.board?.slug?.replace(/-/g, ' '),
      type: campaign?.board?.category?.name?.toLowerCase().includes('digital') ? 'Digital' : 'Static',
      category: campaign?.board?.category?.name || 'Billboard',
      estimatedTime: campaign?.bookings?.[0]
        ? `${Math.ceil((new Date(campaign.bookings[0].end_at).getTime() - new Date(campaign.bookings[0].start_at).getTime()) / (1000 * 60 * 60 * 24))} days`
        : undefined,
    };

    if (!campaignDetails) return null;

    // Map status to UI status and colors (matching StatusCard)
    const rawStatus = (campaignDetails.status || campaign?.status || 'DRAFT').toUpperCase();
    const isInProgress = rawStatus === 'IN_PROGRESS' || rawStatus === 'IN_REVIEW' || rawStatus === 'UNDER_REVIEW';
    const isPaymentPending = rawStatus === 'PAYMENT_PENDING';
    const isSchedule = rawStatus === 'SCHEDULED';
    const isActive = rawStatus === 'PUBLISHED';
    const isCompleted = rawStatus === 'COMPLETED';
    const isBlocked = rawStatus === 'BLOCKED';
    const isDraft = rawStatus === 'DRAFT';

    // Get status label and color
    const getStatusInfo = () => {
      if (isInProgress) return { label: 'InProgress', color: '#ECBDF3', textColor: '#C539A5' };
      if (isPaymentPending) return { label: 'Payment Pending', color: '#FDD46C', textColor: '#92400E' };
      if (isSchedule) return { label: 'Schedule', color: '#83B1FA', textColor: '#0046B7' };
      if (isActive) return { label: 'Active', color: '#36BD79', textColor: '#FFFFFF' };
      if (isCompleted) return { label: 'Completed', color: '#E5E7EB', textColor: '#00000033' };
      if (isBlocked) return { label: 'Blocked', color: '#F25255', textColor: '#FFFFFF' };
      if (isDraft) return { label: 'Draft', color: '#00000033', textColor: '#000000' };
      return { label: campaignDetails.status, color: '#9E9E9E', textColor: '#FFFFFF' };
    };

    const statusInfo = getStatusInfo();
    const normalizedEstimatedTime = campaignDetails.estimatedTime;
    const normalizedStatusMessage = campaignDetails.estimatedTime ? `Estimated Time ${campaignDetails.estimatedTime}` : undefined;

    // Get booking data for purchase duration and campaign period
    const booking = campaign?.bookings?.[0];
    let purchaseDuration: string | undefined;
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (booking) {
      const start = new Date(booking.start_at);
      const end = new Date(booking.end_at);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.getMonth() + 1;
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        return `${day}.${month.toString().padStart(2, '0')}. ${monthName}`;
      };

      startDate = formatDate(start);
      endDate = formatDate(end);
      purchaseDuration = `${daysDiff} days`;
    }

    // Determine what to show
    const showPurchaseDurationRow = !isPaymentPending && !isBlocked && !isDraft && (isCompleted || isActive) && purchaseDuration;
    const showCampaignPeriod = !isPaymentPending && !isBlocked && !isDraft && !isSchedule && !isInProgress && (startDate || endDate);

    // Card background and border styling (matching Figma - white background)
    const cardStyle = isPaymentPending
      ? styles.cardPaymentPending
      : styles.card;

    // Card background color - always white per Figma design
    const cardBackgroundColor = '#FFFFFF';

    // Type tags use gray background, not status color

    return (
      <View style={[cardStyle, { backgroundColor: cardBackgroundColor }]}>
        {/* Header with Status Badge and Info Icon */}
        <View style={styles.header}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: statusInfo.color },
            isPaymentPending && styles.statusBadgePaymentPending,
            isSchedule && styles.statusBadgeSchedule,
            isActive && styles.statusBadgeActive
          ]}>
            {isActive && (
              <Ionicons name="checkmark" size={12} color={statusInfo.textColor} style={{ marginRight: 4 }} />
            )}
            <Text style={[styles.statusText, { color: statusInfo.textColor }]}>
              {statusInfo.label}
            </Text>
          </View>
          {/* <TouchableOpacity style={styles.alertIcon}>
            <Ionicons name="information-circle-outline" size={wp(5)} color="#9E9E9E" />
          </TouchableOpacity> */}
        </View>

        {/* Body Container */}
        <View style={[styles.bodyContainer, isPaymentPending && styles.bodyContainerPaymentPending]}>
          {/* Timeline Wrapper (matching StatusCard structure) */}
          <View style={[
            styles.timelineWrapper,
            isPaymentPending && styles.timelineWrapperPaymentPending,
            isDraft && styles.timelineWrapperDraft,
          ]}>
            {/* Title Section with Type Tags */}
            <View style={styles.titleSection}>
              <Text style={styles.title} numberOfLines={2}>
                {campaignDetails.campaignName}
              </Text>
              <View style={styles.typeTags}>
                {campaignDetails.type && (
                  <>
                    <View style={[
                      styles.typeTag,
                      isActive ? styles.typeTagActive : { backgroundColor: statusInfo.color },
                      isCompleted && styles.typeTagCompleted
                    ]}>
                      <Text style={[
                        styles.typeTagText,
                        isActive ? styles.typeTagTextActive : { color: statusInfo.textColor },
                        isCompleted && styles.typeTagTextCompleted
                      ]}>
                        {campaignDetails.type}
                      </Text>
                    </View>
                    {campaignDetails.category && (
                      <>
                        <View style={[
                          styles.connectionLines,
                          isActive ? { backgroundColor: '#36BD79' } : { backgroundColor: statusInfo.color }
                        ]} />
                        <View style={[
                          styles.typeTag,
                          isActive ? styles.typeTagActive : { backgroundColor: statusInfo.color },
                          isCompleted && styles.typeTagCompleted
                        ]}>
                          <Text style={[
                            styles.typeTagText,
                            isActive ? styles.typeTagTextActive : { color: statusInfo.textColor },
                            isCompleted && styles.typeTagTextCompleted
                          ]}>
                            {campaignDetails.category}
                          </Text>
                        </View>
                      </>
                    )}
                  </>
                )}
              </View>
            </View>

            {/* Payment Pending Message Row - Below Tags */}
            {isPaymentPending && (
              <View style={styles.paymentPendingMessageRow}>
                <View style={styles.paymentBadgeSmall}>
                  <Text style={styles.paymentBadgeSmallText}>Payment</Text>
                </View>
                <View style={styles.connectionLineLabel} />
                <Text style={styles.paymentPendingMessage}>
                  Finish your payment to confirm your campaign
                </Text>
              </View>
            )}

            {/* Draft Message Row */}
            {isDraft && (
              <View style={styles.paymentPendingMessageRow}>
                <View style={styles.draftBadgeSmall}>
                  <Text style={styles.draftBadgeSmallText}>Draft</Text>
                </View>
                <View style={styles.connectionLineLabel} />
                <Text style={styles.draftMessage}>
                  Continue from here whenever you're ready
                </Text>
              </View>
            )}

            {/* In Progress Message Row */}
            {isInProgress && (normalizedStatusMessage || normalizedEstimatedTime) && (
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
            {isSchedule && normalizedStatusMessage && (
              <View style={styles.statusInfoRow}>
                <View style={styles.statusInfoBadge}>
                  <Text style={[styles.statusInfoBadgeText, { color: '#70737D' }]}>Scheduled</Text>
                </View>
                <View style={styles.connectionLineLabel} />
                <Text style={styles.statusInfoMessage}>
                  Your campaign is all set to go live as scheduled
                </Text>
              </View>
            )}

            {/* Blocked Message Row */}
            {isBlocked && normalizedStatusMessage && (
              <View style={styles.statusInfoRow}>
                <View style={styles.statusInfoBadge}>
                  <Text style={[styles.statusInfoBadgeText, { color: '#70737D' }]}>Blocked</Text>
                </View>
                <View style={styles.connectionLineLabel} />
                <Text style={[styles.statusInfoMessage, { color: '#70737D' }]}>
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
                  <View style={[styles.detailTag, styles.detailTagIcon, isCompleted && styles.detailTagCompleted]}>
                    <Text
                      style={[styles.detailTagText, isCompleted && styles.detailTagTextCompleted]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      Board purchased for
                    </Text>
                  </View>
                  <View style={styles.connectionLineLabel} />
                  <View style={[styles.detailValueTag, isCompleted && styles.detailValueTagCompleted]}>
                    <Text
                      style={[styles.detailValueText, isCompleted && styles.detailValueTextCompleted]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {purchaseDuration}
                    </Text>
                  </View>
                </View>
              )}

              {/* Location and Area */}
              {campaignDetails.location && !isBlocked && !isDraft && (
                <View style={styles.locationBadgesRow}>
                  <View style={[
                    styles.locationBadge,
                    styles.locationBadgeValue,
                    isCompleted && styles.locationBadgeCompleted
                  ]}>
                    <Text style={[
                      styles.locationBadgeText,
                      isCompleted && styles.locationBadgeTextCompleted
                    ]} numberOfLines={1} ellipsizeMode="tail">
                      {campaignDetails.location}
                    </Text>
                  </View>
                  {campaignDetails.area && (
                    <>
                      <View style={styles.connectionLineLabel} />
                      <View style={[
                        styles.locationBadge,
                        styles.locationBadgeValue,
                        isCompleted && styles.locationBadgeCompleted
                      ]}>
                        <Text style={[
                          styles.locationBadgeText,
                          isCompleted && styles.locationBadgeTextCompleted
                        ]} numberOfLines={1} ellipsizeMode="tail">
                          {campaignDetails.area}
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

            {/* Payment Button - At bottom of card for payment pending */}
            {isPaymentPending && (
              <TouchableOpacity
                style={styles.paymentButton}
                onPress={() => {
                  const amount = campaign?.total_payment || 0;
                  const customerEmail = user?.email || '';
                  const customerPhone = user?.phone || '';

                  if (!amount || !customerEmail) {
                    Alert.alert('Error', 'Payment information is missing. Please contact support.');
                    return;
                  }

                  // Check if campaign has a company
                  const hasCompany = campaign?.company_id || campaign?.company;

                  if (hasCompany) {
                    // Navigate to CompanyWithInfoScreen (with company)
                    navigation.navigate('CompanyWithInfoScreen', {
                      campaignId: campaignId.toString(),
                    });
                  } else {
                    // Navigate to CompanywithoutInfoScreen (without company)
                    navigation.navigate('CompanywithoutInfoScreen', {
                      campaignId: campaignId.toString(),
                    });
                  }
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.paymentButtonText}>Payment</Text>
              </TouchableOpacity>
            )}

            {/* Curved Bottom Info Section (matching StatusCard) */}
            <View
              style={[
                styles.curvedBottomInfo,
                isPaymentPending && styles.curvedBottomInfoPayment,
              ]}
            />

            {/* Timeline Section - Only show for Active cards */}
            {isActive && (
              <View style={styles.timelineSectionWithIcon}>
                <View style={styles.timelineSection}>
                  <View style={styles.timelineHeader}>
                    <Ionicons name="time-outline" size={wp(3.5)} color="#666" />
                    <Text style={styles.timelineLabel}>Timeline</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarInner}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: '75%', backgroundColor: statusInfo.color },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Message Text inside Card */}
        {showMessageText && message.text && (
          <View style={styles.cardMessageContainer}>
            <Text style={styles.cardMessageText}>
              {message.text}
            </Text>
            <Text style={styles.cardMessageTime}>
              {formatTime(message.timestamp)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Render stars helper function
  const renderStars = (rating: number, size: number = 11, color: string = '#FBBC05') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`full-${i}`} name="star" size={size} color={color} />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={size} color={color} />
      );
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={size} color={color} />
      );
    }
    return stars;
  };

  // Rating breakdown data (mock data - should come from API)
  const ratingBreakdown = [
    { stars: 5, count: 1200000, percentage: 53 },
    { stars: 4, count: 800000, percentage: 35 },
    { stars: 3, count: 200000, percentage: 9 },
    { stars: 2, count: 50000, percentage: 2 },
    { stars: 1, count: 6896, percentage: 0.3 },
  ];
  const totalRatings = 2256896;
  const averageRating = 4.5;
  const renderMediaUploadCard = () => {
    const isUploading = isUploadingMedia;

    return (
      <View style={uploadCardStyles.row}>
        <View style={styles.adminAvatar}>
          <Image source={Images.adrydLogo} style={styles.adminAvatarImage} resizeMode="contain" />
        </View>

        <View style={uploadCardStyles.tile}>
          {isUploading ? (
            // UPLOADING STATE: show spinner + uploading text
            <>
              <View style={uploadCardStyles.tileIcon}>
                <ActivityIndicator size="small" color="#C539A5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={uploadCardStyles.tileTitle}>Uploading...</Text>
                <Text style={uploadCardStyles.tileSub}>Please wait</Text>
              </View>
              <View style={[uploadCardStyles.tileBtn, { backgroundColor: '#D1D5DB' }]}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            </>
          ) : !selectedMedia ? (
            // DEFAULT STATE
            <TouchableOpacity
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}
              onPress={handlePickMedia}
              activeOpacity={0.7}
            >
              <View style={uploadCardStyles.tileIcon}>
                <Ionicons name="image-outline" size={14} color="#C539A5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={uploadCardStyles.tileTitle}>Upload creative</Text>
                <Text style={uploadCardStyles.tileSub}>JPG, PNG, MP4 · max 25MB</Text>
              </View>
              <View style={uploadCardStyles.tileBtn}>
                <Ionicons name="cloud-upload-outline" size={15} color="#fff" />
              </View>
            </TouchableOpacity>
          ) : (
            // AFTER PICK STATE
            <>
              <View style={uploadCardStyles.thumb}>
                {selectedMedia.type.startsWith('image') ? (
                  <Image source={{ uri: selectedMedia.uri }} style={uploadCardStyles.thumbImg} resizeMode="cover" />
                ) : (
                  <View style={uploadCardStyles.thumbVideo}>
                    <Ionicons name="videocam" size={14} color="#C539A5" />
                  </View>
                )}
                <TouchableOpacity onPress={() => setSelectedMedia(null)} style={uploadCardStyles.removeBtn} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Ionicons name="close" size={10} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={uploadCardStyles.fileName} numberOfLines={1}>{selectedMedia.name}</Text>
              <TouchableOpacity
                style={uploadCardStyles.tileBtn}
                onPress={handleSendMedia}
                activeOpacity={0.8}
              >
                <Ionicons name="send" size={14} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };
  const renderRatingCard = () => {
    const board = campaign?.board || {};
    const campaignNameForRating = displayCampaignName || campaign?.title || 'Campaign';

    return (
      <View style={styles.statusMessageContainer}>
        <View style={styles.adminAvatar}>
          <Image
            source={Images.adrydLogo}
            style={styles.adminAvatarImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.ratingCardWrapper}>
          <View style={styles.ratingCard}>
            {/* Campaign Name */}
            <Text style={styles.ratingCampaignName}>{campaignNameForRating}</Text>

            {/* Rating Prompt */}
            <Text style={styles.ratingPrompt}>Rate this Backer and tell others what you think</Text>

            {/* Overall Rating Section */}
            <View style={styles.ratingSummarySection}>
              <View style={styles.ratingSummaryLeft}>
                <Text style={styles.ratingNumber}>{averageRating}</Text>
                <View style={styles.ratingStarsRow}>
                  {renderStars(averageRating, 14, '#FBBC05')}
                </View>
                <Text style={styles.ratingCount}>{totalRatings.toLocaleString()}</Text>
              </View>

              {/* Rating Breakdown */}
              <View style={styles.ratingBreakdown}>
                {ratingBreakdown.map((item, index) => (
                  <View key={item.stars} style={styles.ratingBarRow}>
                    <Text style={styles.ratingBarLabel}>{item.stars}</Text>
                    <View style={styles.ratingBarContainer}>
                      <View
                        style={[
                          styles.ratingBarFill,
                          {
                            width: `${item.percentage}%`,
                            backgroundColor: item.stars >= 4 ? '#C539A5' : '#E5E7EB'
                          }
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Feedback Request */}
            <Text style={styles.ratingFeedbackText}>
              We'd love your feedback. How was your experience with this campaign? Please rate us.
            </Text>

            {/* Star Rating Input */}
            <View style={styles.ratingInputSection}>
              <Text style={styles.ratingInputLabel}>Rate this Backer and tell others what you think</Text>
              <View style={styles.ratingStarInputRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setUserRating(star)}
                    style={styles.ratingStarButton}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={star <= userRating ? 'star' : 'star-outline'}
                      size={32}
                      color={star <= userRating ? '#FFC107' : '#E5E7EB'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Comment Input */}
            <View style={styles.ratingCommentRow}>
              <TextInput
                style={styles.ratingCommentInput}
                placeholder="Write a comment"
                placeholderTextColor="#9CA3AF"
                value={ratingComment}
                onChangeText={setRatingComment}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.ratingSendButton,
                  (!userRating || !ratingComment.trim()) && styles.ratingSendButtonDisabled
                ]}
                onPress={() => {
                  // Handle rating submission
                  console.log('Rating submitted:', { rating: userRating, comment: ratingComment });
                  // TODO: Submit rating to API
                  setRatingComment('');
                  setUserRating(0);
                }}
                disabled={!userRating || !ratingComment.trim()}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="send"
                  size={18}
                  color={(!userRating || !ratingComment.trim()) ? '#9CA3AF' : '#FFFFFF'}
                />
              </TouchableOpacity>
            </View>

            {/* Timestamp */}
            <Text style={styles.ratingTimestamp}>
              {formatTime(new Date())}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderMessage = ({ item }: { item: CampaignMessage }) => {
    const msg = item as any;

    const isUser = item.isUser;

    const displayUrl = item.messageType === 'media' ? (item.mediaUrl || msg.mediaUrl) : undefined;
    const displayDate = msg.created_at ? new Date(msg.created_at) : msg.timestamp;
    const isStatusMessage = !!(item.campaignDetails || item.statusUpdate);

    // --- 1. Handle Status Messages (Cards) ---
    if (isStatusMessage && !isUser) {
      const rawStatus = (item.statusUpdate?.newStatus || item.campaignDetails?.status || '').toUpperCase();
      const isDraftStatus = rawStatus === 'DRAFT';

      return (
        <View style={[styles.statusMessageContainer, isDraftStatus && { justifyContent: 'flex-end' }]}>
          {!isDraftStatus && (
            <View style={styles.adminAvatar}>
              <Image source={Images.adrydLogo} style={styles.adminAvatarImage} resizeMode="contain" />
            </View>
          )}
          <View style={styles.statusCardWrapper}>
            {renderStatusMessage(item, true)}
          </View>
          {isDraftStatus && (
            <View style={styles.userAvatar}>
              <Image
                source={avatarError ? Images.profilePlaceholder : { uri: avatarUrl }}
                style={styles.userAvatarImage}
                onError={() => setAvatarError(true)}
              />
            </View>
          )}
        </View>
      );
    }

    // --- 2. Handle Chat Messages (Text or Media) ---
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.adminMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.adminAvatar}>
            <Image
              source={Images.adrydLogo}
              style={styles.adminAvatarImage}
              resizeMode="contain"
            />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.adminBubble,
            displayUrl && { padding: 0, overflow: 'hidden', minWidth: 200, backgroundColor: isUser ? '#C539A5' : '#F3F4F6' }
          ]}>


          {displayUrl ? (
            isVideoUrl(displayUrl) ? (
              // ✅ STATIC THUMBNAIL — no Video surface in the list
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setFullScreenImage(displayUrl)}>
                <View style={{
                  width: 200,
                  height: 200,
                  backgroundColor: '#111',
                  borderRadius: 12,
                  overflow: 'hidden',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  {/* Dark placeholder background */}
                  <View style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: '#1a1a1a',
                  }} />

                  {/* Video file icon */}
                  <Ionicons name="film-outline" size={40} color="#9CA3AF" />
                  <Text style={{
                    color: '#9CA3AF',
                    fontSize: 11,
                    marginTop: 6,
                  }}>
                    Tap to play
                  </Text>

                  {/* Play button overlay */}
                  <View style={styles.playOverlay}>
                    <View style={styles.playButton}>
                      <Ionicons name="play" size={24} color="#FFFFFF" />
                    </View>
                  </View>

                  {/* Timestamp */}
                  <Text style={styles.mediaTime}>
                    {formatTime(displayDate)}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              // IMAGE — unchanged
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setFullScreenImage(displayUrl)}>
                <View>
                  <SecureImage
                    uri={displayUrl}
                    style={{ width: 200, height: 200 }}
                    resizeMode="cover"
                  />
                  <Text style={styles.mediaTime}>
                    {formatTime(displayDate)}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          ) : (
            // TEXT — unchanged
            <View>
              <Text style={[
                styles.messageText,
                isUser ? styles.userMessageText : styles.adminMessageText,
              ]}>
                {item.text || msg.content}
              </Text>
              <Text style={[
                styles.messageTime,
                isUser ? styles.userMessageTime : styles.adminMessageTime,
              ]}>
                {formatTime(displayDate)}
              </Text>
            </View>
          )}
        </View>

        {isUser && (
          <View style={styles.userAvatar}>
            <Image
              source={avatarError ? Images.profilePlaceholder : { uri: avatarUrl }}
              style={styles.userAvatarImage}
              onError={() => setAvatarError(true)}
            />
          </View>
        )}
      </View>
    );
  };

  // const handleSeeDetail = () => {
  //   // Navigate to campaign detail
  //   navigation.navigate('CompanyWithInfoScreen', { campaignId: campaignId.toString() });
  // };



  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <Header
        title={displayCampaignName}
        onBackPress={() => navigation.goBack()}
        showBackButton={true}
        showRightIcon={false}
      />

      {/* Campaign Info Bar */}
      {/* <View style={styles.infoBar}>
        <Text style={styles.infoBarText} numberOfLines={1}>
          {displayCampaignName}
        </Text>
        <TouchableOpacity onPress={handleSeeDetail}>
          <Text style={styles.seeDetailText}>See Detail</Text>
        </TouchableOpacity>
      </View> */}


      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item, index }) => {
          const renderedMessage = renderMessage({ item });
          const newStatus = item.statusUpdate?.newStatus?.toUpperCase();
          const campaignStatus = item.campaignDetails?.status?.toUpperCase();
          const isCompletedStatus = item.messageType === 'status_update' &&
            (newStatus === 'COMPLETED' || campaignStatus === 'COMPLETED');
          const nextMessage = messages[index + 1];
          const nextIsCompletedStatus = nextMessage?.messageType === 'status_update' &&
            (nextMessage?.statusUpdate?.newStatus?.toUpperCase() === 'COMPLETED' ||
              nextMessage?.campaignDetails?.status?.toUpperCase() === 'COMPLETED');
          const shouldShowRatingCard = isCompletedStatus &&
            !nextIsCompletedStatus &&
            !ratingCardShownRef.current;

          if (shouldShowRatingCard) {
            ratingCardShownRef.current = true;
          }

          return (
            <>
              {renderedMessage}
              {shouldShowRatingCard && renderRatingCard()}
            </>
          );
        }}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        windowSize={21}
        maxToRenderPerBatch={20}
        initialNumToRender={30}
        updateCellsBatchingPeriod={50}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        }
      />
      {/* Media Upload Card - always visible  */}
      <View style={{
        paddingHorizontal: 16,
        paddingBottom: 8,
        backgroundColor: '#F5F5F5',
      }}>
        {renderMediaUploadCard()}
      </View>

      {/* Input Container */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ask Anything"
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSendMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || sendMessageMutation.isPending || isWaitingForMessage) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || sendMessageMutation.isPending || isWaitingForMessage}
            activeOpacity={0.8}
          >
            {sendMessageMutation.isPending || isWaitingForMessage ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
      {/* Full Screen Image Modal */}
      <Modal
        visible={!!fullScreenImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenImage(null)}>
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity
            style={styles.fullScreenClose}
            onPress={() => setFullScreenImage(null)}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {fullScreenImage && (
            isVideoUrl(fullScreenImage) ? (
              // ✅ SecureVideo ONLY here — outside FlatList, no surface conflict
              <SecureVideo
                uri={fullScreenImage}
                style={{ width: '100%', height: '80%' }}
                resizeMode="contain"
                controls={true}
                paused={false}   // auto-play when modal opens
                muted={false}
              />
            ) : (
              <SecureImage
                uri={fullScreenImage}
                style={{ width: '100%', height: '80%' }}
                resizeMode="contain"
              />
            )
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
  },
  infoBarText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  seeDetailText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C539A5',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },
  statusMessageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  statusCardWrapper: {
    flex: 1,
    marginLeft: 8,
    marginRight: 0,
  },
  statusMessageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#111827',
    marginTop: 8,
  },
  statusMessageTime: {
    fontSize: 11,
    marginTop: 4,
    color: '#9CA3AF',
  },
  cardMessageContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cardMessageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#111827',
    marginBottom: 6,
  },
  cardMessageTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  playOverlay: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaTime: {
    position: 'absolute',
    bottom: 5,
    right: 8,
    color: '#FFF',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 4,
    borderRadius: 4,
    fontSize: 11,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  adminMessageContainer: {
    justifyContent: 'flex-start',
  },
  adminAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  adminAvatarImage: {
    width: '100%',
    height: '100%',
  },
  adminAvatarText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 8,
    overflow: 'hidden',
  },
  userAvatarImage: {
    width: '100%',
    height: '100%',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#C539A5',
    borderBottomRightRadius: 12,
  },
  adminBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  card: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 0,
    paddingTop: 10,
    paddingRight: 16,
    paddingBottom: 10,
    paddingLeft: 16,
    marginBottom: 0,
    position: 'relative',
    width: '95%',
    minHeight: hp(28),
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: "#fff",
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  cardPaymentPending: {
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 0,
    paddingTop: 10,
    paddingRight: 16,
    paddingBottom: 10,
    paddingLeft: 16,
    marginBottom: 0,
    position: 'relative',
    width: '100%',
    minHeight: hp(28),
    alignSelf: 'stretch',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
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
  statusBadgeActive: {
    borderRadius: 12,
    height: 24,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#92400E',
  },
  bodyContainer: {
    width: '100%',
    gap: 5,
  },
  bodyContainerPaymentPending: {
    width: '100%',
    gap: 5,
  },
  timelineWrapper: {
    backgroundColor: '#F8F8F8',
    width: '100%',
    borderColor: '#E5E7EB',
    borderWidth: 0.7,
    padding: 10,
    paddingBottom: 8,
    borderRadius: 15,
    gap: 5,
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
  timelineWrapperDraft: {
    width: '100%',
    alignSelf: 'stretch',
    paddingVertical: 12,
    paddingBottom: 12,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
    gap: 10,
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
    borderWidth: 0,
    borderColor: 'transparent',
  },
  typeTagText: {
    fontSize: 8,
    fontWeight: '400',
  },
  typeTagActive: {
    backgroundColor: '#36BD79',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  typeTagTextActive: {
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
  connectionLines: {
    width: 8,
    height: 2,
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
  paymentPendingMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 5,
    flexWrap: 'nowrap',
  },
  statusInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 5,
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
    flexShrink: 1,
    minWidth: 0,
  },
  paymentButton: {
    width: '100%',
    height: 39,
    backgroundColor: '#FDD46C',
    borderWidth: 0.31,
    borderColor: '#E5E7EB',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'stretch',
  },
  paymentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400E',
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
  detailsSection: {
    gap: 5,
    marginBottom: 0,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    paddingVertical: 0,
    marginBottom: 5,
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
    marginTop: 5,
  },
  locationBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 5,
    flexWrap: 'nowrap',
    gap: 0,
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
  locationBadgeText: {
    fontSize: 10,
    color: '#70737D',
    fontWeight: '400',
  },
  locationBadgeCompleted: {
    backgroundColor: '#F4F4F5',
    borderColor: '#E5E7EB',
  },
  locationBadgeTextCompleted: {
    color: '#70737D',
  },
  connectionLineLabel: {
    width: 12,
    height: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
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
  progressBarFill: {
    height: '100%',
    borderRadius: wp(2),
    position: 'absolute',
    left: 0,
    top: 0,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  adminMessageText: {
    color: '#111827',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userMessageTime: {
    color: '#E5E7EB',
  },
  adminMessageTime: {
    color: '#9CA3AF',
  },
  checkIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  attachButton: {
    padding: 4,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C539A5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  ratingCardWrapper: {
    flex: 1,
    marginLeft: 8,
    marginRight: 0,
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingCampaignName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181B',
    marginBottom: 12,
  },
  ratingPrompt: {
    fontSize: 12,
    fontWeight: '400',
    color: '#70737D',
    marginBottom: 16,
  },
  ratingSummarySection: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 24,
  },
  ratingSummaryLeft: {
    alignItems: 'center',
    minWidth: 80,
  },
  ratingNumber: {
    fontSize: 46,
    fontWeight: '700',
    color: '#18181B',
    lineHeight: 50,
  },
  ratingStarsRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  },
  ratingCount: {
    fontSize: 12,
    fontWeight: '400',
    color: '#70737D',
    marginTop: 6,
  },
  ratingBreakdown: {
    flex: 1,
    justifyContent: 'space-between',
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  ratingBarLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#18181B',
    width: 12,
  },
  ratingBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  ratingFeedbackText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#18181B',
    marginBottom: 16,
    lineHeight: 20,
  },
  ratingInputSection: {
    marginBottom: 16,
  },
  ratingInputLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#70737D',
    marginBottom: 12,
  },
  ratingStarInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  ratingStarButton: {
    padding: 4,
  },
  ratingCommentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 4,
    marginBottom: 12,
  },
  ratingCommentInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 14,
    minHeight: 48,
    maxHeight: 120,
    color: '#111827',
    textAlignVertical: 'top',
  },
  ratingSendButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#C539A5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingSendButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },
  ratingTimestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 8,
  },

});

const uploadCardStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tile: {
    flex: 1,
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tileIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FDF4FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#18181B',
    lineHeight: 16,
  },
  tileSub: {
    fontSize: 10,
    color: '#9CA3AF',
    lineHeight: 14,
  },
  tileBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#C539A5',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  thumb: {
    width: 32,
    height: 32,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
  },
  thumbImg: {
    width: 32,
    height: 32,
  },
  thumbVideo: {
    width: 32,
    height: 32,
    backgroundColor: '#FDF4FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileName: {
    flex: 1,
    fontSize: 11,
    color: '#374151',
  },
});
export default CampaignChatDetailScreen;

