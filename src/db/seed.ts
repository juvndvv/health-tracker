import { db } from './client';
import { settings, measurementTypes } from './schema';

export async function seedIfEmpty(): Promise<void> {
  await db.insert(settings).values({ id: 1 }).onConflictDoNothing();

  await db.insert(measurementTypes).values([
    { name: 'Cintura', unit: 'cm' },
    { name: 'Brazo derecho', unit: 'cm' },
    { name: 'Pecho', unit: 'cm' },
    { name: 'Grasa corporal', unit: '%' },
  ]).onConflictDoNothing();
}
