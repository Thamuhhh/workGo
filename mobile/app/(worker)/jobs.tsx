import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Card, SkeletonJobCard } from '../../src/components/ui';
import { FadeSlide } from '../../src/components/AppHeader';
import { useJobsStore, WorkerJob } from '../../src/store/jobsStore';
import { NativeJobMap } from '../../src/components/JobMap';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';

type Filter = 'all' | 'today' | 'nearby';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All Jobs' },
  { key: 'today', label: 'Today' },
  { key: 'nearby', label: 'Nearby' },
];

function kmOf(job: WorkerJob): number {
  const match = job.distance.match(/([\d.]+)\s*km/);
  return match ? parseFloat(match[1]) : 99;
}

const MAP_CENTER = 50;
const MAP_RADIUS = 44;
const MAP_SCALE = 0.9;

function radarPos(job: WorkerJob, index: number, total: number) {
  const ratio = Math.min(kmOf(job) / 6, 1);
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const x = MAP_CENTER + Math.cos(angle) * MAP_RADIUS * ratio * MAP_SCALE;
  const y = MAP_CENTER + Math.sin(angle) * MAP_RADIUS * ratio * MAP_SCALE;
  return { x, y };
}

function RadarMap({ jobs }: { jobs: WorkerJob[] }) {
  return (
    <View style={styles.mapCard}>
      {[100, 66, 33].map((pct) => {
        const inset = (100 - pct) / 2;
        return (
          <View
            key={pct}
            style={[styles.mapRing, {
              width: `${pct}%`,
              height: `${pct}%`,
              borderRadius: 999,
              left: `${inset}%`,
              top: `${inset}%`,
            }]}
            pointerEvents="none"
          />
        );
      })}

      <View style={[styles.mapYou, { left: `${MAP_CENTER - 4}%`, top: `${MAP_CENTER - 4}%` }]} pointerEvents="none">
        <View style={styles.mapYouDot} />
      </View>

      {jobs.map((job, index) => {
        const { x, y } = radarPos(job, index, jobs.length);
        return (
          <TouchableOpacity
            key={job.id}
            activeOpacity={0.7}
            style={[styles.mapMarker, { left: `${x}%`, top: `${y}%` }]}
            onPress={() =>
              router.push({ pathname: '/(worker)/job-detail', params: { jobId: job.id } })
            }
          >
            <View style={styles.mapDot} />
            <Text variant="caption" weight="semibold" color="#0F172A" numberOfLines={1} style={styles.mapLabel}>
              {job.title}
            </Text>
            <Text variant="caption" color={Colors.textMuted} numberOfLines={1} style={styles.mapDist}>
              {job.distance.replace(' away', '')}
            </Text>
          </TouchableOpacity>
        );
      })}

      <Text variant="caption" color={Colors.textMuted} style={styles.mapHint}>
        You are here • tap a dot for details
      </Text>
    </View>
  );
}

export default function WorkerJobsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [showMap, setShowMap] = useState(false);
  const serverJobs = useJobsStore((s) => s.jobs);
  const loadJobs = useJobsStore((s) => s.loadJobs);

  useEffect(() => {
    loadJobs();
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, [loadJobs]);

  const onRefresh = () => {
    setRefreshing(true);
    loadJobs(true).finally(() => setRefreshing(false));
  };

  const webReset = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null;

  let jobs = [...serverJobs];
  if (filter === 'today') jobs = jobs.filter((j) => j.date.toLowerCase() === 'today');
  if (filter === 'nearby') jobs = jobs.sort((a, b) => kmOf(a) - kmOf(b));

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
          Explore Jobs
        </Text>
        <View style={styles.topSpacer} />
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0F172A"
            colors={['#0F172A']}
          />
        }
      >
        <FadeSlide delay={40}>
          <View style={styles.subtitleRow}>
            <Text variant="bodySm" color={Colors.textSecondary} style={styles.subtitleText}>
              {loading
                ? 'Finding jobs near you...'
                : `${jobs.length} jobs near you — tap any job for full details`}
            </Text>
            <TouchableOpacity
              style={[styles.mapToggle, webReset]}
              activeOpacity={0.8}
              onPress={() => setShowMap((v) => !v)}
              hitSlop={8}
            >
              <Ionicons name={showMap ? 'list' : 'map'} size={16} color="#0F172A" weight="bold" />
              <Text variant="caption" weight="bold" color="#0F172A">
                {showMap ? 'List' : 'Map'}
              </Text>
            </TouchableOpacity>
          </View>
        </FadeSlide>

        {/* Filter chips */}
        <FadeSlide delay={90}>
          <View style={styles.filterRow}>
            {FILTERS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                activeOpacity={0.8}
                style={[styles.filterChip, filter === opt.key && styles.filterChipActive, webReset]}
                onPress={() => setFilter(opt.key)}
              >
                <Text
                  variant="caption"
                  weight="bold"
                  color={filter === opt.key ? '#FFFFFF' : Colors.textSecondary}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FadeSlide>

        <FadeSlide delay={140}>
          {loading ? (
            <View style={styles.listWrap}>
              <SkeletonJobCard count={3} />
            </View>
          ) : jobs.length === 0 ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Ionicons name="search" size={22} color={Colors.textMuted} />
              </View>
              <Text variant="body" weight="bold" color="#0F172A" style={styles.emptyTitle}>
                No jobs found
              </Text>
              <Text variant="bodySm" color={Colors.textMuted} style={styles.emptySub}>
                Try a different filter or check back later.
              </Text>
              <TouchableOpacity
                style={[styles.clearBtn, webReset]}
                activeOpacity={0.8}
                onPress={() => setFilter('all')}
              >
                <Text variant="caption" weight="bold" color="#FFFFFF">
                  Clear filters
                </Text>
              </TouchableOpacity>
            </View>
          ) : showMap ? (
            <View style={styles.listWrap}>
              {Platform.OS === 'web' ? (
                <RadarMap jobs={jobs} />
              ) : (
                <NativeJobMap jobs={jobs} />
              )}
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
                      <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1} style={styles.jobTitle}>
                        {job.title}
                      </Text>
                      <Text variant="body" weight="bold" color="#0F172A" style={styles.salary}>
                        {job.salary}
                      </Text>
                    </View>

                    <Text variant="bodySm" color={Colors.textSecondary} numberOfLines={1} style={styles.subTag}>
                      {job.employerName} • {job.location}
                    </Text>

                    <View style={styles.jobMetaRow}>
                      <View style={styles.metaLeft}>
                        <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
                        <Text variant="caption" color={Colors.textMuted}>
                          {job.date} • {job.timing}
                        </Text>
                      </View>
                      <View style={styles.ratingWrap}>
                        <Ionicons name="star" size={12} color="#F59E0B" weight="fill" />
                        <Text variant="caption" weight="bold" color={Colors.textSecondary}>
                          {job.employerRating.replace(' Rating', '')}
                        </Text>
                      </View>
                    </View>

                    {(job.foodProvided || job.transportProvided) && (
                      <Text variant="caption" color={Colors.borderDark} style={styles.amenities}>
                        {[job.foodProvided && 'Food', job.transportProvided && 'Transport']
                          .filter(Boolean)
                          .join(' • ')}{' '}
                        included
                      </Text>
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
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  subtitleText: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  mapToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#E8EEF6',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEF6',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  listWrap: {
    paddingHorizontal: Spacing.xl,
  },
  jobCard: {
    marginBottom: Spacing.md,
  },
  jobCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  jobTitle: {
    flex: 1,
    marginRight: Spacing.md,
  },
  salary: {
    fontVariant: ['tabular-nums'],
  },
  subTag: {
    marginTop: 2,
  },
  jobMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: Spacing.sm,
  },
  amenities: {
    marginTop: Spacing.xs,
  },

  /* Map view */
  mapCard: {
    aspectRatio: 1,
    backgroundColor: '#FAFBFC',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E8EEF6',
    alignSelf: 'stretch',
  },
  mapRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapYou: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(2, 119, 244, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapYouDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0F172A',
  },
  mapMarker: {
    position: 'absolute',
    alignItems: 'center',
    width: 84,
    marginLeft: -42,
  },
  mapDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mapLabel: {
    marginTop: 3,
    textAlign: 'center',
    maxWidth: 84,
  },
  mapDist: {
    marginTop: 1,
    textAlign: 'center',
  },
  mapHint: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
  },

  /* Empty state */
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    marginBottom: Spacing.xs,
  },
  emptySub: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  clearBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 18,
  },
});