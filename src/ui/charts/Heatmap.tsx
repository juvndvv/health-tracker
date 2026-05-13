import { View, Pressable } from 'react-native';
import { mixRgb } from '@/lib/color';

export type HeatDay = {
  date: Date;
  intensity?: number;
  future?: boolean;
  sessions?: unknown[];
};

export type HeatmapWeek = HeatDay[];

export function Heatmap({
  weeks, accent, isDark, cellSize = 12, gap = 3,
  onDayPress, selectedDate,
}: {
  weeks: HeatmapWeek[];
  accent: string;
  isDark: boolean;
  cellSize?: number;
  gap?: number;
  onDayPress?: (day: HeatDay) => void;
  selectedDate?: Date | null;
}) {
  const blank = isDark ? 'rgba(255,255,255,0.06)' : '#F0F0F0';
  const base = isDark ? '#000000' : '#FFFFFF';

  return (
    <View style={{ flexDirection: 'row', gap, alignItems: 'flex-start' }}>
      {weeks.map((week, wi) => (
        <View key={wi} style={{ flexDirection: 'column', gap }}>
          {week.map((day, di) => {
            const intensity = day.intensity ?? 0;
            const isFuture = !!day.future;
            const isSelected = !!(selectedDate && day.date && day.date.toDateString() === selectedDate.toDateString());
            const bg = isFuture
              ? 'transparent'
              : intensity === 0
                ? blank
                : mixRgb(accent, base, 22 + intensity * 18);
            const borderStyle = isSelected
              ? { borderWidth: 1.5, borderColor: accent }
              : isFuture
                ? { borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E5E5', borderStyle: 'dashed' as const }
                : {};
            const tappable = !isFuture && (day.sessions?.length ?? 0) > 0;
            return tappable ? (
              <Pressable
                key={di}
                onPress={() => onDayPress?.(day)}
                style={{ width: cellSize, height: cellSize, borderRadius: 3, backgroundColor: bg, ...borderStyle }}
              />
            ) : (
              <View key={di} style={{ width: cellSize, height: cellSize, borderRadius: 3, backgroundColor: bg, ...borderStyle }} />
            );
          })}
        </View>
      ))}
    </View>
  );
}
