import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Spacing } from '../constants/theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeightRatio?: number;
}

const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 0.5;

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  maxHeightRatio = 0.85,
}) => {
  const screenHeight = Dimensions.get('window').height;
  const sheetMaxHeight = screenHeight * maxHeightRatio;

  const translateY = useRef(new Animated.Value(sheetMaxHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const handleScale = useRef(new Animated.Value(1)).current;
  const handleWidth = useRef(new Animated.Value(36)).current;

  const openSheet = (open: boolean) => {
    if (open) {
      contentOpacity.setValue(0);
      translateY.setValue(sheetMaxHeight);
      backdropOpacity.setValue(0);
      handleWidth.setValue(36);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 16,
          stiffness: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.55,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(200),
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // handle pulse: subtle width grow then settle
      Animated.sequence([
        Animated.timing(handleWidth, {
          toValue: 52,
          duration: 260,
          useNativeDriver: false,
        }),
        Animated.spring(handleWidth, {
          toValue: 36,
          damping: 12,
          stiffness: 200,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: sheetMaxHeight,
          duration: 200,
          easing: (t) => t * (2 - t), // ease-out quad
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start(() => onClose());
    }
  };

  useEffect(() => {
    openSheet(visible);
  }, [visible, sheetMaxHeight]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => g.dy > 8 && g.dy > Math.abs(g.dx),
      onPanResponderMove: (_e, g) => {
        translateY.setValue(Math.max(0, g.dy));
        backdropOpacity.setValue(
          Math.max(0, 0.55 - (g.dy / sheetMaxHeight) * 0.55)
        );
      },
      onPanResponderRelease: (_e, g) => {
        if (g.dy > CLOSE_DISTANCE || g.vy > CLOSE_VELOCITY) {
          openSheet(false);
        } else {
          openSheet(true);
        }
      },
      onPanResponderTerminate: (_e, g) => {
        if (g.dy > CLOSE_DISTANCE || g.vy > CLOSE_VELOCITY) {
          openSheet(false);
        } else {
          openSheet(true);
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent={Platform.OS === 'android'}
      onRequestClose={() => openSheet(false)}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => openSheet(false)}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              maxHeight: sheetMaxHeight,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.grabArea} {...panResponder.panHandlers}>
            <Animated.View
              style={[styles.handle, { width: handleWidth }]}
            />
          </View>
          <Animated.View style={[styles.sheetContent, { opacity: contentOpacity }]}>
            {children}
          </Animated.View>
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
    backgroundColor: '#0F172A',
  },
  sheet: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  sheetContent: {
    width: '100%',
  },
  handle: {
    alignSelf: 'center',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  grabArea: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
});

export default BottomSheet;