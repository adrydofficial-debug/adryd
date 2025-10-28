import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import Ionicons from "react-native-vector-icons/Ionicons";
import apiClient from '../services/apiClient';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../services/supabase';


interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
  aiStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  messageId?: number;
}

const ChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const userId = user?.id;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const realtimeChannelRef = useRef<any>(null);

  // Setup Supabase Realtime listener
  const setupRealtimeListener = useCallback((chatId: number | null) => {
    if (!chatId) return;
    
    // Clean up existing channel
    if (realtimeChannelRef.current) {
      realtimeChannelRef.current.unsubscribe();
    }

    // Create a channel for this specific chat
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new;
            
            setMessages(prev => {
              // Check if message already exists (to prevent duplicates)
              const exists = prev.some(msg => msg.messageId === newMessage.id);
              if (exists) return prev;
              
              // Determine if this is a user message or AI message
              const isUserMessage = newMessage.sender_id === userId || (!newMessage.is_ai_generated && newMessage.sender_id !== 'adryd-bot');
              
              // If this is an AI message, try to replace the most recent loading indicator
              if (!isUserMessage) {
                const newMessageObj = {
                  id: newMessage.id.toString(),
                  text: newMessage.content || '',
                  isUser: false,
                  timestamp: new Date(newMessage.created_at),
                  isLoading: newMessage.ai_status === 'pending' || newMessage.ai_status === 'processing',
                  aiStatus: newMessage.ai_status,
                  messageId: newMessage.id,
                };
                
                // Find and replace the last loading message
                let foundLoading = false;
                const updatedMessages = prev.map((msg, index) => {
                  if (!foundLoading && msg.isLoading && !msg.isUser && index === prev.length - 1) {
                    const lastLoadingIndex = prev.map((m, i) => ({ m, i }))
                      .filter(({ m }) => m.isLoading && !m.isUser)
                      .map(({ i }) => i)
                      .pop();
                    
                    if (lastLoadingIndex === index || lastLoadingIndex === undefined) {
                      foundLoading = true;
                      return newMessageObj;
                    }
                  }
                  return msg;
                });
                
                return foundLoading ? updatedMessages : [...prev, newMessageObj];
              }
              
              // Add new user message to the end of the list
              return [...prev, {
                id: newMessage.id.toString(),
                text: newMessage.content,
                isUser: true,
                timestamp: new Date(newMessage.created_at),
                isLoading: false,
                aiStatus: newMessage.ai_status,
                messageId: newMessage.id,
              }];
            });
            
            // Scroll to bottom when new message arrives
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          } else if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new;
            
            setMessages(prev => {
              const updated = prev.map(msg => {
                if (msg.messageId === updatedMessage.id) {
                  return {
                    ...msg,
                    text: updatedMessage.content || msg.text,
                    isLoading: updatedMessage.ai_status === 'pending' || updatedMessage.ai_status === 'processing',
                    aiStatus: updatedMessage.ai_status,
                  };
                }
                return msg;
              });
              
              // If this update completes an AI message, remove loading indicator
              if (updatedMessage.ai_status === 'completed' && updatedMessage.content) {
                const hasLoading = updated.some(m => m.isLoading);
                if (hasLoading) {
                  return updated.filter(m => !m.isLoading || m.messageId);
                }
              }
              
              return updated;
            });
            
            // Scroll to bottom when message is updated
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;
  }, [userId]);

  // Poll for AI message as fallback if Realtime doesn't work
  const pollForAIMessage = useCallback((chatId: number | null, maxAttempts = 15) => {
    if (!chatId) return;
    
    let attempts = 0;
    const pollInterval = setInterval(async () => {
      attempts++;
      
      try {
        const response = await apiClient.get(`/api/chat/messages`);
        if (response.data.success && response.data.data?.messages) {
          const messages = response.data.data.messages;
          // Find the latest AI message that we don't have yet
          const latestAIMessage = messages
            .filter((msg: any) => msg.is_ai_generated && msg.sender_id === 'adryd-bot')
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          
          if (latestAIMessage) {
            setMessages(prev => {
              const exists = prev.some(msg => msg.messageId === latestAIMessage.id);
              if (exists) {
                clearInterval(pollInterval);
                return prev;
              }
              
              // Replace loading message with AI response
              const updated = prev.map(msg => {
                if (msg.isLoading && !msg.isUser) {
                  return {
                    id: latestAIMessage.id.toString(),
                    text: latestAIMessage.content,
                    isUser: false,
                    timestamp: new Date(latestAIMessage.created_at),
                    isLoading: false,
                    aiStatus: latestAIMessage.ai_status,
                    messageId: latestAIMessage.id,
                  };
                }
                return msg;
              }).filter(msg => !(msg.isLoading && !msg.messageId));
              
              if (updated.length !== prev.length || !prev.some(m => m.isLoading && !m.messageId)) {
                clearInterval(pollInterval);
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }
              
              return updated;
            });
          }
        }
      } catch (error) {
        // Silently handle polling errors
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
      }
    }, 2000);
    
    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  // Load chat history
  const loadChatHistory = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await apiClient.get('/api/chat/messages');

      if (response.data.success) {
        const chatData = response.data.data;
        
        if (chatData && chatData.id) {
          const chatId = chatData.id;
          setCurrentChatId(chatId);
          setupRealtimeListener(chatId);
          
          // Format and set messages if they exist
          if (chatData.messages && chatData.messages.length > 0) {
            const sortedMessages = [...chatData.messages].sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            
            const formattedMessages = sortedMessages.map((msg: any) => ({
              id: msg.id.toString(),
              text: msg.content,
              isUser: msg.sender_id === userId || !msg.is_ai_generated,
              timestamp: new Date(msg.created_at),
              isLoading: msg.ai_status === 'pending' || msg.ai_status === 'processing',
              aiStatus: msg.ai_status,
              messageId: msg.id,
            }));

            setMessages(formattedMessages);
          } else {
            setMessages([{
              id: "welcome",
              text: "Hello! 👋 Ask me anything about Adryd. I'm here to help!",
              isUser: false,
              timestamp: new Date(),
            }]);
          }
        } else {
          setMessages([{
            id: "welcome",
            text: "Hello! 👋 Ask me anything about Adryd. I'm here to help!",
            isUser: false,
            timestamp: new Date(),
          }]);
        }
      }
    } catch (error: any) {
      setMessages([{
        id: "welcome",
        text: "Hello! 👋 Ask me anything about Adryd. I'm here to help!",
        isUser: false,
        timestamp: new Date(),
      }]);
    }
  }, [userId, setupRealtimeListener]);

  // Initialize on mount
  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || !userId) return;

    const userMessageText = inputText.trim();
    setInputText("");

    // Create temporary user message for optimistic UI update
    const tempUserMessageId = `temp-${Date.now()}`;
    const tempUserMessage: Message = {
      id: tempUserMessageId,
      text: userMessageText,
      isUser: true,
      timestamp: new Date(),
    };

    // Add temporary user message and loading indicator
    setMessages((prev) => [...prev, tempUserMessage]);
    
    const loadingMessage: Message = {
      id: `${Date.now()}-loading`,
      text: "",
      isUser: false,
      timestamp: new Date(),
      isLoading: true,
      aiStatus: 'pending',
    };

    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const response = await apiClient.post('/api/chat/send', { 
        content: userMessageText,
        message_type: 'text',
        chat_id: currentChatId || undefined
      });

      if (response.data.success) {
        const responseData = response.data.data;
        
        if (responseData.userMessage) {
          const apiUserMessage = responseData.userMessage;
          
          // Replace temporary message with actual API response
          setMessages(prev => prev.map(msg => 
            msg.id === tempUserMessageId
              ? {
                  id: apiUserMessage.id.toString(),
                  text: apiUserMessage.content,
                  isUser: true,
                  timestamp: new Date(apiUserMessage.created_at),
                  messageId: apiUserMessage.id,
                }
              : msg
          ));
          
          // Handle chat_id
          let newChatId = currentChatId;
          
          if (apiUserMessage.chat_id) {
            newChatId = apiUserMessage.chat_id;
          } else if (responseData.chat_id) {
            newChatId = responseData.chat_id;
          }
          
          // Setup Realtime listener if we got a new chat_id
          if (!currentChatId && newChatId) {
            setCurrentChatId(newChatId);
            setupRealtimeListener(newChatId);
          } else if (currentChatId && !realtimeChannelRef.current) {
            setupRealtimeListener(currentChatId);
          }
          
          // Fallback: Poll for AI message if Realtime doesn't work
          const chatIdForPolling = newChatId || currentChatId;
          if (chatIdForPolling) {
            setTimeout(() => {
              pollForAIMessage(chatIdForPolling);
            }, 2000);
          }
        }
      }
    } catch (error: any) {
      // Remove loading message and temporary user message on error
      setMessages(prev => prev.filter(msg => 
        msg.id !== tempUserMessageId && 
        msg.id !== loadingMessage.id && 
        !msg.isLoading
      ));
      
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        text: error?.response?.data?.message || "Sorry, I'm having trouble connecting. Please try again.",
        isUser: false,
        timestamp: new Date(),
        aiStatus: 'failed',
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }, [inputText, currentChatId, userId, setupRealtimeListener, pollForAIMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.unsubscribe();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const TypingIndicator = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animate = (dot: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: -10,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animate(dot1, 0);
      animate(dot2, 200);
      animate(dot3, 400);
    }, []);

    return (
      <View style={styles.typingContainer}>
        <Animated.View
          style={[styles.typingDot, { transform: [{ translateY: dot1 }] }]}
        />
        <Animated.View
          style={[styles.typingDot, { transform: [{ translateY: dot2 }] }]}
        />
        <Animated.View
          style={[styles.typingDot, { transform: [{ translateY: dot3 }] }]}
        />
      </View>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.isLoading) {
      return (
        <View style={[styles.messageBubble, styles.botBubble]}>
          <TypingIndicator />
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          item.isUser ? styles.userMessageContainer : styles.botMessageContainer,
        ]}
      >
        {!item.isUser && (
          <View style={styles.botAvatar}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#C539A5" />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            item.isUser ? styles.userBubble : styles.botBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              item.isUser ? styles.userText : styles.botText,
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.timestamp,
              item.isUser ? styles.userTimestamp : styles.botTimestamp,
            ]}
          >
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header with gradient effect */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (!isTyping) {
                navigation.goBack();
              }
            }}
            activeOpacity={0.7}
            disabled={isTyping}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Adryd Assistant</Text>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusDot, 
                  { 
                    backgroundColor: '#4ade80' // Always connected for Supabase
                  }
                ]} />
                <Text style={styles.statusText}>
                  Connected
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.menuButton}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Enhanced Input Container */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity 
            style={styles.attachButton}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={24} color="#C539A5" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#aaa"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}
            activeOpacity={0.8}
          >
            {isTyping ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  header: {
    backgroundColor: "#C539A5",
    paddingTop: Platform.OS === "ios" ? 50 : 10,
    paddingBottom: 15,
    elevation: 4,
    shadowColor: "#C539A5",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 3,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#4ade80",
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    marginVertical: 6,
    maxWidth: "85%",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
  },
  botMessageContainer: {
    alignSelf: "flex-start",
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  userBubble: {
    backgroundColor: "#C539A5",
    borderBottomRightRadius: 4,
    marginLeft: 48,
  },
  botBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 4,
  },
  userText: {
    color: "#fff",
    fontWeight: "400",
  },
  botText: {
    color: "#1C1C1E",
    fontWeight: "400",
  },
  timestamp: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: "500",
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.75)",
    textAlign: "right",
  },
  botTimestamp: {
    color: "#8E8E93",
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C539A5",
    marginHorizontal: 3,
  },
  inputContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E7",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F5F5F7",
    borderRadius: 24,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  attachButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1C1C1E",
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#C539A5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
    elevation: 2,
    shadowColor: "#C539A5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  sendButtonDisabled: {
    backgroundColor: "#D1D1D6",
    elevation: 0,
    shadowOpacity: 0,
  },
});

export default ChatScreen;