import { View, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { radius, space } from '@/theme/tokens';
import { parseYmd } from '@/lib/date';

const TICK_MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
] as const;

export function formatTickDate(d: string | Date): string {
  const date = typeof d === 'string' ? parseYmd(d) : d;
  return `${date.getDate()} ${TICK_MONTHS[date.getMonth()]}`;
}

export function SectionTitle({ title }: { title: string }) {
  const p = useTheme();
  return (
    <Text
      style={{
        color: p.text2,
        fontFamily: fontVariant('sans', 700),
        fontSize: 13,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        marginTop: 18,
        marginBottom: 8,
      }}
    >
      {title}
    </Text>
  );
}

export function NotEnough({ label }: { label: string }) {
  const p = useTheme();
  return (
    <View
      style={{
        backgroundColor: p.surface,
        borderColor: p.border,
        borderWidth: 1,
        borderRadius: radius['2xl'],
        padding: space[5],
        alignItems: 'center',
      }}
    >
      <Text style={{ color: p.text2, fontSize: 13, textAlign: 'center' }}>
        {label}
      </Text>
    </View>
  );
}

export function ChartCard({ children }: { children: React.ReactNode }) {
  const p = useTheme();
  return (
    <View
      style={{
        marginTop: 10,
        paddingVertical: 12,
        paddingHorizontal: 6,
        borderRadius: 18,
        backgroundColor: p.surface,
        borderColor: p.border,
        borderWidth: 1,
      }}
    >
      {children}
    </View>
  );
}

export function ListCard({ children }: { children: React.ReactNode }) {
  const p = useTheme();
  return (
    <View
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: p.surface,
        borderColor: p.border,
        borderWidth: 1,
      }}
    >
      {children}
    </View>
  );
}

export function ListRow({
  first,
  left,
  rightValue,
  rightUnit,
}: {
  first: boolean;
  left: string;
  rightValue: string;
  rightUnit: string;
}) {
  const p = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 11,
        paddingHorizontal: 14,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: p.border,
      }}
    >
      <Text style={{ color: p.text, fontSize: 13 }}>{left}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text
          style={{
            color: p.text,
            fontFamily: fontVariant('numeric', 600),
            fontSize: 15,
          }}
        >
          {rightValue}
        </Text>
        <Text style={{ color: p.text3, fontSize: 11, marginLeft: 4 }}>
          {rightUnit}
        </Text>
      </View>
    </View>
  );
}

export type SessionPair = {
  session: { id: number; startedAt: number; finishedAt: number | null; routineNameSnapshot: string };
  sets: {
    exerciseId: number;
    weightKg: number | null;
    reps: number;
  }[];
};
