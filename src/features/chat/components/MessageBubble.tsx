// src/features/chat/components/MessageBubble.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Message } from '../domain/entities';
import { TypingIndicator } from './TypingIndicator';

interface MessageBubbleProps {
  message: Message;
  formatTime: (date: Date) => string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  formatTime,
}) => {
  if (message.isLoading) {
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
        message.isUser ? styles.userMessageContainer : styles.botMessageContainer,
      ]}
    >
      {!message.isUser && (
        <View style={styles.botAvatar}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#C539A5" />
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userText : styles.botText,
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            message.isUser ? styles.userTimestamp : styles.botTimestamp,
          ]}
        >
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 6,
    maxWidth: '85%',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  userBubble: {
    backgroundColor: '#C539A5',
    borderBottomRightRadius: 4,
    marginLeft: 48,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 4,
  },
  userText: {
    color: '#fff',
    fontWeight: '400',
  },
  botText: {
    color: '#1C1C1E',
    fontWeight: '400',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#8E8E93',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C539A5',
    marginHorizontal: 3,
  },
});

