import { View, Pressable, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';

export function Stepper({
  label,
  value,
  step,
  onChange,
  disabled,
}: {
  label: string;
  value: number | null;
  step: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const p = useTheme();
  const display = value == null ? '—' : step < 1 ? value.toFixed(1) : String(value);
  const dec = () =>
    !disabled &&
    value != null &&
    value > 0 &&
    onChange(Math.round((value - step) * 10) / 10);
  const inc = () =>
    !disabled && onChange(Math.round(((value ?? 0) + step) * 10) / 10);

  const btnBg = p.surface2;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
      }}
    >
      <Pressable
        onPress={dec}
        style={{
          width: 24,
          height: 24,
          borderRadius: 999,
          backgroundColor: btnBg,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.4 : 1,
        }}
      >
        <Text
          style={{
            color: p.text,
            fontSize: 16,
            fontFamily: fontVariant('sans', 600),
          }}
        >
          −
        </Text>
      </Pressable>
      <View style={{ alignItems: 'center', flex: 1 }}>
        <Text
          style={{
            fontFamily: fontVariant('numeric', 600),
            fontSize: 17,
            color: p.text,
            letterSpacing: -0.5,
            includeFontPadding: false,
          }}
        >
          {display}
        </Text>
        <Text
          style={{
            fontFamily: fontVariant('sans', 600),
            fontSize: 9,
            color: p.text3,
            marginTop: 1,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
      </View>
      <Pressable
        onPress={inc}
        style={{
          width: 24,
          height: 24,
          borderRadius: 999,
          backgroundColor: btnBg,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.4 : 1,
        }}
      >
        <Text
          style={{
            color: p.text,
            fontSize: 16,
            fontFamily: fontVariant('sans', 600),
          }}
        >
          +
        </Text>
      </Pressable>
    </View>
  );
}
