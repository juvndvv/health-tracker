import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { ScreenHeader } from '@/ui/primitives/ScreenHeader';
import { Segment } from '@/ui/primitives/Segment';
import { useCreateMeasurementType } from '@/features/measurements/hooks';
import type { MeasurementUnit } from '@/features/measurements/queries';

export default function NewMeasurementTypeScreen() {
  const p = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<MeasurementUnit>('cm');
  const create = useCreateMeasurementType();

  const canSave = name.trim().length > 0;

  const save = async () => {
    if (!canSave) return;
    try {
      await create.mutateAsync({ name: name.trim(), unit });
      router.back();
    } catch (e) {
      Alert.alert('No se pudo guardar', String(e));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScreenHeader
        title="Nueva medida"
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
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <Field label="Nombre">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Cintura, bíceps..."
            placeholderTextColor={p.text3}
            style={{
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: p.border,
              backgroundColor: p.surface,
              color: p.text,
              fontSize: 15,
            }}
          />
        </Field>
        <Field label="Unidad">
          <Segment
            value={unit}
            onChange={setUnit}
            options={[
              { value: 'cm', label: 'cm' },
              { value: '%', label: '%' },
            ]}
          />
        </Field>
      </ScrollView>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const p = useTheme();
  return (
    <View>
      <Text
        style={{
          color: p.text3,
          fontFamily: fontVariant('sans', 700),
          fontSize: 11,
          letterSpacing: 1,
          textTransform: 'uppercase',
          marginBottom: 6,
          paddingHorizontal: 4,
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}
