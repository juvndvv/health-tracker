import { View, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export default function WorkoutScreen() {
  const p = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: p.bg,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: p.text }}>Workout (T34)</Text>
    </View>
  );
}
