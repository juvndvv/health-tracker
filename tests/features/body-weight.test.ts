import { describe, it, expect } from 'vitest';
import { makeTestDb } from '../setup-db';
import { makeBodyWeightQueries } from '@/features/body-weight/queries';

function setup() {
  const { db } = makeTestDb();
  return makeBodyWeightQueries(db);
}

describe('body weight queries', () => {
  it('upsertWeight inserts a new row', async () => {
    const q = setup();
    const row = await q.upsertWeight({ recordedOn: '2026-05-01', weightKg: 75.2 });
    expect(row.recordedOn).toBe('2026-05-01');
    expect(row.weightKg).toBe(75.2);
    expect(typeof row.createdAt).toBe('number');
    const all = await q.listAll();
    expect(all).toHaveLength(1);
  });

  it('re-upserting same recordedOn updates weight without creating a new row', async () => {
    const q = setup();
    await q.upsertWeight({ recordedOn: '2026-05-01', weightKg: 75.0 });
    await q.upsertWeight({ recordedOn: '2026-05-01', weightKg: 74.5 });
    const all = await q.listAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.weightKg).toBe(74.5);
  });

  it('listAll returns rows sorted by recordedOn ascending', async () => {
    const q = setup();
    await q.upsertWeight({ recordedOn: '2026-05-03', weightKg: 75 });
    await q.upsertWeight({ recordedOn: '2026-05-01', weightKg: 76 });
    await q.upsertWeight({ recordedOn: '2026-05-02', weightKg: 75.5 });
    const all = await q.listAll();
    expect(all.map((w) => w.recordedOn)).toEqual(['2026-05-01', '2026-05-02', '2026-05-03']);
  });

  it('lastWeight returns the most recent row', async () => {
    const q = setup();
    await q.upsertWeight({ recordedOn: '2026-05-01', weightKg: 76 });
    await q.upsertWeight({ recordedOn: '2026-05-03', weightKg: 75 });
    await q.upsertWeight({ recordedOn: '2026-05-02', weightKg: 75.5 });
    const last = await q.lastWeight();
    expect(last?.recordedOn).toBe('2026-05-03');
    expect(last?.weightKg).toBe(75);
  });

  it('lastWeight returns null on empty table', async () => {
    const q = setup();
    expect(await q.lastWeight()).toBeNull();
  });

  it('deleteWeight removes a row', async () => {
    const q = setup();
    const row = await q.upsertWeight({ recordedOn: '2026-05-01', weightKg: 75 });
    await q.deleteWeight(row.id);
    expect(await q.listAll()).toHaveLength(0);
  });
});
