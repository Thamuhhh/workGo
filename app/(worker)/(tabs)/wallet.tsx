import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Icon as Ionicons } from '../../../src/components/Icon';
import { Text, Button } from '../../../src/components/ui';
import { Colors, Spacing, BorderRadius } from '../../../src/constants/theme';

interface Txn {
  id: string;
  title: string;
  meta: string;
  amount: string;
  type: 'credit' | 'debit';
  group: 'Today' | 'Yesterday' | 'Earlier';
}

const GROUPS: Array<'Today' | 'Yesterday' | 'Earlier'> = ['Today', 'Yesterday', 'Earlier'];

const TRANSACTIONS: Txn[] = [
  { id: '1', title: 'Catering Helper — Day job', meta: 'Sharon Catering • 10:42 AM', amount: '+₹800', type: 'credit', group: 'Today' },
  { id: '2', title: 'Retail Promoter — Store', meta: 'BigMart • 08:15 AM', amount: '+₹750', type: 'credit', group: 'Today' },
  { id: '3', title: 'Event Support — Weekend', meta: 'RPS Events • 09:30 PM', amount: '+₹1,200', type: 'credit', group: 'Yesterday' },
  { id: '4', title: 'Instant withdrawal to UPI', meta: 'arun*****@okhdfc • 06:12 PM', amount: '-₹500', type: 'debit', group: 'Yesterday' },
  { id: '5', title: 'Event Support — Stage', meta: 'RPS Events • Fri', amount: '+₹600', type: 'credit', group: 'Earlier' },
  { id: '6', title: 'Instant withdrawal to UPI', meta: 'arun*****@okhdfc • Wed', amount: '-₹800', type: 'debit', group: 'Earlier' },
  { id: '7', title: 'Service fee', meta: 'WorkGo • Wed', amount: '-₹20', type: 'debit', group: 'Earlier' },
];

export default function WorkerWalletScreen() {
  const [hidden, setHidden] = useState(false);
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const rowsInGroup = (g: (typeof GROUPS)[number]) =>
    TRANSACTIONS.filter(
      (t) => t.group === g && (filter === 'all' ? true : t.type === filter)
    ).length > 0;

  const mask = (s: string) => (hidden ? '••••••' : s);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Balance */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceTop}>
          <Text variant="caption" weight="bold" color={Colors.textMuted} style={styles.balanceLabel}>
            AVAILABLE BALANCE
          </Text>
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setHidden((v) => !v)} hitSlop={8}>
            <Ionicons name={hidden ? 'eye-off' : 'eye'} size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceRow}>
          <Text variant="body" weight="medium" color={Colors.textSecondary}>
            ₹
          </Text>
          <Text variant="h1" weight="heavy" color="#0F172A" style={styles.balance}>
            {mask('2,430.00')}
          </Text>
        </View>

        <Text variant="caption" weight="medium" color="#16A34A">
          +₹3,420 earned this month
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <Button
          title="Add Money"
          variant="outline"
          icon={<Ionicons name="wallet-outline" size={16} color="#0277F4" weight="bold" />}
          onPress={() => {}}
          style={styles.actionBtn}
        />
        <Button
          title="Withdraw"
          icon={<Ionicons name="arrow-up-right" size={16} color="#FFFFFF" weight="bold" />}
          onPress={() => {}}
          style={styles.actionBtn}
        />
      </View>

      {/* UPI link */}
      <View style={styles.upiRow}>
        <Ionicons name="phone" size={13} color={Colors.textMuted} />
        <Text variant="caption" color={Colors.textSecondary} style={styles.upiText}>
          arun*****@okhdfc
        </Text>
        <Text variant="caption" weight="bold" color={Colors.primary}>
          Change
        </Text>
      </View>

      {/* Transactions */}
      <View style={styles.sectionHead}>
        <Text variant="body" weight="bold" color="#0F172A">
          Transactions
        </Text>
        <View style={styles.filterRow}>
          {(['all', 'credit', 'debit'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              activeOpacity={0.8}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text
                variant="caption"
                weight="bold"
                color={filter === f ? '#FFFFFF' : Colors.textSecondary}
              >
                {f === 'all' ? 'All' : f === 'credit' ? 'In' : 'Out'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.txnList}>
        {GROUPS.map((group) =>
          !rowsInGroup(group) ? null : (
            <View key={group}>
              <Text variant="caption" weight="bold" color={Colors.textMuted} style={styles.groupLabel}>
                {group.toUpperCase()}
              </Text>
              {TRANSACTIONS.filter(
                (t) => t.group === group && (filter === 'all' ? true : t.type === filter)
              ).map((txn) => (
                <View key={txn.id} style={styles.txnRow}>
                  <View
                    style={[
                      styles.txnIcon,
                      txn.type === 'credit' ? styles.txnIconCredit : styles.txnIconDebit,
                    ]}
                  >
                    <Ionicons
                      name={txn.type === 'credit' ? 'arrow-down-left' : 'arrow-up-right'}
                      size={15}
                      color={txn.type === 'credit' ? '#16A34A' : Colors.textSecondary}
                      weight="bold"
                    />
                  </View>
                  <View style={styles.txnMiddle}>
                    <Text variant="body" weight="medium" color="#0F172A" numberOfLines={1}>
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
                    style={styles.txnAmount}
                  >
                    {txn.amount}
                  </Text>
                </View>
              ))}
            </View>
          )
        )}
        {GROUPS.every((g) => !rowsInGroup(g)) && (
          <Text variant="bodySm" color={Colors.textMuted} style={styles.txnEmpty}>
            No transactions in this view
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    backgroundColor: Colors.surface,
  },
  balanceCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  balanceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  balanceLabel: {
    letterSpacing: 0.4,
  },
  eyeBtn: {
    padding: 2,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  balance: {
    fontSize: 36,
    lineHeight: 44,
    marginBottom: 4,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  actionBtn: {
    flex: 1,
  },
  upiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
  },
  upiText: {
    flex: 1,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
  },
  txnList: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  groupLabel: {
    letterSpacing: 0.6,
    paddingVertical: Spacing.sm,
    fontSize: 11,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  txnIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  txnIconCredit: {
    backgroundColor: '#E6F9EC',
  },
  txnIconDebit: {
    backgroundColor: '#F1F5F9',
  },
  txnMiddle: {
    flex: 1,
    marginRight: Spacing.md,
  },
  txnAmount: {
    fontVariant: ['tabular-nums'],
  },
  txnEmpty: {
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
});