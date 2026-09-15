import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Card, SkeletonJobCard, Badge } from '../../src/components/ui';
import { FadeSlide } from '../../src/components/AppHeader';
import { SAMPLE_JOBS } from '../../src/data/sampleJobs';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';

type SortKey = 'recent' | 'pay' | 'distance';

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'recent', label: 'Recent' },
  { key: 'pay', label: 'Pay' },
  { key: 'distance', label: 'Distance' },
];

const toPay = (s: string) => parseInt(s.replace(/[^\d]/g, ''), 10) || 0;
const toKm = (s: string) => parseFloat(s) || 0;

export default function CategoryJobsScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const category = typeof params.category === 'string' ? params.category : '';

  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>('recent');

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, [category]);

  const jobs = useMemo(() => {
    const list = category
      ? SAMPLE_JOBS.filter((j) => j.category.toLowerCase() === category.toLowerCase())
      : SAMPLE_JOBS;
    if (sort === 'pay') return [...list].sort((a, b) => toPay(b.salary) - toPay(a.salary));
    if (sort === 'distance') return [...list].sort((a, b) => toKm(a.distance) - toKm(b.distance));
    return list;
  }, [category, sort]);

  const avgPay = jobs.length
    ? Math.round(jobs.reduce((acc, j) => acc + toPay(j.salary), 0) / jobs.length)
    : 0;

  const webReset = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null;

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top bar */}
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.topBackBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1} style={styles.topTitle}>
          {category} Jobs
        </Text>
        <View style={styles.topSpacer} />
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Category summary */}
        <FadeSlide delay={40}>
          <View style={[styles.summaryCard, webReset]}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCol}>
                <Text variant="h3" weight="bold" color="#0F172A">
                  {category || 'All Jobs'}
                </Text>
                <Text variant="bodySm" color={Colors.textSecondary}>
                  {jobs.length} job{jobs.length === 1 ? '' : 's'} hiring near you
                </Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Text variant="body" weight="bold" color="#0F172A">
                  ₹{avgPay.toLocaleString('en-IN')}
                </Text>
                <Text variant="caption" color={Colors.textMuted}>Avg pay / day</Text>
              </View>
              <View style={styles.summaryStatDivider} />
              <View style={styles.summaryStat}>
                <Text variant="body" weight="bold" color="#0F172A">
                  {jobs.length}
                </Text>
                <Text variant="caption" color={Colors.textMuted}>Jobs</Text>
              </View>
              <View style={styles.summaryStatDivider} />
              <View style={styles.summaryStat}>
                <Text variant="body" weight="bold" color="#059669">
                  Live
                </Text>
                <Text variant="caption" color={Colors.textMuted}>Now</Text>
              </View>
            </View>
          </View>
        </FadeSlide>

        {/* Sort chips */}
        <FadeSlide delay={90}>
          <View style={styles.sortRow}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                activeOpacity={0.8}
                style={[styles.sortChip, sort === opt.key && styles.sortChipActive, webReset]}
                onPress={() => setSort(opt.key)}
              >
                <Text
                  variant="caption"
                  weight="bold"
                  color={sort === opt.key ? '#FFFFFF' : Colors.textSecondary}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FadeSlide>

        {/* Job list */}
        <FadeSlide delay={140}>
          {loading ? (
            <View style={styles.listWrap}>
              <SkeletonJobCard count={2} />
            </View>
          ) : jobs.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="file-tray-outline" size={42} color={Colors.borderDark} />
              <Text variant="body" weight="semibold" color={Colors.textSecondary} style={styles.emptyTitle}>
                No {category || 'job'} postings right now
              </Text>
              <Text variant="caption" color={Colors.textMuted} style={styles.emptySubtitle}>
                Check back soon or explore nearby listings.
              </Text>
            </View>
          ) : (
            <View style={styles.listWrap}>
              {jobs.map((job) => (
                <TouchableOpacity
                  key={job.id}
                  activeOpacity={0.7}
                  style={webReset}
                  onPress={() =>
                    router.push({ pathname: '/(worker)/job-detail', params: { jobId: job.id } })
                  }
                >
                  <Card padding="lg" variant="outlined" style={styles.jobCard}>
                    <View style={styles.jobCardTop}>
                      <View style={styles.jobTitleCol}>
                        <Text variant="h3" weight="bold" color="#0F172A" numberOfLines={1}>
                          {job.title}
                        </Text>
                        <Text variant="bodySm" color={Colors.textSecondary} numberOfLines={1} style={styles.subTag}>
                          {job.employerName} • {job.location} ({job.distance})
                        </Text>
                      </View>
                      <View style={styles.salaryBadge}>
                        <Text variant="body" weight="heavy" color="#0F172A">
                          {job.salary}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.jobMetaRow}>
                      <Text variant="bodySm" color={Colors.textMuted}>
                        {job.date} • {job.timing}
                      </Text>
                      <View style={styles.ratingPill}>
                        <Ionicons name="star" size={12} color="#F59E0B" weight="fill" />
                        <Text variant="bodySm" weight="bold" color="#0F172A">
                          {job.employerRating.replace(' Rating', '')}
                        </Text>
                      </View>
                    </View>

                    {(job.foodProvided || job.transportProvided) && (
                      <View style={styles.badgeRow}>
                        {job.foodProvided ? (
                          <Badge label="Food" variant="success" size="sm" style={styles.amenityBadge} />
                        ) : null}
                        {job.transportProvided ? (
                          <Badge label="Transport" variant="info" size="sm" style={styles.amenityBadge} />
                        ) : null}
                      </View>
                    )}
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </FadeSlide>
      </ScrollView>
    </View>
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
  topTitle: {
    flex: 1,
    textAlign: 'center',
  },
  topSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* Summary card */
  summaryCard: {
    marginHorizontal: Spacing.xl,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  summaryCol: {
    flex: 1,
    gap: 2,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: Spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
  },
  summaryStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },

  /* Sort chips */
  sortRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sortChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEF6',
  },
  sortChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },

  /* List */
  listWrap: {
    paddingHorizontal: Spacing.xl,
  },
  jobCard: {
    marginBottom: Spacing.md,
  },
  jobCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  jobTitleCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  subTag: {
    marginTop: 2,
  },
  salaryBadge: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
  },
  jobMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
  },
  amenityBadge: {
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    marginTop: Spacing.sm,
    marginBottom: 2,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
});