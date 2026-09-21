import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Badge } from '../../src/components/ui';
import { ScalePress } from '../../src/components/AppHeader';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useMessagesStore } from '../../src/store/messagesStore';
import EmployerBottomNav from '../../src/components/EmployerBottomNav';

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const diffDays = Math.floor(
    (now.setHours(0, 0, 0, 0) - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86400000
  );
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

export default function EmployerMessagesScreen() {
  const threads = useMessagesStore((s) => s.threads);
  const threadMeta = useMessagesStore((s) => s.threadMeta);
  const readThreadIds = useMessagesStore((s) => s.readThreadIds);
  const loadThreads = useMessagesStore((s) => s.loadThreads);

  const conversationIds = Object.keys(threadMeta).length > 0 ? Object.keys(threadMeta) : Object.keys(threads);
  const unreadTotal = conversationIds.filter((id) => {
    const meta = threadMeta[id];
    return meta ? meta.unread > 0 : !readThreadIds.includes(id);
  }).length;

  const jobTitleOf = (jobId: string) => threadMeta[jobId]?.jobTitle ?? 'Gig';
  const nameOf = (jobId: string) => threadMeta[jobId]?.otherName ?? 'Worker';

  useEffect(() => {
    loadThreads();
    const id = setInterval(() => {
      loadThreads();
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text variant="h2" weight="bold" color="#0F172A">
          Messages
        </Text>
      </View>

      <FlatList
        data={conversationIds}
        keyExtractor={(id) => id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.subheadRow}>
            <Text variant="caption" weight="semibold" color={Colors.textSecondary}>
              Conversations
            </Text>
            {unreadTotal > 0 ? (
              <Badge label={`${unreadTotal} unread`} variant="info" size="sm" />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons name="chatbubble-ellipses-outline" size={32} color="#90A4AE" weight="regular" />
            </View>
            <Text variant="body" weight="bold" color="#0F172A" style={styles.emptyTitle}>
              No conversations yet
            </Text>
            <Text variant="caption" color={Colors.textSecondary} style={styles.emptyText}>
              Open a chat from a job applicant and it will show up here.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(employer)/jobs')}
              style={styles.emptyCta}
            >
              <Text variant="caption" weight="bold" color="#0F172A">
                Go to Applicants →
              </Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item: jobId }) => {
          const msgs = threads[jobId] ?? [];
          const last = msgs[msgs.length - 1];
          const meta = threadMeta[jobId];
          const unread = meta ? meta.unread > 0 : !readThreadIds.includes(jobId);
          const name = nameOf(jobId);
          return (
            <ScalePress
              scaleTo={0.97}
              onPress={() =>
                router.push({
                  pathname: '/(worker)/chat',
                  params: { jobId, workerName: name, jobTitle: jobTitleOf(jobId), mode: 'employer' },
                })
              }
              style={styles.convCard}
            >
              {unread && <View style={styles.unreadBar} />}
              <View style={styles.avatar}>
                <Text variant="body" weight="bold" color={Colors.primary}>
                  {name.charAt(0)}
                </Text>
                {unread && <View style={styles.avatarDot} />}
              </View>
              <View style={styles.convBody}>
                <View style={styles.convTop}>
                  <Text
                    variant="body"
                    weight={unread ? 'bold' : 'semibold'}
                    color="#0F172A"
                    numberOfLines={1}
                    style={styles.convName}
                  >
                    {name}
                  </Text>
                  {meta && (
                    <Text variant="caption" color={unread ? Colors.primary : Colors.textMuted}>
                      {formatTime(meta.lastTimestamp)}
                    </Text>
                  )}
                </View>
                <Text variant="caption" color={Colors.textSecondary} numberOfLines={1} style={styles.jobLine}>
                  {jobTitleOf(jobId)}
                </Text>
                <Text
                  variant="caption"
                  color={unread ? '#0F172A' : Colors.textMuted}
                  weight={unread ? 'semibold' : 'regular'}
                  numberOfLines={1}
                >
                  {meta ? meta.lastMessage : last ? last.text : 'Say hello to get things moving.'}
                </Text>
              </View>
            </ScalePress>
          );
        }}
      />

      <EmployerBottomNav activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 110,
  },
  subheadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  unreadBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  convBody: {
    flex: 1,
    minWidth: 0,
  },
  convTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  convName: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  jobLine: {
    marginTop: 1,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    marginBottom: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyCta: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primaryLight,
  },
});