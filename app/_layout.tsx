import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useDbReady } from '@/db/client';
import { seedIfEmpty } from '@/db/seed';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { ready, error } = useDbReady();
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState<unknown>(null);

  useEffect(() => {
    if (ready && !seeded) {
      seedIfEmpty().then(() => setSeeded(true)).catch(setSeedError);
    }
  }, [ready, seeded]);

  if (error) throw error;
  if (seedError) throw seedError;
  if (!ready || !seeded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
