import { db as prodDb } from '@/db/client';
import { makeMeasurementQueries, type DrizzleDb } from './queries';

export const measurementQueries = makeMeasurementQueries(prodDb as unknown as DrizzleDb);
export const {
  listTypes,
  listAllTypes,
  createType,
  archiveType,
  listMeasurements,
  upsertMeasurement,
  deleteMeasurement,
  lastFor,
} = measurementQueries;

export type {
  Measurement,
  MeasurementType,
  MeasurementUnit,
  MeasurementQueries,
} from './queries';
