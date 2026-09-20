import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Button } from '../../src/components/ui';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { usePaymentsStore, formatINR } from '../../src/store/paymentsStore';

export default function WorkerPaymentScreen() {
  const { paymentId } = useLocalSearchParams<{ paymentId: string }>();
  const payment = usePaymentsStore((s) => s.payments.find((p) => p.id === paymentId));

  if (!payment) {
    return (
      <View style={styles.fallback}>
        <Ionicons name="wallet-outline" size={30} color="#94A3B8" />
        <Text variant="body" weight="semibold" color={Colors.textSecondary} style={styles.fallbackText}>
          Payment not found.
        </Text>
      </View>
    );
  }

  const isPaid = payment.status === 'PAID';

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {isPaid ? (
        <>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={30} color="#FFFFFF" weight="bold" />
          </View>
          <Text variant="h3" weight="bold" color="#0F172A" align="center">
            Payment received
          </Text>
          <Text variant="caption" color={Colors.textMuted} align="center" style={styles.receiptSub}>
            Credited to your wallet
          </Text>

          <View style={styles.amountRowCenter}>
            <Text variant="body" weight="medium" color={Colors.textSecondary}>₹</Text>
            <Text variant="h1" weight="heavy" color="#0F172A" style={styles.amount}>
              {payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.detailCard}>
            <ReceiptRow label="From" value={payment.employerName} icon="business-outline" />
            <ReceiptRow label="Job" value={payment.title} icon="briefcase" />
            <ReceiptRow label="Method" value={payment.method} icon="shield-checkmark" />
            <ReceiptRow label="Ref no" value={payment.txnId ?? '—'} icon="document-text-outline" />
            <ReceiptRow
              label="Received on"
              value={new Date(payment.paidAt ?? payment.createdAt).toLocaleString('en-IN')}
              icon="calendar-outline"
              last
            />
          </View>

          <View style={styles.statusRow}>
            <View style={styles.status}>
              <View style={[styles.statusDot, { backgroundColor: '#16A34A' }]} />
              <Text variant="caption" weight="semibold" color={Colors.textSecondary}>
                Paid
              </Text>
            </View>
          </View>

          <View style={styles.noteRow}>
            <Ionicons name="bulb-outline" size={14} color="#94A3B8" />
            <Text variant="caption" color={Colors.textSecondary} style={styles.noteText}>
              Money is now in your Gigro wallet. You can withdraw it to UPI anytime.
            </Text>
          </View>

          <Button title="Done" size="lg" fullWidth onPress={() => router.back()} style={styles.doneBtn} />
        </>
      ) : (
        <>
          <View style={[styles.actionIcon, { backgroundColor: '#FFFBEB' }]}>
            <Ionicons name="time-outline" size={28} color="#D97706" />
          </View>
          <Text variant="h3" weight="bold" color="#0F172A" align="center">
            Payment on the way
          </Text>
          <Text variant="caption" color={Colors.textMuted} align="center" style={styles.receiptSub}>
            {payment.employerName} will release the amount once they confirm completion.
          </Text>

          <View style={styles.amountRowCenter}>
            <Text variant="body" weight="medium" color={Colors.textSecondary}>₹</Text>
            <Text variant="h1" weight="heavy" color="#0F172A" style={styles.amount}>
              {payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.detailCard}>
            <ReceiptRow label="Employer" value={payment.employerName} icon="business-outline" />
            <ReceiptRow label="Job" value={payment.title} icon="briefcase" />
            <ReceiptRow
              label="Requested on"
              value={new Date(payment.createdAt).toLocaleString('en-IN')}
              icon="calendar-outline"
              last
            />
          </View>

          <View style={styles.statusRow}>
            <View style={styles.status}>
              <View style={[styles.statusDot, { backgroundColor: '#D97706' }]} />
              <Text variant="caption" weight="semibold" color={Colors.textSecondary}>
                Pending
              </Text>
            </View>
          </View>

          <View style={styles.noteRow}>
            <Ionicons name="bulb-outline" size={14} color="#94A3B8" />
            <Text variant="caption" color={Colors.textSecondary} style={styles.noteText}>
              Payment is released automatically once the employer marks the gig complete and pays from the Bookings screen.
            </Text>
          </View>

          <Button
            title="Back to bookings"
            size="lg"
            fullWidth
            variant="outline"
            onPress={() => router.back()}
            style={styles.doneBtn}
          />
        </>
      )}
    </ScrollView>
  );
}

function ReceiptRow({
  label,
  value,
  icon,
  last,
}: {
  label: string;
  value: string;
  icon: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.receiptRow, last && { borderBottomWidth: 0 }]}>
      <View style={styles.receiptRowLeft}>
        <Ionicons name={icon} size={14} color="#94A3B8" />
        <Text variant="bodySm" color={Colors.textSecondary} style={styles.receiptLabel}>
          {label}
        </Text>
      </View>
      <Text variant="bodySm" weight="bold" color="#0F172A" numberOfLines={1} style={styles.receiptValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: 60,
    backgroundColor: Colors.background,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  fallbackText: {
    marginTop: Spacing.sm,
  },
  successIcon: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  actionIcon: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  receiptSub: {
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  amountRowCenter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  amount: {
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  receiptRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  receiptLabel: {
    marginLeft: 2,
  },
  receiptValue: {
    maxWidth: '58%',
    textAlign: 'right',
  },
  statusRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  noteText: {
    flex: 1,
    lineHeight: 18,
  },
  doneBtn: {
    marginTop: Spacing.xs,
  },
});