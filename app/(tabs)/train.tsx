import { ScrollView, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { List } from 'phosphor-react-native';
import { useTheme } from '@/theme/useTheme';
import { useRoutines } from '@/features/routines/hooks';
import { Empty } from '@/ui/primitives/Empty';
import { PageTitle } from '@/ui/primitives/PageTitle';

export default function Train() {
  const p = useTheme();
  const router = useRouter();
  const { data: routines = [] } = useRoutines();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: p.bg }} contentContainerStyle={{ paddingTop: 56 }}>
      <PageTitle title="Entrenar" subtitle="Elige una rutina para empezar" />
      {routines.length === 0 ? (
        <Empty
          icon={<List size={28} color={p.accent.primary} />}
          title="No tienes rutinas"
          body="Crea una rutina para empezar a entrenar."
          cta="Crear rutina"
          onCta={() => router.push('/(tabs)/routines')}
        />
      ) : (
        <View style={{ padding: 16, alignItems: 'center' }}>
          <Text style={{ color: p.text2 }}>Lista de rutinas (T33)</Text>
        </View>
      )}
    </ScrollView>
  );
}
