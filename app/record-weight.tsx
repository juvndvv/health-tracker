import { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { ScreenHeader } from '@/ui/primitives/ScreenHeader';
import { NumericPad } from '@/ui/primitives/NumericPad';
import { fmtDayShort, ymd } from '@/lib/date';
import {
  useLastWeight,
  useUpsertWeight,
  useWeightsSince,
} from '@/features/body-weight/hooks';

export default function RecordWeightScreen() {
  const p = useTheme();
  const router = useRouter();
  const today = new Date();
  const lastQ = useLastWeight();
  const sevenDaysQ = useWeightsSince(7);
  const upsert = useUpsertWeight();

  const [kg, setKg] = useState<number | null>(null);

  useEffect(() => {
    if (kg === null && !lastQ.isLoading) {
      setKg(lastQ.data?.weightKg ?? 75);
    }
  }, [kg, lastQ.isLoading, lastQ.data]);

  const sevenDaysAgoRef = (() => {
    const list = sevenDaysQ.data ?? [];
    if (list.length === 0) return null;
    return list[0] ?? null;
  })();

  const save = async () => {
    if (kg === null) return;
    try {
      await upsert.mutateAsync({ recordedOn: ymd(today), weightKg: kg });
      router.back();
    } catch (e) {
      Alert.alert('No se pudo guardar', String(e));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScreenHeader
        title="Peso corporal"
        onBack={() => router.back()}
        right={
          <Pressable onPress={save} disabled={kg === null || upsert.isPending}>
            <Text
              style={{
                color: kg === null ? p.text3 : p.accent.primary,
                fontFamily: fontVariant('sans', 700),
                fontSize: 15,
              }}
            >
              Guardar
            </Text>
          </Pressable>
        }
      />
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 13,
            color: p.text2,
            marginBottom: 8,
            fontFamily: fontVariant('sans', 500),
          }}
        >
          {fmtDayShort(today)}
        </Text>
        {kg !== null && (
          <NumericPad value={kg} onChange={setKg} suffix="kg" step={0.1} />
        )}
        <Text
          style={{
            fontSize: 13,
            color: p.text2,
            marginTop: 12,
            textAlign: 'center',
            fontFamily: fontVariant('sans', 500),
          }}
        >
          {sevenDaysAgoRef
            ? `Hace 7 días: ${sevenDaysAgoRef.weightKg.toFixed(1)} kg`
            : 'Sin registro hace 7 días'}
        </Text>
      </View>
    </View>
  );
}
