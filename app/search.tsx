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
import { Text, Badge, Card } from '../src/components/ui';
import { FadeSlide, ScalePress } from '../src/components/AppHeader';
import { Colors, Spacing, BorderRadius } from '../src/constants/theme';

const POPULAR = ['Wedding', 'Catering', 'Promoter', 'Cleaner', 'MC/Anchor', 'Coordinator'];

const RECENT = ['Catering Staff', 'Event Setup'];

const MOCK_JOBS = [
  {
    id: '1',
    title: 'Wedding Catering Staff',
    category: 'Catering',
    location: 'Kanchipuram',
    salary: '₹900 / day',
    food: true,
    transport: true,
  },
  {
    id: '2',
    title: 'Event Booth Promoter',
    category: 'Promoter',
    location: 'Trade Centre',
    salary: '₹1,000 / day',
    food: true,
    transport: true,
  },
  {
    id: '3',
    title: 'Banquet Cleaning Staff',
    category: 'Cleaner',
    location: 'Gandhi Road',
    salary: '₹850 / day',
    food: true,
    transport: false,
  },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const headerAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [headerAnim]);

  const headerOpacity = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const headerY = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] });

  const trimmed = query.trim().toLowerCase();
  const results = trimmed
    ? MOCK_JOBS.filter(
        (j) =>
          j.title.toLowerCase().includes(trimmed) ||
          j.category.toLowerCase().includes(trimmed) ||
          j.location.toLowerCase().includes(trimmed)
      )
    : [];

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFFFFF', '#F8FAFC', '#F8FAFC']}
      locations={[0, 0.34, 0.66, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Animated Search Header */}
        <Animated.View
          style={[
            styles.searchRow,
            { opacity: headerOpacity, transform: [{ translateY: headerY }] },
          ]}
        >
          <ScalePress onPress={() => router.back()} style={styles.backBtn} scaleTo={0.9}>
            <Ionicons name="chevron-back" size={22} color={Colors.secondary} />
          </ScalePress>

          <View style={styles.inputWrap}>
            <LinearGradient
              colors={['#3E4E7A', '#1C274C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconChip}
            >
              <Ionicons name="search" size={15} color="#FFFFFF" />
            </LinearGradient>
            <TextInput
              placeholder="Search jobs, categories, location..."
              placeholderTextColor={Colors.textMuted}
              value={query}
              onChangeText={setQuery}
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
                  <Text variant="h3" weight="bold" color={Colors.secondary} style={styles.sectionTitle}>
                    Popular Searches
                  </Text>
                  <View style={styles.chipRow}>
                    {POPULAR.map((tag) => (
                      <ScalePress
                        key={tag}
                        scaleTo={0.9}
                        style={styles.chip}
                        onPress={() => setQuery(tag)}
                      >
                        <Text variant="bodySm" weight="medium" color={Colors.textSecondary}>
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
                  <Text variant="h3" weight="bold" color={Colors.secondary} style={styles.sectionTitle}>
                    Recent Searches
                  </Text>
                  <View style={styles.chipRow}>
                    {RECENT.map((tag) => (
                      <ScalePress
                        key={tag}
                        scaleTo={0.9}
                        style={styles.chip}
                        onPress={() => setQuery(tag)}
                      >
                        <Ionicons name="time-outline" size={14} color={Colors.textMuted} style={styles.timeIcon} />
                        <Text variant="bodySm" weight="medium" color={Colors.textSecondary}>
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
                  <Text variant="h3" weight="bold" color={Colors.secondary} style={styles.sectionTitle}>
                    Browse Categories
                  </Text>
                  <View style={styles.catGrid}>
                    {['Catering', 'Promoter', 'Cleaning', 'MC/Anchor', 'Coordinator', 'Other'].map(
                      (c) => (
                        <ScalePress
                          key={c}
                          scaleTo={0.92}
                          style={styles.catTile}
                          onPress={() => setQuery(c)}
                        >
                          <Ionicons name="grid-outline" size={18} color={Colors.primaryDark} />
                          <Text variant="bodySm" weight="medium" color={Colors.textSecondary} style={styles.catTileText}>
                            {c}
                          </Text>
                        </ScalePress>
                      )
                    )}
                  </View>
                </View>
              </FadeSlide>
            </>
          ) : (
            <FadeSlide delay={80}>
              <View style={styles.resultsHeader}>
                <Text variant="bodySm" color={Colors.textSecondary}>
                  {results.length} result{results.length === 1 ? '' : 's'} for "{query}"
                </Text>
              </View>

              {results.length === 0 ? (
                <View style={styles.empty}>
                  <Ionicons name="search-outline" size={42} color={Colors.borderDark} />
                  <Text variant="body" weight="semibold" color={Colors.textSecondary} style={styles.emptyTitle}>
                    No results found
                  </Text>
                  <Text variant="caption" color={Colors.textMuted}>
                    Try a different keyword or location.
                  </Text>
                </View>
              ) : (
                results.map((job) => (
                  <Card
                    key={job.id}
                    padding="lg"
                    style={styles.jobCard}
                  >
                    <View style={styles.jobCardTop}>
                      <View style={styles.jobTitleCol}>
                        <Text variant="h3" weight="bold" color="#0F172A">
                          {job.title}
                        </Text>
                        <Text variant="bodySm" color={Colors.textSecondary} style={styles.jobLocation}>
                          {job.category} • {job.location}
                        </Text>
                      </View>
                      <View style={styles.salaryBadge}>
<Text variant="body" weight="heavy" color={Colors.primary}>
                           {job.salary}
                         </Text>
                      </View>
                    </View>
                    <View style={styles.badgeRow}>
                      {job.food ? (
                        <Badge label="Food Provided" variant="success" size="sm" style={styles.amenityBadge} />
                      ) : null}
                      {job.transport ? (
                        <Badge label="Transport Provided" variant="info" size="sm" style={styles.amenityBadge} />
                      ) : null}
                    </View>
                  </Card>
                ))
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
    marginBottom: Spacing.md,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  inputWrap: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1.5,
    borderColor: '#1C274C',
    shadowColor: '#1C274C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  iconChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 17,
    marginBottom: Spacing.md,
    letterSpacing: -0.3,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.round,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  timeIcon: {
    marginRight: 5,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  catTile: {
    width: '30%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  catTileText: {
    marginTop: 6,
    textAlign: 'center',
  },
  resultsHeader: {
    marginBottom: Spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginVertical: Spacing.sm,
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
  jobLocation: {
    marginTop: 2,
  },
  salaryBadge: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
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
});