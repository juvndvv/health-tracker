import { View, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { mixRgb } from '@/lib/color';

export function RoutineBadge({ name, size = 56 }: { name: string; size?: number }) {
  const p = useTheme();
  const initial = (name[0] ?? '?').toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 16,
        backgroundColor: mixRgb(p.accent.primary, p.surface, 18),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: p.accent.primary,
          fontFamily: fontVariant('sans', 800),
          fontSize: size * 0.42,
          letterSpacing: -1,
        }}
      >
        {initial}
      </Text>
    </View>
  );
}
