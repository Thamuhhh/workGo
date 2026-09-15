import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Card, Badge, Button } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { SAMPLE_JOBS } from '../../src/data/sampleJobs';
import { useApplicationsStore, ApplicationStatus } from '../../src/store/applicationsStore';
import { useMessagesStore, ChatMessage } from '../../src/store/messagesStore';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';

const STATUS_VARIANT: Record<ApplicationStatus, { label: string; variant: 'success' | 'info' | 'warning' | 'danger' }> = {
  APPLIED: { label: 'Applied', variant: 'info' },
  SHORTLISTED: { label: 'Shortlisted', variant: 'warning' },
  ACCEPTED: { label: 'Accepted', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
  COMPLETED: { label: 'Completed', variant: 'success' },
};

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function previewOf(thread: ChatMessage[] | undefined, fallback: string) {
  if (!thread || thread.length === 0) return fallback;
  const last = thread[thread.length - 1];
  const prefix = last.sender === 'worker' ? 'You: ' : '';
  return `${prefix}${last.text}`;
}

export default function WorkerMessagesScreen() {
  const applications = useApplicationsStore((s) => s.applications);
  const readThreadIds = useMessagesStore((s) => s.readThreadIds);
  const threads = useMessagesStore((s) => s.threads);
  const seedThread = useMessagesStore((s) => s.seedThread);
  const markAllRead = useMessagesStore((s) => s.markAllRead);
  const [segment, setSegment] = useState<'chats' | 'apps'>('chats');

  const rows = applications.map((app) => {
    const job = SAMPLE_JOBS.find((j) => j.id === app.jobId);
    return { app, job };
  });

  useEffect(() => {
    rows.forEach(({ app }) => seedThread(app.jobId));
  }, []);

  const unreadCount = rows.filter(
    ({ app }) => !readThreadIds.includes(app.jobId)
  ).length;

  const openChat = (jobId: string, employerName: string, jobTitle: string) => {
    router.push({
      pathname: '/(worker)/chat',
      params: { jobId, employerName, jobTitle },
    });
  };

  if (usePageLoading()) return <ScreenSkeleton variant="list" />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text variant="h2" weight="bold" style={styles.title} color="#0F172A">
          Messages
        </Text>
        {segment === 'chats' && unreadCount > 0 && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => markAllRead(rows.map(({ app }) => app.jobId))}
            hitSlop={8}
          >
            <Text variant="bodySm" weight="semibold" color={Colors.primary}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Segmented switch */}
      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[styles.segment, segment === 'chats' && styles.segmentActive]}
          activeOpacity={0.8}
          onPress={() => setSegment('chats')}
        >
          <Ionicons
            name={segment === 'chats' ? 'chatbubble' : 'chatbubble-outline'}
            size={16}
            color={segment === 'chats' ? '#FFFFFF' : Colors.textSecondary}
          />
          <Text
            variant="bodySm"
            weight={segment === 'chats' ? 'bold' : 'regular'}
            color={segment === 'chats' ? '#FFFFFF' : Colors.textSecondary}
          >
            Chats
          </Text>
          {unreadCount > 0 && (
            <View style={styles.countBadge}>
              <Text variant="caption" weight="bold" color="#FFFFFF">
                {unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, segment === 'apps' && styles.segmentActive]}
          activeOpacity={0.8}
          onPress={() => setSegment('apps')}
        >
          <Ionicons
            name="document-text-outline"
            size={16}
            color={segment === 'apps' ? '#FFFFFF' : Colors.textSecondary}
          />
          <Text
            variant="bodySm"
            weight={segment === 'apps' ? 'bold' : 'regular'}
            color={segment === 'apps' ? '#FFFFFF' : Colors.textSecondary}
          >
            Applications
          </Text>
        </TouchableOpacity>
      </View>

      {segment === 'chats' ? (
        rows.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="chatbubble-outline" size={40} color={Colors.primary} />
            </View>
            <Text variant="body" weight="semibold" color={Colors.textSecondary} style={styles.emptyTitle}>
              No conversations yet
            </Text>
            <Text variant="caption" color={Colors.textMuted} style={styles.emptySubtitle}>
              When you apply to a job, employers can chat with you here.
            </Text>
            <Button
              title="Browse Jobs"
              size="sm"
              onPress={() => router.push('/(worker)/jobs')}
              style={styles.emptyBtn}
            />
          </View>
        ) : (
          <View style={styles.threadList}>
            {rows.map(({ app, job }) => {
              if (!job) return null;
              const firstName = job.employerName.trim().split(' ')[0] || 'E';
              const initial = firstName.charAt(0).toUpperCase();
              const isUnread = !readThreadIds.includes(app.jobId);
              const thread = threads[app.jobId];
              return (
                <TouchableOpacity
                  key={app.jobId}
                  activeOpacity={0.7}
                  onPress={() => openChat(app.jobId, job.employerName, job.title)}
                >
                  <View style={styles.threadRow}>
                    <View style={styles.threadAvatar}>
                      <Text variant="h3" weight="bold" color={Colors.primary}>
                        {initial}
                      </Text>
                      <View style={styles.onlineDot} />
                    </View>
                    <View style={styles.threadMiddle}>
                      <View style={styles.threadNameRow}>
                        <Text variant="body" weight={isUnread ? 'bold' : 'semibold'} color="#0F172A" numberOfLines={1} style={styles.threadName}>
                          {job.employerName}
                        </Text>
                        <Text variant="caption" color={isUnread ? Colors.primary : Colors.textMuted}>
                          {timeAgo(thread?.[thread.length - 1]?.timestamp ?? app.appliedAt)}
                        </Text>
                      </View>
                      <Text
                        variant="bodySm"
                        weight={isUnread ? 'semibold' : 'regular'}
                        color={isUnread ? '#0F172A' : Colors.textSecondary}
                        numberOfLines={1}
                      >
                        {previewOf(thread, `${job.title} • started a conversation`)}
                      </Text>
                    </View>
                    {isUnread && <View style={styles.unreadDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )
      ) : (
        <>
          {rows.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="document-text-outline" size={40} color={Colors.primary} />
              </View>
              <Text variant="body" weight="semibold" color={Colors.textSecondary} style={styles.emptyTitle}>
                No applications yet
              </Text>
              <Text variant="caption" color={Colors.textMuted} style={styles.emptySubtitle}>
                Jobs you apply to will show up here.
              </Text>
              <Button
                title="Browse Jobs"
                size="sm"
                onPress={() => router.push('/(worker)/jobs')}
                style={styles.emptyBtn}
              />
            </View>
          ) : (
            rows.map(({ app, job }) => {
              const status = STATUS_VARIANT[app.status];
              return (
                <Card key={app.jobId} padding="lg" style={styles.appCard}>
                  <View style={styles.row}>
                    <Text variant="h3" weight="bold" style={styles.jobTitle}>
                      {job?.title ?? 'Unknown job'}
                    </Text>
                    <Badge label={status.label} variant={status.variant} size="sm" />
                  </View>
                  <Text variant="bodySm" color={Colors.textSecondary}>
                    {job ? `${job.employerName} • ${job.salary}` : '—'}
                  </Text>
                  <View style={styles.dateRow}>
                    <Text variant="caption" color={Colors.textMuted}>
                      Applied {timeAgo(app.appliedAt)}
                    </Text>
                    {job && (
                      <TouchableOpacity
                        onPress={() =>
                          router.push({ pathname: '/(worker)/job-detail', params: { jobId: job.id } })
                        }
                      >
                        <Text variant="bodySm" weight="bold" color={Colors.primary}>
                          View job
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              );
            })
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: 110,
    backgroundColor: Colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  title: {
    flex: 1,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
  },
  segmentActive: {
    backgroundColor: Colors.primary,
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadList: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  threadAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  threadMiddle: {
    flex: 1,
  },
  threadNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  threadName: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    marginTop: Spacing.xs,
  },
  emptySubtitle: {
    marginTop: 2,
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: Spacing.lg,
  },
  appCard: {
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  jobTitle: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
});