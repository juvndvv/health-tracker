import { useFonts } from 'expo-font';
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from '@expo-google-fonts/geist';

export function useAppFonts() {
  return useFonts({
    'Geist-Regular': Geist_400Regular,
    'Geist-Medium': Geist_500Medium,
    'Geist-SemiBold': Geist_600SemiBold,
    'Geist-Bold': Geist_700Bold,
    'OpenSauceOne-Regular': require('../../assets/fonts/OpenSauceOne-Regular.ttf'),
    'OpenSauceOne-Medium': require('../../assets/fonts/OpenSauceOne-Medium.ttf'),
    'OpenSauceOne-SemiBold': require('../../assets/fonts/OpenSauceOne-SemiBold.ttf'),
    'OpenSauceOne-Bold': require('../../assets/fonts/OpenSauceOne-Bold.ttf'),
    'OpenSauceOne-ExtraBold': require('../../assets/fonts/OpenSauceOne-ExtraBold.ttf'),
  });
}

export function fontVariant(
  family: 'sans' | 'numeric',
  weight: 400 | 500 | 600 | 700 | 800,
): string {
  const base = family === 'sans' ? 'OpenSauceOne' : 'Geist';
  const w =
    weight === 400
      ? 'Regular'
      : weight === 500
        ? 'Medium'
        : weight === 600
          ? 'SemiBold'
          : weight === 700
            ? 'Bold'
            : 'ExtraBold';
  if (base === 'Geist' && w === 'ExtraBold') return 'Geist-Bold';
  return `${base}-${w}`;
}
