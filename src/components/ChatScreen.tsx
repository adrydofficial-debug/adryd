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
import axios from "axios";
import io from 'socket.io-client';

/**
 * ChatScreen Component with Socket.IO Integration
 * 
 * Features:
 * - Real-time AI message updates via Socket.IO
 * - Chat history loading
 * - Typing indicators
 * - Message seen status
 * - Connection status display
 * - Error handling for AI failures
 */

// API Configuration
// Update these URLs based on your backend server location
// Alternative configurations for different environments:
// For local development: "http://localhost:3000" or "http://127.0.0.1:3000"
// For production: "https://your-domain.com"
// For Android emulator: "http://10.0.2.2:3000"
// For iOS simulator: "http://localhost:3000"

// Helper function to get the correct API URL based on platform
const getApiUrl = () => {
  if (__DEV__) {

    return "http://192.168.18.110:3000";
  } else {
    // Production mode
    return "https://your-production-domain.com";
  }
};

const API_URL = getApiUrl();
const SOCKET_URL = getApiUrl();
const USER_ID = "test-user-123";  // Replace with actual user ID

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
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  // Initialize socket connection and load chat history
  useEffect(() => {
    console.log('🔧 Initializing Socket.IO connection to:', SOCKET_URL);
    
    // Initialize socket connection with better configuration
    const newSocket = io(SOCKET_URL, {
      transports: ['polling'], // Use polling for better mobile compatibility
      timeout: 30000, // Increased timeout for mobile networks
      reconnection: true,
      reconnectionAttempts: 10, // More attempts for mobile
      reconnectionDelay: 2000, // Longer delay between attempts
      reconnectionDelayMax: 10000, // Max delay
      forceNew: true,
      autoConnect: true,
      upgrade: true, // Allow upgrade to websocket if available
      rememberUpgrade: true,
    });
    
    setSocket(newSocket);

    // Socket connection events
    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
      setIsConnected(true);
      setConnectionError(null);
      setIsOfflineMode(false);
      // Join user room
      newSocket.emit('join_user_room', USER_ID);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setIsConnected(false);
      setConnectionError(error.message || 'Connection failed');
      
      // Show user-friendly error message
      setMessages(prev => {
        const errorMessage = {
          id: `connection-error-${Date.now()}`,
          text: "⚠️ Unable to connect to chat server. Please check your internet connection and try again.",
          isUser: false,
          timestamp: new Date(),
          aiStatus: 'failed' as const,
        };
        
        // Only add error message if it doesn't already exist
        const hasError = prev.some(msg => msg.id.includes('connection-error'));
        return hasError ? prev : [errorMessage, ...prev];
      });
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionError(null);
      setIsOfflineMode(false);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection failed:', error);
      setIsConnected(false);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('❌ All reconnection attempts failed');
      setIsConnected(false);
      setIsOfflineMode(true);
    });

    // Listen for AI message updates
    newSocket.on('ai_message_ready', (data) => {
      setMessages(prev => prev.map(msg => 
        msg.messageId === data.messageId 
          ? { ...msg, text: data.content, isLoading: false, aiStatus: 'completed' }
          : msg
      ));
    });

    // Listen for AI message errors
    newSocket.on('ai_message_error', (data) => {
      setMessages(prev => prev.map(msg => 
        msg.messageId === data.messageId 
          ? { ...msg, text: 'Sorry, I encountered an error.', isLoading: false, aiStatus: 'failed' }
          : msg
      ));
    });

    // Listen for typing indicators
    newSocket.on('user_typing', (data) => {
      if (data.userId !== USER_ID) {
        setIsTyping(true);
      }
    });

    newSocket.on('user_stopped_typing', (data) => {
      if (data.userId !== USER_ID) {
        setIsTyping(false);
      }
    });

    // Test connection and load chat history
    const testAndLoad = async () => {
      console.log('🔍 Testing backend connection before loading chat...');
      const isBackendUp = await testBackendConnection();
      if (isBackendUp) {
        console.log('✅ Backend is up, loading chat history...');
        loadChatHistory(newSocket);
      } else {
        console.log('❌ Backend is down, showing offline mode...');
        setIsOfflineMode(true);
        setConnectionError('Backend server is not responding');
      }
    };
    
    testAndLoad();

    return () => {
      newSocket.close();
    };
  }, []);


// Replace your current loadChatHistory function with this:
const loadChatHistory = useCallback(async (socketInstance?: any) => {
  try {
    console.log('📋 Loading chat history for user:', USER_ID);
    const response = await axios.get(
      `${API_URL}/api/chat/messages?user_id=${USER_ID}`,
      { headers: { "Content-Type": "application/json" } }
    );

    console.log('🔍 Full API Response:', JSON.stringify(response.data, null, 2));
    console.log('🔍 Chat Data:', response.data.data);
    console.log('🔍 Messages Array:', response.data.data.messages);
    console.log('🔍 Messages Length:', response.data.data.messages?.length);

    if (response.data.success) {
      const chatData = response.data.data;
      
      if (chatData && chatData.messages && chatData.messages.length > 0) {
        console.log('📋 Found', chatData.messages.length, 'messages - Processing...');
        setCurrentChatId(chatData.id);
        
        if (socketInstance) {
          socketInstance.emit('join_chat', chatData.id);
        }

        const formattedMessages = chatData.messages.map((msg: any) => ({
          id: msg.id.toString(),
          text: msg.content,
          isUser: !msg.is_ai_generated,
          timestamp: new Date(msg.created_at),
          isLoading: msg.ai_status === 'pending' || msg.ai_status === 'processing',
          aiStatus: msg.ai_status,
          messageId: msg.id,
        }));

        console.log('📋 Formatted Messages:', formattedMessages);
        setMessages(formattedMessages);
        console.log('📋 Messages set in state');
      } else {
        console.log('📋 No messages found');
        setMessages([{
          id: "1",
          text: "Hello! 👋 Ask me anything about Adryd. I'm here to help!",
          isUser: false,
          timestamp: new Date(),
        }]);
      }
    } else {
      console.log('📋 API returned success: false');
      setMessages([{
        id: "1",
        text: "Hello! 👋 Ask me anything about Adryd. I'm here to help!",
        isUser: false,
        timestamp: new Date(),
      }]);
    }
  } catch (error) {
    console.error('❌ Failed to load chat history:', error);
    setMessages([{
      id: "1",
      text: "Hello! 👋 Ask me anything about Adryd. I'm here to help!",
      isUser: false,
      timestamp: new Date(),
    }]);
  }
}, []);

  // Test backend connection
  const testBackendConnection = useCallback(async () => {
    try {
      console.log('🔍 Testing backend connection...');
      const response = await axios.get(`${API_URL}/api/health`, { timeout: 5000 });
      console.log('✅ Backend health check passed:', response.data);
      return response.status === 200;
    } catch (error) {
      console.log('❌ Backend health check failed:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }, []);

  // Manual retry connection function
  const retryConnection = useCallback(async () => {
    console.log('🔄 Manually retrying connection...');
    
    // Test backend first
    const isBackendUp = await testBackendConnection();
    if (!isBackendUp) {
      setConnectionError('Backend server is not responding');
      setIsOfflineMode(true);
      return;
    }

    if (socket) {
      socket.connect();
    } else {
      // Recreate socket if it doesn't exist
      const newSocket = io(SOCKET_URL, {
        transports: ['polling'],
        timeout: 30000,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        forceNew: true,
        autoConnect: true,
        upgrade: true,
        rememberUpgrade: true,
      });
      setSocket(newSocket);
    }
  }, [socket, testBackendConnection]);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [userMessage, ...prev]);
    setInputText("");

    // If offline mode, show offline message
    if (isOfflineMode) {
      const offlineMessage: Message = {
        id: `${Date.now()}-offline`,
        text: "📱 You're in offline mode. Messages will be sent when connection is restored.",
        isUser: false,
        timestamp: new Date(),
        aiStatus: 'failed',
      };
      setMessages((prev) => [offlineMessage, ...prev]);
      return;
    }

    const loadingMessage: Message = {
      id: `${Date.now()}-loading`,
      text: "",
      isUser: false,
      timestamp: new Date(),
      isLoading: true,
      aiStatus: 'pending',
    };

    setMessages((prev) => [loadingMessage, ...prev]);

    try {
      const response = await axios.post(
        `${API_URL}/api/chat/send`,
        { 
          content: userMessage.text,
          user_id: USER_ID,
          message_type: 'text',
          chat_id: currentChatId
        },
        { 
          headers: { "Content-Type": "application/json" },
          timeout: 30000,
        }
      );

      if (response.data.success) {
        // Update loading message with the AI message ID from backend
        const messageData = response.data.data;
        setMessages(prev => prev.map(msg => 
          msg.id === loadingMessage.id 
            ? { ...msg, messageId: messageData.aiMessage.id, aiStatus: 'processing' }  // ✅ Use AI message ID
            : msg
        ));
        
        // Update current chat ID if this is a new chat
        if (!currentChatId && messageData.chat_id) {
          setCurrentChatId(messageData.chat_id);
          if (socket) {
            socket.emit('join_chat', messageData.chat_id);
          }
        }
      }
      
    } catch (error) {
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        text: "Sorry, I'm having trouble connecting. Please try again.",
        isUser: false,
        timestamp: new Date(),
        aiStatus: 'failed',
      };
      setMessages((prev) => [errorMessage, ...prev.filter((m) => !m.isLoading)]);
      console.error("API Error:", error);
      
      // Switch to offline mode if connection fails
      setIsOfflineMode(true);
      setConnectionError('Connection failed');
    }
  }, [inputText, currentChatId, socket, isOfflineMode]);

  // Typing indicators
  const handleTypingStart = useCallback(() => {
    if (socket && currentChatId) {
      socket.emit('typing_start', { 
        chatId: currentChatId, 
        userId: USER_ID 
      });
    }
  }, [socket, currentChatId]);

  const handleTypingStop = useCallback(() => {
    if (socket && currentChatId) {
      socket.emit('typing_stop', { 
        chatId: currentChatId, 
        userId: USER_ID 
      });
    }
  }, [socket, currentChatId]);

  // Mark messages as seen
  const markMessagesAsSeen = useCallback(async () => {
    if (currentChatId) {
      try {
        await axios.post(
          `${API_URL}/api/chat/mark-seen`,
          { 
            chat_id: currentChatId,
            user_id: USER_ID
          }
        );
      } catch (error) {
        console.error('Failed to mark messages as seen:', error);
      }
    }
  }, [currentChatId]);

  // Mark messages as seen when component mounts
  useEffect(() => {
    markMessagesAsSeen();
  }, [markMessagesAsSeen]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
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
                    backgroundColor: isOfflineMode 
                      ? '#f59e0b' 
                      : isConnected 
                        ? '#4ade80' 
                        : '#ef4444' 
                  }
                ]} />
                <Text style={styles.statusText}>
                  {isOfflineMode 
                    ? 'Offline Mode' 
                    : isConnected 
                      ? 'Connected' 
                      : 'Disconnected'
                  }
                </Text>
              </View>
            </View>
          </View>
          {(!isConnected && connectionError) || isOfflineMode ? (
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={retryConnection}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={18} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => {
                // You can add menu functionality here later
                console.log('Menu button pressed');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted={true}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
      />

      {/* Enhanced Input Container */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={() => {
              // You can add attachment functionality here later
              console.log('Attach button pressed');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={24} color="#C539A5" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#aaa"
            value={inputText}
            onChangeText={(text) => {
              setInputText(text);
              if (text.length > 0) {
                handleTypingStart();
                // Clear existing timeout
                if (typingTimeoutRef.current) {
                  clearTimeout(typingTimeoutRef.current);
                }
                // Set new timeout to stop typing
                typingTimeoutRef.current = setTimeout(() => {
                  handleTypingStop();
                }, 1000);
              } else {
                handleTypingStop();
              }
            }}
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
  retryButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
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