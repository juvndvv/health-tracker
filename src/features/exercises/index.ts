import { db as prodDb } from '@/db/client';
import { makeExerciseQueries, type DrizzleDb } from './queries';

export const exerciseQueries = makeExerciseQueries(prodDb as unknown as DrizzleDb);
export const {
  listActive,
  listAll,
  createExercise,
  archiveExercise,
  restoreExercise,
  getById,
} = exerciseQueries;

export type { Exercise, ExerciseQueries } from './queries';
