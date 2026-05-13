import { View, Text } from 'react-native';
import { ReactNode } from 'react';
import { useTheme } from '@/theme/useTheme';
import { radius, space } from '@/theme/tokens';
import { Button } from './Button';

export function Empty({
  icon,
  title,
  body,
  cta,
  onCta,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  cta?: string;
  onCta?: () => void;
}) {
  const p = useTheme();
  return (
    <View
      style={{
        backgroundColor: p.surface,
        borderColor: p.border,
        borderWidth: 1,
        borderRadius: radius['2xl'],
        padding: space[6],
        margin: space[4],
        alignItems: 'center',
      }}
    >
      {icon && (
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            backgroundColor: p.accent.primaryLighter,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
      )}
      <Text
        style={{
          color: p.text,
          fontSize: 18,
          fontFamily: 'OpenSauceOne-Bold',
          marginTop: 12,
          letterSpacing: -0.2,
        }}
      >
        {title}
      </Text>
      {body && (
        <Text
          style={{
            color: p.text2,
            fontSize: 13,
            marginTop: 6,
            textAlign: 'center',
          }}
        >
          {body}
        </Text>
      )}
      {cta && (
        <View style={{ marginTop: 16 }}>
          <Button onPress={onCta}>{cta}</Button>
        </View>
      )}
    </View>
  );
}
