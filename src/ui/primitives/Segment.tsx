import { View, Pressable, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';

type Opt<V extends string> = { value: V; label: string };

export function Segment<V extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: {
  options: Opt<V>[];
  value: V;
  onChange: (v: V) => void;
  size?: 'sm' | 'md';
}) {
  const p = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: p.surface2,
        padding: 3,
        borderRadius: 12,
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              height: size === 'sm' ? 28 : 34,
              backgroundColor: active ? '#fff' : 'transparent',
              borderRadius: 9,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: active ? '#1F1F1F' : p.text2,
                fontFamily: fontVariant('sans', 600),
                fontSize: size === 'sm' ? 12 : 13,
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
