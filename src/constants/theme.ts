export const Colors = {
  // Brand colors
  primary: '#1C274C',       // Deep Indigo / Navy
  primaryLight: '#ECF1F9',  // Soft light indigo background
  primaryDark: '#2B3A60',   // Deep indigo for active states

  // Secondary & Accents
  secondary: '#1C274C',     // Deep Indigo / Navy
  secondaryLight: '#2B3A60',
  
  // Semantic status colors
  success: '#10B981',       // Emerald (Earnings / Verified / Confirmed)
  successLight: '#D1FAE5',
  warning: '#1C274C',       // Pending / In Progress
  warningLight: '#ECF1F9',
  danger: '#EF4444',        // Rejected / Cancelled / Error
  dangerLight: '#FEE2E2',
  info: '#3B82F6',          // Information / Updates
  infoLight: '#DBEAFE',

  // Grayscale & Surfaces
  background: '#F8FAFC',    // Soft off-white app background
  surface: '#FFFFFF',       // Card / Modal background
  surfaceAlt: '#F1F5F9',    // Secondary card / input fill
  border: '#E2E8F0',        // Subtle border
  borderDark: '#CBD5E1',

  // Text
  text: '#0F172A',          // Primary text (near black)
  textSecondary: '#64748B', // Secondary text / captions
  textMuted: '#94A3B8',     // Placeholders / disabled
  textWhite: '#FFFFFF',     // White text on dark/primary buttons
};

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  round: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const Typography = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};
