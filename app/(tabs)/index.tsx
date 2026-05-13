import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  CaretRight,
  Flame,
  Gear,
  Play,
  Ruler,
  Scales,
  TrendDown,
  TrendUp,
} from 'phosphor-react-native';
import { useTheme, useIsDark } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { radius, space } from '@/theme/tokens';
import { mixRgb } from '@/lib/color';
import { useSettingsStore } from '@/features/settings/store';
import { useWeights } from '@/features/body-weight/hooks';
import { useSessionsWithSets } from '@/features/sessions/hooks';
import {
  currentStreak,
  heatmapWeeks,
  thisWeekStats,
  type SessionLite,
  type WeeklyStats,
} from '@/features/progress/derived';
import { fmtDayShort, fmtRelative, parseYmd, ymd } from '@/lib/date';
import type { BodyWeight } from '@/features/body-weight/queries';
import type { SessionSet, WorkoutSession } from '@/features/sessions/queries';
import { Empty } from '@/ui/primitives/Empty';
import { PageTitle } from '@/ui/primitives/PageTitle';
import { ActivityRing } from '@/ui/charts/ActivityRing';
import { Sparkline } from '@/ui/charts/Sparkline';
import { Heatmap, type HeatmapWeek } from '@/ui/charts/Heatmap';
import { RoutineBadge } from '@/ui/workout/RoutineBadge';

const RING_MINUTES = '#10B981';
const RING_VOLUME = '#3B82F6';

export default function Home() {
  const p = useTheme();
  const isDark = useIsDark();
  const router = useRouter();
  const today = new Date();

  const settings = useSettingsStore((s) => s.data);
  const ownerName = settings?.ownerName ?? null;
  const goals = {
    sessions: settings?.weeklyGoalSessions ?? 4,
    minutes: settings?.weeklyGoalMinutes ?? 240,
    volumeKg: settings?.weeklyGoalVolumeKg ?? 18000,
  };

  const { data: weights = [] } = useWeights();
  const { data: pairs = [] } = useSessionsWithSets();

  const sessionLites: SessionLite[] = pairs.map(({ session, sets }) => ({
    startedAt: session.startedAt,
    finishedAt: session.finishedAt,
    sets: sets.map((s) => ({ weightKg: s.weightKg, reps: s.reps })),
  }));

  const stats = thisWeekStats(sessionLites, today, goals);
  const sessionYmd = new Set(
    pairs.map(({ session }) => ymd(new Date(session.startedAt))),
  );
  const streak = currentStreak(sessionYmd, today);
  const weeks: HeatmapWeek[] = heatmapWeeks(sessionLites, today, 26)
    .slice(-12)
    .map((week) =>
      week.map((day) => ({
        date: day.date,
        intensity: day.intensity,
        future: day.future,
        sessions:
          day.sessions != null ? new Array(day.sessions).fill(null) : undefined,
      })),
    );

  const lastWeight = weights.length > 0 ? weights[weights.length - 1]! : null;
  const lastFinishedPair =
    pairs.find(({ session }) => session.finishedAt != null) ?? null;
  const hasData = weights.length > 0 || pairs.length > 0;

  const greeting = ownerName ? `Hola, ${ownerName}` : 'Hola';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: p.bg }}
      contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}
    >
      <PageTitle
        title={greeting}
        subtitle={fmtDayShort(today)}
        action={
          <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
            <Gear size={24} color={p.text} />
          </Pressable>
        }
      />

      {!hasData ? (
        <Empty
          title="Aún no hay datos"
          body="Crea tu primera rutina o registra tu peso para empezar."
          cta="Crear primera rutina"
          onCta={() => router.push('/(tabs)/routines')}
        />
      ) : (
        <View>
          <ActivityRingsCard stats={stats} accent={p.accent.primary} isDark={isDark} />

          <QuickTileGrid
            lastWeight={lastWeight}
            streak={streak}
            onRouteToTrain={() => router.push('/(tabs)/train')}
            onRouteToWeight={() => router.push('/record-weight')}
            onRouteToMeasure={() => router.push('/record-measurement')}
          />

          {lastWeight && weights.length >= 2 ? (
            <>
              <SectionTitle
                title="Peso corporal"
                action="Ver"
                onAction={() => router.push('/(tabs)/progress')}
              />
              <WeightCard
                weights={weights}
                today={today}
                accent={p.accent.primary}
              />
            </>
          ) : null}

          {lastFinishedPair ? (
            <>
              <SectionTitle
                title="Último entrenamiento"
                action="Historial"
                onAction={() => router.push('/(tabs)/progress')}
              />
              <LastSessionCard
                session={lastFinishedPair.session}
                sets={lastFinishedPair.sets}
                onPress={() =>
                  router.push(`/workout-summary/${lastFinishedPair.session.id}`)
                }
              />
            </>
          ) : null}

          <SectionTitle title="Cadencia" />
          <CadenceCard weeks={weeks} accent={p.accent.primary} isDark={isDark} />
        </View>
      )}
    </ScrollView>
  );
}

function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const p = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 8,
      }}
    >
      <Text
        style={{
          color: p.text2,
          fontFamily: fontVariant('sans', 700),
          fontSize: 13,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Text>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text
            style={{
              color: p.accent.primary,
              fontFamily: fontVariant('sans', 600),
              fontSize: 13,
            }}
          >
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ActivityRingsCard({
  stats,
  accent,
  isDark,
}: {
  stats: WeeklyStats;
  accent: string;
  isDark: boolean;
}) {
  const p = useTheme();
  const trackColor = isDark ? 'rgba(255,255,255,0.08)' : '#EFEFEF';

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 14,
        backgroundColor: p.surface,
        borderColor: p.border,
        borderWidth: 1,
        borderRadius: radius['2xl'],
        padding: 18,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              color: p.text3,
              fontFamily: fontVariant('sans', 700),
              fontSize: 11,
              letterSpacing: 1.3,
              textTransform: 'uppercase',
            }}
          >
            Esta semana
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              marginTop: 4,
            }}
          >
            <Text
              style={{
                color: p.text,
                fontFamily: fontVariant('numeric', 700),
                fontSize: 32,
                letterSpacing: -0.9,
              }}
            >
              {stats.sessions}
            </Text>
            <Text
              style={{
                color: p.text3,
                fontFamily: fontVariant('numeric', 500),
                fontSize: 18,
                marginLeft: 4,
              }}
            >
              / {stats.sessionsGoal}
            </Text>
          </View>
          <Text style={{ color: p.text2, fontSize: 12, marginTop: 2 }}>
            sesiones · meta semanal
          </Text>
        </View>

        <View style={{ width: 112, height: 112 }}>
          <View style={{ position: 'absolute', top: 0, left: 0 }}>
            <ActivityRing
              size={112}
              stroke={11}
              value={stats.sessions}
              goal={stats.sessionsGoal}
              color={accent}
              trackColor={trackColor}
            />
          </View>
          <View style={{ position: 'absolute', top: 13, left: 13 }}>
            <ActivityRing
              size={86}
              stroke={10}
              value={stats.minutes}
              goal={stats.minutesGoal}
              color={RING_MINUTES}
              trackColor={trackColor}
            />
          </View>
          <View style={{ position: 'absolute', top: 26, left: 26 }}>
            <ActivityRing
              size={60}
              stroke={9}
              value={stats.volumeKg}
              goal={stats.volumeGoalKg}
              color={RING_VOLUME}
              trackColor={trackColor}
            />
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 16 }}>
        <RingLegend
          color={accent}
          label="Sesiones"
          value={`${stats.sessions} / ${stats.sessionsGoal}`}
        />
        <RingLegend
          color={RING_MINUTES}
          label="Minutos"
          value={`${stats.minutes} / ${stats.minutesGoal}`}
        />
        <RingLegend
          color={RING_VOLUME}
          label="Volumen"
          value={`${(stats.volumeKg / 1000).toFixed(1)} / ${(stats.volumeGoalKg / 1000).toFixed(0)}t`}
        />
      </View>
    </View>
  );
}

function RingLegend({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  const p = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
        minWidth: 0,
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          backgroundColor: color,
        }}
      />
      <View style={{ minWidth: 0, flex: 1 }}>
        <Text
          style={{
            color: p.text3,
            fontFamily: fontVariant('sans', 700),
            fontSize: 9,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: p.text,
            fontFamily: fontVariant('sans', 600),
            fontSize: 12,
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function QuickTileGrid({
  lastWeight,
  streak,
  onRouteToTrain,
  onRouteToWeight,
  onRouteToMeasure,
}: {
  lastWeight: BodyWeight | null;
  streak: number;
  onRouteToTrain: () => void;
  onRouteToWeight: () => void;
  onRouteToMeasure: () => void;
}) {
  const p = useTheme();
  const weightSubline = lastWeight
    ? `${lastWeight.weightKg.toFixed(1)} kg · ${fmtRelative(parseYmd(lastWeight.recordedOn))}`
    : 'Sin registros';
  const streakSubline =
    streak === 1 ? '1 semana en racha' : `${streak} semanas en racha`;

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 14,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
      }}
    >
      <QuickTile
        renderIcon={(color) => <Play size={20} color={color} weight="fill" />}
        label="Entrenar"
        sublabel="Elegir rutina"
        primary
        onPress={onRouteToTrain}
      />
      <QuickTile
        renderIcon={(color) => <Scales size={20} color={color} />}
        label="Peso"
        sublabel={weightSubline}
        onPress={onRouteToWeight}
      />
      <QuickTile
        renderIcon={(color) => <Ruler size={20} color={color} />}
        label="Medida"
        sublabel="Cintura, brazo…"
        onPress={onRouteToMeasure}
      />
      <QuickTile
        renderIcon={() => (
          <Flame size={20} color={p.accent.primary} weight="fill" />
        )}
        label={`${streak}`}
        sublabel={streakSubline}
      />
    </View>
  );
}

function QuickTile({
  renderIcon,
  label,
  sublabel,
  primary,
  onPress,
}: {
  renderIcon: (color: string) => React.ReactNode;
  label: string;
  sublabel: string;
  primary?: boolean;
  onPress?: () => void;
}) {
  const p = useTheme();
  const bg = primary ? p.accent.primary : p.surface;
  const fg = primary ? '#fff' : p.text;
  const subFg = primary ? 'rgba(255,255,255,0.85)' : p.text2;

  const content = (
    <View
      style={{
        flex: 1,
        backgroundColor: bg,
        borderRadius: 18,
        padding: 14,
        minHeight: 84,
        gap: 8,
        borderWidth: primary ? 0 : 1,
        borderColor: p.border,
      }}
    >
      {renderIcon(fg)}
      <View>
        <Text
          style={{
            color: fg,
            fontFamily: fontVariant('sans', 700),
            fontSize: 15,
            letterSpacing: -0.15,
          }}
        >
          {label}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: subFg,
            fontSize: 11,
            marginTop: 2,
          }}
        >
          {sublabel}
        </Text>
      </View>
    </View>
  );

  if (!onPress) {
    return <View style={{ width: '48.5%' }}>{content}</View>;
  }
  return (
    <Pressable onPress={onPress} style={{ width: '48.5%' }}>
      {content}
    </Pressable>
  );
}

function WeightCard({
  weights,
  today,
  accent,
}: {
  weights: BodyWeight[];
  today: Date;
  accent: string;
}) {
  const p = useTheme();
  const last = weights[weights.length - 1]!;
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - 180);
  const baseline =
    weights.find((w) => parseYmd(w.recordedOn) >= cutoff) ?? weights[0]!;
  const delta = last.weightKg - baseline.weightKg;
  const isDown = delta < 0;
  const deltaColor = isDown ? '#10B981' : p.warning;
  const series = weights.slice(-30).map((w) => w.weightKg);

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 14,
        backgroundColor: p.surface,
        borderColor: p.border,
        borderWidth: 1,
        borderRadius: radius['2xl'],
        padding: space[5],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text
            style={{
              color: p.text,
              fontFamily: fontVariant('numeric', 600),
              fontSize: 38,
              letterSpacing: -1.2,
              lineHeight: 40,
            }}
          >
            {last.weightKg.toFixed(1)}
          </Text>
          <Text
            style={{
              color: p.text2,
              fontFamily: fontVariant('numeric', 500),
              fontSize: 16,
              marginLeft: 4,
            }}
          >
            kg
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginTop: 6,
          }}
        >
          {isDown ? (
            <TrendDown size={12} color={deltaColor} weight="bold" />
          ) : (
            <TrendUp size={12} color={deltaColor} weight="bold" />
          )}
          <Text
            style={{
              color: deltaColor,
              fontFamily: fontVariant('sans', 600),
              fontSize: 12,
            }}
          >
            {isDown ? '−' : '+'}
            {Math.abs(delta).toFixed(1)} kg
          </Text>
          <Text style={{ color: p.text3, fontSize: 12 }}>· 6 meses</Text>
        </View>
      </View>
      <Sparkline
        values={series}
        width={120}
        height={44}
        color={accent}
        fill={mixRgb(accent, p.surface, 18)}
      />
    </View>
  );
}

function LastSessionCard({
  session,
  sets,
  onPress,
}: {
  session: WorkoutSession;
  sets: SessionSet[];
  onPress: () => void;
}) {
  const p = useTheme();
  const startedAt = new Date(session.startedAt);
  const durationMin =
    session.finishedAt != null
      ? Math.round((session.finishedAt - session.startedAt) / 60000)
      : 0;
  const volumeKg = sets.reduce(
    (acc, s) => acc + (s.weightKg ?? 0) * s.reps,
    0,
  );

  return (
    <Pressable
      onPress={onPress}
      style={{
        marginHorizontal: 16,
        marginBottom: 14,
        backgroundColor: p.surface,
        borderColor: p.border,
        borderWidth: 1,
        borderRadius: radius['2xl'],
        padding: space[5],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <RoutineBadge name={session.routineNameSnapshot} size={48} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{
              color: p.text,
              fontFamily: fontVariant('sans', 700),
              fontSize: 16,
              letterSpacing: -0.15,
            }}
          >
            {session.routineNameSnapshot}
          </Text>
          <Text style={{ color: p.text2, fontSize: 12, marginTop: 2 }}>
            {fmtRelative(startedAt)} · {durationMin} min
          </Text>
        </View>
        <CaretRight size={18} color={p.text3} />
      </View>
      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          marginTop: 14,
        }}
      >
        <Metric value={`${sets.length}`} label="Series" />
        <Metric value={`${(volumeKg / 1000).toFixed(1)}t`} label="Volumen" />
        <Metric value={`${durationMin}'`} label="Duración" />
      </View>
    </Pressable>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  const p = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          color: p.text,
          fontFamily: fontVariant('numeric', 600),
          fontSize: 22,
          letterSpacing: -0.7,
          lineHeight: 24,
        }}
      >
        {value}
      </Text>
      <Text style={{ color: p.text3, fontSize: 11, marginTop: 3 }}>{label}</Text>
    </View>
  );
}

function CadenceCard({
  weeks,
  accent,
  isDark,
}: {
  weeks: HeatmapWeek[];
  accent: string;
  isDark: boolean;
}) {
  const p = useTheme();
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 14,
        backgroundColor: p.surface,
        borderColor: p.border,
        borderWidth: 1,
        borderRadius: radius['2xl'],
        padding: space[5],
      }}
    >
      <Heatmap weeks={weeks} accent={accent} isDark={isDark} cellSize={12} />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 8,
        }}
      >
        <Text style={{ color: p.text3, fontSize: 11 }}>Hace 12 sem.</Text>
        <Text style={{ color: p.text3, fontSize: 11 }}>Hoy</Text>
      </View>
    </View>
  );
}
