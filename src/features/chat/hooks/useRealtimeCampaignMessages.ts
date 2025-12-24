// src/features/chat/hooks/useRealtimeCampaignMessages.ts
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../../services/supabase';
import { campaignChatApi } from '../api/campaignChatApi';

interface UseRealtimeCampaignMessagesProps {
  campaignId: number | null;
  messagesData?: any; // Pass messages data to extract conversation_id
  onNewMessage: () => void; // Callback to refetch messages
}

/**
 * Hook to subscribe to real-time campaign messages
 * Listens for new messages inserted into ConversationMessage table
 * (linked to advertisement via ConversationLink)
 * 
 * Gets conversation_id from the messages API response to avoid RLS issues
 */
export const useRealtimeCampaignMessages = ({
  campaignId,
  messagesData,
  onNewMessage,
}: UseRealtimeCampaignMessagesProps) => {
  const channelRef = useRef<any>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);

  // Extract conversation_id from messages API response
  // This avoids RLS permission issues with direct ConversationLink queries
  useEffect(() => {
    if (!campaignId) {
      setConversationId(null);
      return;
    }

    // Only extract conversation_id from messagesData if it exists
    // Don't make a separate API call - use the data that's already fetched
    if (messagesData?.messages && messagesData.messages.length > 0) {
      const firstMessage = messagesData.messages[0] as any;
      // Check if conversation_id is in the message (backend should include it)
      if (firstMessage.conversation_id) {
        console.log('✅ Found conversation_id:', firstMessage.conversation_id);
        setConversationId(firstMessage.conversation_id);
      } else {
        // If conversation_id is not in the response, we can't set up real-time
        console.warn('⚠️ conversation_id not found in API response. Real-time updates will not work.');
        console.warn('First message structure:', Object.keys(firstMessage));
        setConversationId(null);
      }
    } else {
      // No messages data available (API might not be implemented or returned empty)
      // Don't try to fetch again - just set conversationId to null
      console.log('ℹ️ No messages available yet, conversation_id will be set when messages arrive');
      setConversationId(null);
    }
  }, [campaignId, messagesData]);

  // Subscribe to ConversationMessage table for this conversation
  useEffect(() => {
    if (!conversationId) {
      // Clean up if conversationId becomes null
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Prevent duplicate subscriptions
    if (channelRef.current) {
      return;
    }

    console.log(`🔄 Setting up real-time subscription for conversation_id: ${conversationId}`);

    // Create a channel for this specific conversation
    const channel = supabase
      .channel(`conversation-messages:${conversationId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ConversationMessage',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new;
          
          // Trigger refetch for all message types (text, status_update, system)
          // This will handle messages created by the database trigger
          console.log('📨 New conversation message received:', {
            id: newMessage.id,
            type: newMessage.message_type,
            conversation_id: newMessage.conversation_id,
          });
          
          // Trigger refetch to update the UI with all messages
          onNewMessage();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to conversation messages');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to conversation messages:', err);
          console.error('💡 Make sure:');
          console.error('   1. Realtime is enabled for ConversationMessage table in Supabase');
          console.error('   2. RLS policies allow SELECT on ConversationMessage');
          console.error('   3. The table name is correct: ConversationMessage');
          // Don't remove channel on error - let it retry
        } else if (status === 'TIMED_OUT') {
          console.warn('⏱️ Subscription timed out');
        } else if (status === 'CLOSED') {
          console.log('🔌 Subscription closed');
          channelRef.current = null;
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount or conversationId change
    return () => {
      if (channelRef.current) {
        console.log(`🧹 Cleaning up real-time subscription for conversation_id: ${conversationId}`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, onNewMessage]);
};

