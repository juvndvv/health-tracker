import { View, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export default function Progress() {
  const p = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: p.bg }}>
      <Text style={{ color: p.text, fontFamily: 'OpenSauceOne-SemiBold', fontSize: 18 }}>Progreso</Text>
    </View>
  );
}
