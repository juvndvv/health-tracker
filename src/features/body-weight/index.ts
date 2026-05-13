import { db as prodDb } from '@/db/client';
import { makeBodyWeightQueries, type DrizzleDb } from './queries';

export const bodyWeightQueries = makeBodyWeightQueries(prodDb as unknown as DrizzleDb);
export const { listAll, listSince, upsertWeight, deleteWeight, lastWeight } = bodyWeightQueries;

export type { BodyWeight, BodyWeightQueries } from './queries';
