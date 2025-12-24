// src/features/chat/hooks/useCampaignChat.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignChatApi, CampaignChat, CampaignMessage } from '../api/campaignChatApi';

/**
 * Hook to get all campaign chats (one per campaign)
 */
export const useCampaignChats = () => {
  return useQuery<CampaignChat[]>({
    queryKey: ['campaignChats'],
    queryFn: campaignChatApi.getCampaignChats,
  });
};

/**
 * Hook to get messages for a specific campaign
 */
export const useCampaignMessages = (campaignId: number | null) => {
  return useQuery({
    queryKey: ['campaignMessages', campaignId], // This should be unique per campaign
    queryFn: () => {
      if (!campaignId) throw new Error('Campaign ID is required');
      console.log('📨 Fetching messages for campaign:', campaignId);
      return campaignChatApi.getCampaignMessages(campaignId);
    },
    enabled: !!campaignId,
    retry: false, // Don't retry if API doesn't exist
    refetchOnWindowFocus: true, // Enable refetch on focus
    refetchOnMount: true, // Enable refetch on mount
    staleTime: 0, // Data is immediately stale - always fetch fresh data
    cacheTime: 0, // Don't keep in cache - always fetch fresh
    // Ensure we don't share cache between different campaigns
    select: (data) => {
      // Verify the data belongs to the correct campaign
      if (data?.campaign?.id && data.campaign.id !== campaignId) {
        console.warn('⚠️ Campaign ID mismatch in messages response');
        return { messages: [], campaign: data.campaign };
      }
      return data;
    },
  });
};

/**
 * Hook to send a message in a campaign chat
 */
export const useSendCampaignMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, ...request }: { campaignId: number; content: string; message_type?: 'text' | 'status_update' }) => {
      return campaignChatApi.sendCampaignMessage(campaignId, request);
    },
    onSuccess: (response, variables) => {
      console.log('✅ Message mutation successful:', response);
      // Invalidate messages for this campaign
      queryClient.invalidateQueries({
        queryKey: ['campaignMessages', variables.campaignId],
      });
      // Invalidate chats list to update last message
      queryClient.invalidateQueries({
        queryKey: ['campaignChats'],
      });
    },
    onError: (error: any) => {
      console.error('❌ Message mutation error:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
    },
  });
};

/**
 * Hook to mark messages as read
 */
export const useMarkCampaignMessagesRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: campaignChatApi.markAsRead,
    onSuccess: (_, campaignId) => {
      // Invalidate chats list to update unread count
      queryClient.invalidateQueries({
        queryKey: ['campaignChats'],
      });
      // Invalidate messages for this campaign
      queryClient.invalidateQueries({
        queryKey: ['campaignMessages', campaignId],
      });
    },
    onError: (error) => {
      // Silently fail if API doesn't exist
      console.log('Mark as read failed (API may not be implemented):', error);
    },
  });
};

