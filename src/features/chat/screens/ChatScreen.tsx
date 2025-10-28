// src/features/chat/screens/ChatScreen.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../../../store/authStore';
import { Message } from '../domain/entities';
import { MessageBubble } from '../components/MessageBubble';
import { useChat } from '../hooks/useChat';
import { useRealtimeMessages } from '../hooks/useRealtimeMessages';
import { useSendMessage } from '../hooks/useSendMessage';
import { usePollForAIMessage } from '../hooks/usePollForAIMessage';

const ChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const userId = user?.id;

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load chat history and manage messages state
  const {
    messages,
    setMessages,
    currentChatId,
    setCurrentChatId,
    isLoading: chatLoading,
  } = useChat({
    userId,
  });

  // Handle Realtime message insert
  const handleMessageInsert = useCallback(
    (newMessage: Message) => {
      setMessages((prev) => {
        // Check if message already exists (to prevent duplicates)
        const exists = prev.some((msg) => msg.messageId === newMessage.messageId);
        if (exists) return prev;

        // If this is an AI message, try to replace the most recent loading indicator
        if (!newMessage.isUser) {
          let foundLoading = false;
          const updatedMessages = prev.map((msg, index) => {
            if (
              !foundLoading &&
              msg.isLoading &&
              !msg.isUser &&
              index === prev.length - 1
            ) {
              const lastLoadingIndex = prev
                .map((m, i) => ({ m, i }))
                .filter(({ m }) => m.isLoading && !m.isUser)
                .map(({ i }) => i)
                .pop();

              if (lastLoadingIndex === index || lastLoadingIndex === undefined) {
                foundLoading = true;
                return newMessage;
              }
            }
            return msg;
          });

          return foundLoading ? updatedMessages : [...prev, newMessage];
        }

        // Add new user message to the end of the list
        return [...prev, newMessage];
      });
    },
    [setMessages]
  );

  // Handle Realtime message update
  const handleMessageUpdate = useCallback(
    (updatedMessage: Message) => {
      setMessages((prev) => {
        const updated = prev.map((msg) => {
          if (msg.messageId === updatedMessage.messageId) {
            return {
              ...msg,
              text: updatedMessage.text || msg.text,
              isLoading: updatedMessage.isLoading,
              aiStatus: updatedMessage.aiStatus,
            };
          }
          return msg;
        });

        // If this update completes an AI message, remove loading indicator
        if (updatedMessage.aiStatus === 'completed' && updatedMessage.text) {
          const hasLoading = updated.some((m) => m.isLoading);
          if (hasLoading) {
            return updated.filter((m) => !m.isLoading || m.messageId);
          }
        }

        return updated;
      });
    },
    [setMessages]
  );

  // Setup Realtime messages hook
  const { setupRealtimeListener, cleanup } = useRealtimeMessages({
    userId: userId || '',
    onMessageInsert: handleMessageInsert,
    onMessageUpdate: handleMessageUpdate,
    flatListRef,
  });

  // Setup Realtime listener when chatId changes
  useEffect(() => {
    if (currentChatId && setupRealtimeListener) {
      setupRealtimeListener(currentChatId);
    }
    return () => {
      cleanup();
    };
  }, [currentChatId, setupRealtimeListener, cleanup]);

  // Poll for AI message hook
  const { pollForAIMessage } = usePollForAIMessage({
    userId: userId || '',
    messages,
    setMessages,
    flatListRef,
  });

  // Handle sending messages
  const handleMessageSent = useCallback(
    (message: Message) => {
      setMessages((prev) => [...prev, message]);
    },
    [setMessages]
  );

  const handleLoadingAdded = useCallback(
    (message: Message) => {
      setMessages((prev) => [...prev, message]);
    },
    [setMessages]
  );

  const handleMessageReplaced = useCallback(
    (tempId: string, realMessage: Message) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? realMessage : msg))
      );
    },
    [setMessages]
  );

  const handleError = useCallback(
    (error: Error) => {
      setMessages((prev) => {
        // Remove loading messages on error
        const filtered = prev.filter((msg) => !msg.isLoading || msg.messageId);

        // Add error message
        const errorMessage: Message = {
          id: `${Date.now()}-error`,
          text: error.message,
          isUser: false,
          timestamp: new Date(),
          aiStatus: 'failed',
        };

        return [...filtered, errorMessage];
      });
    },
    [setMessages]
  );

  const { sendMessage } = useSendMessage({
    userId: userId || '',
    currentChatId,
    onMessageSent: handleMessageSent,
    onLoadingAdded: handleLoadingAdded,
    onMessageReplaced: handleMessageReplaced,
    onChatIdUpdated: setCurrentChatId,
    onError: handleError,
    onPollForAI: pollForAIMessage,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [cleanup]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    return <MessageBubble message={item} formatTime={formatTime} />;
  };

  if (chatLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C539A5" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
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
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: '#4ade80',
                    },
                  ]}
                />
                <Text style={styles.statusText}>Connected</Text>
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
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
      />

      {/* Input Container */}
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
            onSubmitEditing={() => {
              if (inputText.trim()) {
                sendMessage(inputText);
                setInputText('');
              }
            }}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
            ]}
            onPress={() => {
              if (inputText.trim()) {
                sendMessage(inputText);
                setInputText('');
              }
            }}
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
    backgroundColor: '#F5F5F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
  },
  header: {
    backgroundColor: '#C539A5',
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingBottom: 15,
    elevation: 4,
    shadowColor: '#C539A5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 3,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#4ade80',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F5F5F7',
    borderRadius: 24,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  attachButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1E',
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#C539A5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    elevation: 2,
    shadowColor: '#C539A5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D1D6',
    elevation: 0,
    shadowOpacity: 0,
  },
});

export default ChatScreen;

