import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon as Ionicons } from '../../../src/components/Icon';
import { Text, Button } from '../../../src/components/ui';
import { Colors, Spacing, BorderRadius } from '../../../src/constants/theme';
import { useWalletStore, WalletTxn, formatINR } from '../../../src/store/walletStore';

const GROUPS = ['Today', 'Yesterday', 'Earlier'] as const;

function groupOf(timestamp: string): (typeof GROUPS)[number] {
  const d = new Date(timestamp);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYesterday = startToday - 86400000;
  if (d.getTime() >= startToday) return 'Today';
  if (d.getTime() >= startYesterday) return 'Yesterday';
  return 'Earlier';
}

export default function WorkerWalletScreen() {
  const balance = useWalletStore((s) => s.balance);
  const upiId = useWalletStore((s) => s.upiId);
  const transactions = useWalletStore((s) => s.transactions);
  const addMoney = useWalletStore((s) => s.addMoney);
  const withdraw = useWalletStore((s) => s.withdraw);

  const [hidden, setHidden] = useState(false);
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const rowsInGroup = (g: (typeof GROUPS)[number]) =>
    transactions.some((t) => groupOf(t.timestamp) === g && (filter === 'all' ? true : (t.amount > 0) === (filter === 'credit')));

  const mask = (s: string) => (hidden ? '••••••' : s);

  const handleAddMoney = () => {
    addMoney(500);
    Alert.alert('Added', '₹500 added to your wallet.');
  };

  const handleWithdraw = async () => {
    if (balance <= 0) return;
    const ok = await withdraw();
    if (ok) {
      Alert.alert('Withdrawal initiated', `${formatINR(balance)} sent to ${upiId}.`);
    } else {
      Alert.alert('Withdrawal failed', 'Could not process the withdrawal right now. Please try again.');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text variant="h2" weight="bold" color="#0F172A">
          Wallet
        </Text>
      </View>
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
            {mask(balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
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
          icon={<Ionicons name="wallet-outline" size={16} color="#0F172A" weight="bold" />}
          onPress={handleAddMoney}
          style={styles.actionBtn}
        />
        <Button
          title="Withdraw"
          icon={<Ionicons name="arrow-up-right" size={16} color="#FFFFFF" weight="bold" />}
          onPress={handleWithdraw}
          disabled={balance <= 0}
          style={styles.actionBtn}
        />
      </View>

      {/* UPI link */}
      <View style={styles.upiRow}>
        <Ionicons name="phone" size={13} color={Colors.textMuted} />
        <Text variant="caption" color={Colors.textSecondary} style={styles.upiText}>
          {upiId}
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
              {transactions
                .filter((t) => groupOf(t.timestamp) === group && (filter === 'all' ? true : (t.amount > 0) === (filter === 'credit')))
                .map((txn) => (
                <TxnRow key={txn.id} txn={txn} />
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
    </SafeAreaView>
  );
}

function TxnRow({ txn }: { txn: WalletTxn }) {
  const credit = txn.amount > 0;
  return (
    <View style={styles.txnRow}>
      <View
        style={[
          styles.txnIcon,
          credit ? styles.txnIconCredit : styles.txnIconDebit,
        ]}
      >
        <Ionicons
          name={credit ? 'arrow-down-left' : 'arrow-up-right'}
          size={15}
          color={credit ? '#16A34A' : Colors.textSecondary}
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
        color={credit ? '#16A34A' : '#0F172A'}
        style={styles.txnAmount}
      >
        {credit ? '+' : ''}{formatINR(Math.abs(txn.amount))}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs,
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