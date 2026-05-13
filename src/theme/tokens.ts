export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 20: 80 } as const;

export const radius = { xs: 4, sm: 6, md: 8, lg: 12, xl: 18, '2xl': 24, full: 9999 } as const;

export const fontFamily = {
  sans: 'OpenSauceOne',
  numeric: 'Geist',
  display: 'BowlbyOneSC',
} as const;

export const type = {
  displayLg:    { size: 64, line: 76, weight: '500' as const },
  displayMd:    { size: 40, line: 52, weight: '500' as const },
  headlineLg:   { size: 40, line: 52, weight: '700' as const },
  headlineMd:   { size: 32, line: 40, weight: '600' as const },
  headlineSm:   { size: 24, line: 32, weight: '600' as const },
  titleLg:      { size: 18, line: 26, weight: '600' as const },
  titleMd:      { size: 16, line: 24, weight: '600' as const },
  titleSm:      { size: 14, line: 20, weight: '600' as const },
  bodyMd:       { size: 16, line: 24, weight: '400' as const },
  bodySm:       { size: 14, line: 22, weight: '400' as const },
  labelLg:      { size: 14, line: 20, weight: '500' as const },
  labelMd:      { size: 12, line: 16, weight: '500' as const },
  labelSm:      { size: 10, line: 16, weight: '500' as const },
} as const;

export const motion = {
  durFast: 120,
  dur: 180,
  durSlow: 260,
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;
