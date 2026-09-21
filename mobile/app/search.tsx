import React, { useEffect, useRef, useState } from 'react';
import {
  Platform,
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Icon as Ionicons } from '../src/components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, SkeletonJobCard } from '../src/components/ui';
import { FadeSlide, ScalePress } from '../src/components/AppHeader';
import { Colors, Spacing, BorderRadius } from '../src/constants/theme';
import { useJobsStore, toWorkerJob, WorkerJob } from '../src/store/jobsStore';
import { getJobs } from '../src/services/jobs';

const POPULAR = ['Wedding', 'Catering', 'Promoter', 'Cleaner', 'MC/Anchor', 'Coordinator'];

const RECENT = ['Catering Staff', 'Event Setup'];

const SEARCH_CATEGORIES = [
  { label: 'Catering', icon: 'restaurant-outline' },
  { label: 'Promoter', icon: 'megaphone-outline' },
  { label: 'Cleaning', icon: 'sparkles-outline' },
  { label: 'MC/Anchor', icon: 'mic-outline' },
  { label: 'Coordinator', icon: 'calendar-outline' },
  { label: 'Other', icon: 'grid-outline' },
];

function SectionTitle({ children }: { children: string }) {
  return (
    <View style={styles.sectionHead}>
      <Text variant="caption" weight="bold" color="#94A3B8" style={styles.kicker}>
        {children.toUpperCase()}
      </Text>
      <View style={styles.headRule} />
    </View>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const allJobs = useJobsStore((s) => s.jobs);
  const loadJobs = useJobsStore((s) => s.loadJobs);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadJobs();
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [headerAnim, loadJobs]);

  const headerOpacity = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const headerY = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] });

  const trimmed = query.trim().toLowerCase();
  const [displayJobs, setDisplayJobs] = useState<WorkerJob[] | null>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setDisplayJobs(null);
      return;
    }
    let alive = true;
    setDisplayJobs(null);
    const t = setTimeout(async () => {
      const fallback = allJobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q.toLowerCase()) ||
          j.category.toLowerCase().includes(q.toLowerCase()) ||
          j.location.toLowerCase().includes(q.toLowerCase()) ||
          j.employerName.toLowerCase().includes(q.toLowerCase())
      );
      try {
        const results = await getJobs({ q });
        if (alive) setDisplayJobs(results.length ? results.map(toWorkerJob) : []);
      } catch {
        if (alive) setDisplayJobs(fallback);
      }
    }, 400);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query, allJobs]);

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFFFFF', '#F8FAFC', '#F8FAFC']}
      locations={[0, 0.34, 0.66, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Search header */}
        <Animated.View
          style={[
            styles.searchRow,
            { opacity: headerOpacity, transform: [{ translateY: headerY }] },
          ]}
        >
          <ScalePress onPress={() => router.back()} style={styles.backBtn} scaleTo={0.9}>
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </ScalePress>

          <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
            <View style={styles.iconChip}>
              <Ionicons name="search" size={16} color="#475569" />
            </View>
            <TextInput
              placeholder="Search jobs, categories, location..."
              placeholderTextColor={Colors.textMuted}
              value={query}
              onChangeText={setQuery}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoFocus
              style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
              returnKeyType="search"
              selectionColor={Colors.primary}
              underlineColorAndroid="transparent"
              {...({ enableFocusRing: false } as any)}
            />
            {query.length > 0 ? (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={8} activeOpacity={0.6}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {trimmed === '' ? (
            <>
              {/* Popular searches */}
              <FadeSlide delay={180}>
                <View style={styles.section}>
                  <SectionTitle>Popular Searches</SectionTitle>
                  <View style={styles.chipRow}>
                    {POPULAR.map((tag) => (
                      <ScalePress
                        key={tag}
                        scaleTo={0.92}
                        style={styles.chip}
                        onPress={() => setQuery(tag)}
                      >
                        <Text variant="bodySm" weight="medium" color="#334155">
                          {tag}
                        </Text>
                      </ScalePress>
                    ))}
                  </View>
                </View>
              </FadeSlide>

              {/* Recent searches */}
              <FadeSlide delay={260}>
                <View style={styles.section}>
                  <SectionTitle>Recent Searches</SectionTitle>
                  <View style={styles.chipRow}>
                    {RECENT.map((tag) => (
                      <ScalePress
                        key={tag}
                        scaleTo={0.92}
                        style={styles.chip}
                        onPress={() => setQuery(tag)}
                      >
                        <Text variant="bodySm" weight="medium" color="#334155">
                          {tag}
                        </Text>
                      </ScalePress>
                    ))}
                  </View>
                </View>
              </FadeSlide>

              {/* Category tiles */}
              <FadeSlide delay={340}>
                <View style={styles.section}>
                  <SectionTitle>Browse Categories</SectionTitle>
                  <View style={styles.catGrid}>
                    {SEARCH_CATEGORIES.map((c) => (
                      <ScalePress
                        key={c.label}
                        scaleTo={0.94}
                        style={styles.catTile}
                        onPress={() => setQuery(c.label)}
                      >
                        <View style={styles.catIconChip}>
                          <Ionicons name={c.icon as any} size={19} color="#0F172A" />
                        </View>
                        <Text variant="bodySm" weight="semibold" color="#334155" style={styles.catTileText}>
                          {c.label}
                        </Text>
                      </ScalePress>
                    ))}
                  </View>
                </View>
              </FadeSlide>
            </>
          ) : (
            <FadeSlide delay={80}>
              {displayJobs === null ? (
                <Text variant="bodySm" color={Colors.textSecondary} style={styles.resultsHeader}>
                  Searching for "{query}"…
                </Text>
              ) : (
                <Text variant="bodySm" color={Colors.textSecondary} style={styles.resultsHeader}>
                  {displayJobs.length} result{displayJobs.length === 1 ? '' : 's'} for "{query}"
                </Text>
              )}

              {displayJobs === null ? (
                <SkeletonJobCard count={2} />
              ) : displayJobs.length === 0 ? (
                <View style={styles.empty}>
                  <View style={styles.emptyIcon}>
                    <Ionicons name="search-outline" size={30} color="#94A3B8" />
                  </View>
                  <Text variant="body" weight="semibold" color="#0F172A" style={styles.emptyTitle}>
                    No results found
                  </Text>
                  <Text variant="caption" color={Colors.textMuted}>
                    Try a different keyword or location.
                  </Text>
                </View>
              ) : (
                <View style={styles.resultsList}>
                  {displayJobs.map((job, index) => (
                    <FadeSlide key={job.id} delay={90 + index * 70}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() =>
                          router.push({ pathname: '/(worker)/job-detail', params: { jobId: job.id } })
                        }
                        style={styles.jobCard}
                      >
                        <View style={styles.jobTop}>
                          <View style={styles.jobTitleCol}>
                            <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1}>
                              {job.title}
                            </Text>
                            <Text variant="caption" color={Colors.textSecondary} style={styles.jobLocation}>
                              {job.category} · {job.location} ({job.distance})
                            </Text>
                          </View>
                          <View style={styles.salaryBadge}>
                            <Text variant="body" weight="heavy" color="#0F172A" style={styles.salaryText}>
                              {job.salary}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.jobMetaRow}>
                          <View style={styles.metaLeft}>
                            <Ionicons name="calendar-outline" size={13} color="#94A3B8" />
                            <Text variant="bodySm" color={Colors.textSecondary}>
                              {job.date} · {job.timing}
                            </Text>
                          </View>
                          <View style={styles.ratingPill}>
                            <Ionicons name="star" size={12} color="#F59E0B" />
                            <Text variant="bodySm" weight="bold" color="#0F172A">
                              {job.employerRating.replace(' Rating', '')}
                            </Text>
                          </View>
                        </View>

                        {(job.foodProvided || job.transportProvided) && (
                          <View style={styles.amenityRow}>
                            {job.foodProvided ? (
                              <View style={styles.amenity}>
                                <Ionicons name="restaurant-outline" size={12} color="#475569" />
                                <Text variant="caption" weight="semibold" color="#475569">
                                  Food
                                </Text>
                              </View>
                            ) : null}
                            {job.transportProvided ? (
                              <View style={styles.amenity}>
                                <Ionicons name="bus-outline" size={12} color="#475569" />
                                <Text variant="caption" weight="semibold" color="#475569">
                                  Transport
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        )}
                      </TouchableOpacity>
                    </FadeSlide>
                  ))}
                </View>
              )}
            </FadeSlide>
          )}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  inputWrap: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  inputWrapFocused: {
    borderColor: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  iconChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 0,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
  },
  section: {
    marginBottom: Spacing.lg + 4,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  kicker: {
    letterSpacing: 1.4,
  },
  headRule: {
    flex: 1,
    height: 1,
    backgroundColor: '#EDF2F7',
    marginLeft: Spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.round,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  catTile: {
    width: '31.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: Spacing.sm + 4,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  catIconChip: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  catTileText: {
    marginBottom: 2,
  },
  resultsHeader: {
    marginBottom: Spacing.md,
  },
  resultsList: {
    gap: Spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    marginBottom: 4,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    padding: Spacing.md + 4,
  },
  jobTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobTitleCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  jobLocation: {
    marginTop: 2,
  },
  salaryBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
  },
  salaryText: {
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: Spacing.sm,
  },
  jobMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF9EC',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  amenityRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  amenity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
});