import { useState } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { ChartLine } from 'phosphor-react-native';
import { useTheme, useIsDark } from '@/theme/useTheme';
import { useWeights } from '@/features/body-weight/hooks';
import { useSessionsWithSets } from '@/features/sessions/hooks';
import { useExercises } from '@/features/exercises/hooks';
import { useMeasurementTypes } from '@/features/measurements/hooks';
import { Empty } from '@/ui/primitives/Empty';
import { PageTitle } from '@/ui/primitives/PageTitle';
import { Segment } from '@/ui/primitives/Segment';
import { BodyWeightTab } from '@/features/progress/BodyWeightTab';
import { ExercisesTab } from '@/features/progress/ExercisesTab';
import { CalendarTab } from '@/features/progress/CalendarTab';
import { MeasuresTab } from '@/features/progress/MeasuresTab';

type SubTab = 'weight' | 'exercises' | 'calendar' | 'measures';

const CHART_W = Dimensions.get('window').width - 56;

export default function Progress() {
  const p = useTheme();
  const isDark = useIsDark();
  const [sub, setSub] = useState<SubTab>('weight');

  const { data: weights = [] } = useWeights();
  const { data: pairs = [] } = useSessionsWithSets();
  const { data: exercises = [] } = useExercises();
  const { data: measurementTypes = [] } = useMeasurementTypes();

  const hasAnyData =
    weights.length > 0 ||
    pairs.length > 0 ||
    measurementTypes.length > 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: p.bg }}
      contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}
    >
      <PageTitle title="Progreso" />
      {!hasAnyData ? (
        <Empty
          icon={<ChartLine size={28} color={p.accent.primary} />}
          title="Aún no hay datos"
          body="Registra peso o entrena para ver gráficos."
        />
      ) : (
        <View>
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <Segment
              value={sub}
              onChange={setSub}
              options={[
                { value: 'weight', label: 'Peso' },
                { value: 'exercises', label: 'Ejerc.' },
                { value: 'calendar', label: 'Cadencia' },
                { value: 'measures', label: 'Medidas' },
              ]}
            />
          </View>
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            {sub === 'weight' && (
              <BodyWeightTab
                weights={weights}
                isDark={isDark}
                chartWidth={CHART_W}
              />
            )}
            {sub === 'exercises' && (
              <ExercisesTab
                exercises={exercises}
                pairs={pairs}
                isDark={isDark}
                chartWidth={CHART_W}
              />
            )}
            {sub === 'calendar' && (
              <CalendarTab
                pairs={pairs}
                exercises={exercises}
                isDark={isDark}
              />
            )}
            {sub === 'measures' && (
              <MeasuresTab
                types={measurementTypes}
                isDark={isDark}
                chartWidth={CHART_W}
              />
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
