import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text, Card } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { Colors, Spacing } from '../../src/constants/theme';

const PRIVACY_SECTIONS = [
  { title: 'Data we collect', body: 'Profile details, device info, job/application history and location (only while choosing your work area).' },
  { title: 'How it is used', body: 'To match you with nearby jobs, process payouts, and keep the platform safe.' },
  { title: 'What we never do', body: 'We never sell your personal data. Your location is never shared with employers without action.' },
  { title: 'Payouts', body: 'Bank/UPI details are used only to transfer your earnings and are stored securely.' },
];

const TERMS_SECTIONS = [
  { title: 'Your commitment', body: 'Attend jobs you accept on time and complete them to the employer’s reasonable standards.' },
  { title: 'Payouts', body: 'Earnings are credited the same evening after a job is marked complete and rated.' },
  { title: 'Cancellations', body: 'Free cancellation till 9 PM the day before the job. Repeated late cancels may lower your rating.' },
  { title: 'Safety', body: 'Never pay any employer a deposit or fee. Report workplace issues via Help & Support.' },
  { title: 'Account integrity', body: 'One account per person. Creating fake bookings or ratings can lead to account suspension.' },
];

export default function LegalScreen() {
  const { page } = useLocalSearchParams<{ page?: string }>();
  const isPrivacy = page !== 'terms';

  if (usePageLoading()) return <ScreenSkeleton variant="form" />;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Card padding="lg" style={styles.intro}>
        <Text variant="body" color={Colors.textSecondary}>
          {isPrivacy
            ? 'Last updated: 1 September 2026. This policy explains how Gigro handles your information.'
            : 'Last updated: 1 September 2026. These terms govern your use of the Gigro worker app.'}
        </Text>
      </Card>

      {(isPrivacy ? PRIVACY_SECTIONS : TERMS_SECTIONS).map((section) => (
        <Card key={section.title} variant="flat" padding="lg" style={styles.section}>
          <Text variant="body" weight="bold" color="#0F172A" style={styles.sectionTitle}>
            {section.title}
          </Text>
          <Text variant="bodySm" color={Colors.textSecondary}>
            {section.body}
          </Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: 60,
    backgroundColor: Colors.background,
  },
  intro: {
    marginBottom: Spacing.md,
  },
  section: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: 4,
  },
});