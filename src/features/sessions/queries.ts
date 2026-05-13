import { and, asc, desc, eq, gte, inArray, isNotNull } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import * as schema from '@/db/schema';
import { sessionSets, workoutSessions } from '@/db/schema';

export type DrizzleDb = BaseSQLiteDatabase<'sync' | 'async', unknown, typeof schema>;
export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type SessionSet = typeof sessionSets.$inferSelect;

export function makeSessionQueries(db: DrizzleDb) {
  return {
    startSession: async ({
      routineId,
      routineName,
    }: {
      routineId: number;
      routineName: string;
    }): Promise<WorkoutSession> => {
      const [row] = await db
        .insert(workoutSessions)
        .values({
          routineId,
          routineNameSnapshot: routineName,
          startedAt: Date.now(),
        })
        .returning();
      if (!row) throw new Error('insert returned no row');
      return row;
    },

    appendSet: async ({
      sessionId,
      exerciseId,
      exerciseName,
      position,
      weightKg,
      reps,
    }: {
      sessionId: number;
      exerciseId: number;
      exerciseName: string;
      position: number;
      weightKg: number | null;
      reps: number;
    }): Promise<SessionSet> => {
      const [row] = await db
        .insert(sessionSets)
        .values({
          sessionId,
          exerciseId,
          exerciseNameSnapshot: exerciseName,
          position,
          weightKg,
          reps,
          completedAt: Date.now(),
        })
        .returning();
      if (!row) throw new Error('insert returned no row');
      return row;
    },

    finishSession: async (sessionId: number): Promise<void> => {
      await db
        .update(workoutSessions)
        .set({ finishedAt: Date.now() })
        .where(eq(workoutSessions.id, sessionId));
    },

    abandonSession: async (sessionId: number): Promise<void> => {
      await db.delete(workoutSessions).where(eq(workoutSessions.id, sessionId));
    },

    lastSessionForExercise: async (
      exerciseId: number,
      beforeSessionId?: number,
    ): Promise<{ session: WorkoutSession; sets: SessionSet[] } | null> => {
      const setRows = await db
        .select({ sessionId: sessionSets.sessionId })
        .from(sessionSets)
        .where(eq(sessionSets.exerciseId, exerciseId));
      const candidateIds = Array.from(new Set(setRows.map((r) => r.sessionId)));
      if (candidateIds.length === 0) return null;

      const sessions = await db
        .select()
        .from(workoutSessions)
        .where(
          and(
            inArray(workoutSessions.id, candidateIds),
            isNotNull(workoutSessions.finishedAt),
          ),
        )
        .orderBy(desc(workoutSessions.startedAt), desc(workoutSessions.id));

      const session = sessions.find((s) =>
        beforeSessionId == null ? true : s.id < beforeSessionId,
      );
      if (!session) return null;

      const sets = await db
        .select()
        .from(sessionSets)
        .where(
          and(eq(sessionSets.sessionId, session.id), eq(sessionSets.exerciseId, exerciseId)),
        )
        .orderBy(asc(sessionSets.position));

      return { session, sets };
    },

    listSessions: async ({ since }: { since?: number } = {}): Promise<WorkoutSession[]> => {
      if (since === undefined) {
        return db
          .select()
          .from(workoutSessions)
          .orderBy(desc(workoutSessions.startedAt), desc(workoutSessions.id));
      }
      return db
        .select()
        .from(workoutSessions)
        .where(gte(workoutSessions.startedAt, since))
        .orderBy(desc(workoutSessions.startedAt), desc(workoutSessions.id));
    },

    getSessionWithSets: async (
      sessionId: number,
    ): Promise<{ session: WorkoutSession; sets: SessionSet[] } | null> => {
      const rows = await db
        .select()
        .from(workoutSessions)
        .where(eq(workoutSessions.id, sessionId));
      const session = rows[0];
      if (!session) return null;
      const sets = await db
        .select()
        .from(sessionSets)
        .where(eq(sessionSets.sessionId, sessionId))
        .orderBy(asc(sessionSets.exerciseId), asc(sessionSets.position));
      return { session, sets };
    },

    listSetsForExercise: async (
      exerciseId: number,
      sessionId?: number,
    ): Promise<SessionSet[]> => {
      const where =
        sessionId === undefined
          ? eq(sessionSets.exerciseId, exerciseId)
          : and(
              eq(sessionSets.exerciseId, exerciseId),
              eq(sessionSets.sessionId, sessionId),
            );
      return db
        .select()
        .from(sessionSets)
        .where(where)
        .orderBy(asc(sessionSets.position));
    },
  };
}

export type SessionQueries = ReturnType<typeof makeSessionQueries>;
