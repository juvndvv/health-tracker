import { ScrollView, View, Text } from 'react-native';
import { ChartLine } from 'phosphor-react-native';
import { useTheme } from '@/theme/useTheme';
import { useWeights } from '@/features/body-weight/hooks';
import { Empty } from '@/ui/primitives/Empty';
import { PageTitle } from '@/ui/primitives/PageTitle';

export default function Progress() {
  const p = useTheme();
  const { data: weights = [] } = useWeights();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: p.bg }} contentContainerStyle={{ paddingTop: 56 }}>
      <PageTitle title="Progreso" />
      {weights.length === 0 ? (
        <Empty
          icon={<ChartLine size={28} color={p.accent.primary} />}
          title="Aún no hay datos"
          body="Registra peso o entrena para ver gráficos."
        />
      ) : (
        <View style={{ padding: 16, alignItems: 'center' }}>
          <Text style={{ color: p.text2 }}>Sub-tabs próximamente (T39-T42)</Text>
        </View>
      )}
    </ScrollView>
  );
}
