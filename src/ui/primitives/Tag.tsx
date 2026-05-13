import { View, Text } from 'react-native';
import { ReactNode } from 'react';
import { useTheme } from '@/theme/useTheme';

export function Tag({
  children,
  color,
  bg,
}: {
  children: ReactNode;
  color?: string;
  bg?: string;
}) {
  const p = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        backgroundColor: bg ?? p.accent.primaryLighter,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color: color ?? p.accent.primary,
          fontFamily: 'OpenSauceOne-SemiBold',
          fontSize: 11,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
