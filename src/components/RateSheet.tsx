import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon as Ionicons } from './Icon';
import { Text, Button } from './ui';
import { RATING_TAGS } from '../store/ratingsStore';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

const STAR_LABELS = ['Poor', 'Okay', 'Good', 'Great', 'Excellent!'];

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
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setStars(0);
      setTags([]);
      setComment('');
      pop.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    Animated.spring(pop, {
      toValue: 1,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [stars]);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length >= 3 ? prev : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (stars === 0) return;
    onSubmit(stars, tags, comment.trim());
    onClose();
  };

  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent={Platform.OS === 'android'}>
      <View style={styles.overlay}>
        <View style={styles.backdrop} />
        <Animated.View style={[styles.sheet, { transform: [{ scale }] }]}>
          <SafeAreaView edges={['bottom']} style={styles.safe}>
            <View style={styles.handle} />

            <View style={styles.titleRow}>
              <View style={styles.titleIcon}>
                <Ionicons name="star" size={20} color={Colors.primary} />
              </View>
              <View style={styles.titleCol}>
                <Text variant="h3" weight="bold" color="#0F172A">
                  Rate {employerName}
                </Text>
                {jobTitle ? (
                  <Text variant="caption" color={Colors.textSecondary} numberOfLines={1}>
                    {jobTitle}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Star picker */}
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity
                  key={n}
                  activeOpacity={0.7}
                  onPress={() => setStars(n)}
                  hitSlop={6}
                  style={webReset}
                >
                  <Ionicons
                    name="star"
                    size={40}
                    color={n <= stars ? '#F59E0B' : '#E2E8F0'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text
              variant="bodySm"
              weight={stars > 0 ? 'bold' : 'medium'}
              color={stars > 0 ? '#F59E0B' : Colors.textMuted}
              align="center"
              style={styles.starLabel}
            >
              {stars > 0 ? STAR_LABELS[stars - 1] : 'Tap to rate'}
            </Text>

            {/* Quick tags */}
            <View style={styles.tagsSection}>
              <Text variant="caption" weight="semibold" color={Colors.textMuted}>
                QUICK FEEDBACK (MAX 3)
              </Text>
              <View style={styles.tagsRow}>
                {RATING_TAGS.map((tag) => {
                  const active = tags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      activeOpacity={0.8}
                      onPress={() => toggleTag(tag)}
                      style={[styles.tagChip, active && styles.tagChipActive]}
                    >
                      <Text
                        variant="bodySm"
                        weight={active ? 'bold' : 'regular'}
                        color={active ? '#FFFFFF' : Colors.textSecondary}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Comment */}
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Add a comment (optional)"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
              maxLength={140}
              multiline
              selectionColor={Colors.primary}
            />

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title="Skip"
                variant="ghost"
                size="md"
                onPress={onClose}
                textStyle={{ color: Colors.textSecondary }}
              />
              <Button
                title={stars > 0 ? `Submit ${stars}★ Rating` : 'Submit Rating'}
                variant="primary"
                size="md"
                fullWidth
                disabled={stars === 0}
                onPress={handleSubmit}
              />
            </View>
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
    opacity: 0.55,
  },
  sheet: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    marginBottom: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  titleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  titleCol: {
    flex: 1,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  starLabel: {
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
});