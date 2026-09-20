import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { FadeSlide } from '../../src/components/AppHeader';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';

const PILLARS = [
  { icon: 'location-outline', title: 'Work near you', body: 'Local gigs matched to your area and skills.' },
  { icon: 'wallet-outline', title: 'Paid the same day', body: 'Shift ends. Rate is released. No waiting.' },
  { icon: 'shield-checkmark-outline', title: 'Build reputation', body: 'Ratings and reviews follow you across gigs.' },
];

export default function AboutScreen() {
  if (usePageLoading()) return <ScreenSkeleton variant="form" />;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <FadeSlide>
        <View style={styles.headRow}>
          <Text variant="caption" weight="bold" color="#94A3B8" style={styles.kicker}>
            ABOUT GIGRO
          </Text>
          <Text variant="caption" color={Colors.textMuted}>
            v1.0.0
          </Text>
        </View>
        <View style={styles.headRule} />
      </FadeSlide>

      {/* Brand hero */}
      <FadeSlide delay={60}>
        <View style={styles.hero}>
          <Text variant="h1" weight="heavy" color="#0F172A" style={styles.appTitle}>
            Gigro
          </Text>
          <Text variant="bodySm" color={Colors.textSecondary} style={styles.tagline}>
            Work near you. Get paid same day.
          </Text>
          <View style={styles.sinceBadge}>
            <Text variant="caption" weight="semibold" color="#334155">
              Made in Chennai · 2026
            </Text>
          </View>
        </View>
      </FadeSlide>

      {/* What it is */}
      <FadeSlide delay={120}>
        <View style={styles.copyCol}>
          <Text variant="caption" weight="bold" color="#94A3B8" style={styles.sectionLabel}>
            WHAT IS GIGRO
          </Text>
          <Text variant="body" color="#334155" style={styles.copy}>
            Gigro connects workers with nearby one-day and event gigs, and helps employers hire fast for
            hand-to-mouth staffing needs.
          </Text>
          <Text variant="body" color="#334155" style={styles.copy}>
            No long-term contracts. Apply in one tap, get accepted, work, and get paid — the same day.
          </Text>
        </View>
      </FadeSlide>

      {/* Pillars */}
      <FadeSlide delay={180}>
        <View style={styles.copyCol}>
          <Text variant="caption" weight="bold" color="#94A3B8" style={styles.sectionLabel}>
            HOW IT WORKS
          </Text>
          <View style={styles.pillarCard}>
            {PILLARS.map((p, i) => (
              <View key={p.title}>
                <View style={styles.pillarRow}>
                  <View style={styles.pillarIcon}>
                    <Ionicons name={p.icon as any} size={16} color="#0F172A" />
                  </View>
                  <View style={styles.pillarBody}>
                    <Text variant="bodySm" weight="bold" color="#0F172A">
                      {p.title}
                    </Text>
                    <Text variant="caption" color={Colors.textSecondary} style={styles.pillarText}>
                      {p.body}
                    </Text>
                  </View>
                  {i < PILLARS.length - 1 ? <View style={styles.dot} /> : null}
                </View>
                {i < PILLARS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
      </FadeSlide>

      {/* App info */}
      <FadeSlide delay={240}>
        <View style={styles.copyCol}>
          <Text variant="caption" weight="bold" color="#94A3B8" style={styles.sectionLabel}>
            APP INFO
          </Text>
          <View style={styles.infoCard}>
            {[
              { label: 'Version', value: '1.0.0' },
              { label: 'Build', value: 'Expo SDK 52' },
              { label: 'Platform', value: 'iOS · Android · Web' },
              { label: 'Made by', value: 'WorkGo Team' },
            ].map((row, i) => (
              <View key={row.label} style={[styles.row, i === 3 && styles.rowLast]}>
                <Text variant="bodySm" color={Colors.textSecondary}>
                  {row.label}
                </Text>
                <Text variant="bodySm" weight="bold" color="#0F172A">
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </FadeSlide>

      <FadeSlide delay={300}>
        <Text variant="caption" color={Colors.textMuted} style={styles.footer}>
          Built with care for India's gig workers.
        </Text>
      </FadeSlide>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: 60,
    backgroundColor: Colors.background,
  },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  kicker: {
    letterSpacing: 1.4,
  },
  headRule: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginBottom: Spacing.lg,
  },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
  },
  appTitle: {
    letterSpacing: -0.4,
    marginBottom: 4,
    fontSize: 30,
  },
  tagline: {
    marginBottom: Spacing.md,
  },
  sinceBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },
  copyCol: {
    marginBottom: Spacing.lg + 4,
  },
  sectionLabel: {
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  copy: {
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },
  pillarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.xs + 2,
  },
  pillarRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
  },
  pillarIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  pillarBody: {
    flex: 1,
    marginTop: 2,
  },
  pillarText: {
    lineHeight: 17,
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    marginLeft: Spacing.sm,
    marginTop: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 46,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  footer: {
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});