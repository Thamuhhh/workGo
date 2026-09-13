import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, Platform, StyleProp, TextStyle } from 'react-native';
import { Colors, Typography } from '../../constants/theme';

export const FONT_FAMILY_BY_WEIGHT: Record<string, string> = {
  '400': 'Poppins_400Regular',
  '500': 'Poppins_500Medium',
  '600': 'Poppins_600SemiBold',
  '700': 'Poppins_700Bold',
  '800': 'Poppins_800ExtraBold',
};

export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodySm' | 'caption' | 'label';
  color?: string;
  weight?: keyof typeof Typography.weights;
  align?: 'left' | 'center' | 'right';
}

// Android renders the system font when fontWeight is combined with a
// single-weight custom fontFamily. Drop fontWeight there so the exact
// Poppins face (chosen via fontFamily) is used.
function buildResolvedStyle(
  base: StyleProp<TextStyle>,
  custom: StyleProp<TextStyle>
): StyleProp<TextStyle> {
  const flat = StyleSheet.flatten([base, custom]);
  if (Platform.OS === 'android') {
    const merged = { ...flat };
    delete merged.fontWeight;
    return merged;
  }
  return flat;
}

export const Text: React.FC<TextProps> = ({
  children,
  style,
  variant = 'body',
  color = Colors.text,
  weight,
  align = 'left',
  ...props
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'h1':
        return styles.h1;
      case 'h2':
        return styles.h2;
      case 'h3':
        return styles.h3;
      case 'label':
        return styles.label;
      case 'bodySm':
        return styles.bodySm;
      case 'caption':
        return styles.caption;
      case 'body':
      default:
        return styles.body;
    }
  };

  const getDefaultWeight = (): keyof typeof Typography.weights => {
    switch (variant) {
      case 'h1':
        return 'heavy';
      case 'h2':
      case 'h3':
        return 'bold';
      case 'label':
        return 'semibold';
      case 'body':
      case 'bodySm':
      case 'caption':
      default:
        return 'regular';
    }
  };

  const effectiveWeight = weight ?? getDefaultWeight();
  const fontFamily = FONT_FAMILY_BY_WEIGHT[Typography.weights[effectiveWeight]];

  return (
    <RNText
      style={buildResolvedStyle(getVariantStyle(), [
        { color, textAlign: align, fontFamily },
        weight ? { fontWeight: Typography.weights[weight] } : undefined,
        style,
      ])}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.heavy,
    lineHeight: 36,
  },
  h2: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    lineHeight: 30,
  },
  h3: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    lineHeight: 26,
  },
  body: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.regular,
    lineHeight: 22,
  },
  bodySm: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    lineHeight: 18,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    lineHeight: 18,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.regular,
    lineHeight: 15,
  },
});
