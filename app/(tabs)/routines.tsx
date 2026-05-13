import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { List, CaretRight, Archive } from 'phosphor-react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { PageTitle } from '@/ui/primitives/PageTitle';
import { Empty } from '@/ui/primitives/Empty';
import { HeaderActionPlus } from '@/ui/primitives/HeaderActionPlus';
import { RoutineBadge } from '@/ui/workout/RoutineBadge';
import {
  useAllRoutines,
  useRoutine,
  useRestoreRoutine,
} from '@/features/routines/hooks';
import type { Routine } from '@/features/routines';

export default function RoutinesScreen() {
  const p = useTheme();
  const router = useRouter();
  const { data: all = [], isLoading } = useAllRoutines();

  const active = all.filter((r) => r.archivedAt == null);
  const archived = all.filter((r) => r.archivedAt != null);

  if (!isLoading && active.length === 0 && archived.length === 0) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: p.bg }}
        contentContainerStyle={{ paddingTop: 56 }}
      >
        <PageTitle
          title="Rutinas"
          action={<HeaderActionPlus onPress={() => router.push('/routine/edit')} />}
        />
        <Empty
          icon={<List size={28} color={p.accent.primary} />}
          title="Crea tu primera rutina"
          body="Una rutina es un conjunto de ejercicios con series, repeticiones y peso objetivo."
          cta="Nueva rutina"
          onCta={() => router.push('/routine/edit')}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: p.bg }}
      contentContainerStyle={{ paddingTop: 56, paddingBottom: 24 }}
    >
      <PageTitle
        title="Rutinas"
        action={<HeaderActionPlus onPress={() => router.push('/routine/edit')} />}
      />

      <View style={{ paddingHorizontal: 16, gap: 10 }}>
        {active.map((r) => (
          <RoutineRow
            key={r.id}
            routine={r}
            onPress={() => router.push({ pathname: '/routine/edit', params: { id: String(r.id) } })}
          />
        ))}
      </View>

      {archived.length > 0 && (
        <>
          <Text
            style={{
              color: p.text3,
              fontFamily: fontVariant('sans', 700),
              fontSize: 11,
              letterSpacing: 1,
              textTransform: 'uppercase',
              paddingHorizontal: 20,
              paddingTop: 22,
              paddingBottom: 10,
            }}
          >
            Archivadas
          </Text>
          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            {archived.map((r) => (
              <ArchivedRow key={r.id} routine={r} />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function RoutineRow({ routine, onPress }: { routine: Routine; onPress: () => void }) {
  const p = useTheme();
  const { data } = useRoutine(routine.id);
  const items = data?.items ?? [];
  const sets = items.reduce((a, i) => a + i.targetSets, 0);

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 18,
        backgroundColor: p.surface,
        borderWidth: 1,
        borderColor: p.border,
      }}
    >
      <RoutineBadge name={routine.name} size={42} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            color: p.text,
            fontFamily: fontVariant('sans', 700),
            fontSize: 15,
            letterSpacing: -0.1,
          }}
        >
          {routine.name}
        </Text>
        <Text style={{ color: p.text3, fontSize: 12, marginTop: 2 }}>
          {items.length} ejercicios · {sets} series
        </Text>
      </View>
      <CaretRight size={18} color={p.text3} />
    </Pressable>
  );
}

function ArchivedRow({ routine }: { routine: Routine }) {
  const p = useTheme();
  const restore = useRestoreRoutine();
  return (
    <View
      style={{
        opacity: 0.65,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 18,
        backgroundColor: p.surface,
        borderWidth: 1,
        borderColor: p.border,
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 16,
          backgroundColor: p.surface2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Archive size={20} color={p.text3} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: p.text, fontFamily: fontVariant('sans', 600), fontSize: 14 }}>
          {routine.name}
        </Text>
        <Text style={{ color: p.text3, fontSize: 11 }}>Archivada</Text>
      </View>
      <Pressable onPress={() => restore.mutate(routine.id)}>
        <Text
          style={{
            color: p.accent.primary,
            fontFamily: fontVariant('sans', 600),
            fontSize: 12,
          }}
        >
          Restaurar
        </Text>
      </Pressable>
    </View>
  );
}
