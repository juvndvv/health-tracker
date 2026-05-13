import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from './migrations/migrations';
import * as schema from './schema';

export const sqlite = openDatabaseSync('health-tracker.db', { enableChangeListener: true });
export const db = drizzle(sqlite, { schema });

export function useDbReady() {
  const { success, error } = useMigrations(db, migrations);
  return { ready: success, error };
}
