import { eq, isNull, asc } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import * as schema from '@/db/schema';
import { exercises, routines, routineItems } from '@/db/schema';

export type DrizzleDb = BaseSQLiteDatabase<'sync' | 'async', unknown, typeof schema>;
export type Routine = typeof routines.$inferSelect;
export type RoutineItem = typeof routineItems.$inferSelect;
export type RoutineItemWithExercise = RoutineItem & {
  exerciseName: string;
  muscleGroup: string;
};
export type RoutineWithItems = Routine & { items: RoutineItemWithExercise[] };

export function makeRoutineQueries(db: DrizzleDb) {
  return {
    listActive: async (): Promise<Routine[]> =>
      db.select().from(routines).where(isNull(routines.archivedAt)).orderBy(routines.name),

    listAll: async (): Promise<Routine[]> =>
      db.select().from(routines).orderBy(routines.name),

    createRoutine: async (name: string): Promise<Routine> => {
      const [row] = await db
        .insert(routines)
        .values({ name, createdAt: Date.now() })
        .returning();
      if (!row) throw new Error('insert returned no row');
      return row;
    },

    getRoutineWithItems: async (id: number): Promise<RoutineWithItems | null> => {
      const routineRows = await db.select().from(routines).where(eq(routines.id, id));
      const routine = routineRows[0];
      if (!routine) return null;

      const rows = await db
        .select({
          id: routineItems.id,
          routineId: routineItems.routineId,
          exerciseId: routineItems.exerciseId,
          position: routineItems.position,
          targetSets: routineItems.targetSets,
          targetReps: routineItems.targetReps,
          targetWeightKg: routineItems.targetWeightKg,
          exerciseName: exercises.name,
          muscleGroup: exercises.muscleGroup,
        })
        .from(routineItems)
        .leftJoin(exercises, eq(routineItems.exerciseId, exercises.id))
        .where(eq(routineItems.routineId, id))
        .orderBy(asc(routineItems.position));

      const items: RoutineItemWithExercise[] = rows.map((r) => ({
        id: r.id,
        routineId: r.routineId,
        exerciseId: r.exerciseId,
        position: r.position,
        targetSets: r.targetSets,
        targetReps: r.targetReps,
        targetWeightKg: r.targetWeightKg,
        exerciseName: r.exerciseName ?? '',
        muscleGroup: r.muscleGroup ?? '',
      }));

      return { ...routine, items };
    },

    addItem: async (
      routineId: number,
      exerciseId: number,
      position: number,
      targetSets: number,
      targetReps: number,
      targetWeightKg: number | null,
    ): Promise<RoutineItem> => {
      const [row] = await db
        .insert(routineItems)
        .values({ routineId, exerciseId, position, targetSets, targetReps, targetWeightKg })
        .returning();
      if (!row) throw new Error('insert returned no row');
      return row;
    },

    updateItem: async (
      itemId: number,
      patch: Partial<{ targetSets: number; targetReps: number; targetWeightKg: number | null }>,
    ): Promise<void> => {
      await db.update(routineItems).set(patch).where(eq(routineItems.id, itemId));
    },

    removeItem: async (itemId: number): Promise<void> => {
      await db.delete(routineItems).where(eq(routineItems.id, itemId));
    },

    reorderItems: async (routineId: number, idsInOrder: number[]): Promise<void> => {
      const result = db.transaction((tx) => {
        for (let i = 0; i < idsInOrder.length; i++) {
          tx.update(routineItems)
            .set({ position: -(i + 1) })
            .where(eq(routineItems.id, idsInOrder[i]!))
            .run();
        }
        for (let i = 0; i < idsInOrder.length; i++) {
          tx.update(routineItems)
            .set({ position: i })
            .where(eq(routineItems.id, idsInOrder[i]!))
            .run();
        }
      });
      await Promise.resolve(result);
    },

    duplicateRoutine: async (routineId: number, newName: string): Promise<Routine> => {
      const sourceRows = await db.select().from(routines).where(eq(routines.id, routineId));
      const source = sourceRows[0];
      if (!source) throw new Error('routine not found');

      const items = await db
        .select()
        .from(routineItems)
        .where(eq(routineItems.routineId, routineId))
        .orderBy(asc(routineItems.position));

      const [created] = await db
        .insert(routines)
        .values({ name: newName, createdAt: Date.now() })
        .returning();
      if (!created) throw new Error('insert returned no row');

      if (items.length > 0) {
        await db.insert(routineItems).values(
          items.map((item) => ({
            routineId: created.id,
            exerciseId: item.exerciseId,
            position: item.position,
            targetSets: item.targetSets,
            targetReps: item.targetReps,
            targetWeightKg: item.targetWeightKg,
          })),
        );
      }

      return created;
    },

    archiveRoutine: async (id: number): Promise<void> => {
      await db.update(routines).set({ archivedAt: Date.now() }).where(eq(routines.id, id));
    },

    restoreRoutine: async (id: number): Promise<void> => {
      await db.update(routines).set({ archivedAt: null }).where(eq(routines.id, id));
    },
  };
}

export type RoutineQueries = ReturnType<typeof makeRoutineQueries>;
