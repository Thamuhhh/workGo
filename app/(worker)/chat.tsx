import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { Colors, Spacing } from '../../src/constants/theme';
import { useMessagesStore } from '../../src/store/messagesStore';

interface ChatMessage {
  id: string;
  sender: 'worker' | 'employer';
  text: string;
  time: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'employer', text: 'Hi! Thanks for applying to the job.', time: '10:02 AM' },
  { id: '2', sender: 'employer', text: 'Can you join tomorrow by 9:00 AM?', time: '10:02 AM' },
  { id: '3', sender: 'worker', text: 'Yes, I will be there on time.', time: '10:15 AM' },
  { id: '4', sender: 'employer', text: 'Perfect! Please carry an ID proof.', time: '10:17 AM' },
  { id: '5', sender: 'employer', text: 'We need you by 9 AM tomorrow. Confirm?', time: '10:18 AM' },
];

export default function WorkerChatScreen() {
  const params = useLocalSearchParams<{ jobId?: string; employerName?: string; jobTitle?: string }>();
  const employerName = params.employerName || 'Employer';
  const markThreadRead = useMessagesStore((s) => s.markThreadRead);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: false });
    if (params.jobId) {
      markThreadRead(params.jobId);
    }
  }, [params.jobId]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        sender: 'worker',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  if (usePageLoading()) return <ScreenSkeleton variant="chat" />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Job context chip */}
      <View style={styles.jobBar}>
        <Ionicons name="briefcase-outline" size={16} color={Colors.primary} />
        <Text variant="caption" color={Colors.textSecondary} numberOfLines={1} style={styles.jobBarText}>
          {params.jobTitle || 'Job conversation'}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messagesContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => {
          const isWorker = msg.sender === 'worker';
          return (
            <View key={msg.id} style={[styles.bubbleRow, isWorker ? styles.rowRight : styles.rowLeft]}>
              <View style={[styles.bubble, isWorker ? styles.bubbleWorker : styles.bubbleEmployer]}>
                <Text variant="bodySm" color={isWorker ? '#FFFFFF' : '#0F172A'}>
                  {msg.text}
                </Text>
              </View>
              <Text variant="caption" color={Colors.textMuted} style={styles.bubbleTime}>
                {isWorker ? `You · ${msg.time}` : `${employerName} · ${msg.time}`}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type a message…"
          placeholderTextColor={Colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim()}
        >
          <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  jobBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    gap: Spacing.xs,
  },
  jobBarText: {
    flex: 1,
  },
  messagesContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  bubbleRow: {
    marginBottom: Spacing.sm,
    maxWidth: '82%',
  },
  rowLeft: {
    alignSelf: 'flex-start',
  },
  rowRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  bubbleWorker: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleEmployer: {
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 4,
  },
  bubbleTime: {
    marginTop: 2,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 22,
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#0F172A',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});