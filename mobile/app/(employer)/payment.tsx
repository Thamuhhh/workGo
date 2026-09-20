import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Button } from '../../src/components/ui';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { usePaymentsStore, formatINR } from '../../src/store/paymentsStore';

const UPI_APPS = [
  { id: 'gpay', label: 'GPay', color: '#1A73E8' },
  { id: 'phonepe', label: 'PhonePe', color: '#5F259F' },
  { id: 'paytm', label: 'Paytm', color: '#00BAF2' },
  { id: 'upi', label: 'UPI ID', color: '#0F172A' },
];

const TEMP_GIG_PIN = '1234';

export default function EmployerPaymentScreen() {
  const { paymentId } = useLocalSearchParams<{ paymentId: string }>();
  const payment = usePaymentsStore((s) => s.payments.find((p) => p.id === paymentId));
  const payPayment = usePaymentsStore((s) => s.payPayment);

  const [method, setMethod] = useState('gpay');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [processing, setProcessing] = useState(false);
  const pinInputRef = useRef<TextInput>(null);

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

  const handlePay = () => {
    if (processing) return;
    if (pin.length !== 4) {
      setPinError('Enter your 4-digit Gig PIN');
      return;
    }
    if (pin !== TEMP_GIG_PIN) {
      setPinError('Wrong Gig PIN — this is your temporary PIN from signup');
      return;
    }
    setPinError('');
    setProcessing(true);
    setTimeout(() => {
      const app = UPI_APPS.find((a) => a.id === method);
      payPayment(payment.id, app?.label ?? 'UPI');
      setProcessing(false);
    }, 800);
  };

  if (isPaid) {
    return (
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={30} color="#FFFFFF" weight="bold" />
        </View>
        <Text variant="h3" weight="bold" color="#0F172A" align="center">
          Payment sent
        </Text>
        <Text variant="caption" color={Colors.textMuted} align="center" style={styles.receiptSub}>
          {formatINR(payment.amount)} to {payment.workerName}
        </Text>

        <View style={styles.detailCard}>
          <ReceiptRow label="Worker" value={payment.workerName} icon="person" />
          <ReceiptRow label="Job" value={payment.title} icon="briefcase" />
          <ReceiptRow label="Amount" value={formatINR(payment.amount)} icon="wallet-outline" />
          <ReceiptRow label="Method" value={payment.method} icon="shield-checkmark" />
          <ReceiptRow label="Ref no" value={payment.txnId ?? '—'} icon="document-text-outline" />
          <ReceiptRow
            label="Paid on"
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

        <Button title="Done" size="lg" fullWidth onPress={() => router.back()} style={styles.doneBtn} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Amount */}
      <View style={styles.amountCard}>
        <Text variant="caption" color={Colors.textMuted}>
          PAY TO
        </Text>
        <Text variant="h3" weight="bold" color="#0F172A" style={styles.worker}>
          {payment.workerName}
        </Text>
        <Text variant="caption" color={Colors.textSecondary} style={styles.job}>
          {payment.title}
        </Text>
        <View style={styles.amountRow}>
          <Text variant="body" weight="medium" color={Colors.textSecondary}>₹</Text>
          <Text variant="h1" weight="heavy" color="#0F172A" style={styles.amount}>
            {payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      {/* Pay via */}
      <Text variant="caption" weight="semibold" color={Colors.textMuted} style={styles.sectionLabel}>
        PAY VIA UPI
      </Text>
      <View style={styles.upiRow}>
        {UPI_APPS.map((a) => {
          const on = method === a.id;
          return (
            <TouchableOpacity
              key={a.id}
              activeOpacity={0.75}
              onPress={() => setMethod(a.id)}
              style={[styles.upiChip, on && styles.upiChipOn]}
            >
              <View style={[styles.upiDot, { backgroundColor: on ? a.color : '#E2E8F0' }]} />
              <Text variant="caption" weight={on ? 'bold' : 'medium'} color={on ? '#0F172A' : Colors.textSecondary}>
                {a.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Gig PIN */}
      <View style={styles.pinLabelRow}>
        <Text variant="caption" weight="semibold" color={Colors.textMuted} style={styles.sectionLabel}>
          GIG PIN
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowPin((v) => !v)}
          hitSlop={8}
          style={styles.toggleBtn}
        >
          <Ionicons name={showPin ? 'eye' : 'eye-off'} size={16} color={showPin ? '#0F172A' : '#94A3B8'} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity activeOpacity={1} style={styles.pinArea} onPress={() => pinInputRef.current?.focus()}>
        <View style={styles.pinRow}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.pinDot,
                i < pin.length && styles.pinDotFilled,
                showPin && i < pin.length && styles.pinDotShow,
              ]}
            >
              {showPin && i < pin.length ? (
                <Text variant="body" weight="bold" color="#0F172A" style={styles.pinDigit}>
                  {pin.charAt(i)}
                </Text>
              ) : i < pin.length ? (
                <View style={styles.pinFilledInner} />
              ) : null}
            </View>
          ))}
        </View>
        <TextInput
          ref={pinInputRef}
          value={pin}
          onChangeText={(t) => {
            setPin(t.replace(/\D/g, '').slice(0, 4));
            setPinError('');
          }}
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry={!showPin}
          autoFocus
          caretHidden={showPin}
          style={styles.pinInput}
        />
      </TouchableOpacity>
      {pinError ? (
        <Text variant="caption" weight="semibold" color="#DC2626" align="center" style={styles.pinHint}>
          {pinError}
        </Text>
      ) : (
        <Text variant="caption" color={Colors.textMuted} align="center" style={styles.pinHint}>
          Temporary Gig PIN from signup · demo: 1234
        </Text>
      )}

      <View style={styles.guardRow}>
        <Ionicons name="shield-checkmark" size={14} color="#94A3B8" />
        <Text variant="caption" color={Colors.textSecondary}>
          Secured by Gigro Payments • 256-bit encrypted
        </Text>
      </View>

      <Button
        title={`Pay ${formatINR(payment.amount)}`}
        size="lg"
        fullWidth
        loading={processing}
        disabled={pin.length !== 4}
        onPress={handlePay}
        style={styles.payBtn}
      />
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
  amountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  worker: {
    marginTop: Spacing.xs,
  },
  job: {
    marginTop: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: Spacing.sm,
  },
  amount: {
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  sectionLabel: {
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  upiRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  upiChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  upiChipOn: {
    borderColor: '#0F172A',
    backgroundColor: '#FAFBFC',
  },
  upiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pinLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  toggleBtn: {
    padding: 4,
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  pinArea: {
    position: 'relative',
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  pinInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
  },
  pinDot: {
    width: 44,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#EDF2F7',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDotFilled: {
    borderColor: '#0F172A',
  },
  pinDotShow: {
    backgroundColor: '#F8FAFC',
  },
  pinDigit: {
    fontSize: 20,
    fontVariant: ['tabular-nums'],
  },
  pinFilledInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0F172A',
  },
  pinHint: {
    marginTop: 2,
  },
  guardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  payBtn: {},
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
  receiptSub: {
    marginTop: 4,
    marginBottom: Spacing.lg,
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
    marginBottom: Spacing.lg,
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
  doneBtn: {
    marginTop: Spacing.xs,
  },
});