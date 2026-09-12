import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Card } from '../../src/components/ui';
import { Colors, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';

interface Txn {
  id: string;
  title: string;
  meta: string;
  amount: string;
  type: 'credit' | 'debit';
}

const TRANSACTIONS: Txn[] = [
  { id: '1', title: 'Catering Helper — Day job', meta: 'Sharon Catering • Today', amount: '+₹800', type: 'credit' },
  { id: '2', title: 'Event Support — Weekend', meta: 'RPS Events • Yesterday', amount: '+₹1,200', type: 'credit' },
  { id: '3', title: 'Instant withdrawal to UPI', meta: 'UPI • 2 days ago', amount: '-₹500', type: 'debit' },
  { id: '4', title: 'Retail Promoter — Store', meta: 'BigMart • 3 days ago', amount: '+₹750', type: 'credit' },
  { id: '5', title: 'Service fee', meta: 'WorkGo • 3 days ago', amount: '-₹20', type: 'debit' },
];

export default function WorkerWalletScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Balance cover */}
      <View style={styles.cover}>
        <View style={styles.coverTop}>
          <View style={styles.walletIcon}>
            <Ionicons name="wallet-outline" size={20} color="#0277F4" />
          </View>
          <Text variant="caption" weight="bold" color="rgba(255,255,255,0.6)">
            AVAILABLE BALANCE
          </Text>
        </View>
        <Text variant="h1" weight="heavy" color="#FFFFFF" style={styles.balance}>
          ₹2,430.00
        </Text>
        <Text variant="caption" color="rgba(255,255,255,0.55)">
          Instant withdrawal • No fees
        </Text>

        <View style={styles.coverActions}>
          <TouchableOpacity activeOpacity={0.85} style={[styles.coverBtn, styles.addBtn]}>
            <Text variant="body" weight="bold" color="#0277F4">
              Add Money
            </Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={[styles.coverBtn, styles.withdrawBtn]}>
            <Text variant="body" weight="bold" color="#FFFFFF">
              Withdraw
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Earnings summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryBlock}>
          <Text variant="h3" weight="bold" color="#0F172A">
            ₹2,750
          </Text>
          <Text variant="caption" color={Colors.textMuted}>
            Earnings (7 days)
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryBlock}>
          <Text variant="h3" weight="bold" color="#0F172A">
            ₹320
          </Text>
          <Text variant="caption" color={Colors.textMuted}>
            Withdrawn
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryBlock}>
          <Text variant="h3" weight="bold" color="#0F172A">
            6
          </Text>
          <Text variant="caption" color={Colors.textMuted}>
            Jobs done
          </Text>
        </View>
      </View>

      {/* Transactions */}
      <Text variant="h3" weight="bold" style={styles.sectionTitle}>
        Transactions
      </Text>
      <Card padding="md" style={styles.txnCard}>
        {TRANSACTIONS.map((txn, index) => (
          <View
            key={txn.id}
            style={[styles.txnRow, index === TRANSACTIONS.length - 1 && styles.txnRowLast]}
          >
            <View
              style={[
                styles.txnIcon,
                txn.type === 'credit' ? styles.txnIconCredit : styles.txnIconDebit,
              ]}
            >
              <Ionicons
                name={txn.type === 'credit' ? 'checkmark-circle' : 'time-outline'}
                size={18}
                color={txn.type === 'credit' ? '#16A34A' : '#0F172A'}
              />
            </View>
            <View style={styles.txnMiddle}>
              <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1}>
                {txn.title}
              </Text>
              <Text variant="caption" color={Colors.textMuted}>
                {txn.meta}
              </Text>
            </View>
            <Text
              variant="body"
              weight="bold"
              color={txn.type === 'credit' ? '#16A34A' : '#0F172A'}
            >
              {txn.amount}
            </Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    backgroundColor: Colors.background,
  },
  cover: {
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.lg,
  },
  coverTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  walletIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balance: {
    fontSize: 38,
    lineHeight: 46,
    marginBottom: 2,
  },
  coverActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  coverBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  addBtn: {
    backgroundColor: '#FFFFFF',
  },
  withdrawBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryBlock: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F1F5F9',
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  txnCard: {
    marginBottom: Spacing.lg,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  txnRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  txnIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  txnIconCredit: {
    backgroundColor: '#E6F9EC',
  },
  txnIconDebit: {
    backgroundColor: Colors.surface,
  },
  txnMiddle: {
    flex: 1,
    marginRight: Spacing.md,
  },
});