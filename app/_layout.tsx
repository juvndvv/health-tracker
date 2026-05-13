import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useDbReady } from '@/db/client';
import { seedIfEmpty } from '@/db/seed';
import { useAppFonts } from '@/theme/fonts';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { useSettingsStore } from '@/features/settings/store';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { ready, error } = useDbReady();
  const [fontsLoaded] = useAppFonts();
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState<unknown>(null);
  const settingsLoaded = useSettingsStore((s) => s.loaded);
  const themePref = (useSettingsStore((s) => s.data?.theme) ?? 'dark') as 'light' | 'dark' | 'system';
  const loadSettings = useSettingsStore((s) => s.load);
  const [settingsError, setSettingsError] = useState<unknown>(null);

  useEffect(() => {
    if (ready && !seeded) {
      seedIfEmpty().then(() => setSeeded(true)).catch(setSeedError);
    }
  }, [ready, seeded]);

  useEffect(() => {
    if (ready && seeded && !settingsLoaded) {
      loadSettings().catch(setSettingsError);
    }
  }, [ready, seeded, settingsLoaded, loadSettings]);

  if (error) throw error;
  if (seedError) throw seedError;
  if (settingsError) throw settingsError;
  if (!ready || !seeded || !fontsLoaded || !settingsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ThemeProvider preference={themePref}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
