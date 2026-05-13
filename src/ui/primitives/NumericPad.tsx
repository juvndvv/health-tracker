import { View, Pressable, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';

const QUICK_DELTAS = [-1, -0.5, 0.5, 1] as const;

export function NumericPad({ value, onChange, suffix, step }: {
  value: number;
  onChange: (v: number) => void;
  suffix: string;
  step: number;
}) {
  const p = useTheme();
  const decimal = step < 1;
  const dec = () => onChange(Math.round((value - step) * 10) / 10);
  const inc = () => onChange(Math.round((value + step) * 10) / 10);
  const applyDelta = (d: number) => onChange(Math.round((value + d) * 10) / 10);

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 20 }}>
        <Pressable onPress={dec} style={{
          width: 52, height: 52, borderRadius: 999,
          backgroundColor: p.surface2,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: p.text, fontFamily: fontVariant('sans', 600), fontSize: 22 }}>−</Text>
        </Pressable>

        <View style={{ minWidth: 140, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
          <Text style={{
            color: p.text, fontFamily: fontVariant('numeric', 600),
            fontSize: 72, letterSpacing: -3, includeFontPadding: false,
          }}>{decimal ? value.toFixed(1) : String(value)}</Text>
          <Text style={{ color: p.text2, fontSize: 18, fontFamily: fontVariant('sans', 500), alignSelf: 'flex-end', marginBottom: 14 }}>{suffix}</Text>
        </View>

        <Pressable onPress={inc} style={{
          width: 52, height: 52, borderRadius: 999,
          backgroundColor: p.surface2,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: p.text, fontFamily: fontVariant('sans', 600), fontSize: 22 }}>+</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
        {QUICK_DELTAS.map((d) => (
          <Pressable key={d} onPress={() => applyDelta(d)} style={{
            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
            borderWidth: 1, borderColor: p.border,
            backgroundColor: 'transparent',
          }}>
            <Text style={{ color: p.text, fontFamily: fontVariant('numeric', 600), fontSize: 12 }}>
              {d > 0 ? `+${d}` : String(d)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
