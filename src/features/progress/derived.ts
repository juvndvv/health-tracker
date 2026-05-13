import { ymd } from '@/lib/date';

export function suggestedRoutine(
  routines: { id: number; archivedAt: number | null }[],
  lastUsedAt: Record<number, number>,
): number | null {
  const active = routines.filter((r) => r.archivedAt == null);
  if (active.length === 0) return null;
  return active
    .map((r) => ({ id: r.id, lu: lastUsedAt[r.id] ?? 0 }))
    .sort((a, b) => a.lu - b.lu || a.id - b.id)[0]!.id;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const dow = (x.getDay() + 6) % 7;
  return addDays(x, -dow);
}

function endOfWeek(d: Date): Date {
  const start = startOfWeek(d);
  const end = addDays(start, 7);
  return end;
}

export function currentStreak(
  sessionDates: Set<string>,
  today: Date,
  weeksMax = 26,
): number {
  const monday = startOfWeek(today);
  let streak = 0;
  for (let w = 0; w < weeksMax; w++) {
    const weekStart = addDays(monday, -7 * w);
    let count = 0;
    for (let d = 0; d < 7; d++) {
      if (sessionDates.has(ymd(addDays(weekStart, d)))) count++;
    }
    if (count >= 3) streak++;
    else break;
  }
  return streak;
}

export type SessionLite = {
  startedAt: number;
  finishedAt: number | null;
  sets: { weightKg: number | null; reps: number }[];
};

export type WeeklyStats = {
  sessions: number;
  sessionsGoal: number;
  minutes: number;
  minutesGoal: number;
  volumeKg: number;
  volumeGoalKg: number;
};

export function thisWeekStats(
  sessions: SessionLite[],
  today: Date,
  goals: { sessions: number; minutes: number; volumeKg: number },
): WeeklyStats {
  const start = startOfWeek(today).getTime();
  const end = endOfWeek(today).getTime();
  let sessionCount = 0;
  let minutes = 0;
  let volumeKg = 0;
  for (const s of sessions) {
    if (s.startedAt < start || s.startedAt >= end) continue;
    sessionCount++;
    if (s.finishedAt != null) {
      minutes += Math.round((s.finishedAt - s.startedAt) / 60000);
    }
    for (const set of s.sets) {
      if (set.weightKg == null) continue;
      volumeKg += set.weightKg * set.reps;
    }
  }
  return {
    sessions: sessionCount,
    sessionsGoal: goals.sessions,
    minutes,
    minutesGoal: goals.minutes,
    volumeKg,
    volumeGoalKg: goals.volumeKg,
  };
}

export type SessionWithSets = {
  id: number;
  startedAt: number;
  finishedAt: number | null;
  sets: { exerciseId: number; weightKg: number | null; reps: number }[];
};

export type HistoryPoint = {
  date: Date;
  topSet: { weightKg: number | null; reps: number };
  volume: number;
  setsCount: number;
};

export function exerciseHistory(
  sessions: SessionWithSets[],
  exerciseId: number,
): HistoryPoint[] {
  const points: HistoryPoint[] = [];
  for (const s of sessions) {
    if (s.finishedAt == null) continue;
    const exSets = s.sets.filter((set) => set.exerciseId === exerciseId);
    if (exSets.length === 0) continue;
    let top = exSets[0]!;
    let volume = 0;
    for (const set of exSets) {
      if ((set.weightKg ?? -Infinity) > (top.weightKg ?? -Infinity)) {
        top = set;
      }
      if (set.weightKg != null) volume += set.weightKg * set.reps;
    }
    points.push({
      date: new Date(s.startedAt),
      topSet: { weightKg: top.weightKg, reps: top.reps },
      volume,
      setsCount: exSets.length,
    });
  }
  points.sort((a, b) => a.date.getTime() - b.date.getTime());
  return points;
}

export function prIndices(history: { y: number }[]): number[] {
  const out: number[] = [];
  let max = -Infinity;
  for (let i = 0; i < history.length; i++) {
    const y = history[i]!.y;
    if (y > max) {
      out.push(i);
      max = y;
    }
  }
  return out;
}

export type HeatDay = {
  date: Date;
  intensity?: number;
  sessions?: number;
  future?: boolean;
};

export function heatmapWeeks(
  sessions: SessionLite[],
  today: Date,
  weeks = 26,
): HeatDay[][] {
  const todayStart = startOfDay(today);
  const monday = startOfWeek(today);
  const totals = new Map<string, { volume: number; sessions: number }>();
  for (const s of sessions) {
    const key = ymd(new Date(s.startedAt));
    let vol = 0;
    for (const set of s.sets) {
      if (set.weightKg == null) continue;
      vol += set.weightKg * set.reps;
    }
    const cur = totals.get(key) ?? { volume: 0, sessions: 0 };
    cur.volume += vol;
    cur.sessions += 1;
    totals.set(key, cur);
  }
  const cols: HeatDay[][] = [];
  for (let w = weeks; w >= 0; w--) {
    const weekStart = addDays(monday, -7 * w);
    const col: HeatDay[] = [];
    for (let d = 0; d < 7; d++) {
      const day = addDays(weekStart, d);
      const key = ymd(day);
      const tot = totals.get(key);
      const future = day.getTime() > todayStart.getTime();
      if (future) {
        col.push({ date: day, future: true });
      } else if (tot) {
        const intensity = Math.min(4, Math.ceil(tot.volume / 1500));
        col.push({
          date: day,
          intensity,
          sessions: tot.sessions,
        });
      } else {
        col.push({ date: day });
      }
    }
    cols.push(col);
  }
  return cols;
}

export type SessionWithSetsAndMuscle = {
  startedAt: number;
  sets: { muscleGroup: string }[];
};

export function muscleVolumeStats(
  sessions: SessionWithSetsAndMuscle[],
  today: Date,
  days = 84,
): { name: string; sessions: number; pct: number }[] {
  const cutoff = addDays(startOfDay(today), -days).getTime();
  const counts = new Map<string, number>();
  for (const s of sessions) {
    if (s.startedAt < cutoff) continue;
    const muscles = new Set<string>();
    for (const set of s.sets) muscles.add(set.muscleGroup);
    for (const m of muscles) {
      counts.set(m, (counts.get(m) ?? 0) + 1);
    }
  }
  const entries = Array.from(counts.entries()).map(([name, sessions]) => ({
    name,
    sessions,
  }));
  const max = entries.reduce((acc, e) => Math.max(acc, e.sessions), 0);
  const result = entries.map((e) => ({
    ...e,
    pct: max === 0 ? 0 : (e.sessions / max) * 100,
  }));
  result.sort((a, b) => b.sessions - a.sessions || a.name.localeCompare(b.name));
  return result;
}
