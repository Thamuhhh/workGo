import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Stack } from 'expo-router';
import { Text, Button } from '../../src/components/ui';
import { FadeSlide } from '../../src/components/AppHeader';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useReviewApplicantsStore } from '../../src/store/reviewApplicantsStore';

interface DetailRow {
  label: string;
  value: string;
}

export default function EmployerBusinessDetailsScreen() {
  const user = useAuthStore((s) => s.user);
  const applicants = useReviewApplicantsStore((s) => s.applicants);

  const rows: DetailRow[] = [
    { label: 'Business name', value: user?.businessName || user?.name || '—' },
    { label: 'Mobile', value: `+91 ${user?.phone || '—'}` },
    { label: 'Business type', value: user?.businessType || 'Service provider' },
    { label: 'Default UPI', value: 'you@upi' },
    { label: 'Verification', value: 'Verified · shield' },
  ];

  const stats = [
    { value: applicants.length, label: 'Applicants' },
    { value: '4.9★', label: 'Rating' },
    { value: '100%', label: 'Response' },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Business Details' }} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <FadeSlide>
          <View style={styles.headRow}>
            <Text variant="caption" weight="bold" color="#94A3B8" style={styles.kicker}>
              BUSINESS
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              hitSlop={6}
            >
              <Ionicons name="close" size={20} color="#475569" />
            </TouchableOpacity>
          </View>
          <View style={styles.headRule} />
        </FadeSlide>

        <FadeSlide delay={60}>
          <View style={styles.hero}>
            <View style={styles.avatar}>
              <Text variant="h1" weight="heavy" color="#0F172A">
                {(user?.businessName || user?.name || 'B').charAt(0)}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="h2" weight="bold" color="#0F172A" numberOfLines={1}>
                {user?.businessName || user?.name || 'My Business'}
              </Text>
              <View style={styles.verifiedChip}>
                <Ionicons name="shield-checkmark" size={12} color="#0F9D58" />
                <Text variant="caption" weight="semibold" color="#0F9D58">
                  Verified Business
                </Text>
              </View>
            </View>
          </View>
        </FadeSlide>

        <FadeSlide delay={100}>
          <View style={styles.statsRow}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statBlock}>
                <Text variant="h3" weight="bold" color="#0F172A">
                  {s.value}
                </Text>
                <Text variant="caption" color={Colors.textMuted}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        </FadeSlide>

        <FadeSlide delay={140}>
          <View style={styles.card}>
            {rows.map((row, index) => (
              <View
                key={row.label}
                style={[styles.detailRow, index === rows.length - 1 && styles.lastRow]}
              >
                <Text variant="bodySm" color={Colors.textSecondary}>
                  {row.label}
                </Text>
                <Text variant="bodySm" weight="bold" color="#0F172A" numberOfLines={1} style={{ flex: 1, textAlign: 'right' }}>
                  {row.value}
                </Text>
              </View>
            ))}
          </View>
        </FadeSlide>

        <Button
          title="Edit details"
          variant="outline"
          size="md"
          fullWidth
          onPress={() => router.back()}
          style={{ marginTop: Spacing.md }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: Spacing.lg,
    paddingBottom: 48,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
});