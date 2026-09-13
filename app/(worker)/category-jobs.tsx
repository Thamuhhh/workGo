import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Card, SkeletonJobCard } from '../../src/components/ui';
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

  return (
    <>
      <Stack.Screen options={{ title: category ? `${category} Jobs` : 'All Jobs' }} />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Category cover */}
          <LinearGradient
            colors={['#0F172A', '#1E3A8A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cover}
          >
            <View style={styles.decoCircle1} />
            <View style={styles.decoCircle2} />
            <View style={styles.coverRow}>
              <View style={styles.coverDetails}>
                <Text variant="h2" weight="bold" color="#FFFFFF">
                  {category || 'All Jobs'}
                </Text>
                <Text variant="caption" color="rgba(255,255,255,0.7)">
                  {jobs.length} job{jobs.length === 1 ? '' : 's'} hiring near you
                </Text>
              </View>
            </View>

            <View style={styles.coverStats}>
              <View style={styles.coverStatBlock}>
                <Text variant="h3" weight="bold" color="#FFFFFF">
                  ₹{avgPay.toLocaleString('en-IN')}
                </Text>
                <Text variant="caption" color="rgba(255,255,255,0.6)">
                  Avg pay / day
                </Text>
              </View>
              <View style={styles.coverStatDivider} />
              <View style={styles.coverStatBlock}>
                <Text variant="h3" weight="bold" color="#FFFFFF">
                  {jobs.length}
                </Text>
                <Text variant="caption" color="rgba(255,255,255,0.6)">
                  Open roles
                </Text>
              </View>
              <View style={styles.coverStatDivider} />
              <View style={styles.coverStatBlock}>
                <View style={styles.liveRow}>
                  <View style={styles.liveDot} />
                  <Text variant="h3" weight="bold" color="#FFFFFF">
                    Now
                  </Text>
                </View>
                <Text variant="caption" color="rgba(255,255,255,0.6)">
                  Hiring
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Sort chips */}
          <View style={styles.sortRow}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                activeOpacity={0.8}
                style={[styles.sortChip, sort === opt.key && styles.sortChipActive]}
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
            <TouchableOpacity style={styles.filterBtn}>
              <Ionicons name="settings" size={13} color={Colors.textSecondary} />
              <Text variant="caption" weight="bold" color={Colors.textSecondary}>
                Filters
              </Text>
            </TouchableOpacity>
          </View>

          <FadeSlide delay={140}>
            {loading ? (
              <SkeletonJobCard count={2} />
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
              <View style={styles.jobsList}>
                {jobs.map((job) => (
                  <TouchableOpacity
                    key={job.id}
                    activeOpacity={0.7}
                    onPress={() =>
                      router.push({ pathname: '/(worker)/job-detail', params: { jobId: job.id } })
                    }
                  >
                    <Card padding="lg" style={styles.jobCard}>
                      <View style={styles.jobCardTop}>
                        <View style={styles.jobTitleCol}>
                          <Text variant="h3" weight="bold" color="#0F172A" numberOfLines={1}>
                            {job.title}
                          </Text>
                          <Text variant="bodySm" color="#64748B" numberOfLines={1} style={styles.categoryTag}>
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
                        <Text variant="bodySm" color="#64748B">
                          {job.date} • {job.timing}
                        </Text>
                        <View style={styles.ratingPill}>
                          <Ionicons name="star" size={12} color="#F59E0B" />
                          <Text variant="bodySm" weight="bold" color="#0F172A">
                            {job.employerRating.replace(' Rating', '')}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.applyRow}>
                        <Text variant="body" weight="bold" color="#0277F4">
                          Apply now
                        </Text>
                        <Ionicons name="arrow-right" size={14} color="#0277F4" weight="bold" />
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </FadeSlide>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  cover: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  decoCircle1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  decoCircle2: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  coverRow: {
    marginBottom: Spacing.md,
  },
  coverDetails: {
    flex: 1,
  },
  coverStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  coverStatBlock: {
    flex: 1,
    alignItems: 'center',
  },
  coverStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
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
  filterBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEF6',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: Spacing.sm,
    marginBottom: 2,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  jobsList: {
    paddingHorizontal: Spacing.lg,
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
  categoryTag: {
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
  applyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
});