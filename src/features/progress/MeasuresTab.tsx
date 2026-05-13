import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { TrendDown, TrendUp } from 'phosphor-react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { fmtDayShort, parseYmd } from '@/lib/date';
import { LineChart, type Point } from '@/ui/charts/LineChart';
import { useMeasurements } from '@/features/measurements/hooks';
import type { Measurement, MeasurementType } from '@/features/measurements/queries';
import {
  ChartCard,
  formatTickDate,
  ListCard,
  ListRow,
  NotEnough,
  SectionTitle,
} from './shared-ui';

export function MeasuresTab({
  types,
  isDark,
  chartWidth,
}: {
  types: MeasurementType[];
  isDark: boolean;
  chartWidth: number;
}) {
  const p = useTheme();
  const [typeId, setTypeId] = useState<number | null>(types[0]?.id ?? null);
  const currentId =
    typeId != null && types.some((t) => t.id === typeId)
      ? typeId
      : (types[0]?.id ?? null);
  const currentType = types.find((t) => t.id === currentId) ?? null;
  const { data: measurements = [] } = useMeasurements(currentId);

  if (types.length === 0) {
    return <NotEnough label="Aún no tienes tipos de medida configurados." />;
  }

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, paddingVertical: 6 }}
      >
        {types.map((t) => {
          const active = t.id === currentId;
          return (
            <Pressable
              key={t.id}
              onPress={() => setTypeId(t.id)}
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
                {t.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {currentType == null ? null : measurements.length === 0 ? (
        <View style={{ marginTop: 12 }}>
          <NotEnough label="Sin registros para esta medida." />
        </View>
      ) : (
        <MeasuresBody
          type={currentType}
          measurements={measurements}
          isDark={isDark}
          chartWidth={chartWidth}
        />
      )}
    </View>
  );
}

function MeasuresBody({
  type,
  measurements,
  isDark,
  chartWidth,
}: {
  type: MeasurementType;
  measurements: Measurement[];
  isDark: boolean;
  chartWidth: number;
}) {
  const p = useTheme();
  const last = measurements[measurements.length - 1]!;
  const first = measurements[0]!;
  const diff = last.value - first.value;
  const isDown = diff < 0;
  const deltaColor = isDown ? '#10B981' : p.warning;
  const points: Point[] = measurements.map((m, i) => ({
    x: i,
    y: m.value,
    raw: { date: m.recordedOn },
  }));

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
            {last.value.toFixed(1)}
          </Text>
          <Text
            style={{
              color: p.text2,
              fontFamily: fontVariant('sans', 600),
              fontSize: 14,
            }}
          >
            {type.unit}
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
            {diff.toFixed(1)} {type.unit}
          </Text>
          <Text style={{ color: p.text3, fontSize: 12 }}>
            · {measurements.length} registros
          </Text>
        </View>
      </View>

      <ChartCard>
        <LineChart
          points={points}
          width={chartWidth}
          height={170}
          color={p.accent.primary}
          dark={isDark}
          yFormat={(v) => v.toFixed(1)}
          xFormat={(pt) => formatTickDate((pt.raw as { date: string }).date)}
        />
      </ChartCard>

      <SectionTitle title="Historial" />
      <ListCard>
        {[...measurements]
          .reverse()
          .slice(0, 6)
          .map((m, i) => (
            <ListRow
              key={m.id}
              first={i === 0}
              left={fmtDayShort(parseYmd(m.recordedOn))}
              rightValue={m.value.toFixed(1)}
              rightUnit={type.unit}
            />
          ))}
      </ListCard>
    </View>
  );
}
