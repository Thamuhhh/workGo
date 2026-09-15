import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Skeleton, SkeletonJobCard } from './Skeleton';
import { Spacing } from '../../constants/theme';

export type SkeletonVariant = 'list' | 'form' | 'profile' | 'wallet' | 'chat' | 'refer' | 'home';

export function usePageLoading(ms = 800) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}

const gapSm = { marginTop: Spacing.sm };
const gapMd = { marginTop: Spacing.md };
const gapLg = { marginTop: Spacing.lg };

function Bubble({ avatar, content }: { avatar: boolean; content: number[] }) {
  return (
    <View style={[styles.bubbleRow, avatar ? { justifyContent: 'flex-end' } : null]}>
      {!avatar && <Skeleton width={30} height={30} radius={15} />}
      <View style={styles.bubbleCol}>
        {content.map((w, i) => (
          <Skeleton key={i} width={w} height={12} radius={6} style={i > 0 ? gapSm : undefined} />
        ))}
      </View>
    </View>
  );
}
function Column({ style, children }: { style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }, style]}>{children}</View>;
}

export function ScreenSkeleton({ variant = 'list' }: { variant?: SkeletonVariant }) {
  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.rootInner}>
        {variant === 'form' && (
          <View style={styles.pad}>
            <Skeleton width={110} height={20} radius={7} />
            <Skeleton width={200} height={12} radius={6} style={gapSm} />
            <Skeleton width="100%" height={52} radius={12} style={gapLg} />
            <Skeleton width="100%" height={52} radius={12} style={gapMd} />
            <Skeleton width="72%" height={52} radius={12} style={gapMd} />
            <Skeleton width="100%" height={50} radius={12} style={gapLg} />
          </View>
        )}

        {variant === 'profile' && (
          <View style={styles.pad}>
            <Skeleton width="100%" height={120} radius={18} />
            <Column style={styles.avatarRow}>
              <Skeleton width={64} height={64} radius={32} />
              <View style={styles.colFlex}>
                <Skeleton width={140} height={18} radius={6} />
                <Skeleton width={100} height={12} radius={6} style={gapSm} />
              </View>
            </Column>
            <Skeleton width="100%" height={64} radius={14} style={gapLg} />
            <Skeleton width="100%" height={76} radius={14} style={gapMd} />
            <Skeleton width="100%" height={76} radius={14} style={gapMd} />
          </View>
        )}

        {variant === 'wallet' && (
          <View style={styles.pad}>
            <Skeleton width="100%" height={150} radius={18} />
            <Column style={styles.avatarRow}>
              <Skeleton width={90} height={14} radius={6} />
            </Column>
            <Skeleton width="100%" height={70} radius={14} style={gapLg} />
            <View style={[gapMd, { flexDirection: 'row', gap: Spacing.sm }]}>
              <Skeleton width="48%" height={90} radius={14} />
              <Skeleton width="48%" height={90} radius={14} />
            </View>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} width="100%" height={58} radius={14} style={gapMd} />
            ))}
          </View>
        )}

        {variant === 'chat' && (
          <View style={styles.pad}>
            <Skeleton width={170} height={20} radius={7} />
            <Skeleton width={90} height={12} radius={6} style={gapSm} />
            <View style={gapLg} />
            <Bubble avatar={false} content={[220, 140]} />
            <Bubble avatar content={[190, 120, 150]} />
            <Bubble avatar={false} content={[150]} />
            <Bubble avatar content={[200, 90]} />
            <View style={gapLg} />
            <Skeleton width="100%" height={46} radius={23} />
          </View>
        )}

        {variant === 'refer' && (
          <View style={styles.pad}>
            <Skeleton width="100%" height={180} radius={18} />
            <Skeleton width={130} height={16} radius={6} style={gapLg} />
            <Skeleton width="100%" height={140} radius={14} style={gapSm} />
            <Skeleton width={110} height={16} radius={6} style={gapLg} />
            <Skeleton width="100%" height={170} radius={14} style={gapSm} />
          </View>
        )}

        {variant === 'home' && (
          <View style={styles.pad}>
            <Column>
              <Skeleton width={110} height={24} radius={7} />
              <Skeleton width={42} height={42} radius={21} />
            </Column>
            <Skeleton width="100%" height={52} radius={26} style={gapMd} />
            <Skeleton width={140} height={16} radius={6} style={gapLg} />
            <View style={[gapSm, styles.grid]}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={styles.gridCell}>
                  <Skeleton width={46} height={46} radius={999} />
                  <Skeleton width={64} height={10} radius={5} style={gapSm} />
                </View>
              ))}
            </View>
            <Skeleton width={120} height={16} radius={6} style={gapLg} />
            <View style={gapSm}>
              <SkeletonJobCard count={2} />
            </View>
          </View>
        )}

        {(variant === 'list' || variant === undefined) && (
          <View style={styles.pad}>
            <Skeleton width={150} height={20} radius={7} />
            <Skeleton width={110} height={12} radius={6} style={gapSm} />
            <View style={gapLg} />
            <SkeletonJobCard count={3} />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  rootInner: {
    flex: 1,
  },
  pad: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  colFlex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  bubbleCol: {
    flex: 1,
    maxWidth: '72%',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  gridCell: {
    width: '22%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: Spacing.md,
  },
  avatarRow: {
    marginTop: Spacing.lg,
  },
});