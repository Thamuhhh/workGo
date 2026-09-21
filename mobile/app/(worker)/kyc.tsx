import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Card, Button } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useWalletStore } from '../../src/store/walletStore';

export default function KycScreen() {
  const user = useAuthStore((s) => s.user);
  const upiId = useWalletStore((s) => s.upiId);

  const docs = [
    { icon: 'business-outline', title: 'Aadhaar Card', meta: 'Not required for gig jobs', status: 'Optional', verified: false },
    { icon: 'bank', title: 'Bank Account (UPI)', meta: upiId ? upiId : 'Not linked yet', status: upiId ? 'Verified' : 'Pending', verified: Boolean(upiId) },
    { icon: 'phone', title: 'Mobile Number', meta: user?.phone ? `+91 ${user.phone}` : 'Not set', status: user?.phone ? 'Verified' : 'Pending', verified: Boolean(user?.phone) },
    { icon: 'location-outline', title: 'Address', meta: user?.location?.city || user?.location?.address || 'Not added', status: user?.location?.city || user?.location?.address ? 'Verified' : 'Pending', verified: Boolean(user?.location?.city || user?.location?.address) },
    { icon: 'person-outline', title: 'PAN Card', meta: 'Not submitted', status: 'Pending', verified: false },
  ];

  const done = docs.filter((d) => d.verified).length;
  const pct = Math.round((done / docs.length) * 100);

  if (usePageLoading()) return <ScreenSkeleton variant="form" />;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Card padding="lg" style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={styles.heroIcon}>
            <Ionicons name="shield-checkmark" size={22} color="#16A34A" />
          </View>
          <View style={styles.heroCol}>
            <Text variant="h3" weight="bold" color="#0F172A">
              {done === docs.length ? 'All set!' : 'Identity verified'}
            </Text>
            <Text variant="bodySm" color={Colors.textSecondary}>
              {done === docs.length
                ? 'Your profile is complete. You are ready for work.'
                : `${done} of ${docs.length} documents verified · ${pct}% complete.`}
            </Text>
          </View>
        </View>
      </Card>

      <Text variant="caption" weight="bold" color={Colors.textMuted} style={styles.sectionLabel}>
        DOCUMENTS
      </Text>
      <Card padding="sm" variant="flat" style={styles.docCard}>
        {docs.map((doc, index) => (
          <TouchableOpacity key={doc.title} activeOpacity={0.7}>
            <View style={[styles.docRow, index === docs.length - 1 && styles.docRowLast]}>
              <View style={[styles.docIcon, doc.verified && styles.docIconDone]}>
                <Ionicons
                  name={doc.icon}
                  size={18}
                  color={doc.verified ? '#16A34A' : '#64748B'}
                />
              </View>
              <View style={styles.docCol}>
                <Text variant="body" weight="semibold" color="#0F172A">
                  {doc.title}
                </Text>
                <Text variant="caption" color={Colors.textMuted}>
                  {doc.meta}
                </Text>
              </View>
              <View style={[styles.statusChip, doc.verified && styles.statusChipDone]}>
                <Text variant="caption" weight="bold" color={doc.verified ? '#16A34A' : '#F59E0B'}>
                  {doc.status}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </Card>

      <Button
        title="Start verification"
        size="lg"
        fullWidth
        onPress={() => {}}
        style={styles.cta}
        textStyle={{ color: Colors.textSecondary }}
        variant="outline"
      />
      <Text variant="caption" color={Colors.textMuted} align="center" style={styles.note}>
        Your verification status is matched against the details on your registered profile.
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
  heroCard: {
    marginBottom: Spacing.lg,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  heroCol: {
    flex: 1,
  },
  sectionLabel: {
    letterSpacing: 0.6,
    marginBottom: Spacing.sm,
  },
  docCard: {
    marginBottom: Spacing.lg,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  docRowLast: {
    borderBottomWidth: 0,
  },
  docIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  docIconDone: {
    backgroundColor: '#E6F9EC',
  },
  docCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusChip: {
    backgroundColor: '#FFFBEB',
    borderRadius: BorderRadius.round,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  statusChipDone: {
    backgroundColor: '#E6F9EC',
  },
  cta: {
    marginBottom: Spacing.md,
  },
  note: {
    opacity: 0.8,
  },
});