import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { ScreenHeader } from '@/ui/primitives/ScreenHeader';
import { MUSCLE_GROUPS, type MuscleGroup } from '@/db/schema';
import { useCreateExercise } from '@/features/exercises/hooks';

export default function NewExerciseScreen() {
  const p = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const [muscle, setMuscle] = useState<MuscleGroup | null>(null);
  const create = useCreateExercise();

  const canSave = name.trim().length > 0 && muscle !== null;

  const save = async () => {
    if (!canSave || !muscle) return;
    try {
      await create.mutateAsync({ name: name.trim(), muscleGroup: muscle });
      router.back();
    } catch (e) {
      Alert.alert('No se pudo guardar', String(e));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScreenHeader
        title="Nuevo ejercicio"
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
            placeholder="Press banca, sentadilla..."
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
        <Field label="Grupo muscular">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {MUSCLE_GROUPS.map((m) => {
              const active = muscle === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => setMuscle(m)}
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
                    {m}
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
