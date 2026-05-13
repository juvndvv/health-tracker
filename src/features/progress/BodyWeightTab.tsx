import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { TrendDown, TrendUp } from 'phosphor-react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { fmtDayShort, parseYmd, ymd } from '@/lib/date';
import { LineChart, type Point } from '@/ui/charts/LineChart';
import type { BodyWeight } from '@/features/body-weight/queries';
import {
  ChartCard,
  formatTickDate,
  ListCard,
  ListRow,
  NotEnough,
  SectionTitle,
} from './shared-ui';

export type WeightRange = '1M' | '3M' | '6M' | '1A' | 'Todo';

const RANGE_DAYS: Record<WeightRange, number | null> = {
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1A': 365,
  Todo: null,
};

export function BodyWeightTab({
  weights,
  isDark,
  chartWidth,
}: {
  weights: BodyWeight[];
  isDark: boolean;
  chartWidth: number;
}) {
  const p = useTheme();
  const [range, setRange] = useState<WeightRange>('3M');

  const filtered = useMemo(() => {
    const days = RANGE_DAYS[range];
    if (days == null) return weights;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffYmd = ymd(cutoff);
    return weights.filter((w) => w.recordedOn >= cutoffYmd);
  }, [weights, range]);

  if (filtered.length === 0) {
    return (
      <View>
        <RangePills value={range} onChange={setRange} />
        <View style={{ marginTop: 12 }}>
          <NotEnough label="No hay pesos registrados en este rango." />
        </View>
      </View>
    );
  }

  const last = filtered[filtered.length - 1]!;
  const first = filtered[0]!;
  const diff = last.weightKg - first.weightKg;
  const isDown = diff < 0;
  const deltaColor = isDown ? '#10B981' : p.warning;

  const points: Point[] = filtered.map((w, i) => ({
    x: i,
    y: w.weightKg,
    raw: { date: w.recordedOn },
  }));
  const rangeLabel = range === 'Todo' ? 'Todo' : range;

  return (
    <View>
      <View style={{ paddingHorizontal: 4, paddingTop: 4 }}>
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
            {last.weightKg.toFixed(1)}
          </Text>
          <Text
            style={{
              color: p.text2,
              fontFamily: fontVariant('sans', 600),
              fontSize: 14,
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
              fontFamily: fontVariant('sans', 700),
              fontSize: 12,
            }}
          >
            {diff > 0 ? '+' : ''}
            {diff.toFixed(1)} kg
          </Text>
          <Text style={{ color: p.text3, fontSize: 12 }}>· {rangeLabel}</Text>
        </View>
      </View>

      <ChartCard>
        <LineChart
          points={points}
          width={chartWidth}
          height={180}
          color={p.accent.primary}
          dark={isDark}
          yFormat={(v) => v.toFixed(1)}
          xFormat={(pt) => formatTickDate((pt.raw as { date: string }).date)}
        />
      </ChartCard>

      <View style={{ marginTop: 10 }}>
        <RangePills value={range} onChange={setRange} />
      </View>

      <SectionTitle title="Últimos registros" />
      <ListCard>
        {[...filtered]
          .reverse()
          .slice(0, 6)
          .map((w, i) => (
            <ListRow
              key={w.id}
              first={i === 0}
              left={fmtDayShort(parseYmd(w.recordedOn))}
              rightValue={w.weightKg.toFixed(1)}
              rightUnit="kg"
            />
          ))}
      </ListCard>
    </View>
  );
}

function RangePills({
  value,
  onChange,
}: {
  value: WeightRange;
  onChange: (v: WeightRange) => void;
}) {
  const p = useTheme();
  const ranges: WeightRange[] = ['1M', '3M', '6M', '1A', 'Todo'];
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {ranges.map((r) => {
        const active = r === value;
        return (
          <Pressable
            key={r}
            onPress={() => onChange(r)}
            style={{
              flex: 1,
              height: 32,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
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
              {r}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
