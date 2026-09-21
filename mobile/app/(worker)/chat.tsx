import React, { Fragment, useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text } from '../../src/components/ui';
import { ScalePress } from '../../src/components/AppHeader';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useMessagesStore, ChatMessage } from '../../src/store/messagesStore';

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const QUICK_REPLIES =
  Platform.OS === 'web'
    ? ['I am available', 'Need more details', 'Please confirm']
    : ["I'm available", 'Need more details', 'Please confirm'];
const EMPLOYER_QUICK_REPLIES = ['Meet at 9 AM', 'Share your UPI ID', 'Confirmed'];

function dateLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.setHours(0, 0, 0, 0) - d.setHours(0, 0, 0, 0)) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

export default function WorkerChatScreen() {
  const params = useLocalSearchParams<{ jobId?: string; employerName?: string; workerName?: string; jobTitle?: string; mode?: string }>();
  const isEmployer = params.mode === 'employer';
  const threadName = isEmployer && params.workerName ? params.workerName : params.employerName;
  const jobTitle = params.jobTitle || '';

  const threadId = params.jobId ?? 'default';

  const thread = useMessagesStore((s) => s.threads[threadId]);
  const loadThread = useMessagesStore((s) => s.loadThread);
  const loadThreads = useMessagesStore((s) => s.loadThreads);
  const markThreadRead = useMessagesStore((s) => s.markThreadRead);
  const sendMessage = useMessagesStore((s) => s.sendMessage);
  const threadMeta = useMessagesStore((s) => s.threadMeta[threadId]);
  const otherPhone = threadMeta?.otherPhone;
  const displayName = threadMeta?.otherName || threadName || (isEmployer ? 'Worker' : 'Employer');

  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadThreads();
    loadThread(threadId);
    markThreadRead(threadId);
  }, [threadId, loadThread, loadThreads, markThreadRead]);

  useEffect(() => {
    const id = setInterval(() => {
      useMessagesStore.getState().loadThread(threadId);
      useMessagesStore.getState().loadThreads();
    }, 4000);
    return () => clearInterval(id);
  }, [threadId]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  }, [thread?.length]);

  const messages = thread ?? [];

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendMessage(threadId, text, isEmployer ? 'employer' : 'worker');
    setInput('');
  };

  const handleCall = () => {
    if (!otherPhone) {
      Alert.alert('Call', `Call available once the thread loads.`);
      return;
    }
    Linking.openURL(`tel:${otherPhone}`).catch(() => {
      Alert.alert('Call', `Call ${displayName} at ${otherPhone}`);
    });
  };

  const headerInitial = displayName.trim().charAt(0).toUpperCase() || 'E';

  if (usePageLoading()) return <ScreenSkeleton variant="chat" />;

  return (
    <LinearGradient
      colors={['#FFFFFF', '#F8FAFC', '#F1F5F9']}
      locations={[0, 0.5, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <ScalePress onPress={() => router.back()} style={styles.backBtn} scaleTo={0.9}>
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </ScalePress>

<View style={styles.headerAvatar}>
              <Text variant="h3" weight="bold" color={Colors.primary}>
                {headerInitial}
              </Text>
            </View>

          <View style={styles.headerInfo}>
            <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1}>
              {displayName}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.headerActionBtn}
              onPress={handleCall}
            >
              <Ionicons name="call-outline" size={18} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Job context chip */}
        {jobTitle ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              params.jobId &&
              router.push({ pathname: '/(worker)/job-detail', params: { jobId: params.jobId } })
            }
            style={styles.jobBar}
          >
            <View style={styles.jobBarIcon}>
              <Ionicons name="briefcase-outline" size={14} color={Colors.primary} />
            </View>
            <Text variant="caption" color="#0F172A" numberOfLines={1} style={styles.jobBarText}>
              {jobTitle}
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#64748B" />
          </TouchableOpacity>
        ) : null}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.messagesContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {thread && thread.length === 0 && (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <Ionicons name="chatbubble-ellipses-outline" size={22} color={Colors.primary} />
                </View>
                <Text variant="bodySm" weight="semibold" color="#0F172A" align="center">
                  Start the conversation
                </Text>
                <Text variant="caption" color={Colors.textMuted} align="center">
                  Introduce yourself and confirm you're available for this job. The employer will see your message right away.
                </Text>
              </View>
            )}

            {messages.map((msg, index) => {
              const isWorker = msg.sender === 'worker';
              const isLastOwn = isWorker && index === messages.length - 1;
              const prev = messages[index - 1];
              const showDate = index === 0 || dateLabel(msg.timestamp) !== dateLabel(prev.timestamp);
              return (
                <Fragment key={msg.id}>
                  {showDate && (
                    <View style={styles.dateChip}>
                      <Text variant="caption" weight="semibold" color={Colors.textSecondary}>
                        {dateLabel(msg.timestamp)}
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubbleRow,
                      isWorker ? styles.rowRight : styles.rowLeft,
                    ]}
                  >
                    {!isWorker && (
                      <View style={styles.msgAvatar}>
                        <Text variant="caption" weight="bold" color={Colors.primary}>
                          {headerInitial}
                        </Text>
                      </View>
                    )}
                    <View style={[isWorker ? styles.msgColRight : styles.msgColLeft]}>
                      <View
                        style={[
                          styles.bubble,
                          isWorker ? styles.bubbleWorker : styles.bubbleEmployer,
                        ]}
                      >
                        <Text
                          variant="bodySm"
                          color={isWorker ? '#FFFFFF' : '#0F172A'}
                        >
                          {msg.text}
                        </Text>
                      </View>
                      <View style={styles.bubbleMeta}>
                        {isLastOwn ? (
                          <Text variant="caption" weight="medium" color={Colors.primary}>
                            Sent · {formatTime(msg.timestamp)}
                          </Text>
                        ) : (
                          <Text variant="caption" color={Colors.textMuted}>
                            {formatTime(msg.timestamp)}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </Fragment>
              );
            })}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Quick replies */}
        {messages.length <= 2 && (
          <View style={styles.quickRow}>
            {(isEmployer ? EMPLOYER_QUICK_REPLIES : QUICK_REPLIES).map((reply) => (
              <TouchableOpacity
                key={reply}
                activeOpacity={0.8}
                onPress={() => {
                  setInput(reply);
                }}
                style={styles.quickChip}
              >
                <Text variant="caption" weight="semibold" color={Colors.primary}>
                  {reply}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

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
            selectionColor={Colors.primary}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  jobBarIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobBarText: {
    flex: 1,
  },
  messagesContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.md,
  },
  dateChip: {
    alignSelf: 'center',
    backgroundColor: 'rgba(15,23,42,0.06)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    gap: 4,
  },
  emptyStateIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    maxWidth: '84%',
  },
  rowLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-end',
  },
  rowRight: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  msgAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
    marginBottom: 2,
  },
  msgColLeft: {
    alignItems: 'flex-start',
  },
  msgColRight: {
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
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubbleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  quickRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  quickChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.round,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: Colors.surfaceAlt,
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