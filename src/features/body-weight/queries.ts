import { asc, desc, eq, gte } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import * as schema from '@/db/schema';
import { bodyWeights } from '@/db/schema';
import { ymd } from '@/lib/date';

export type DrizzleDb = BaseSQLiteDatabase<'sync' | 'async', unknown, typeof schema>;
export type BodyWeight = typeof bodyWeights.$inferSelect;

export function makeBodyWeightQueries(db: DrizzleDb) {
  return {
    listAll: async (): Promise<BodyWeight[]> =>
      db.select().from(bodyWeights).orderBy(asc(bodyWeights.recordedOn)),

    listSince: async (daysAgo: number): Promise<BodyWeight[]> => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysAgo);
      return db
        .select()
        .from(bodyWeights)
        .where(gte(bodyWeights.recordedOn, ymd(cutoff)))
        .orderBy(asc(bodyWeights.recordedOn));
    },

    upsertWeight: async ({
      recordedOn,
      weightKg,
    }: {
      recordedOn: string;
      weightKg: number;
    }): Promise<BodyWeight> => {
      const [row] = await db
        .insert(bodyWeights)
        .values({ recordedOn, weightKg, createdAt: Date.now() })
        .onConflictDoUpdate({
          target: bodyWeights.recordedOn,
          set: { weightKg, createdAt: Date.now() },
        })
        .returning();
      if (!row) throw new Error('upsert returned no row');
      return row;
    },

    deleteWeight: async (id: number): Promise<void> => {
      await db.delete(bodyWeights).where(eq(bodyWeights.id, id));
    },

    lastWeight: async (): Promise<BodyWeight | null> => {
      const rows = await db
        .select()
        .from(bodyWeights)
        .orderBy(desc(bodyWeights.recordedOn))
        .limit(1);
      return rows[0] ?? null;
    },
  };
}

export type BodyWeightQueries = ReturnType<typeof makeBodyWeightQueries>;
