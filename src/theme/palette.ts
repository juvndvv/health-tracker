export const ember = {
  primary:        '#FA114F',
  primaryDark:    '#D90033',
  primaryLight:   '#FFD8E1',
  primaryLighter: '#FFEBF0',
} as const;

export type ThemeName = 'light' | 'dark';

export const palettes: Record<ThemeName, {
  bg: string; surface: string; surface2: string;
  text: string; text2: string; text3: string;
  border: string;
  success: string; info: string; warning: string; error: string;
  accent: typeof ember;
}> = {
  dark: {
    bg: '#000000', surface: '#161616', surface2: '#1F1F1F',
    text: '#FFFFFF', text2: 'rgba(255,255,255,0.6)', text3: 'rgba(255,255,255,0.4)',
    border: 'rgba(255,255,255,0.08)',
    success: '#10B981', info: '#3B82F6', warning: '#F59E0B', error: '#ED5A46',
    accent: ember,
  },
  light: {
    bg: '#F5F5F7', surface: '#FFFFFF', surface2: '#FAFAFA',
    text: '#1F1F1F', text2: '#666666', text3: '#8F8F8F',
    border: '#EBEBEB',
    success: '#10B981', info: '#3B82F6', warning: '#F59E0B', error: '#ED5A46',
    accent: ember,
  },
};

export type Palette = (typeof palettes)['dark'];
