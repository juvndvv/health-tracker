import { describe, it, expect } from 'vitest';
import {
  suggestedRoutine,
  currentStreak,
  thisWeekStats,
  exerciseHistory,
  prIndices,
  heatmapWeeks,
  muscleVolumeStats,
} from '@/features/progress/derived';
import { ymd } from '@/lib/date';

describe('suggestedRoutine', () => {
  it('returns null when there are no active routines', () => {
    expect(suggestedRoutine([], {})).toBeNull();
    expect(suggestedRoutine([{ id: 1, archivedAt: 100 }], {})).toBeNull();
  });
  it('returns the smallest id when nothing has been used', () => {
    const routines = [
      { id: 3, archivedAt: null },
      { id: 1, archivedAt: null },
      { id: 2, archivedAt: null },
    ];
    expect(suggestedRoutine(routines, {})).toBe(1);
  });
  it('returns the least recently used', () => {
    const routines = [
      { id: 1, archivedAt: null },
      { id: 2, archivedAt: null },
    ];
    expect(suggestedRoutine(routines, { 1: 1000, 2: 500 })).toBe(2);
  });
  it('skips archived routines', () => {
    const routines = [
      { id: 1, archivedAt: 5 },
      { id: 2, archivedAt: null },
    ];
    expect(suggestedRoutine(routines, { 2: 1000 })).toBe(2);
  });
  it('breaks ties by ascending id', () => {
    const routines = [
      { id: 3, archivedAt: null },
      { id: 1, archivedAt: null },
    ];
    expect(suggestedRoutine(routines, { 1: 500, 3: 500 })).toBe(1);
  });
});

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

describe('currentStreak', () => {
  // Wednesday 2026-05-13
  const today = new Date(2026, 4, 13);
  const monday = new Date(2026, 4, 11);

  it('returns 0 when there are no sessions', () => {
    expect(currentStreak(new Set(), today)).toBe(0);
  });

  it('returns 1 when current week has 3+ sessions', () => {
    const set = new Set([
      ymd(monday),
      ymd(addDays(monday, 1)),
      ymd(addDays(monday, 2)),
    ]);
    expect(currentStreak(set, today)).toBe(1);
  });

  it('returns 2 when previous week also has 3+ sessions', () => {
    const prevMonday = addDays(monday, -7);
    const set = new Set([
      ymd(monday),
      ymd(addDays(monday, 1)),
      ymd(addDays(monday, 2)),
      ymd(prevMonday),
      ymd(addDays(prevMonday, 1)),
      ymd(addDays(prevMonday, 2)),
    ]);
    expect(currentStreak(set, today)).toBe(2);
  });

  it('stops at the first week with <3 sessions', () => {
    const prevMonday = addDays(monday, -7);
    const twoBack = addDays(monday, -14);
    const set = new Set([
      ymd(monday),
      ymd(addDays(monday, 1)),
      ymd(addDays(monday, 2)),
      // previous week only 2 sessions: streak breaks
      ymd(prevMonday),
      ymd(addDays(prevMonday, 1)),
      // older week has 3 but does not count because chain broke
      ymd(twoBack),
      ymd(addDays(twoBack, 1)),
      ymd(addDays(twoBack, 2)),
    ]);
    expect(currentStreak(set, today)).toBe(1);
  });
});

describe('thisWeekStats', () => {
  // Wednesday 2026-05-13 — Monday 2026-05-11
  const today = new Date(2026, 4, 13);
  const monday = new Date(2026, 4, 11, 8, 0, 0);
  const lastWeek = new Date(2026, 4, 4, 8, 0, 0);
  const goals = { sessions: 4, minutes: 240, volumeKg: 10000 };

  it('counts sessions, minutes, and volume within current week', () => {
    const sessions = [
      {
        startedAt: monday.getTime(),
        finishedAt: monday.getTime() + 30 * 60000,
        sets: [
          { weightKg: 50, reps: 10 },
          { weightKg: 60, reps: 8 },
        ],
      },
      {
        startedAt: addDays(monday, 2).getTime(),
        finishedAt: addDays(monday, 2).getTime() + 45 * 60000,
        sets: [{ weightKg: 100, reps: 5 }],
      },
      {
        startedAt: lastWeek.getTime(),
        finishedAt: lastWeek.getTime() + 60 * 60000,
        sets: [{ weightKg: 200, reps: 5 }],
      },
    ];
    const stats = thisWeekStats(sessions, today, goals);
    expect(stats.sessions).toBe(2);
    expect(stats.minutes).toBe(75);
    expect(stats.volumeKg).toBe(50 * 10 + 60 * 8 + 100 * 5);
    expect(stats.sessionsGoal).toBe(4);
    expect(stats.minutesGoal).toBe(240);
    expect(stats.volumeGoalKg).toBe(10000);
  });

  it('skips unfinished sessions for minutes and null weight for volume', () => {
    const sessions = [
      {
        startedAt: monday.getTime(),
        finishedAt: null,
        sets: [
          { weightKg: null, reps: 10 },
          { weightKg: 80, reps: 5 },
        ],
      },
    ];
    const stats = thisWeekStats(sessions, today, goals);
    expect(stats.sessions).toBe(1);
    expect(stats.minutes).toBe(0);
    expect(stats.volumeKg).toBe(400);
  });
});

describe('exerciseHistory', () => {
  it('returns points sorted ascending by date', () => {
    const sessions = [
      {
        id: 2,
        startedAt: 2000,
        finishedAt: 3000,
        sets: [{ exerciseId: 1, weightKg: 50, reps: 10 }],
      },
      {
        id: 1,
        startedAt: 1000,
        finishedAt: 1500,
        sets: [{ exerciseId: 1, weightKg: 40, reps: 10 }],
      },
    ];
    const history = exerciseHistory(sessions, 1);
    expect(history.map((p) => p.date.getTime())).toEqual([1000, 2000]);
  });

  it('picks the set with highest weight as topSet and sums volume', () => {
    const sessions = [
      {
        id: 1,
        startedAt: 1000,
        finishedAt: 2000,
        sets: [
          { exerciseId: 1, weightKg: 50, reps: 10 },
          { exerciseId: 1, weightKg: 70, reps: 5 },
          { exerciseId: 1, weightKg: 60, reps: 8 },
          { exerciseId: 2, weightKg: 200, reps: 1 },
        ],
      },
    ];
    const history = exerciseHistory(sessions, 1);
    expect(history).toHaveLength(1);
    expect(history[0]!.topSet).toEqual({ weightKg: 70, reps: 5 });
    expect(history[0]!.volume).toBe(50 * 10 + 70 * 5 + 60 * 8);
    expect(history[0]!.setsCount).toBe(3);
  });

  it('skips unfinished sessions and sessions without the exercise', () => {
    const sessions = [
      {
        id: 1,
        startedAt: 1000,
        finishedAt: null,
        sets: [{ exerciseId: 1, weightKg: 50, reps: 5 }],
      },
      {
        id: 2,
        startedAt: 2000,
        finishedAt: 3000,
        sets: [{ exerciseId: 2, weightKg: 50, reps: 5 }],
      },
    ];
    expect(exerciseHistory(sessions, 1)).toEqual([]);
  });
});

describe('prIndices', () => {
  it('returns empty array for empty input', () => {
    expect(prIndices([])).toEqual([]);
  });

  it('returns all indices when strictly increasing', () => {
    expect(prIndices([{ y: 1 }, { y: 2 }, { y: 3 }])).toEqual([0, 1, 2]);
  });

  it('returns only new maxima for non-monotonic input', () => {
    expect(
      prIndices([{ y: 10 }, { y: 8 }, { y: 12 }, { y: 12 }, { y: 15 }]),
    ).toEqual([0, 2, 4]);
  });
});

describe('heatmapWeeks', () => {
  const today = new Date(2026, 4, 13); // Wednesday

  it('returns weeks+1 columns of 7 days', () => {
    const cols = heatmapWeeks([], today, 26);
    expect(cols).toHaveLength(27);
    for (const c of cols) expect(c).toHaveLength(7);
  });

  it('rightmost column is the current week', () => {
    const cols = heatmapWeeks([], today, 4);
    const last = cols[cols.length - 1]!;
    expect(ymd(last[0]!.date)).toBe('2026-05-11'); // Monday
    expect(ymd(last[6]!.date)).toBe('2026-05-17'); // Sunday
  });

  it('marks future days and buckets intensity by volume', () => {
    const monday = new Date(2026, 4, 11, 9, 0);
    const sessions = [
      {
        startedAt: monday.getTime(),
        finishedAt: monday.getTime() + 1,
        sets: [
          // volume 1500 -> intensity ceil(1500/1500) = 1
          { weightKg: 150, reps: 10 },
        ],
      },
      {
        startedAt: addDays(monday, 1).getTime(),
        finishedAt: null,
        // volume 4500 -> intensity ceil(4500/1500) = 3
        sets: [{ weightKg: 450, reps: 10 }],
      },
      {
        startedAt: addDays(monday, 2).getTime(),
        finishedAt: null,
        // volume 9000 -> intensity ceil(9000/1500) = 6 clamped to 4
        sets: [{ weightKg: 900, reps: 10 }],
      },
    ];
    const cols = heatmapWeeks(sessions, today, 1);
    const current = cols[cols.length - 1]!;
    expect(current[0]!.intensity).toBe(1);
    expect(current[1]!.intensity).toBe(3);
    expect(current[2]!.intensity).toBe(4);
    // Thursday is in the future relative to Wednesday today
    expect(current[3]!.future).toBe(true);
    expect(current[6]!.future).toBe(true);
  });
});

describe('muscleVolumeStats', () => {
  const today = new Date(2026, 4, 13);

  it('counts unique muscles per session and normalizes pct to max', () => {
    const sessions = [
      {
        startedAt: today.getTime() - 86400000,
        sets: [
          { muscleGroup: 'chest' },
          { muscleGroup: 'chest' },
          { muscleGroup: 'triceps' },
        ],
      },
      {
        startedAt: today.getTime() - 2 * 86400000,
        sets: [{ muscleGroup: 'chest' }, { muscleGroup: 'back' }],
      },
    ];
    const stats = muscleVolumeStats(sessions, today, 84);
    expect(stats).toEqual([
      { name: 'chest', sessions: 2, pct: 100 },
      { name: 'back', sessions: 1, pct: 50 },
      { name: 'triceps', sessions: 1, pct: 50 },
    ]);
  });

  it('only considers sessions within the last N days', () => {
    const sessions = [
      {
        startedAt: today.getTime() - 10 * 86400000,
        sets: [{ muscleGroup: 'chest' }],
      },
      {
        startedAt: today.getTime() - 100 * 86400000,
        sets: [{ muscleGroup: 'back' }],
      },
    ];
    const stats = muscleVolumeStats(sessions, today, 84);
    expect(stats).toEqual([{ name: 'chest', sessions: 1, pct: 100 }]);
  });
});
