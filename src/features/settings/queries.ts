import { db } from '@/db/client';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type SettingsRow = typeof settings.$inferSelect;
export type SettingsPatch = Partial<Omit<SettingsRow, 'id'>>;

export async function getSettings(): Promise<SettingsRow> {
  const rows = await db.select().from(settings).where(eq(settings.id, 1));
  const row = rows[0];
  if (!row) {
    throw new Error('Settings row missing — seed did not run');
  }
  return row;
}

export async function updateSettings(patch: SettingsPatch): Promise<SettingsRow> {
  await db.update(settings).set(patch).where(eq(settings.id, 1));
  return getSettings();
}
