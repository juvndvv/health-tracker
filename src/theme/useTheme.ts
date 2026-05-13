import { useThemeCtx } from './ThemeProvider';
export const useTheme = () => useThemeCtx().palette;
export const useIsDark = () => useThemeCtx().isDark;
