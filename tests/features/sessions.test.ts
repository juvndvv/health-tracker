import { describe, it, expect } from 'vitest';
import { makeTestDb } from '../setup-db';
import { makeSessionQueries } from '@/features/sessions/queries';
import { makeExerciseQueries } from '@/features/exercises/queries';
import { makeRoutineQueries } from '@/features/routines/queries';
import { sessionSets, workoutSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function setup() {
  const { db } = makeTestDb();
  const ex = makeExerciseQueries(db);
  const rt = makeRoutineQueries(db);
  const ss = makeSessionQueries(db);
  const press = await ex.createExercise({ name: 'Press banca', muscleGroup: 'Pecho' });
  const sentadilla = await ex.createExercise({ name: 'Sentadilla', muscleGroup: 'Pierna' });
  const routine = await rt.createRoutine('Push');
  return { db, ex, rt, ss, press, sentadilla, routine };
}

describe('sessions queries', () => {
  it('startSession writes routineNameSnapshot and leaves finishedAt null', async () => {
    const { ss, routine } = await setup();
    const session = await ss.startSession({ routineId: routine.id, routineName: routine.name });
    expect(session.routineNameSnapshot).toBe('Push');
    expect(session.finishedAt).toBeNull();
    expect(typeof session.startedAt).toBe('number');
  });

  it('appendSet writes one row with exerciseNameSnapshot', async () => {
    const { ss, routine, press } = await setup();
    const session = await ss.startSession({ routineId: routine.id, routineName: routine.name });
    const set = await ss.appendSet({
      sessionId: session.id,
      exerciseId: press.id,
      exerciseName: 'Press banca',
      position: 0,
      weightKg: 80,
      reps: 8,
    });
    expect(set.exerciseNameSnapshot).toBe('Press banca');
    expect(set.weightKg).toBe(80);
    expect(set.reps).toBe(8);
  });

  it('finishSession sets finishedAt', async () => {
    const { ss, routine } = await setup();
    const session = await ss.startSession({ routineId: routine.id, routineName: routine.name });
    await ss.finishSession(session.id);
    const fetched = await ss.getSessionWithSets(session.id);
    expect(fetched?.session.finishedAt).toEqual(expect.any(Number));
  });

  it('abandonSession removes the session and cascades sets', async () => {
    const { db, ss, routine, press } = await setup();
    const session = await ss.startSession({ routineId: routine.id, routineName: routine.name });
    await ss.appendSet({
      sessionId: session.id,
      exerciseId: press.id,
      exerciseName: 'Press banca',
      position: 0,
      weightKg: 80,
      reps: 8,
    });
    await ss.abandonSession(session.id);
    const fetched = await ss.getSessionWithSets(session.id);
    expect(fetched).toBeNull();
    const leftover = await db
      .select()
      .from(sessionSets)
      .where(eq(sessionSets.sessionId, session.id));
    expect(leftover).toHaveLength(0);
  });

  it('lastSessionForExercise returns most recent finished session containing the exercise', async () => {
    const { ss, routine, press, sentadilla } = await setup();
    expect(await ss.lastSessionForExercise(press.id)).toBeNull();

    const first = await ss.startSession({ routineId: routine.id, routineName: routine.name });
    await ss.appendSet({
      sessionId: first.id,
      exerciseId: press.id,
      exerciseName: 'Press banca',
      position: 0,
      weightKg: 70,
      reps: 8,
    });
    await ss.finishSession(first.id);

    const second = await ss.startSession({ routineId: routine.id, routineName: routine.name });
    await ss.appendSet({
      sessionId: second.id,
      exerciseId: sentadilla.id,
      exerciseName: 'Sentadilla',
      position: 0,
      weightKg: 100,
      reps: 6,
    });
    await ss.finishSession(second.id);

    const third = await ss.startSession({ routineId: routine.id, routineName: routine.name });
    await ss.appendSet({
      sessionId: third.id,
      exerciseId: press.id,
      exerciseName: 'Press banca',
      position: 0,
      weightKg: 80,
      reps: 8,
    });
    await ss.finishSession(third.id);

    const last = await ss.lastSessionForExercise(press.id);
    expect(last?.session.id).toBe(third.id);
    expect(last?.sets[0]?.weightKg).toBe(80);

    const previous = await ss.lastSessionForExercise(press.id, third.id);
    expect(previous?.session.id).toBe(first.id);
  });

  it('listSessions orders by startedAt desc', async () => {
    const { db, ss, routine } = await setup();
    const a = await ss.startSession({ routineId: routine.id, routineName: routine.name });
    const b = await ss.startSession({ routineId: routine.id, routineName: routine.name });
    const c = await ss.startSession({ routineId: routine.id, routineName: routine.name });

    await db.update(workoutSessions).set({ startedAt: 100 }).where(eq(workoutSessions.id, a.id));
    await db.update(workoutSessions).set({ startedAt: 300 }).where(eq(workoutSessions.id, b.id));
    await db.update(workoutSessions).set({ startedAt: 200 }).where(eq(workoutSessions.id, c.id));

    const list = await ss.listSessions({});
    expect(list.map((s) => s.id)).toEqual([b.id, c.id, a.id]);

    const sinceList = await ss.listSessions({ since: 200 });
    expect(sinceList.map((s) => s.id)).toEqual([b.id, c.id]);
  });
});

describe('last-set autofill end-to-end', () => {
  it('returns sets ordered such that the first element is the first persisted set of the last finished session', async () => {
    const { db } = makeTestDb();
    const ex = makeExerciseQueries(db);
    const rt = makeRoutineQueries(db);
    const ss = makeSessionQueries(db);

    const pressBanca = await ex.createExercise({ name: 'Peso muerto', muscleGroup: 'Espalda' });
    const routine = await rt.createRoutine('Pull');

    const old = await ss.startSession({ routineId: routine.id, routineName: 'Old' });
    await ss.appendSet({
      sessionId: old.id,
      exerciseId: pressBanca.id,
      exerciseName: 'Peso muerto',
      position: 0,
      weightKg: 100,
      reps: 5,
    });
    await ss.finishSession(old.id);

    const recent = await ss.startSession({ routineId: routine.id, routineName: 'Recent' });
    await ss.appendSet({
      sessionId: recent.id,
      exerciseId: pressBanca.id,
      exerciseName: 'Peso muerto',
      position: 0,
      weightKg: 120,
      reps: 5,
    });
    await ss.appendSet({
      sessionId: recent.id,
      exerciseId: pressBanca.id,
      exerciseName: 'Peso muerto',
      position: 1,
      weightKg: 120,
      reps: 5,
    });
    await ss.appendSet({
      sessionId: recent.id,
      exerciseId: pressBanca.id,
      exerciseName: 'Peso muerto',
      position: 2,
      weightKg: 120,
      reps: 5,
    });
    await ss.appendSet({
      sessionId: recent.id,
      exerciseId: pressBanca.id,
      exerciseName: 'Peso muerto',
      position: 3,
      weightKg: 120,
      reps: 4,
    });
    await ss.finishSession(recent.id);

    const last = await ss.lastSessionForExercise(pressBanca.id);
    expect(last).not.toBeNull();
    expect(last!.session.id).toBe(recent.id);
    const exSets = last!.sets.filter((s) => s.exerciseId === pressBanca.id);
    expect(exSets).toHaveLength(4);
    expect(exSets[0]!.weightKg).toBe(120);
    expect(exSets[0]!.reps).toBe(5);
  });

  it('autofill fallback: when no prior session exists, returns null', async () => {
    const { db } = makeTestDb();
    const ex = makeExerciseQueries(db);
    const ss = makeSessionQueries(db);
    const e = await ex.createExercise({ name: 'Sentadilla', muscleGroup: 'Pierna' });
    const last = await ss.lastSessionForExercise(e.id);
    expect(last).toBeNull();
  });
});
