import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

export default function ChatScreen() {
  const { conversations, messages, sendMessage } = useApp();
  const { user } = useAuth();

  const [activeConvId, setActiveConvId] = useState(null);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations]);

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const activeMessages = messages[activeConvId] || [];

  const handleSend = () => {
    if (inputText.trim() && activeConvId) {
      sendMessage(activeConvId, inputText.trim());
      setInputText('');
    }
  };

  const handleQuickPreset = (presetText) => {
    if (activeConvId) {
      sendMessage(activeConvId, presetText);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Top Channel Selector Tabs */}
      <View style={styles.channelsBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isActive = item.id === activeConvId;
            return (
              <TouchableOpacity
                style={[styles.channelChip, isActive && styles.activeChannelChip]}
                onPress={() => setActiveConvId(item.id)}
              >
                <Text
                  style={[
                    styles.channelChipText,
                    isActive && styles.activeChannelChipText,
                  ]}
                  numberOfLines={1}
                >
                  {item.itemTitle || item.id}
                </Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.noChannels}>No active chat threads found.</Text>
          }
        />
      </View>

      {/* Quick Meetup Arrangement Chips */}
      <View style={styles.presetsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
          <TouchableOpacity
            style={styles.presetChip}
            onPress={() => handleQuickPreset('I can meet you at Campus Security Desk tomorrow at 10 AM.')}
          >
            <Text style={styles.presetText}>🏢 Meet at Security Desk</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetChip}
            onPress={() => handleQuickPreset('Can we meet near the Main Library entrance?')}
          >
            <Text style={styles.presetText}>📚 Meet at Library Entrance</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetChip}
            onPress={() => handleQuickPreset('I have my student ID card ready for verification.')}
          >
            <Text style={styles.presetText}>🎓 Bring Student ID</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Messages Stream */}
      <FlatList
        data={activeMessages}
        keyExtractor={(item, index) => item.id || String(index)}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => {
          const isMe = item.senderId === user?.id;
          return (
            <View
              style={[
                styles.bubbleWrapper,
                isMe ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft,
              ]}
            >
              {!isMe && (
                <Text style={styles.senderLabel}>{item.senderName || 'Peer'}</Text>
              )}
              <View
                style={[
                  styles.bubble,
                  isMe ? styles.bubbleRight : styles.bubbleLeft,
                ]}
              >
                <Text style={[styles.bubbleText, isMe && styles.bubbleTextRight]}>
                  {item.text}
                </Text>
              </View>
              <Text style={styles.timeLabel}>
                {item.time ? new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>
              {activeConv
                ? `Active channel for "${activeConv.itemTitle}". Say hello to coordinate recovery!`
                : 'Select or start a conversation thread.'}
            </Text>
          </View>
        }
      />

      {/* Message Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.chatInput}
          placeholder="Type message or recovery note..."
          placeholderTextColor={COLORS.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Ensure ScrollView is imported
import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  channelsBar: {
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
    paddingHorizontal: 12,
  },
  channelChip: {
    backgroundColor: COLORS.surfaceCard,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    maxWidth: 160,
  },
  activeChannelChip: {
    backgroundColor: 'rgba(0, 245, 255, 0.15)',
    borderColor: COLORS.cyan,
  },
  channelChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  activeChannelChipText: {
    color: COLORS.cyan,
    fontWeight: 'bold',
  },
  noChannels: {
    color: COLORS.textMuted,
    fontSize: 12,
    paddingVertical: 4,
  },
  presetsBar: {
    backgroundColor: COLORS.surfaceCard,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  presetsScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  presetChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  presetText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  bubbleWrapper: {
    marginBottom: 10,
    maxWidth: '80%',
  },
  bubbleWrapperRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubbleWrapperLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 2,
    marginLeft: 4,
  },
  bubble: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  bubbleRight: {
    backgroundColor: COLORS.cyan,
    borderBottomRightRadius: 2,
  },
  bubbleLeft: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderBottomLeftRadius: 2,
  },
  bubbleText: {
    fontSize: 13,
    color: '#ffffff',
    lineHeight: 18,
  },
  bubbleTextRight: {
    color: '#030712',
    fontWeight: '500',
  },
  timeLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
    marginHorizontal: 4,
  },
  emptyChat: {
    padding: 30,
    alignItems: 'center',
  },
  emptyChatText: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    alignItems: 'center',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  sendBtn: {
    backgroundColor: COLORS.cyan,
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnText: {
    color: '#030712',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
