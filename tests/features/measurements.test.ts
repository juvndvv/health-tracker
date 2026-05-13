import { describe, it, expect } from 'vitest';
import { makeTestDb } from '../setup-db';
import { makeMeasurementQueries } from '@/features/measurements/queries';

function setup() {
  const { db } = makeTestDb();
  return makeMeasurementQueries(db);
}

describe('measurements queries', () => {
  it('upsertMeasurement per (typeId, recordedOn) replaces existing value', async () => {
    const q = setup();
    const cintura = await q.createType({ name: 'Cintura', unit: 'cm' });
    await q.upsertMeasurement({ typeId: cintura.id, recordedOn: '2026-05-01', value: 82 });
    await q.upsertMeasurement({ typeId: cintura.id, recordedOn: '2026-05-01', value: 81 });
    const list = await q.listMeasurements(cintura.id);
    expect(list).toHaveLength(1);
    expect(list[0]?.value).toBe(81);
  });

  it('listTypes excludes archived types', async () => {
    const q = setup();
    const cintura = await q.createType({ name: 'Cintura', unit: 'cm' });
    await q.createType({ name: 'Bíceps', unit: 'cm' });
    await q.archiveType(cintura.id);
    const types = await q.listTypes();
    expect(types.map((t) => t.name)).toEqual(['Bíceps']);
    const all = await q.listAllTypes();
    expect(all).toHaveLength(2);
  });

  it('lastFor returns the most recent value for the type or null', async () => {
    const q = setup();
    const cintura = await q.createType({ name: 'Cintura', unit: 'cm' });
    const biceps = await q.createType({ name: 'Bíceps', unit: 'cm' });
    await q.upsertMeasurement({ typeId: cintura.id, recordedOn: '2026-05-01', value: 82 });
    await q.upsertMeasurement({ typeId: cintura.id, recordedOn: '2026-05-03', value: 81 });
    await q.upsertMeasurement({ typeId: cintura.id, recordedOn: '2026-05-02', value: 81.5 });
    const last = await q.lastFor(cintura.id);
    expect(last?.recordedOn).toBe('2026-05-03');
    expect(last?.value).toBe(81);
    expect(await q.lastFor(biceps.id)).toBeNull();
  });
});
