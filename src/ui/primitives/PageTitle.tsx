import { View, Text } from 'react-native';
import { ReactNode } from 'react';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';

export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const p = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 14,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: p.text,
            fontFamily: fontVariant('sans', 800),
            fontSize: 30,
            letterSpacing: -0.75,
            lineHeight: 33,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={{ color: p.text2, fontSize: 14, marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {action}
    </View>
  );
}
