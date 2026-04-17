// NutriLens Design System
export const Colors = {
  // Base
  background: '#0D1117',
  surface: '#161B22',
  surfaceElevated: '#1C2333',
  surfaceBorder: '#21262D',
  overlay: 'rgba(13,17,23,0.85)',

  // Brand
  primary: '#4ADE80',        // Green-lime
  primaryDim: '#166534',
  primaryMuted: 'rgba(74,222,128,0.12)',
  accent: '#F59E0B',         // Gold/amber
  accentMuted: 'rgba(245,158,11,0.12)',
  accentDim: '#78350F',

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  dangerMuted: 'rgba(239,68,68,0.12)',
  info: '#38BDF8',
  infoMuted: 'rgba(56,189,248,0.12)',

  // Text
  textPrimary: '#F0F6FC',
  textSecondary: '#8B949E',
  textMuted: '#484F58',
  textInverse: '#0D1117',

  // Macros
  carbs: '#F59E0B',
  protein: '#4ADE80',
  fat: '#38BDF8',
  fiber: '#A78BFA',

  // Score
  scoreExcellent: '#4ADE80',
  scoreGood: '#86EFAC',
  scoreModerate: '#F59E0B',
  scorePoor: '#EF4444',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 38,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};
