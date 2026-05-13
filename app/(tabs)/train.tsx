import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { List, Play } from 'phosphor-react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { useRoutines, useRoutine } from '@/features/routines/hooks';
import { useSessions } from '@/features/sessions/hooks';
import { suggestedRoutine } from '@/features/progress/derived';
import type { WorkoutSession } from '@/features/sessions/queries';
import type { Routine } from '@/features/routines/queries';
import { fmtRelative } from '@/lib/date';
import { Empty } from '@/ui/primitives/Empty';
import { PageTitle } from '@/ui/primitives/PageTitle';
import { RoutineBadge } from '@/ui/workout/RoutineBadge';

function getLatestByRoutine(sessions: WorkoutSession[]): Record<number, number> {
  const latest: Record<number, number> = {};
  for (const s of sessions) {
    if (s.routineId == null) continue;
    const prev = latest[s.routineId] ?? 0;
    if (s.startedAt > prev) latest[s.routineId] = s.startedAt;
  }
  return latest;
}

export default function Train() {
  const p = useTheme();
  const router = useRouter();
  const { data: routines = [] } = useRoutines();
  const { data: sessions = [] } = useSessions();

  const lastUsedAt = getLatestByRoutine(sessions);
  const suggestedId = suggestedRoutine(routines, lastUsedAt);
  const suggested = routines.find((r) => r.id === suggestedId) ?? null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: p.bg }}
      contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}
    >
      <PageTitle title="Entrenar" subtitle="Elige una rutina para empezar" />

      {routines.length === 0 ? (
        <Empty
          icon={<List size={28} color={p.accent.primary} />}
          title="No tienes rutinas"
          body="Crea una rutina para empezar a entrenar."
          cta="Crear rutina"
          onCta={() => router.push('/(tabs)/routines')}
        />
      ) : (
        <View>
          {suggested && (
            <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
              <SuggestedHero
                routine={suggested}
                lastUsedAt={lastUsedAt[suggested.id] ?? 0}
                onStart={() =>
                  router.push({ pathname: '/workout/start', params: { routineId: String(suggested.id) } })
                }
              />
            </View>
          )}

          <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 }}>
            <Text
              style={{
                color: p.text3,
                fontSize: 11,
                fontFamily: fontVariant('sans', 700),
                letterSpacing: 1.2,
                textTransform: 'uppercase',
              }}
            >
              Todas las rutinas
            </Text>
          </View>

          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            {routines.map((r) => (
              <RoutineRow
                key={r.id}
                routine={r}
                lastUsedAt={lastUsedAt[r.id] ?? 0}
                onStart={() =>
                  router.push({ pathname: '/workout/start', params: { routineId: String(r.id) } })
                }
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function SuggestedHero({
  routine,
  lastUsedAt,
  onStart,
}: {
  routine: Routine;
  lastUsedAt: number;
  onStart: () => void;
}) {
  const p = useTheme();
  const { data: detail } = useRoutine(routine.id);
  const itemCount = detail?.items.length ?? 0;
  const lastLabel =
    lastUsedAt > 0 ? `Última vez ${fmtRelative(new Date(lastUsedAt))}` : 'Sin historial';

  return (
    <LinearGradient
      colors={[p.accent.primary, p.accent.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 24, padding: 20, overflow: 'hidden' }}
    >
      <Text
        style={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: 11,
          fontFamily: fontVariant('sans', 700),
          letterSpacing: 1.6,
          textTransform: 'uppercase',
        }}
      >
        Recomendado hoy
      </Text>
      <Text
        style={{
          color: '#fff',
          fontSize: 32,
          fontFamily: fontVariant('sans', 800),
          letterSpacing: -1,
          marginTop: 6,
          lineHeight: 34,
        }}
      >
        {routine.name}
      </Text>
      <Text
        style={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: 13,
          marginTop: 6,
        }}
      >
        {itemCount} ejercicios · {lastLabel}
      </Text>
      <View style={{ marginTop: 16, flexDirection: 'row' }}>
        <Pressable
          onPress={onStart}
          style={{
            backgroundColor: '#fff',
            borderRadius: 14,
            paddingHorizontal: 20,
            height: 44,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Play size={18} color={p.accent.primary} weight="fill" />
          <Text
            style={{
              color: p.accent.primary,
              fontFamily: fontVariant('sans', 700),
              fontSize: 15,
            }}
          >
            Empezar
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

function RoutineRow({
  routine,
  lastUsedAt,
  onStart,
}: {
  routine: Routine;
  lastUsedAt: number;
  onStart: () => void;
}) {
  const p = useTheme();
  const { data: detail } = useRoutine(routine.id);
  const itemCount = detail?.items.length ?? 0;
  const lastLabel = lastUsedAt > 0 ? fmtRelative(new Date(lastUsedAt)) : 'nueva';

  return (
    <Pressable
      onPress={onStart}
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
      <RoutineBadge name={routine.name} size={44} />
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
          {itemCount} ejercicios · {lastLabel}
        </Text>
      </View>
      <Pressable
        onPress={onStart}
        hitSlop={8}
        style={{
          width: 36,
          height: 36,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: p.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Play size={16} color={p.text} weight="fill" />
      </Pressable>
    </Pressable>
  );
}
