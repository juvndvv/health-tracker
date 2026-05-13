import { db } from './client';
import { settings, measurementTypes } from './schema';
import { eq } from 'drizzle-orm';

export async function seedIfEmpty(): Promise<void> {
  const existing = await db.select().from(settings).where(eq(settings.id, 1));
  if (existing.length > 0) return;

  await db.insert(settings).values({ id: 1 });
  await db.insert(measurementTypes).values([
    { name: 'Cintura', unit: 'cm' },
    { name: 'Brazo derecho', unit: 'cm' },
    { name: 'Pecho', unit: 'cm' },
    { name: 'Grasa corporal', unit: '%' },
  ]);
}
