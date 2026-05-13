import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { mixRgb } from '@/lib/color';
import { fmtDayShort, ymd } from '@/lib/date';
import { Heatmap, type HeatmapWeek } from '@/ui/charts/Heatmap';
import type { Exercise } from '@/features/exercises/queries';
import {
  heatmapWeeks,
  muscleVolumeStats,
  type SessionLite,
  type SessionWithSetsAndMuscle,
} from './derived';
import { NotEnough, SectionTitle, type SessionPair } from './shared-ui';

export function CalendarTab({
  pairs,
  exercises,
  isDark,
}: {
  pairs: SessionPair[];
  exercises: Exercise[];
  isDark: boolean;
}) {
  const p = useTheme();
  const today = useMemo(() => new Date(), []);
  const [selected, setSelected] = useState<Date | null>(null);

  const exerciseById = useMemo(() => {
    const map = new Map<number, Exercise>();
    for (const e of exercises) map.set(e.id, e);
    return map;
  }, [exercises]);

  const sessionLites: SessionLite[] = useMemo(
    () =>
      pairs.map(({ session, sets }) => ({
        startedAt: session.startedAt,
        finishedAt: session.finishedAt,
        sets: sets.map((s) => ({ weightKg: s.weightKg, reps: s.reps })),
      })),
    [pairs],
  );

  const totalSessions = pairs.length;
  const totalMinutes = useMemo(
    () =>
      pairs.reduce((acc, { session }) => {
        if (session.finishedAt == null) return acc;
        return (
          acc + Math.round((session.finishedAt - session.startedAt) / 60000)
        );
      }, 0),
    [pairs],
  );
  const avgPerWeek = (totalSessions / 26).toFixed(1);

  const heatWeeks = useMemo(
    () => heatmapWeeks(sessionLites, today, 26),
    [sessionLites, today],
  );

  const heatmapInput: HeatmapWeek[] = useMemo(
    () =>
      heatWeeks.map((week) =>
        week.map((day) => ({
          date: day.date,
          intensity: day.intensity,
          future: day.future,
          sessions:
            day.sessions != null
              ? new Array(day.sessions).fill(null)
              : undefined,
        })),
      ),
    [heatWeeks],
  );

  const selectedSessions = useMemo(() => {
    if (!selected) return [];
    const key = ymd(selected);
    return pairs.filter(
      ({ session }) => ymd(new Date(session.startedAt)) === key,
    );
  }, [pairs, selected]);

  const muscleSessions: SessionWithSetsAndMuscle[] = useMemo(
    () =>
      pairs.map(({ session, sets }) => ({
        startedAt: session.startedAt,
        sets: sets.map((s) => ({
          muscleGroup: exerciseById.get(s.exerciseId)?.muscleGroup ?? 'Otros',
        })),
      })),
    [pairs, exerciseById],
  );

  const muscleStats = useMemo(
    () => muscleVolumeStats(muscleSessions, today, 84),
    [muscleSessions, today],
  );

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4 }}>
        <BigStat value={String(totalSessions)} label="Sesiones" />
        <BigStat value={avgPerWeek} label="Por semana" />
        <BigStat value={`${Math.round(totalMinutes / 60)}h`} label="Total" />
      </View>

      <View
        style={{
          marginTop: 12,
          padding: 14,
          borderRadius: 18,
          backgroundColor: p.surface,
          borderColor: p.border,
          borderWidth: 1,
        }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Heatmap
            weeks={heatmapInput}
            accent={p.accent.primary}
            isDark={isDark}
            cellSize={12}
            onDayPress={(day) => setSelected(day.date)}
            selectedDate={selected}
          />
        </ScrollView>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 6,
            marginTop: 10,
          }}
        >
          <Text style={{ color: p.text3, fontSize: 10 }}>Menos</Text>
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: mixRgb(
                  p.accent.primary,
                  isDark ? '#000' : '#fff',
                  22 + i * 18,
                ),
              }}
            />
          ))}
          <Text style={{ color: p.text3, fontSize: 10 }}>Más</Text>
        </View>
      </View>

      {selected && selectedSessions.length > 0 ? (
        <View
          style={{
            marginTop: 12,
            padding: 14,
            borderRadius: 16,
            backgroundColor: p.accent.primaryLighter,
            borderWidth: 1,
            borderColor: p.accent.primaryLight,
          }}
        >
          <Text
            style={{
              color: p.text,
              fontFamily: fontVariant('sans', 700),
              fontSize: 13,
            }}
          >
            {fmtDayShort(selected)}
          </Text>
          {selectedSessions.map(({ session, sets }) => {
            const durationMin =
              session.finishedAt != null
                ? Math.round(
                    (session.finishedAt - session.startedAt) / 60000,
                  )
                : 0;
            return (
              <View
                key={session.id}
                style={{ marginTop: 8, flexDirection: 'row' }}
              >
                <Text
                  style={{
                    color: p.text,
                    fontFamily: fontVariant('sans', 600),
                    fontSize: 12,
                  }}
                >
                  {session.routineNameSnapshot}
                </Text>
                <Text style={{ color: p.text2, fontSize: 12 }}>
                  {' '}
                  · {sets.length} series · {durationMin} min
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View
          style={{
            marginTop: 12,
            paddingVertical: 11,
            paddingHorizontal: 14,
            borderRadius: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: p.text3, fontSize: 11 }}>
            Toca un día para ver detalles
          </Text>
        </View>
      )}

      <SectionTitle title="Por grupo muscular (12 sem)" />
      {muscleStats.length === 0 ? (
        <NotEnough label="Sin sesiones recientes para calcular volumen muscular." />
      ) : (
        <View style={{ gap: 6 }}>
          {muscleStats.map((m) => (
            <View
              key={m.name}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: p.surface,
                borderColor: p.border,
                borderWidth: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Text
                style={{
                  width: 90,
                  color: p.text,
                  fontFamily: fontVariant('sans', 600),
                  fontSize: 12,
                }}
              >
                {m.name}
              </Text>
              <View
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: p.surface2,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${m.pct}%`,
                    height: '100%',
                    backgroundColor: p.accent.primary,
                  }}
                />
              </View>
              <Text
                style={{
                  width: 56,
                  textAlign: 'right',
                  color: p.text2,
                  fontFamily: fontVariant('numeric', 500),
                  fontSize: 11,
                }}
              >
                {m.sessions} ses.
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function BigStat({ value, label }: { value: string; label: string }) {
  const p = useTheme();
  return (
    <View
      style={{
        flex: 1,
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
          fontFamily: fontVariant('numeric', 700),
          fontSize: 22,
          letterSpacing: -0.7,
          lineHeight: 24,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: p.text3,
          fontSize: 10,
          marginTop: 4,
          fontFamily: fontVariant('sans', 600),
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
