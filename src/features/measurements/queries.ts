import { and, asc, desc, eq, gte, isNull } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import * as schema from '@/db/schema';
import { measurements, measurementTypes } from '@/db/schema';
import { ymd } from '@/lib/date';

export type DrizzleDb = BaseSQLiteDatabase<'sync' | 'async', unknown, typeof schema>;
export type MeasurementType = typeof measurementTypes.$inferSelect;
export type Measurement = typeof measurements.$inferSelect;
export type MeasurementUnit = 'cm' | '%';

export function makeMeasurementQueries(db: DrizzleDb) {
  return {
    listTypes: async (): Promise<MeasurementType[]> =>
      db
        .select()
        .from(measurementTypes)
        .where(isNull(measurementTypes.archivedAt))
        .orderBy(asc(measurementTypes.name)),

    listAllTypes: async (): Promise<MeasurementType[]> =>
      db.select().from(measurementTypes).orderBy(asc(measurementTypes.name)),

    createType: async ({
      name,
      unit,
    }: {
      name: string;
      unit: MeasurementUnit;
    }): Promise<MeasurementType> => {
      const [row] = await db.insert(measurementTypes).values({ name, unit }).returning();
      if (!row) throw new Error('insert returned no row');
      return row;
    },

    archiveType: async (id: number): Promise<void> => {
      await db
        .update(measurementTypes)
        .set({ archivedAt: Date.now() })
        .where(eq(measurementTypes.id, id));
    },

    listMeasurements: async (
      typeId: number,
      sinceDaysAgo?: number,
    ): Promise<Measurement[]> => {
      if (sinceDaysAgo === undefined) {
        return db
          .select()
          .from(measurements)
          .where(eq(measurements.measurementTypeId, typeId))
          .orderBy(asc(measurements.recordedOn));
      }
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - sinceDaysAgo);
      return db
        .select()
        .from(measurements)
        .where(
          and(
            eq(measurements.measurementTypeId, typeId),
            gte(measurements.recordedOn, ymd(cutoff)),
          ),
        )
        .orderBy(asc(measurements.recordedOn));
    },

    upsertMeasurement: async ({
      typeId,
      recordedOn,
      value,
    }: {
      typeId: number;
      recordedOn: string;
      value: number;
    }): Promise<Measurement> => {
      const [row] = await db
        .insert(measurements)
        .values({
          measurementTypeId: typeId,
          recordedOn,
          value,
          createdAt: Date.now(),
        })
        .onConflictDoUpdate({
          target: [measurements.measurementTypeId, measurements.recordedOn],
          set: { value, createdAt: Date.now() },
        })
        .returning();
      if (!row) throw new Error('upsert returned no row');
      return row;
    },

    deleteMeasurement: async (id: number): Promise<void> => {
      await db.delete(measurements).where(eq(measurements.id, id));
    },

    lastFor: async (typeId: number): Promise<Measurement | null> => {
      const rows = await db
        .select()
        .from(measurements)
        .where(eq(measurements.measurementTypeId, typeId))
        .orderBy(desc(measurements.recordedOn))
        .limit(1);
      return rows[0] ?? null;
    },
  };
}

export type MeasurementQueries = ReturnType<typeof makeMeasurementQueries>;
