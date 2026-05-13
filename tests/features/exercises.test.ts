import { describe, it, expect } from 'vitest';
import { makeTestDb } from '../setup-db';
import { makeExerciseQueries } from '@/features/exercises/queries';

function setup() {
  const { db } = makeTestDb();
  return makeExerciseQueries(db);
}

describe('exercises queries', () => {
  it('lists active exercises sorted by name', async () => {
    const q = setup();
    await q.createExercise({ name: 'Sentadilla', muscleGroup: 'Pierna' });
    await q.createExercise({ name: 'Press banca', muscleGroup: 'Pecho' });
    const list = await q.listActive();
    expect(list.map((e) => e.name)).toEqual(['Press banca', 'Sentadilla']);
  });

  it('createExercise stores muscle group and createdAt', async () => {
    const q = setup();
    const e = await q.createExercise({ name: 'Dominadas', muscleGroup: 'Espalda' });
    expect(e.muscleGroup).toBe('Espalda');
    expect(typeof e.createdAt).toBe('number');
    expect(e.archivedAt).toBeNull();
  });

  it('rejects invalid muscle group via CHECK constraint', async () => {
    const q = setup();
    await expect(
      q.createExercise({ name: 'Foo', muscleGroup: 'Invalid' as never }),
    ).rejects.toThrow();
  });

  it('archiveExercise hides from listActive but keeps in listAll', async () => {
    const q = setup();
    const e = await q.createExercise({ name: 'Curl', muscleGroup: 'Brazo' });
    await q.archiveExercise(e.id);
    expect(await q.listActive()).toHaveLength(0);
    const all = await q.listAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.archivedAt).not.toBeNull();
  });

  it('restoreExercise clears archivedAt', async () => {
    const q = setup();
    const e = await q.createExercise({ name: 'Press inclinado', muscleGroup: 'Pecho' });
    await q.archiveExercise(e.id);
    await q.restoreExercise(e.id);
    const list = await q.listActive();
    expect(list).toHaveLength(1);
    expect(list[0]?.archivedAt).toBeNull();
  });

  it('rejects duplicate names', async () => {
    const q = setup();
    await q.createExercise({ name: 'Curl', muscleGroup: 'Brazo' });
    await expect(
      q.createExercise({ name: 'Curl', muscleGroup: 'Brazo' }),
    ).rejects.toThrow();
  });
});
