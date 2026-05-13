import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Trophy } from 'phosphor-react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { fmtDayShort } from '@/lib/date';
import { LineChart, type Point } from '@/ui/charts/LineChart';
import { Segment } from '@/ui/primitives/Segment';
import type { Exercise } from '@/features/exercises/queries';
import {
  exerciseHistory,
  prIndices,
  type SessionWithSets,
} from './derived';
import {
  ChartCard,
  formatTickDate,
  NotEnough,
  SectionTitle,
  type SessionPair,
} from './shared-ui';

export function ExercisesTab({
  exercises,
  pairs,
  isDark,
  chartWidth,
}: {
  exercises: Exercise[];
  pairs: SessionPair[];
  isDark: boolean;
  chartWidth: number;
}) {
  const p = useTheme();
  const [mode, setMode] = useState<'topset' | 'volume'>('topset');

  const chips = useMemo(
    () =>
      [...exercises]
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 8),
    [exercises],
  );

  const [exId, setExId] = useState<number | null>(chips[0]?.id ?? null);
  const currentId =
    exId != null && chips.some((c) => c.id === exId)
      ? exId
      : (chips[0]?.id ?? null);

  if (chips.length === 0 || currentId == null) {
    return <NotEnough label="Aún no tienes ejercicios registrados." />;
  }

  const sessions: SessionWithSets[] = pairs.map(({ session, sets }) => ({
    id: session.id,
    startedAt: session.startedAt,
    finishedAt: session.finishedAt,
    sets: sets.map((s) => ({
      exerciseId: s.exerciseId,
      weightKg: s.weightKg,
      reps: s.reps,
    })),
  }));

  const history = exerciseHistory(sessions, currentId);

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, paddingVertical: 6 }}
      >
        {chips.map((e) => {
          const active = e.id === currentId;
          return (
            <Pressable
              key={e.id}
              onPress={() => setExId(e.id)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 999,
                backgroundColor: active ? p.accent.primary : p.surface2,
                borderWidth: active ? 0 : 1,
                borderColor: p.border,
              }}
            >
              <Text
                style={{
                  color: active ? '#fff' : p.text,
                  fontFamily: fontVariant('sans', 600),
                  fontSize: 12,
                }}
              >
                {e.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {history.length === 0 ? (
        <View style={{ marginTop: 12 }}>
          <NotEnough label="Sin sesiones registradas para este ejercicio." />
        </View>
      ) : (
        <ExercisesBody
          history={history}
          mode={mode}
          onMode={setMode}
          isDark={isDark}
          chartWidth={chartWidth}
        />
      )}
    </View>
  );
}

function ExercisesBody({
  history,
  mode,
  onMode,
  isDark,
  chartWidth,
}: {
  history: ReturnType<typeof exerciseHistory>;
  mode: 'topset' | 'volume';
  onMode: (v: 'topset' | 'volume') => void;
  isDark: boolean;
  chartWidth: number;
}) {
  const p = useTheme();
  const points: Point[] = history.map((h, i) => ({
    x: i,
    y: mode === 'topset' ? (h.topSet.weightKg ?? 0) : h.volume,
    raw: h,
  }));
  const prIdxs = prIndices(points.map((pt) => ({ y: pt.y })));
  const max = points.reduce((acc, pt) => Math.max(acc, pt.y), 0);
  const lastVal = points[points.length - 1]?.y ?? 0;
  const prLabel =
    mode === 'topset'
      ? `${max.toFixed(0)} kg`
      : `${(max / 1000).toFixed(1)} t`;
  const valueText =
    mode === 'topset' ? lastVal.toFixed(0) : (lastVal / 1000).toFixed(1);

  return (
    <View>
      <View style={{ paddingHorizontal: 4, paddingTop: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text
            style={{
              color: p.text,
              fontFamily: fontVariant('numeric', 700),
              fontSize: 44,
              letterSpacing: -1.8,
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
            {mode === 'topset' ? 'kg actual' : 't · vol'}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginTop: 6,
            flexWrap: 'wrap',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
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
          </View>
          <Text style={{ color: p.text3, fontSize: 12 }}>
            · {history.length} sesiones
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 10 }}>
        <Segment
          value={mode}
          onChange={onMode}
          size="sm"
          options={[
            { value: 'topset', label: 'Top set' },
            { value: 'volume', label: 'Volumen' },
          ]}
        />
      </View>

      <ChartCard>
        <LineChart
          points={points}
          width={chartWidth}
          height={170}
          color={p.accent.primary}
          dark={isDark}
          prIdxs={prIdxs}
          yFormat={(v) =>
            mode === 'topset'
              ? `${v.toFixed(0)} kg`
              : `${(v / 1000).toFixed(1)}t`
          }
          xFormat={(pt) => {
            const raw = pt.raw as { date: Date };
            return formatTickDate(raw.date);
          }}
        />
      </ChartCard>

      <SectionTitle title="Últimas sesiones" />
      <View style={{ gap: 6 }}>
        {[...history]
          .reverse()
          .slice(0, 5)
          .map((h, i) => (
            <View
              key={i}
              style={{
                padding: 12,
                borderRadius: 14,
                backgroundColor: p.surface,
                borderColor: p.border,
                borderWidth: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    color: p.text,
                    fontFamily: fontVariant('sans', 600),
                    fontSize: 13,
                  }}
                >
                  {fmtDayShort(h.date)}
                </Text>
                <Text style={{ color: p.text2, fontSize: 11, marginTop: 2 }}>
                  {h.setsCount} series · vol {(h.volume / 1000).toFixed(1)} t
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text
                  style={{
                    color: p.text,
                    fontFamily: fontVariant('numeric', 600),
                    fontSize: 16,
                  }}
                >
                  {h.topSet.weightKg ?? '—'}
                </Text>
                <Text style={{ color: p.text3, fontSize: 11, marginLeft: 3 }}>
                  kg
                </Text>
              </View>
            </View>
          ))}
      </View>
    </View>
  );
}
