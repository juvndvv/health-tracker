import { eq, isNull } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import * as schema from '@/db/schema';
import { exercises, type MuscleGroup } from '@/db/schema';

export type DrizzleDb = BaseSQLiteDatabase<'sync' | 'async', unknown, typeof schema>;
export type Exercise = typeof exercises.$inferSelect;

export function makeExerciseQueries(db: DrizzleDb) {
  return {
    listActive: async (): Promise<Exercise[]> =>
      db.select().from(exercises).where(isNull(exercises.archivedAt)).orderBy(exercises.name),

    listAll: async (): Promise<Exercise[]> =>
      db.select().from(exercises).orderBy(exercises.name),

    createExercise: async ({
      name,
      muscleGroup,
    }: {
      name: string;
      muscleGroup: MuscleGroup;
    }): Promise<Exercise> => {
      const [row] = await db
        .insert(exercises)
        .values({ name, muscleGroup, createdAt: Date.now() })
        .returning();
      if (!row) throw new Error('insert returned no row');
      return row;
    },

    archiveExercise: async (id: number): Promise<void> => {
      await db.update(exercises).set({ archivedAt: Date.now() }).where(eq(exercises.id, id));
    },

    restoreExercise: async (id: number): Promise<void> => {
      await db.update(exercises).set({ archivedAt: null }).where(eq(exercises.id, id));
    },

    getById: async (id: number): Promise<Exercise | null> => {
      const rows = await db.select().from(exercises).where(eq(exercises.id, id));
      return rows[0] ?? null;
    },
  };
}

export type ExerciseQueries = ReturnType<typeof makeExerciseQueries>;
