import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Card, Button, SkeletonJobCard } from '../../src/components/ui';
import { FadeSlide } from '../../src/components/AppHeader';
import { SAMPLE_JOBS } from '../../src/data/sampleJobs';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';

export default function CategoryJobsScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const category = typeof params.category === 'string' ? params.category : '';

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, [category]);

  const jobs = category
    ? SAMPLE_JOBS.filter((j) => j.category.toLowerCase() === category.toLowerCase())
    : SAMPLE_JOBS;

  return (
    <>
      <Stack.Screen options={{ title: category ? `${category} Jobs` : 'All Jobs' }} />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <FadeSlide delay={80}>
            <View style={styles.headerRow}>
              <Text variant="body" color={Colors.textSecondary}>
                {jobs.length} job{jobs.length === 1 ? '' : 's'} available
              </Text>
              <Button
                title="Filters"
                size="sm"
                variant="outline"
                onPress={() => {}}
              />
            </View>
          </FadeSlide>

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
              jobs.map((job) => (
                <Card
                  key={job.id}
                  padding="lg"
                  style={styles.jobCard}
                  onPress={() =>
                    router.push({ pathname: '/(worker)/job-detail', params: { jobId: job.id } })
                  }
                >
                  <View style={styles.jobCardTop}>
                    <View style={styles.jobTitleCol}>
                      <Text variant="h3" weight="bold" color="#0F172A">
                        {job.title}
                      </Text>
                      <Text variant="bodySm" color="#64748B" style={styles.categoryTag}>
                        {job.category} • {job.location} ({job.distance})
                      </Text>
                    </View>
                    <View style={styles.salaryBadge}>
                      <Text variant="body" weight="heavy" color={Colors.primary}>
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
                      <Text variant="bodySm" weight="bold" color={Colors.primaryDark}>
                        {job.employerRating.replace(' Rating', '')}
                      </Text>
                    </View>
                  </View>

                  <Button
                    title="Apply for Job"
                    size="md"
                    fullWidth
                    onPress={() =>
                      router.push({ pathname: '/(worker)/job-detail', params: { jobId: job.id } })
                    }
                    style={styles.applyBtn}
                  />
                </Card>
              ))
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
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
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
    backgroundColor: '#EEF2FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
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
  applyBtn: {
    marginTop: Spacing.sm,
  },
});