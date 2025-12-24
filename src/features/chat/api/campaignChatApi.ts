// src/features/chat/api/campaignChatApi.ts
import apiClient from '../../../services/apiClient';
import { supabase } from '../../../services/supabase';

export interface CampaignMessage {
  id: number;
  conversation_id: number; // Added: Required for real-time subscriptions
  campaign_id: number;
  sender_id: string;
  content: string;
  message_type: 'text' | 'status_update' | 'system';
  status_update?: {
    old_status: string;
    new_status: string;
    campaign_details?: {
      status: string;
      campaignName: string;
      location?: string;
      area?: string;
      type?: string;
      category?: string;
      estimatedTime?: string;
      startDate?: string;
      endDate?: string;
    };
  };
  created_at: string;
  updated_at: string;
  is_read: boolean;
}

export interface CampaignChat {
  campaign_id: number;
  campaign_name: string;
  board_location?: string;
  last_message?: CampaignMessage;
  unread_count: number;
  status: string;
  created_at: string;
}

// Backend API response structure
interface BackendCampaignMessagesResponse {
  success: boolean;
  data: {
    messages: CampaignMessage[];
    campaign: {
      id: number;
      name: string;
      status: string;
      board_location?: string;
    };
  };
  error?: string;
}

// Frontend expected format (after transformation)
export interface GetCampaignMessagesResponse {
  messages: CampaignMessage[];
  campaign: {
    id: number;
    name: string;
    status: string;
    board_location?: string;
  };
}

export interface SendCampaignMessageRequest {
  content: string;
  message_type?: 'text' | 'status_update';
}

// Backend API response structure for send message
interface BackendSendCampaignMessageResponse {
  success: boolean;
  data: CampaignMessage;
  error?: string;
}

export interface SendCampaignMessageResponse {
  success: boolean;
  data: CampaignMessage;
}

const BASE = '/api/campaign-chat';

export const campaignChatApi = {
  /**
   * Get all campaign chats (one per campaign)
   */
  async getCampaignChats(): Promise<CampaignChat[]> {
    const { data } = await apiClient.get<CampaignChat[]>(`${BASE}/chats`);
    return data;
  },

  /**
   * Get messages for a specific campaign
   */
  async getCampaignMessages(campaignId: number): Promise<GetCampaignMessagesResponse> {
    const response = await apiClient.get<BackendCampaignMessagesResponse>(
      `${BASE}/campaigns/${campaignId}/messages`,
    );
    
    // Handle backend response format: { success: true, data: {...} }
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Handle error response
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch campaign messages');
    }
    
    // Fallback: return empty response if structure is unexpected
    return {
      messages: [],
      campaign: {
        id: campaignId,
        name: 'Campaign',
        status: 'UNKNOWN',
      },
    };
  },

  /**
   * Send a message in a campaign chat
   * Endpoint: POST /api/campaign-chat/campaigns/:campaignId/messages
   */
  async sendCampaignMessage(
    campaignId: number,
    request: SendCampaignMessageRequest,
  ): Promise<SendCampaignMessageResponse> {
    try {
      const url = `${BASE}/campaigns/${campaignId}/messages`;
      const baseURL = (apiClient.defaults?.baseURL || '') as string;
      
      // Get auth token for logging
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('🌐 [API] Sending POST request:', {
        url,
        fullUrl: `${baseURL}${url}`,
        campaignId,
        campaignIdType: typeof campaignId,
        requestBody: request,
        hasAuthToken: !!session?.access_token,
        userId: session?.user?.id,
      });
      
      const response = await apiClient.post<BackendSendCampaignMessageResponse>(
        url,
        request,
      );
      
      console.log('✅ [API] Response received:', {
        status: response.status,
        data: response.data,
      });
      
      // Handle backend response format: { success: true, data: {...} }
      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
        };
      }
      
      // Handle error response from backend
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to send message');
      }
      
      // Fallback: throw error if structure is unexpected
      throw new Error('Unexpected response format from server');
    } catch (error: any) {
      console.error('❌ [API] Error sending message:', {
        error,
        message: error?.message,
        response: error?.response,
        responseData: error?.response?.data,
        responseStatus: error?.response?.status,
        request: error?.request,
        config: error?.config,
      });
      
      // Handle Axios errors (network errors, 4xx, 5xx responses)
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        const status = error.response.status;
        const errorMessage = 
          errorData?.message || 
          errorData?.error || 
          (typeof errorData === 'string' ? errorData : null) ||
          error.message || 
          `Request failed with status ${status}`;
        
        console.error('❌ [API] Server error response:', {
          status,
          errorMessage,
          errorData,
        });
        
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received (network error)
        console.error('❌ [API] Network error - no response received');
        throw new Error('Network error: Please check your internet connection');
      } else {
        // Something else happened
        console.error('❌ [API] Unknown error:', error.message);
        throw new Error(error.message || 'Failed to send message');
      }
    }
  },

  /**
   * Mark messages as read for a campaign
   */
  async markAsRead(campaignId: number): Promise<{ success: boolean }> {
    const { data } = await apiClient.post<{ success: boolean }>(
      `${BASE}/campaigns/${campaignId}/read`,
    );
    return data;
  },
};

