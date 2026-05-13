import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle } from 'phosphor-react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { ScreenHeader } from '@/ui/primitives/ScreenHeader';
import { Button } from '@/ui/primitives/Button';
import { sessionQueries } from '@/features/sessions';
import { fmtDayShort } from '@/lib/date';
import type { SessionSet, WorkoutSession } from '@/features/sessions/queries';

export default function WorkoutSummary() {
  const p = useTheme();
  const router = useRouter();
  const { sessionId: idParam } = useLocalSearchParams<{ sessionId?: string }>();
  const sessionId = Number(idParam);

  const [data, setData] = useState<{
    session: WorkoutSession;
    sets: SessionSet[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!sessionId || isNaN(sessionId)) {
        router.back();
        return;
      }
      const result = await sessionQueries.getSessionWithSets(sessionId);
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, router]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: p.bg,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator color={p.accent.primary} />
      </View>
    );
  }
  if (!data) {
    return (
      <View style={{ flex: 1, backgroundColor: p.bg }}>
        <ScreenHeader title="Resumen" onBack={() => router.back()} />
      </View>
    );
  }

  const { session, sets } = data;

  const totalVolumeKg = sets.reduce((a, s) => a + (s.weightKg ?? 0) * s.reps, 0);
  const durationMin = session.finishedAt
    ? Math.max(1, Math.round((session.finishedAt - session.startedAt) / 60000))
    : 0;

  const grouped: { exerciseName: string; sets: SessionSet[] }[] = [];
  for (const s of sets) {
    let g = grouped.find((x) => x.exerciseName === s.exerciseNameSnapshot);
    if (!g) {
      g = { exerciseName: s.exerciseNameSnapshot, sets: [] };
      grouped.push(g);
    }
    g.sets.push(s);
  }

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScreenHeader title="Resumen" onBack={() => router.replace('/(tabs)')} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 999,
              backgroundColor: p.accent.primaryLighter,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle size={48} color={p.accent.primary} weight="bold" />
          </View>
          <Text
            style={{
              color: p.text,
              fontFamily: fontVariant('sans', 800),
              fontSize: 24,
              marginTop: 14,
              letterSpacing: -0.5,
            }}
          >
            ¡Sesión completa!
          </Text>
          <Text style={{ color: p.text2, fontSize: 14, marginTop: 2 }}>
            {session.routineNameSnapshot} ·{' '}
            {fmtDayShort(new Date(session.startedAt))}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <StatCard label="Series" value={String(sets.length)} />
          <StatCard
            label="Volumen"
            value={`${(totalVolumeKg / 1000).toFixed(1)} t`}
          />
          <StatCard label="Duración" value={`${durationMin}'`} />
        </View>

        <Text
          style={{
            color: p.text3,
            fontFamily: fontVariant('sans', 700),
            fontSize: 11,
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginTop: 20,
            marginBottom: 10,
            paddingHorizontal: 4,
          }}
        >
          Por ejercicio
        </Text>
        <View style={{ gap: 8 }}>
          {grouped.map((g, i) => (
            <View
              key={i}
              style={{
                padding: 12,
                borderRadius: 14,
                backgroundColor: p.surface,
                borderColor: p.border,
                borderWidth: 1,
              }}
            >
              <Text
                style={{
                  color: p.text,
                  fontFamily: fontVariant('sans', 700),
                  fontSize: 14,
                }}
              >
                {g.exerciseName}
              </Text>
              <Text
                style={{
                  color: p.text2,
                  fontSize: 12,
                  marginTop: 4,
                  fontFamily: fontVariant('numeric', 500),
                }}
              >
                {g.sets.map((s) => `${s.weightKg ?? '—'}×${s.reps}`).join(' · ')}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 20 }}>
          <Button full size="lg" onPress={() => router.replace('/(tabs)')}>
            Volver al inicio
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  const p = useTheme();
  return (
    <View
      style={{
        flex: 1,
        padding: 14,
        borderRadius: 14,
        alignItems: 'center',
        backgroundColor: p.surface,
        borderColor: p.border,
        borderWidth: 1,
      }}
    >
      <Text
        style={{
          color: p.text,
          fontFamily: fontVariant('numeric', 700),
          fontSize: 26,
          letterSpacing: -1,
        }}
      >
        {value}
      </Text>
      <Text style={{ color: p.text3, fontSize: 11, marginTop: 4 }}>{label}</Text>
    </View>
  );
}
