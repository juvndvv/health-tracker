import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { ScreenHeader } from '@/ui/primitives/ScreenHeader';
import { Stepper } from '@/ui/primitives/Stepper';
import { Button } from '@/ui/primitives/Button';
import { useExercises } from '@/features/exercises/hooks';
import { useRoutine, useAddRoutineItem } from '@/features/routines/hooks';

export default function AddItemScreen() {
  const p = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const routineId = Number(params.id);

  const { data: exercises = [] } = useExercises();
  const { data: routine } = useRoutine(routineId);
  const add = useAddRoutineItem();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(8);
  const [weight, setWeight] = useState<number | null>(null);

  const submit = async () => {
    if (selectedId == null) return;
    try {
      await add.mutateAsync({
        routineId,
        exerciseId: selectedId,
        position: routine?.items.length ?? 0,
        targetSets: sets,
        targetReps: reps,
        targetWeightKg: weight,
      });
      router.back();
    } catch (e) {
      Alert.alert('No se pudo añadir', String(e));
    }
  };

  const groups = groupBy(exercises, (e) => e.muscleGroup);

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScreenHeader title="Añadir ejercicio" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}>
        {Object.entries(groups).map(([muscle, exs]) => (
          <View key={muscle}>
            <Text
              style={{
                color: p.text3,
                fontFamily: fontVariant('sans', 700),
                fontSize: 11,
                letterSpacing: 1,
                textTransform: 'uppercase',
                paddingHorizontal: 4,
                paddingBottom: 8,
              }}
            >
              {muscle}
            </Text>
            <View
              style={{
                backgroundColor: p.surface,
                borderColor: p.border,
                borderWidth: 1,
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >
              {exs.map((e, i) => {
                const active = selectedId === e.id;
                return (
                  <View
                    key={e.id}
                    style={{
                      borderTopWidth: i > 0 ? 1 : 0,
                      borderTopColor: p.border,
                    }}
                  >
                    <Pressable
                      onPress={() => setSelectedId(active ? null : e.id)}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                      }}
                    >
                      <Text
                        style={{
                          color: active ? p.accent.primary : p.text,
                          fontFamily: fontVariant('sans', 600),
                          fontSize: 14,
                        }}
                      >
                        {e.name}
                      </Text>
                    </Pressable>
                    {active && (
                      <View
                        style={{
                          paddingHorizontal: 14,
                          paddingBottom: 14,
                          gap: 12,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            gap: 12,
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            borderRadius: 12,
                            backgroundColor: p.surface2,
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Stepper
                              label="Series"
                              value={sets}
                              step={1}
                              onChange={setSets}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Stepper
                              label="Reps"
                              value={reps}
                              step={1}
                              onChange={setReps}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Stepper
                              label="Kg"
                              value={weight}
                              step={2.5}
                              onChange={setWeight}
                            />
                          </View>
                        </View>
                        <Button onPress={submit} full>
                          Añadir
                        </Button>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function groupBy<T, K extends string>(items: T[], key: (i: T) => K): Record<K, T[]> {
  return items.reduce(
    (acc, i) => {
      const k = key(i);
      (acc[k] ||= []).push(i);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}
