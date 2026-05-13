import { useMemo, useState } from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trophy } from 'phosphor-react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { ScreenHeader } from '@/ui/primitives/ScreenHeader';
import { Segment } from '@/ui/primitives/Segment';
import { Tag } from '@/ui/primitives/Tag';
import { LineChart, type Point } from '@/ui/charts/LineChart';
import { useExercise } from '@/features/exercises/hooks';
import { useSessionsWithSets } from '@/features/sessions/hooks';
import {
  exerciseHistory,
  prIndices,
  type SessionWithSets,
} from '@/features/progress/derived';
import { fmtRelative } from '@/lib/date';

export default function ExerciseDetail() {
  const p = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const exerciseId = Number(id);
  const validId = !Number.isNaN(exerciseId) ? exerciseId : null;

  const { data: exercise } = useExercise(validId);
  const { data: sessionsWithSets = [] } = useSessionsWithSets();

  const sessions: SessionWithSets[] = useMemo(
    () =>
      sessionsWithSets.map((sw) => ({
        id: sw.session.id,
        startedAt: sw.session.startedAt,
        finishedAt: sw.session.finishedAt,
        sets: sw.sets.map((s) => ({
          exerciseId: s.exerciseId,
          weightKg: s.weightKg,
          reps: s.reps,
        })),
      })),
    [sessionsWithSets],
  );

  const history = useMemo(
    () => (validId != null ? exerciseHistory(sessions, validId) : []),
    [sessions, validId],
  );
  const [mode, setMode] = useState<'topset' | 'volume'>('topset');

  const points: Point[] = useMemo(
    () =>
      history.map((h, i) => ({
        x: i,
        y: mode === 'topset' ? (h.topSet.weightKg ?? 0) : h.volume,
        raw: h,
      })),
    [history, mode],
  );
  const prIdxs = useMemo(
    () => prIndices(points.map((pt) => ({ y: pt.y }))),
    [points],
  );
  const max = points.reduce((m, pt) => Math.max(m, pt.y), 0);
  const lastVal = points.length ? points[points.length - 1]!.y : 0;
  const chartW = Dimensions.get('window').width - 32;
  const prLabel =
    mode === 'topset'
      ? `${max.toFixed(0)} kg`
      : `${(max / 1000).toFixed(1)} t`;
  const valueText =
    mode === 'topset' ? lastVal.toFixed(0) : (lastVal / 1000).toFixed(1);

  if (!exercise) {
    return (
      <View style={{ flex: 1, backgroundColor: p.bg }}>
        <ScreenHeader title="Ejercicio" onBack={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <ScreenHeader title={exercise.name} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <Text
          style={{
            color: p.text3,
            fontFamily: fontVariant('sans', 700),
            fontSize: 11,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          {exercise.muscleGroup}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: 6,
            marginTop: 8,
          }}
        >
          <Text
            style={{
              color: p.text,
              fontFamily: fontVariant('numeric', 700),
              fontSize: 44,
              letterSpacing: -1.5,
              lineHeight: 46,
            }}
          >
            {valueText}
          </Text>
          <Text
            style={{
              color: p.text2,
              fontFamily: fontVariant('sans', 600),
              fontSize: 14,
            }}
          >
            {mode === 'topset' ? 'kg' : 't · vol'}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginTop: 4,
          }}
        >
          <Trophy size={14} color={p.accent.primary} weight="fill" />
          <Text
            style={{
              color: p.accent.primary,
              fontFamily: fontVariant('sans', 700),
              fontSize: 12,
            }}
          >
            PR · {prLabel}
          </Text>
          <Text style={{ color: p.text3, fontSize: 12 }}>
            · {history.length} sesiones
          </Text>
        </View>

        <View style={{ marginTop: 14 }}>
          <Segment
            value={mode}
            onChange={setMode}
            options={[
              { value: 'topset', label: 'Top set' },
              { value: 'volume', label: 'Volumen' },
            ]}
          />
        </View>

        <View
          style={{
            marginTop: 12,
            padding: 8,
            borderRadius: 18,
            backgroundColor: p.surface,
            borderColor: p.border,
            borderWidth: 1,
          }}
        >
          <LineChart
            points={points}
            width={chartW - 16}
            height={170}
            color={p.accent.primary}
            dark={p.bg === '#000000'}
            prIdxs={prIdxs}
            yFormat={(v) =>
              mode === 'topset'
                ? `${v.toFixed(0)} kg`
                : `${(v / 1000).toFixed(1)}t`
            }
          />
        </View>

        <Text
          style={{
            color: p.text3,
            fontFamily: fontVariant('sans', 700),
            fontSize: 11,
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginTop: 20,
            marginBottom: 8,
          }}
        >
          Historial
        </Text>

        <View style={{ gap: 6 }}>
          {[...history]
            .reverse()
            .slice(0, 8)
            .map((h, i) => {
              const idx = history.indexOf(h);
              const isPR = prIdxs.includes(idx);
              return (
                <View
                  key={i}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    backgroundColor: p.surface,
                    borderColor: p.border,
                    borderWidth: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: p.text,
                        fontFamily: fontVariant('sans', 600),
                        fontSize: 13,
                      }}
                    >
                      {fmtRelative(h.date)}
                    </Text>
                    <Text style={{ color: p.text2, fontSize: 11 }}>
                      {h.setsCount} series · {(h.volume / 1000).toFixed(1)} t
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: p.text,
                      fontFamily: fontVariant('numeric', 600),
                      fontSize: 16,
                    }}
                  >
                    {h.topSet.weightKg ?? '—'}
                    <Text style={{ color: p.text3, fontSize: 11 }}> kg</Text>
                  </Text>
                  {isPR && <Tag>PR</Tag>}
                </View>
              );
            })}
        </View>
      </ScrollView>
    </View>
  );
}
