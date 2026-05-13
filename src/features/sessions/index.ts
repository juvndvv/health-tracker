import { db as prodDb } from '@/db/client';
import { makeSessionQueries, type DrizzleDb } from './queries';

export const sessionQueries = makeSessionQueries(prodDb as unknown as DrizzleDb);
export const {
  startSession,
  appendSet,
  finishSession,
  abandonSession,
  lastSessionForExercise,
  listSessions,
  getSessionWithSets,
  listSetsForExercise,
} = sessionQueries;

export type { WorkoutSession, SessionSet, SessionQueries } from './queries';
