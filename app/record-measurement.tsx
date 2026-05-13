import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'phosphor-react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { ScreenHeader } from '@/ui/primitives/ScreenHeader';
import { NumericPad } from '@/ui/primitives/NumericPad';
import { fmtDayShort, ymd } from '@/lib/date';
import {
  useMeasurementTypes,
  useLastMeasurement,
  useUpsertMeasurement,
} from '@/features/measurements/hooks';

export default function RecordMeasurementScreen() {
  const p = useTheme();
  const router = useRouter();
  const today = new Date();

  const typesQ = useMeasurementTypes();
  const types = typesQ.data ?? [];

  const [typeId, setTypeId] = useState<number | null>(null);

  useEffect(() => {
    if (typeId === null && types.length > 0) {
      setTypeId(types[0]!.id);
    }
  }, [typeId, types]);

  const lastQ = useLastMeasurement(typeId);
  const upsert = useUpsertMeasurement();

  const [value, setValue] = useState<number | null>(null);
  const [lastTypeId, setLastTypeId] = useState<number | null>(null);

  useEffect(() => {
    if (typeId !== null && typeId !== lastTypeId && !lastQ.isLoading) {
      setValue(lastQ.data?.value ?? 0);
      setLastTypeId(typeId);
    }
  }, [typeId, lastTypeId, lastQ.isLoading, lastQ.data]);

  const selectedType = types.find((t) => t.id === typeId) ?? null;

  const save = async () => {
    if (typeId === null || value === null) return;
    try {
      await upsert.mutateAsync({ typeId, recordedOn: ymd(today), value });
      router.back();
    } catch (e) {
      Alert.alert('No se pudo guardar', String(e));
    }
  };

  const canSave = typeId !== null && value !== null && !upsert.isPending;

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScreenHeader
        title="Medida"
        onBack={() => router.back()}
        right={
          <Pressable onPress={save} disabled={!canSave}>
            <Text
              style={{
                color: canSave ? p.accent.primary : p.text3,
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6, paddingHorizontal: 4, paddingVertical: 4 }}
          style={{ marginBottom: 12, flexGrow: 0 }}
        >
          {types.map((t) => {
            const active = t.id === typeId;
            return (
              <Pressable
                key={t.id}
                onPress={() => setTypeId(t.id)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: active ? p.accent.primary : p.surface2,
                }}
              >
                <Text
                  style={{
                    color: active ? '#fff' : p.text,
                    fontFamily: fontVariant('sans', 600),
                    fontSize: 13,
                  }}
                >
                  {t.name}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => router.push('/measurement-type/new')}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: p.surface2,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Plus size={14} color={p.text} weight="bold" />
            <Text
              style={{
                color: p.text,
                fontFamily: fontVariant('sans', 600),
                fontSize: 13,
              }}
            >
              Nueva
            </Text>
          </Pressable>
        </ScrollView>

        {selectedType && value !== null && (
          <NumericPad
            value={value}
            onChange={setValue}
            suffix={selectedType.unit}
            step={0.1}
          />
        )}
      </View>
    </View>
  );
}
