import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Animated,
  PanResponder,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon as Ionicons } from './Icon';
import { Text, Button } from './ui';
import { RATING_TAGS } from '../store/ratingsStore';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

const STAR_LABELS = ['Poor', 'Okay', 'Good', 'Great', 'Excellent!'];
const STAR_COLORS = ['#EF4444', '#F97316', '#EAB308', '#059669', '#16A34A'];
const STAR_TINTS = ['#FEF2F2', '#FFF7ED', '#FFFBEB', '#ECFDF5', '#F0FDF4'];

interface RateSheetProps {
  visible: boolean;
  onClose: () => void;
  employerName?: string;
  jobTitle?: string;
  onSubmit: (stars: number, tags: string[], comment: string) => void;
}

const webReset = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null;

export const RateSheet: React.FC<RateSheetProps> = ({
  visible,
  onClose,
  employerName = 'Employer',
  jobTitle = '',
  onSubmit,
}) => {
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [showDone, setShowDone] = useState(false);

  const dragY = useRef(new Animated.Value(0)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const openOffset = useRef(new Animated.Value(0)).current;
  const bodyOpacity = useRef(new Animated.Value(0)).current;
  const bodyY = useRef(new Animated.Value(14)).current;
  const labelOpacity = useRef(new Animated.Value(1)).current;
  const starPops = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(1))).current;
  const chipPops = useRef(RATING_TAGS.map(() => new Animated.Value(1))).current;
  const doneScale = useRef(new Animated.Value(0)).current;
  const doneOpacity = useRef(new Animated.Value(0)).current;

  const resetAnims = () => {
    dragY.setValue(0);
    openOffset.setValue(0);
    sheetOpacity.setValue(0);
    bodyOpacity.setValue(0);
    bodyY.setValue(14);
    labelOpacity.setValue(1);
    starPops.forEach((v) => v.setValue(1));
    chipPops.forEach((v) => v.setValue(1));
    doneScale.setValue(0);
    doneOpacity.setValue(0);
  };

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(openOffset, {
        toValue: 420,
        duration: 170,
        useNativeDriver: true,
      }),
      Animated.timing(sheetOpacity, { toValue: 0, duration: 170, useNativeDriver: true }),
      Animated.timing(dragY, { toValue: 0, duration: 170, useNativeDriver: true }),
    ]).start(() => {
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        !showDone && Math.abs(g.dy) > 8 && g.dy > 0,
      onPanResponderMove: (_, g) => {
        dragY.setValue(Math.max(0, g.dy));
      },
      onPanResponderRelease: (_, g) => {
        const shouldDismiss = g.dy > 130 || g.vy > 0.7;
        if (shouldDismiss) {
          dismiss();
        } else {
          Animated.spring(dragY, {
            toValue: 0,
            friction: 7,
            tension: 90,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      setStars(0);
      setTags([]);
      setComment('');
      setShowDone(false);
      Keyboard.dismiss();
      resetAnims();
      openOffset.setValue(360);

      Animated.parallel([
        Animated.timing(sheetOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(openOffset, {
          toValue: 0,
          friction: 9,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();
      Animated.parallel([
        Animated.timing(bodyOpacity, { toValue: 1, duration: 220, delay: 120, useNativeDriver: true }),
        Animated.spring(bodyY, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
          delay: 120,
        }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || stars === 0) return;
    Animated.sequence([
      Animated.timing(labelOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(labelOpacity, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  }, [stars]);

  const onPressStar = (n: number) => {
    setStars(n);
    const v = starPops[n - 1];
    v.setValue(0.3);
    Animated.spring(v, { toValue: 1, friction: 4, tension: 220, useNativeDriver: true }).start();
  };

  const toggleTag = (tag: string) => {
    const idx = (RATING_TAGS as readonly string[]).indexOf(tag);
    setTags((prev) => {
      const next = prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length >= 3
        ? prev
        : [...prev, tag];
      if (next.length > prev.length || (next.length < prev.length && idx >= 0)) {
        const v = chipPops[idx] ?? new Animated.Value(1);
        v.setValue(0.4);
        Animated.spring(v, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }).start();
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (stars === 0 || showDone) return;
    setShowDone(true);
    Animated.parallel([
      Animated.spring(doneScale, { toValue: 1, friction: 5, tension: 160, useNativeDriver: true }),
      Animated.timing(doneOpacity, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      onSubmit(stars, tags, comment.trim());
      onClose();
      setShowDone(false);
    }, 900);
  };

  const sheetTranslateY = Animated.add(openOffset, dragY);

  const popScale = (v: Animated.Value) =>
    v.interpolate({ inputRange: [0, 1, 1.4], outputRange: [0.3, 1, 0.88] });

  const selectedIdx = stars - 1;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent={Platform.OS === 'android'}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: sheetOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) },
          ]}
        />
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }], opacity: sheetOpacity }]}
        >
          <SafeAreaView edges={['bottom']} style={styles.safe}>
            <View style={styles.handle} />

            <Animated.View style={{ opacity: bodyOpacity, transform: [{ translateY: bodyY }] }}>
              {/* Employer header */}
              <View style={styles.avatarWrap}>
                <View style={styles.avatar}>
                  <Text variant="h3" weight="bold" color="#0F172A">
                    {employerName.charAt(0)}
                  </Text>
                </View>
              </View>
              <Text variant="h3" weight="bold" color="#0F172A" align="center">
                Rate {employerName}
              </Text>
              {jobTitle ? (
                <Text variant="caption" color={Colors.textSecondary} align="center" style={styles.jobTitle}>
                  {jobTitle}
                </Text>
              ) : null}
              <Text variant="caption" color={Colors.textMuted} align="center" style={styles.prompt}>
                How was your gig?
              </Text>

              {/* Star picker */}
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <TouchableOpacity
                    key={n}
                    activeOpacity={0.7}
                    onPress={() => onPressStar(n)}
                    hitSlop={6}
                    style={webReset}
                  >
                    <Animated.View style={{ transform: [{ scale: popScale(starPops[n - 1]) }] }}>
                      <Ionicons
                        name="star"
                        size={42}
                        color={n <= stars ? '#F59E0B' : '#E2E8F0'}
                        weight={n <= stars ? 'fill' : 'regular'}
                      />
                    </Animated.View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Selection label */}
              <Animated.View style={{ opacity: labelOpacity }}>
                {stars > 0 ? (
                  <View style={[styles.ratingPill, { backgroundColor: STAR_TINTS[selectedIdx] }]}>
                    <Ionicons name="star" size={14} color={STAR_COLORS[selectedIdx]} weight="fill" />
                    <Text variant="bodySm" weight="bold" color={STAR_COLORS[selectedIdx]}>
                      {STAR_LABELS[selectedIdx]}
                    </Text>
                  </View>
                ) : (
                  <Text variant="bodySm" color={Colors.textMuted} align="center">
                    Tap a star to rate
                  </Text>
                )}
              </Animated.View>

              {/* Quick feedback */}
              <View style={styles.tagsSection}>
                <Text variant="caption" weight="semibold" color={Colors.textMuted}>
                  QUICK FEEDBACK (MAX 3)
                </Text>
                <View style={styles.tagsRow}>
                  {RATING_TAGS.map((tag, idx) => {
                    const active = tags.includes(tag);
                    return (
                      <TouchableOpacity
                        key={tag}
                        activeOpacity={0.8}
                        onPress={() => toggleTag(tag)}
                        style={[styles.tagChip, active && styles.tagChipActive]}
                      >
                        <Animated.View style={{ transform: [{ scale: popScale(chipPops[idx]) }] }}>
                          <Text
                            variant="bodySm"
                            weight={active ? 'bold' : 'regular'}
                            color={active ? '#FFFFFF' : Colors.textSecondary}
                          >
                            {tag}
                          </Text>
                        </Animated.View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Comment */}
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Share a little more (optional)"
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
                maxLength={140}
                multiline
                selectionColor={Colors.primary}
              />

              {/* Actions */}
              <View style={styles.actions}>
                <Button
                  title={showDone ? 'Sending…' : 'Skip'}
                  variant="ghost"
                  size="md"
                  disabled={showDone}
                  onPress={onClose}
                  textStyle={{ color: Colors.textSecondary }}
                />
                <Button
                  title="Submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  disabled={stars === 0 || showDone}
                  onPress={handleSubmit}
                />
              </View>
            </Animated.View>

            {/* Success overlay */}
            {showDone && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.doneWrap,
                  { opacity: Animated.add(doneOpacity, bodyOpacity), position: 'absolute' },
                ]}
              >
                <Animated.View style={{ transform: [{ scale: doneScale }], opacity: doneOpacity }}>
                  <Ionicons name="star" size={62} color="#F59E0B" weight="fill" />
                </Animated.View>
                <Animated.Text style={[styles.doneText, { opacity: doneOpacity }]}>
                  Thanks for rating!
                </Animated.Text>
              </Animated.View>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
  },
  sheet: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  safe: {
    paddingBottom: Spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: Spacing.md,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EAF0FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobTitle: {
    marginTop: 2,
  },
  prompt: {
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  ratingPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.lg,
  },
  tagsSection: {
    marginBottom: Spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  tagChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.round,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  input: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#0F172A',
    minHeight: 44,
    marginBottom: Spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  doneWrap: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  doneText: {
    marginTop: Spacing.sm,
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#0F172A',
  },
});