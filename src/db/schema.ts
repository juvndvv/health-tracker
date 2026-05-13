import { sqliteTable, integer, text, real, uniqueIndex, check } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Pierna', 'Hombro', 'Brazo', 'Core', 'Otros'] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const exercises = sqliteTable(
  'exercises',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull().unique(),
    muscleGroup: text('muscle_group').notNull(),
    createdAt: integer('created_at').notNull(),
    archivedAt: integer('archived_at'),
  },
  (t) => ({
    muscleCheck: check(
      'muscle_group_enum',
      sql`${t.muscleGroup} IN ('Pecho','Espalda','Pierna','Hombro','Brazo','Core','Otros')`,
    ),
  }),
);

export const routines = sqliteTable('routines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: integer('created_at').notNull(),
  archivedAt: integer('archived_at'),
});

export const routineItems = sqliteTable(
  'routine_items',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    routineId: integer('routine_id').notNull().references(() => routines.id, { onDelete: 'cascade' }),
    exerciseId: integer('exercise_id').notNull().references(() => exercises.id),
    position: integer('position').notNull(),
    targetSets: integer('target_sets').notNull(),
    targetReps: integer('target_reps').notNull(),
    targetWeightKg: real('target_weight_kg'),
  },
  (t) => ({
    posIdx: uniqueIndex('routine_items_pos').on(t.routineId, t.position),
  }),
);

export const workoutSessions = sqliteTable('workout_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  routineId: integer('routine_id').references(() => routines.id, { onDelete: 'set null' }),
  routineNameSnapshot: text('routine_name_snapshot').notNull(),
  startedAt: integer('started_at').notNull(),
  finishedAt: integer('finished_at'),
});

export const sessionSets = sqliteTable('session_sets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: integer('session_id').notNull().references(() => workoutSessions.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id),
  exerciseNameSnapshot: text('exercise_name_snapshot').notNull(),
  position: integer('position').notNull(),
  weightKg: real('weight_kg'),
  reps: integer('reps').notNull(),
  completedAt: integer('completed_at').notNull(),
});

export const bodyWeights = sqliteTable(
  'body_weights',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    recordedOn: text('recorded_on').notNull().unique(),
    weightKg: real('weight_kg').notNull(),
    createdAt: integer('created_at').notNull(),
  },
);

export const measurementTypes = sqliteTable('measurement_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  unit: text('unit').notNull(),
  archivedAt: integer('archived_at'),
});

export const measurements = sqliteTable(
  'measurements',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    measurementTypeId: integer('measurement_type_id').notNull().references(() => measurementTypes.id),
    recordedOn: text('recorded_on').notNull(),
    value: real('value').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (t) => ({
    perDayIdx: uniqueIndex('measurements_per_day').on(t.measurementTypeId, t.recordedOn),
  }),
);

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey(),                  // always 1
  ownerName: text('owner_name'),
  weeklyGoalSessions: integer('weekly_goal_sessions').notNull().default(4),
  weeklyGoalMinutes: integer('weekly_goal_minutes').notNull().default(240),
  weeklyGoalVolumeKg: integer('weekly_goal_volume_kg').notNull().default(18000),
  theme: text('theme').notNull().default('dark'),  // 'light' | 'dark' | 'system'
  accent: text('accent').notNull().default('#FA114F'),
});
