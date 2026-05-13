import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Gear } from 'phosphor-react-native';
import { useTheme } from '@/theme/useTheme';

export default function Home() {
  const p = useTheme();
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: p.bg }}>
      <Text style={{ color: p.text, fontFamily: 'OpenSauceOne-SemiBold', fontSize: 18 }}>Inicio</Text>
      <Pressable
        onPress={() => router.push('/settings')}
        style={{ position: 'absolute', top: 56, right: 16 }}
      >
        <Gear size={24} color={p.text} />
      </Pressable>
    </View>
  );
}
