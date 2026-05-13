import { describe, it, expect } from 'vitest';
import { makeTestDb } from '../setup-db';
import { makeRoutineQueries } from '@/features/routines/queries';
import { makeExerciseQueries } from '@/features/exercises/queries';

async function setup() {
  const { db } = makeTestDb();
  const ex = makeExerciseQueries(db);
  const rt = makeRoutineQueries(db);
  const press = await ex.createExercise({ name: 'Press banca', muscleGroup: 'Pecho' });
  const sentadilla = await ex.createExercise({ name: 'Sentadilla', muscleGroup: 'Pierna' });
  return { db, rt, ex, press, sentadilla };
}

describe('routines queries', () => {
  it('createRoutine + listActive', async () => {
    const { rt } = await setup();
    await rt.createRoutine('Empuje');
    const list = await rt.listActive();
    expect(list).toHaveLength(1);
    expect(list[0]?.name).toBe('Empuje');
  });

  it('addItem stores prescription', async () => {
    const { rt, press } = await setup();
    const r = await rt.createRoutine('Push');
    const item = await rt.addItem(r.id, press.id, 0, 3, 8, 80);
    expect(item.targetSets).toBe(3);
    expect(item.targetReps).toBe(8);
    expect(item.targetWeightKg).toBe(80);
  });

  it('getRoutineWithItems joins exercise name', async () => {
    const { rt, press } = await setup();
    const r = await rt.createRoutine('Push');
    await rt.addItem(r.id, press.id, 0, 3, 8, 80);
    const full = await rt.getRoutineWithItems(r.id);
    expect(full?.items).toHaveLength(1);
    expect(full?.items[0]?.exerciseName).toBe('Press banca');
    expect(full?.items[0]?.muscleGroup).toBe('Pecho');
  });

  it('reorderItems updates positions without conflict', async () => {
    const { rt, press, sentadilla } = await setup();
    const r = await rt.createRoutine('Mix');
    const a = await rt.addItem(r.id, press.id, 0, 3, 8, null);
    const b = await rt.addItem(r.id, sentadilla.id, 1, 4, 6, null);
    await rt.reorderItems(r.id, [b.id, a.id]);
    const full = await rt.getRoutineWithItems(r.id);
    expect(full?.items.map((i) => i.exerciseName)).toEqual(['Sentadilla', 'Press banca']);
  });

  it('duplicateRoutine clones items', async () => {
    const { rt, press } = await setup();
    const r = await rt.createRoutine('Original');
    await rt.addItem(r.id, press.id, 0, 3, 8, 80);
    const dup = await rt.duplicateRoutine(r.id, 'Copia');
    const full = await rt.getRoutineWithItems(dup.id);
    expect(full?.items).toHaveLength(1);
    expect(full?.items[0]?.targetWeightKg).toBe(80);
  });

  it('archiveRoutine hides from listActive', async () => {
    const { rt } = await setup();
    const r = await rt.createRoutine('Empuje');
    await rt.archiveRoutine(r.id);
    expect(await rt.listActive()).toHaveLength(0);
    expect(await rt.listAll()).toHaveLength(1);
  });
});
