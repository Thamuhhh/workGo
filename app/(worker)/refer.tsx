import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Card } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { Colors, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';

const REFERRAL_CODE = 'KG72H4';

const STEPS = [
  { icon: 'share', title: 'Share your code', sub: 'Send it to friends via WhatsApp, SMS or any chat app' },
  { icon: 'person-outline', title: 'They join & work', sub: 'Friend signs up with your code and completes their first job' },
  { icon: 'wallet-outline', title: 'Both earn ₹100', sub: 'Bonus lands in both wallets within 24 hours' },
];

const INVITES = [
  { name: 'Rahul S.', status: 'Earned', amount: '+₹100', time: 'Today' },
  { name: 'Mohan K.', status: 'Earned', amount: '+₹100', time: 'Yesterday' },
  { name: 'Priya V.', status: 'Pending', amount: '₹100', time: 'Started signup' },
  { name: 'Suresh B.', status: 'Pending', amount: '₹100', time: 'Not yet worked' },
] as const;

export default function ReferScreen() {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const text = `Work around the corner and earn daily. Use my WorkGo code ${REFERRAL_CODE} when you sign up — we both get ₹100!`;

  const handleCopy = async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(text);
      } else {
        // fallback: expose code by prompting share
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard
          .writeText(text)
          .then(() => setShared(true))
          .catch(() => {});
        setTimeout(() => setShared(false), 2000);
        return;
      }
      await Share.share({ message: text });
    } catch {
      // ignore
    }
  };

  const earnedCount = INVITES.filter((i) => i.status === 'Earned').length;
  const totalEarned = earnedCount * 100;

  if (usePageLoading()) return <ScreenSkeleton variant="refer" />;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero cover */}
      <LinearGradient
        colors={['#0277F4', '#1E4FD7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cover}
      >
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        <View style={styles.coverBadge}>
          <Ionicons name="gift" size={15} color="#FFFFFF" />
          <Text variant="caption" weight="bold" color="#FFFFFF">
            REFER & EARN
          </Text>
        </View>
        <Text variant="h1" weight="heavy" color="#FFFFFF" style={styles.coverTitle}>
          Earn ₹100
        </Text>
        <Text variant="body" color="rgba(255,255,255,0.85)">
          for every friend who joins and finishes a job
        </Text>

        <View style={styles.codeBox}>
          <View style={styles.codeCol}>
            <Text variant="caption" color={Colors.textMuted}>
              YOUR REFERRAL CODE
            </Text>
            <Text variant="h2" weight="heavy" color="#0F172A" style={styles.codeText}>
              {REFERRAL_CODE}
            </Text>
          </View>
          <View style={styles.codeActions}>
            <TouchableOpacity
              style={[styles.codeIcon, copied && styles.codeIconDone]}
              activeOpacity={0.8}
              onPress={handleCopy}
            >
              <Ionicons name={copied ? 'checkmark' : 'copy'} size={18} color={copied ? '#16A34A' : '#0F172A'} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.9} onPress={handleShare}>
          <Ionicons name="share" size={18} color="#0277F4" weight="fill" />
          <Text variant="body" weight="bold" color="#0277F4">
            {shared ? 'Copied to clipboard!' : 'Share with friends'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Reward summary */}
      <View style={styles.rewardRow}>
        <View style={styles.rewardBlock}>
          <Text variant="h3" weight="bold" color="#0F172A">
            ₹{totalEarned}
          </Text>
          <Text variant="caption" color={Colors.textMuted}>
            Bonuses earned
          </Text>
        </View>
        <View style={styles.rewardDivider} />
        <View style={styles.rewardBlock}>
          <Text variant="h3" weight="bold" color="#0F172A">
            {earnedCount}
          </Text>
          <Text variant="caption" color={Colors.textMuted}>
            Friends joined
          </Text>
        </View>
        <View style={styles.rewardDivider} />
        <View style={styles.rewardBlock}>
          <Text variant="h3" weight="bold" color="#0F172A">
            ₹100
          </Text>
          <Text variant="caption" color={Colors.textMuted}>
            Per referral
          </Text>
        </View>
      </View>

      {/* How it works */}
      <Text variant="h3" weight="bold" style={styles.sectionTitle}>
        How it works
      </Text>
      <Card padding="md" style={styles.sectionCard}>
        {STEPS.map((step, index) => (
          <View key={step.title} style={[styles.stepRow, index === STEPS.length - 1 && styles.stepRowLast]}>
            <View style={styles.stepMarker}>
              <Text variant="caption" weight="heavy" color="#FFFFFF">
                {index + 1}
              </Text>
            </View>
            <View style={styles.stepIcon}>
              <Ionicons name={step.icon} size={18} color={Colors.primary} />
            </View>
            <View style={styles.stepMiddle}>
              <Text variant="body" weight="bold" color="#0F172A">
                {step.title}
              </Text>
              <Text variant="caption" color={Colors.textMuted}>
                {step.sub}
              </Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Invites */}
      <View style={styles.sectionHead}>
        <Text variant="h3" weight="bold">
          Your invites
        </Text>
        <Text variant="bodySm" weight="bold" color={Colors.primary}>
          Invite more
        </Text>
      </View>
      <Card padding="md" style={styles.sectionCard}>
        {INVITES.map((inv, index) => {
          const isEarned = inv.status === 'Earned';
          return (
            <View key={inv.name} style={[styles.inviteRow, index === INVITES.length - 1 && styles.stepRowLast]}>
              <View style={[styles.inviteAvatar, isEarned ? styles.inviteAvatarEarned : styles.inviteAvatarPending]}>
                <Text variant="body" weight="heavy" color={isEarned ? '#16A34A' : '#64748B'}>
                  {inv.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.stepMiddle}>
                <Text variant="body" weight="bold" color="#0F172A">
                  {inv.name}
                </Text>
                <Text variant="caption" color={Colors.textMuted}>
                  {inv.time}
                </Text>
              </View>
              <View style={[styles.statusPill, isEarned ? styles.statusPillEarned : styles.statusPillPending]}>
                <Text variant="caption" weight="bold" color={isEarned ? '#16A34A' : '#B45309'}>
                  {isEarned ? `${inv.amount} • ${inv.status}` : inv.status}
                </Text>
              </View>
            </View>
          );
        })}
      </Card>

      {/* Terms */}
      <View style={styles.termsRow}>
        <Ionicons name="info" size={14} color={Colors.textMuted} />
        <Text variant="caption" color={Colors.textMuted} style={styles.termsText}>
          Bonus is credited after your friend completes their first job. Limited to 20 referrals per account.
        </Text>
      </View>
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
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decoCircle2: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  coverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: Spacing.sm,
  },
  coverTitle: {
    fontSize: 34,
    lineHeight: 42,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  codeCol: {
    flex: 1,
  },
  codeText: {
    letterSpacing: 4,
    marginTop: 2,
  },
  codeActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  codeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeIconDone: {
    backgroundColor: '#E6F9EC',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    marginTop: Spacing.sm,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  rewardBlock: {
    flex: 1,
    alignItems: 'center',
  },
  rewardDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F1F5F9',
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  sectionCard: {
    marginBottom: Spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stepRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  stepMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  stepMiddle: {
    flex: 1,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  inviteAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  inviteAvatarEarned: {
    backgroundColor: '#E6F9EC',
  },
  inviteAvatarPending: {
    backgroundColor: '#F1F5F9',
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  statusPillEarned: {
    backgroundColor: '#E6F9EC',
  },
  statusPillPending: {
    backgroundColor: '#FEF3C7',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: 4,
  },
  termsText: {
    flex: 1,
    lineHeight: 16,
  },
});