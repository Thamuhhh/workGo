import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Card } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';

const FAQS = [
  { q: 'When do I get paid?', a: 'Payouts hit your wallet the same evening after the employer marks the job complete.' },
  { q: 'Can I cancel after applying?', a: 'Yes — cancel for free till 9 PM the day before the job. Late cancels affect your rating.' },
  { q: 'Is there any fee to join?', a: 'No. Gigro never asks workers for joining fees or deposits.' },
  { q: 'How does my rating work?', a: 'Employers rate you after each completed job. Only completed jobs count toward your average.' },
  { q: 'What if the employer doesn’t pay?', a: 'Report the job in Help & Support and our team follows up on your behalf.' },
];

export default function HelpScreen() {
  const [open, setOpen] = useState<number | null>(0);

  if (usePageLoading()) return <ScreenSkeleton variant="form" />;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Card padding="lg" style={styles.contactCard}>
        <View style={styles.contactRow}>
          <View style={styles.contactIcon}>
            <Ionicons name="call-outline" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.contactCol}>
            <Text variant="body" weight="bold" color="#FFFFFF">
              Need urgent help?
            </Text>
            <Text variant="caption" color="#BFDBFE">
              Mon–Sat, 9 AM – 8 PM
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.callBtn}
            onPress={() => Alert.alert('Call support', 'Calling 1800-123-4567… (demo)')}
          >
            <Text variant="bodySm" weight="bold" color={Colors.primaryDark}>
              Call now
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Text variant="caption" weight="bold" color={Colors.textMuted} style={styles.sectionLabel}>
        FREQUENTLY ASKED
      </Text>
      <View style={styles.faqList}>
        {FAQS.map((faq, index) => {
          const isOpen = open === index;
          return (
            <Card key={faq.q} variant="flat" padding="md" style={styles.faqCard}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setOpen(isOpen ? null : index)}
              >
                <View style={styles.faqRow}>
                  <Text variant="body" weight="semibold" color="#0F172A" style={styles.faqQ}>
                    {faq.q}
                  </Text>
                  <Ionicons
                    name={isOpen ? 'chevron-down' : 'chevron-forward'}
                    size={16}
                    color="#94A3B8"
                  />
                </View>
                {isOpen && (
                  <Text variant="bodySm" color={Colors.textSecondary} style={styles.faqA}>
                    {faq.a}
                  </Text>
                )}
              </TouchableOpacity>
            </Card>
          );
        })}
      </View>

      <Text variant="caption" color={Colors.textMuted} align="center" style={styles.footer}>
        You can also reach us via chat or email at help@gigro.in
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: 60,
    backgroundColor: Colors.background,
  },
  contactCard: {
    backgroundColor: Colors.primary,
    marginBottom: Spacing.lg,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contactCol: {
    flex: 1,
  },
  callBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
  },
  sectionLabel: {
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  faqList: {
    marginBottom: Spacing.lg,
  },
  faqCard: {
    marginBottom: Spacing.sm,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqQ: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  faqA: {
    marginTop: Spacing.sm,
  },
  footer: {
    opacity: 0.75,
  },
});