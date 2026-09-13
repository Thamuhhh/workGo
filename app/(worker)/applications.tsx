import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Card, Badge, Button } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { SAMPLE_JOBS } from '../../src/data/sampleJobs';
import { useApplicationsStore, ApplicationStatus } from '../../src/store/applicationsStore';
import { useMessagesStore } from '../../src/store/messagesStore';
import { Colors, Spacing } from '../../src/constants/theme';

const STATUS_VARIANT: Record<ApplicationStatus, { label: string; variant: 'success' | 'info' | 'warning' | 'danger' }> = {
  APPLIED: { label: 'Applied', variant: 'info' },
  SHORTLISTED: { label: 'Shortlisted', variant: 'warning' },
  ACCEPTED: { label: 'Accepted', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
};

const THREAD_PREVIEWS = [
  'We need you by 9 AM tomorrow. Confirm?',
  'Great, shortlisted! Please confirm your availability.',
  'Is it possible to start immediately?',
];

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

export default function WorkerMessagesScreen() {
  const applications = useApplicationsStore((s) => s.applications);
  const readThreadIds = useMessagesStore((s) => s.readThreadIds);
  const [segment, setSegment] = useState<'chats' | 'apps'>('chats');

  const rows = applications.map((app) => {
    const job = SAMPLE_JOBS.find((j) => j.id === app.jobId);
    return { app, job };
  });

  const openChat = (jobId: string, employerName: string, jobTitle: string) => {
    router.push({
      pathname: '/(worker)/chat',
      params: { jobId, employerName, jobTitle },
    });
  };

  if (usePageLoading()) return <ScreenSkeleton variant="list" />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="h2" weight="bold" style={styles.title}>
        Messages
      </Text>

      {/* Segmented switch */}
      <View style={styles.segmentRow}>
        <TouchableOpacity
          style={[styles.segment, segment === 'chats' && styles.segmentActive]}
          onPress={() => setSegment('chats')}
        >
          <Text
            variant="bodySm"
            weight={segment === 'chats' ? 'bold' : 'regular'}
            color={segment === 'chats' ? '#FFFFFF' : Colors.textSecondary}
          >
            Chats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, segment === 'apps' && styles.segmentActive]}
          onPress={() => setSegment('apps')}
        >
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
            <Ionicons name="chatbubble-outline" size={44} color={Colors.borderDark} />
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
            {rows.map(({ app, job }, index) => {
              if (!job) return null;
              const firstName = job.employerName.trim().split(' ')[0] || 'E';
              const initial = firstName.charAt(0).toUpperCase();
              return (
                <TouchableOpacity
                  key={app.jobId}
                  activeOpacity={0.7}
                  onPress={() => openChat(app.jobId, job.employerName, job.title)}
                >
                  <View style={[styles.threadRow, index === rows.length - 1 && styles.threadRowLast]}>
                    <View style={styles.threadAvatar}>
                      <Text variant="h3" weight="bold" color={Colors.primary}>
                        {initial}
                      </Text>
                    </View>
                    <View style={styles.threadMiddle}>
                      <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1}>
                        {job.employerName}
                      </Text>
                      <Text variant="bodySm" color={Colors.textSecondary} numberOfLines={1}>
                        {job.title} • {THREAD_PREVIEWS[index % THREAD_PREVIEWS.length]}
                      </Text>
                    </View>
                    <View style={styles.threadRight}>
                      <Text variant="caption" color={Colors.textMuted}>
                        {timeAgo(app.appliedAt)}
                      </Text>
                      {!readThreadIds.includes(app.jobId) && <View style={styles.unreadDot} />}
                    </View>
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
              <Ionicons name="document-text-outline" size={44} color={Colors.borderDark} />
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
                        <Text variant="bodySm" weight="bold" color="#0F172A">
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
  title: {
    marginBottom: Spacing.sm,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  segmentActive: {
    backgroundColor: Colors.primary,
  },
  threadList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  threadRowLast: {
    borderBottomWidth: 0,
  },
  threadAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  threadMiddle: {
    flex: 1,
  },
  threadRight: {
    alignItems: 'flex-end',
    marginLeft: Spacing.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: Spacing.sm,
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