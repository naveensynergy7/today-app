/**
 * Modern design system – soft shadows, refined palette
 */
import { Platform } from 'react-native';

export const colors = {
  // Primary
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',

  // Accent / FAB
  fab: '#EC4899',
  fabLight: '#F472B6',

  // Surfaces – warm neutrals
  background: '#FAFAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F8F9FC',

  // Text
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  priority: '#EF4444',

  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const typography = {
  title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.6 },
  titleSmall: { fontSize: 20, fontWeight: '600', letterSpacing: -0.3 },
  body: { fontSize: 16, fontWeight: '400' },
  bodyMedium: { fontSize: 15, fontWeight: '500' },
  caption: { fontSize: 13, fontWeight: '400' },
  captionMedium: { fontSize: 12, fontWeight: '500' },
};

// Reusable shadow presets for cards and FAB
export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
    android: { elevation: 4 },
  }),
  cardSubtle: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
  }),
  fab: Platform.select({
    ios: {
      shadowColor: '#EC4899',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    android: { elevation: 8 },
  }),
};
