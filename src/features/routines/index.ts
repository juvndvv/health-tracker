import { db as prodDb } from '@/db/client';
import { makeRoutineQueries, type DrizzleDb } from './queries';

export const routineQueries = makeRoutineQueries(prodDb as unknown as DrizzleDb);
export const {
  listActive,
  listAll,
  createRoutine,
  getRoutineWithItems,
  addItem,
  updateItem,
  removeItem,
  reorderItems,
  duplicateRoutine,
  archiveRoutine,
  restoreRoutine,
} = routineQueries;

export type {
  Routine,
  RoutineItem,
  RoutineItemWithExercise,
  RoutineWithItems,
  RoutineQueries,
} from './queries';
