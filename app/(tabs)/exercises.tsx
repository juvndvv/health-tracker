import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Barbell, MagnifyingGlass, CaretRight } from 'phosphor-react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { PageTitle } from '@/ui/primitives/PageTitle';
import { Empty } from '@/ui/primitives/Empty';
import { HeaderActionPlus } from '@/ui/primitives/HeaderActionPlus';
import { useExercises } from '@/features/exercises/hooks';

export default function ExercisesScreen() {
  const p = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { data: exercises = [], isLoading } = useExercises();

  if (!isLoading && exercises.length === 0) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: p.bg }} contentContainerStyle={{ paddingTop: 56 }}>
        <PageTitle
          title="Ejercicios"
          action={<HeaderActionPlus onPress={() => router.push('/exercise/new')} />}
        />
        <Empty
          icon={<Barbell size={28} color={p.accent.primary} />}
          title="Catálogo vacío"
          body="Añade los ejercicios que sueles hacer. Aparecerán al editar rutinas."
          cta="Nuevo ejercicio"
          onCta={() => router.push('/exercise/new')}
        />
      </ScrollView>
    );
  }

  const filtered = exercises.filter((e) => e.name.toLowerCase().includes(query.toLowerCase()));
  const groups = groupBy(filtered, (e) => e.muscleGroup);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: p.bg }}
      contentContainerStyle={{ paddingTop: 56, paddingBottom: 24 }}
    >
      <PageTitle
        title="Ejercicios"
        action={<HeaderActionPlus onPress={() => router.push('/exercise/new')} />}
      />

      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <View style={{ position: 'relative' }}>
          <View style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }}>
            <MagnifyingGlass size={16} color={p.text3} />
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar ejercicio"
            placeholderTextColor={p.text3}
            style={{
              paddingVertical: 11,
              paddingLeft: 36,
              paddingRight: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: p.border,
              backgroundColor: p.surface,
              color: p.text,
              fontSize: 14,
            }}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}>
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
              {exs.map((e, i) => (
                <Pressable
                  key={e.id}
                  onPress={() => router.push(`/exercise/${e.id}`)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderTopWidth: i > 0 ? 1 : 0,
                    borderTopColor: p.border,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: p.text,
                        fontFamily: fontVariant('sans', 600),
                        fontSize: 14,
                      }}
                    >
                      {e.name}
                    </Text>
                  </View>
                  <CaretRight size={16} color={p.text3} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
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
