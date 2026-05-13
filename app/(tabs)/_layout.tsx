import { Tabs } from 'expo-router';
import { House, Play, List, Barbell, ChartLine } from 'phosphor-react-native';
import { useTheme } from '@/theme/useTheme';

export default function TabsLayout() {
  const p = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: p.bg,
          borderTopColor: p.border,
        },
        tabBarActiveTintColor: p.accent.primary,
        tabBarInactiveTintColor: p.text3,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index"     options={{ title: 'Inicio',     tabBarIcon: ({ color, size }) => <House     color={color} size={size}/> }}/>
      <Tabs.Screen name="train"     options={{ title: 'Entrenar',   tabBarIcon: ({ color, size }) => <Play      color={color} size={size}/> }}/>
      <Tabs.Screen name="routines"  options={{ title: 'Rutinas',    tabBarIcon: ({ color, size }) => <List      color={color} size={size}/> }}/>
      <Tabs.Screen name="exercises" options={{ title: 'Ejercicios', tabBarIcon: ({ color, size }) => <Barbell   color={color} size={size}/> }}/>
      <Tabs.Screen name="progress"  options={{ title: 'Progreso',   tabBarIcon: ({ color, size }) => <ChartLine color={color} size={size}/> }}/>
    </Tabs>
  );
}
