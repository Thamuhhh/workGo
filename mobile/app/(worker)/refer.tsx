import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share, Platform } from 'react-native';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Text, Card } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';

const REFERRAL_CODE = 'KG72H4';

const STEPS = [
  { icon: 'share', title: 'Share your code', sub: 'WhatsApp, SMS or any chat app' },
  { icon: 'person-outline', title: 'They join & work', sub: 'Friend signs up and finishes their first job' },
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

  const text = `Work around the corner and earn daily. Use my Gigro code ${REFERRAL_CODE} when you sign up — we both get ₹100!`;

  const flash = (setter: (v: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleCopy = async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // ignore
    }
    flash(setCopied);
  };

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(text);
        flash(setShared);
        return;
      }
      await Share.share({ message: text });
    } catch {
      // ignore
    }
  };

  if (usePageLoading()) return <ScreenSkeleton variant="refer" />;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Refer hero */}
        <View style={styles.hero}>
          <View style={styles.giftIcon}>
            <Ionicons name="gift" size={18} color="#0277F4" />
          </View>
          <Text variant="h2" weight="bold" color="#0F172A" style={styles.heroTitle}>
            Earn ₹100
          </Text>
          <Text variant="bodySm" color={Colors.textSecondary} style={styles.heroSub}>
            for every friend who joins and finishes a job
          </Text>

          <View style={styles.codeBox}>
            <View style={styles.codeCol}>
              <Text variant="caption" weight="bold" color={Colors.textMuted}>
                YOUR REFERRAL CODE
              </Text>
              <Text variant="h2" weight="heavy" color="#0F172A" style={styles.codeText}>
                {REFERRAL_CODE}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.codeIcon, copied && styles.codeIconDone]}
              activeOpacity={0.8}
              onPress={handleCopy}
              hitSlop={8}
            >
              <Ionicons
                name={copied ? 'checkmark' : 'copy'}
                size={18}
                color={copied ? '#16A34A' : '#0F172A'}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.shareBtn} activeOpacity={0.9} onPress={handleShare}>
            <Ionicons name="share" size={17} color="#FFFFFF" weight="fill" />
            <Text variant="body" weight="bold" color="#FFFFFF">
              {shared ? 'Copied to clipboard!' : 'Share with friends'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reward summary */}
        <View style={styles.rewardRow}>
          <View style={styles.rewardBlock}>
            <Text variant="h3" weight="bold" color="#0F172A">
              ₹{INVITES.filter((i) => i.status === 'Earned').length * 100}
            </Text>
            <Text variant="caption" color={Colors.textMuted}>
              Bonuses earned
            </Text>
          </View>
          <View style={styles.rewardDivider} />
          <View style={styles.rewardBlock}>
            <Text variant="h3" weight="bold" color="#0F172A">
              {INVITES.filter((i) => i.status === 'Earned').length}
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
        <Card padding="lg" variant="outlined" style={styles.sectionCard}>
          {STEPS.map((step, index) => (
            <View key={step.title} style={[styles.stepRow, index === STEPS.length - 1 && styles.stepRowLast]}>
              <View style={styles.stepIcon}>
                <Ionicons name={step.icon} size={17} color="#0F172A" />
              </View>
              <View style={styles.stepMiddle}>
                <View style={styles.stepTitleRow}>
                  <Text variant="caption" weight="heavy" color={Colors.textMuted} style={styles.stepNum}>
                    {index + 1}
                  </Text>
                  <Text variant="body" weight="bold" color="#0F172A">
                    {step.title}
                  </Text>
                </View>
                <Text variant="caption" color={Colors.textMuted}>
                  {step.sub}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Invites */}
        <Text variant="h3" weight="bold" style={styles.sectionTitle}>
          Your invites
        </Text>
        <Card padding="lg" variant="outlined" style={styles.sectionCard}>
          {INVITES.map((inv, index) => {
            const isEarned = inv.status === 'Earned';
            return (
              <View key={inv.name} style={[styles.inviteRow, index === INVITES.length - 1 && styles.stepRowLast]}>
                <View style={[styles.inviteAvatar, isEarned && styles.inviteAvatarEarned]}>
                  <Text variant="body" weight="heavy" color={isEarned ? '#16A34A' : '#94A3B8'}>
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
                <Text variant="caption" weight="bold" color={isEarned ? '#16A34A' : Colors.textMuted}>
                  {isEarned ? inv.amount : inv.status}
                </Text>
              </View>
            );
          })}
        </Card>

        {/* Terms */}
        <View style={styles.termsRow}>
          <Ionicons name="info" size={13} color={Colors.textMuted} />
          <Text variant="caption" color={Colors.textMuted} style={styles.termsText}>
            Bonus is credited after your friend completes their first job. Limited to 20 referrals per account.
          </Text>
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    backgroundColor: '#FFFFFF',
  },
  hero: {
    marginBottom: Spacing.lg,
  },
  giftIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroTitle: {
    marginBottom: 2,
  },
  heroSub: {
    marginBottom: Spacing.lg,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  codeCol: {
    flex: 1,
  },
  codeText: {
    letterSpacing: 4,
    marginTop: 2,
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
    backgroundColor: '#0F172A',
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  stepMiddle: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNum: {
    minWidth: 16,
    marginRight: 2,
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
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  inviteAvatarEarned: {
    backgroundColor: '#E6F9EC',
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