import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Badge, Button, Card } from '../../src/components/ui';
import { useApplicationsStore, ApplicationStatus } from '../../src/store/applicationsStore';
import { useJobsStore, findJobById } from '../../src/store/jobsStore';
import { Colors, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';

const STATUS_VARIANT: Record<ApplicationStatus, { label: string; variant: 'success' | 'info' | 'warning' | 'danger' }> = {
  APPLIED: { label: 'Applied', variant: 'info' },
  SHORTLISTED: { label: 'Shortlisted', variant: 'warning' },
  ACCEPTED: { label: 'Accepted', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
  COMPLETED: { label: 'Completed', variant: 'success' },
};

const STATUS_HINTS: Record<ApplicationStatus, string> = {
  APPLIED: 'Application submitted. The employer will review it and get in touch.',
  SHORTLISTED: 'Good news — the employer shortlisted you. Message them to confirm your slot.',
  ACCEPTED: 'You\u2019re hired! Confirm the details with the employer before the event.',
  REJECTED: 'This application wasn\u2019t selected. Keep an eye on new jobs.',
  COMPLETED: 'This gig is done. Collected your payment and rated the employer?',
};

const STATUS_ICONS: Record<ApplicationStatus, string> = {
  APPLIED: 'document-text-outline',
  SHORTLISTED: 'star-outline',
  ACCEPTED: 'checkmark-circle-outline',
  REJECTED: 'close-circle-outline',
  COMPLETED: 'flag-outline',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ApplicationDetailScreen() {
  const params = useLocalSearchParams<{ jobId?: string }>();
  const applications = useApplicationsStore((s) => s.applications);
  const liveJobs = useJobsStore((s) => s.jobs);

  const app = applications.find((a) => a.jobId === params.jobId);
  const job = findJobById(params.jobId ?? '', liveJobs);
  const [startTime = '', endTime = ''] = (job?.timing ?? '').split(' - ');

  if (!app) {
    return (
      <>
        <Stack.Screen options={{ title: 'Application', headerShown: false }} />
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
          <Text variant="h3" weight="semibold" color={Colors.textSecondary} style={styles.notFoundTitle}>
            Application not found
          </Text>
          <Button title="Go Back" size="sm" variant="outline" onPress={() => router.back()} />
        </View>
      </>
    );
  }

  const status = STATUS_VARIANT[app.status];
  const appTitle = app.jobTitle || job?.title || '';
  const appEmployer = app.employerName || job?.employerName || '';
  const appSalary = app.salaryNum
    ? `₹${app.salaryNum.toLocaleString('en-IN')} / day`
    : job?.salary || '';

  const openChat = () => {
    router.push({
      pathname: '/(worker)/chat',
      params: { jobId: app.jobId, employerName: appEmployer, jobTitle: appTitle },
    });
  };

  const withdraw = useApplicationsStore((s) => s.withdraw);

  const handleWithdraw = () => {
    Alert.alert('Withdraw application?', 'The employer will see your slot as freed up.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Withdraw',
        style: 'destructive',
        onPress: async () => {
          await withdraw(app.jobId);
          router.back();
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Application', headerShown: false }} />
      <View style={styles.screen}>
        <SafeAreaView edges={['top']} style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.topBackBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1} style={styles.topBarTitle}>
            Application
          </Text>
        </SafeAreaView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* ─── Status hero ─── */}
          <View style={styles.statusCard}>
            <View style={[styles.statusIcon, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name={STATUS_ICONS[app.status] as any} size={26} color={Colors.primary} />
            </View>
            <Badge label={status.label} variant={status.variant} size="sm" style={styles.statusBadge} />
            <Text variant="h1" weight="heavy" color="#0F172A" style={styles.jobTitle}>
              {appTitle || 'Gig'}
            </Text>
            <Text variant="bodySm" color={Colors.textSecondary} style={styles.employerLine}>
              {appEmployer || 'Employer'}
              {appSalary ? `  ·  ${appSalary}` : ''}
            </Text>
            <View style={styles.appliedLine}>
              <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
              <Text variant="caption" color={Colors.textMuted}>
                Applied {formatDate(app.appliedAt)}
              </Text>
            </View>
          </View>

          {/* ─── Status info ─── */}
          <Card padding="lg" variant="outlined" style={styles.section}>
            <View style={styles.hintRow}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
              <Text variant="bodySm" color={Colors.textSecondary} style={styles.hintText}>
                {STATUS_HINTS[app.status]}
              </Text>
            </View>
          </Card>

          {/* ─── Employer ─── */}
          {appEmployer && (
            <Card padding="lg" variant="outlined" style={styles.section}>
              <View style={styles.employerRow}>
                <View style={styles.employerAvatar}>
                  <Text variant="body" weight="bold" color="#FFFFFF">
                    {getInitials(appEmployer)}
                  </Text>
                </View>
                <View style={styles.employerInfo}>
                  <Text variant="body" weight="bold" color="#0F172A">
                    {appEmployer}
                  </Text>
                  <Text variant="caption" color={Colors.textMuted}>
                    Verified Employer
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* ─── Job details ─── */}
          {job && (
            <>
              <View style={styles.tilesRow}>
                <View style={[styles.tile, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="cash-outline" size={19} color="#059669" />
                  <Text variant="caption" color={Colors.textMuted}>Daily Pay</Text>
                  <Text variant="bodySm" weight="bold" color="#0F172A" numberOfLines={1}>
                    {appSalary || '—'}
                  </Text>
                </View>
                <View style={[styles.tile, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="calendar-outline" size={19} color="#0F172A" />
                  <Text variant="caption" color={Colors.textMuted}>Date</Text>
                  <Text variant="bodySm" weight="bold" color="#0F172A" numberOfLines={1}>
                    {job.date}
                  </Text>
                </View>
                <View style={[styles.tile, { backgroundColor: '#F5F3FF' }]}>
                  <Ionicons name="time-outline" size={19} color="#0F172A" />
                  <Text variant="caption" color={Colors.textMuted}>Timing</Text>
                  <Text variant="bodySm" weight="bold" color="#0F172A" numberOfLines={1}>{startTime}</Text>
                  <Text variant="caption" color="#52525B" numberOfLines={1}>{endTime ? `till ${endTime}` : '—'}</Text>
                </View>
              </View>

              <Card padding="lg" variant="outlined" style={styles.section}>
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={17} color={Colors.textSecondary} />
                  <Text variant="bodySm" color={Colors.textSecondary} style={styles.metaText}>
                    {job.location} · {job.distance}
                  </Text>
                </View>
              </Card>
            </>
          )}

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* ─── Fixed bottom bar ─── */}
        <View style={styles.bottomBar}>
          <Button
            title="Message Employer"
            size="lg"
            variant="outline"
            icon={<Ionicons name="chatbubble-outline" size={16} color={Colors.primary} />}
            onPress={openChat}
            style={styles.msgBtn}
          />
          {app.status === 'APPLIED' && (
            <Button
              title="Withdraw"
              size="lg"
              variant="danger"
              onPress={handleWithdraw}
              style={styles.withdrawBtn}
            />
          )}
          {job && (
            <Button
              title="View Job"
              size="lg"
              onPress={() =>
                router.push({ pathname: '/(worker)/job-detail', params: { jobId: job.id } })
              }
              style={styles.viewBtn}
            />
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  topBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  notFoundTitle: {
    marginTop: Spacing.sm,
  },
  statusCard: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statusIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusBadge: {
    marginBottom: Spacing.sm,
  },
  jobTitle: {
    textAlign: 'center',
    marginBottom: 2,
  },
  employerLine: {
    textAlign: 'center',
  },
  appliedLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: Spacing.sm,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  hintText: {
    flex: 1,
    lineHeight: 20,
  },
  section: {
    marginBottom: Spacing.md,
  },
  employerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  employerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  employerInfo: {
    flex: 1,
    gap: 2,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tile: {
    flex: 1,
    minHeight: 104,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    ...Shadows.md,
  },
  msgBtn: {
    flex: 1,
  },
  viewBtn: {
    flex: 1,
  },
  withdrawBtn: {
    flex: 1,
  },
});