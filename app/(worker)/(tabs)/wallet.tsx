import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon as Ionicons } from '../../../src/components/Icon';
import { Text, Card } from '../../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../../src/components/ui/PageSkeleton';

import { Colors, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';

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

const WEEK_BARS = [42, 55, 30, 70, 48, 88, 60];

const QUICK_ACTIONS = [
  { icon: 'bank', label: 'Bank' },
  { icon: 'wallet-outline', label: 'UPI' },
  { icon: 'arrow-up-right', label: 'Send' },
  { icon: 'gift', label: 'Refer' },
] as const;

export default function WorkerWalletScreen() {
  const [hidden, setHidden] = useState(false);
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const rows = (g: (typeof GROUPS)[number]) =>
    TRANSACTIONS.filter(
      (t) => t.group === g && (filter === 'all' ? true : t.type === filter)
    ).length > 0;

  const mask = (s: string) => (hidden ? '••••••' : s);

  if (usePageLoading()) return <ScreenSkeleton variant="wallet" />;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Balance cover */}
      <LinearGradient
        colors={['#0F172A', '#1E3A8A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cover}
      >
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />

        <View style={styles.coverTop}>
          <View style={styles.walletIcon}>
            <Ionicons name="wallet-outline" size={20} color="#FFFFFF" />
          </View>
          <Text variant="caption" weight="bold" color="rgba(255,255,255,0.65)">
            AVAILABLE BALANCE
          </Text>
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setHidden((v) => !v)}>
            <Ionicons name={hidden ? 'eye-off' : 'eye'} size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceRow}>
          <Text variant="body" weight="bold" color="rgba(255,255,255,0.7)">
            ₹
          </Text>
          <Text variant="h1" weight="heavy" color="#FFFFFF" style={styles.balance}>
            {mask('2,430.00')}
          </Text>
        </View>

        <View style={styles.monthRow}>
          <Ionicons name="arrow-down-left" size={13} color="#4ADE80" weight="bold" />
          <Text variant="caption" weight="medium" color="rgba(255,255,255,0.7)">
            +₹3,420 earned this month
          </Text>
        </View>

        <View style={styles.upiRow}>
          <Ionicons name="phone" size={14} color="rgba(255,255,255,0.65)" />
          <Text variant="caption" color="rgba(255,255,255,0.75)" style={styles.upiText}>
            arun*****@okhdfc
          </Text>
          <Text variant="caption" weight="bold" color="#FFFFFF">
            Change
          </Text>
        </View>

        <View style={styles.coverActions}>
          <TouchableOpacity activeOpacity={0.85} style={[styles.coverBtn, styles.addBtn]}>
            <Ionicons name="arrow-down-left" size={16} color="#0277F4" weight="bold" />
            <Text variant="body" weight="bold" color="#0277F4">
              Add Money
            </Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={[styles.coverBtn, styles.withdrawBtn]}>
            <Ionicons name="arrow-up-right" size={16} color="#FFFFFF" weight="bold" />
            <Text variant="body" weight="bold" color="#FFFFFF">
              Withdraw
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Weekly earnings mini-chart */}
      <Card padding="lg" style={styles.chartCard}>
        <View style={styles.chartHead}>
          <View>
            <Text variant="body" weight="bold" color="#0F172A">
              Earnings this week
            </Text>
            <Text variant="caption" color={Colors.textMuted}>
              Mon 7 Sep — Sun 13 Sep
            </Text>
          </View>
          <Text variant="bodySm" weight="bold" color="#16A34A">
            ₹2,750 ▲
          </Text>
        </View>
        <View style={styles.barRow}>
          {WEEK_BARS.map((h, i) => (
            <View key={i} style={styles.barCol}>
              <View style={[styles.bar, { height: h }, i === 5 && styles.barActive]}>
                {i === 5 && (
                  <View style={styles.barDot}>
                    <View style={styles.barDotInner} />
                  </View>
                )}
              </View>
              <Text variant="caption" color={i === 5 ? Colors.primary : Colors.textMuted}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Quick actions */}
      <View style={styles.quickRow}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity key={action.label} activeOpacity={0.7} style={styles.quickAction}>
            <View style={styles.quickIcon}>
              <Ionicons name={action.icon} size={18} color="#0F172A" />
            </View>
            <Text variant="caption" weight="medium" color="#0F172A">
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions */}
      <View style={styles.sectionHead}>
        <Text variant="h3" weight="bold">
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

      <Card padding="md" style={styles.txnCard}>
        {GROUPS.map((group) =>
          !rows(group) ? null : (
            <View key={group}>
              <Text variant="caption" weight="bold" color={Colors.textMuted} style={styles.groupLabel}>
                {group}
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
                      size={17}
                      color={txn.type === 'credit' ? '#16A34A' : '#0F172A'}
                      weight="bold"
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
                    style={styles.txnAmount}
                  >
                    {txn.amount}
                  </Text>
                </View>
              ))}
            </View>
          )
        )}
        {GROUPS.every((g) => !rows(g)) && (
          <Text variant="bodySm" color={Colors.textMuted} style={styles.txnEmpty}>
            No transactions in this view
          </Text>
        )}
      </Card>

      {/* Refer promo */}
      <TouchableOpacity activeOpacity={0.9} style={styles.promoCard}>
        <View style={styles.promoIcon}>
          <Ionicons name="gift" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.promoText}>
          <Text variant="body" weight="bold" color="#FFFFFF">
            Invite a friend, get ₹100
          </Text>
          <Text variant="caption" color="rgba(255,255,255,0.7)">
            Both of you earn when they complete their first job
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
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
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  decoCircle1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  decoCircle2: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.05)',
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
  eyeBtn: {
    marginLeft: 'auto',
    padding: 4,
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
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.md,
  },
  upiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  upiText: {
    flexShrink: 1,
  },
  coverActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  coverBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  addBtn: {
    backgroundColor: '#FFFFFF',
  },
  withdrawBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  chartCard: {
    marginBottom: Spacing.lg,
  },
  chartHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 96,
  },
  barCol: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    flex: 1,
  },
  bar: {
    width: 18,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barActive: {
    backgroundColor: Colors.primary,
  },
  barDot: {
    position: 'absolute',
    top: -7,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  barDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  quickIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
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
  txnCard: {
    marginBottom: Spacing.lg,
  },
  groupLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingVertical: Spacing.xs,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  txnAmount: {
    fontVariant: ['tabular-nums'],
  },
  txnEmpty: {
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#0277F4',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  promoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoText: {
    flex: 1,
  },
});