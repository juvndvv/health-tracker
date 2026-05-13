import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { palettes, type Palette, type ThemeName } from './palette';

type Ctx = { palette: Palette; isDark: boolean; resolved: ThemeName };
const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({
  children,
  preference,
}: {
  children: React.ReactNode;
  preference: 'light' | 'dark' | 'system';
}) {
  const system = useColorScheme();
  const resolved: ThemeName = preference === 'system' ? (system === 'light' ? 'light' : 'dark') : preference;
  const value = useMemo(
    () => ({ palette: palettes[resolved], isDark: resolved === 'dark', resolved }),
    [resolved],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeCtx() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}
