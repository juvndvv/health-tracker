import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Gear } from 'phosphor-react-native';
import { useTheme } from '@/theme/useTheme';
import { useRoutines } from '@/features/routines/hooks';
import { useWeights } from '@/features/body-weight/hooks';
import { useSettingsStore } from '@/features/settings/store';
import { fmtDayShort } from '@/lib/date';
import { Empty } from '@/ui/primitives/Empty';
import { PageTitle } from '@/ui/primitives/PageTitle';
import { Button } from '@/ui/primitives/Button';

export default function Home() {
  const p = useTheme();
  const router = useRouter();
  const { data: routines = [] } = useRoutines();
  const { data: weights = [] } = useWeights();
  const ownerName = useSettingsStore((s) => s.data?.ownerName);

  const greeting = ownerName ? `Hola, ${ownerName}` : 'Hola';
  const hasData = routines.length > 0 || weights.length > 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: p.bg }} contentContainerStyle={{ paddingTop: 56 }}>
      <PageTitle
        title={greeting}
        subtitle={fmtDayShort(new Date())}
        action={
          <Pressable onPress={() => router.push('/settings')}>
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
        <View style={{ padding: 16, alignItems: 'center' }}>
          <Text style={{ color: p.text2 }}>Dashboard próximamente</Text>
          <View style={{ height: 12 }} />
          <Button onPress={() => router.push('/record-weight')}>Registrar peso</Button>
        </View>
      )}
    </ScrollView>
  );
}
