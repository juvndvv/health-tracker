// Mock data: 6+ months of realistic gym history.
// All dates are computed relative to "today" so the prototype always looks fresh.

const TODAY = new Date(2026, 4, 13); // May 13, 2026 — matches the doc date

function dateNDaysAgo(n) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return d;
}
function ymd(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function fmtDayShort(d) {
  // "lun 12 may"
  const days = ['dom','lun','mar','mié','jue','vie','sáb'];
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}
function parseYmd(s) {
  if (s instanceof Date) return s;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function fmtRelative(d) {
  if (typeof d === 'string') d = parseYmd(d);
  const t0 = new Date(TODAY); t0.setHours(0,0,0,0);
  const d0 = new Date(d); d0.setHours(0,0,0,0);
  const days = Math.round((t0 - d0) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'hoy';
  if (days === 0) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 7) return `hace ${days} días`;
  if (days < 14) return 'hace 1 semana';
  if (days < 30) return `hace ${Math.floor(days / 7)} semanas`;
  if (days < 60) return 'hace 1 mes';
  return `hace ${Math.floor(days / 30)} meses`;
}

// ---- Exercises catalog (10) -------------------------------------------------
const EXERCISES = [
  { id: 1, name: 'Press banca',         muscle: 'Pecho' },
  { id: 2, name: 'Press inclinado',     muscle: 'Pecho' },
  { id: 3, name: 'Sentadilla',          muscle: 'Pierna' },
  { id: 4, name: 'Peso muerto',         muscle: 'Espalda' },
  { id: 5, name: 'Dominadas',           muscle: 'Espalda' },
  { id: 6, name: 'Remo con barra',      muscle: 'Espalda' },
  { id: 7, name: 'Press militar',       muscle: 'Hombro' },
  { id: 8, name: 'Curl de bíceps',      muscle: 'Brazo' },
  { id: 9, name: 'Extensión de tríceps',muscle: 'Brazo' },
  { id: 10,name: 'Hip thrust',          muscle: 'Pierna' },
];

// ---- Routines ---------------------------------------------------------------
const ROUTINES = [
  {
    id: 1, name: 'Empuje', emoji: 'push',
    items: [
      { exerciseId: 1, sets: 4, reps: 6,  weight: 85 },
      { exerciseId: 2, sets: 3, reps: 8,  weight: 65 },
      { exerciseId: 7, sets: 3, reps: 8,  weight: 50 },
      { exerciseId: 9, sets: 3, reps: 10, weight: 25 },
    ],
  },
  {
    id: 2, name: 'Tirón', emoji: 'pull',
    items: [
      { exerciseId: 4, sets: 4, reps: 5,  weight: 120 },
      { exerciseId: 6, sets: 4, reps: 8,  weight: 70 },
      { exerciseId: 5, sets: 3, reps: 8,  weight: null },
      { exerciseId: 8, sets: 3, reps: 10, weight: 14 },
    ],
  },
  {
    id: 3, name: 'Pierna', emoji: 'legs',
    items: [
      { exerciseId: 3, sets: 5, reps: 5,  weight: 110 },
      { exerciseId: 10, sets: 4, reps: 8, weight: 90 },
    ],
  },
  {
    id: 4, name: 'Full body', emoji: 'fb',
    items: [
      { exerciseId: 3, sets: 3, reps: 6,  weight: 100 },
      { exerciseId: 1, sets: 3, reps: 6,  weight: 80 },
      { exerciseId: 6, sets: 3, reps: 8,  weight: 65 },
      { exerciseId: 8, sets: 2, reps: 10, weight: 14 },
    ],
  },
];

// ---- Generate workout sessions ---------------------------------------------
// Pattern: roughly 4 sessions/week for the last 26 weeks. Rotating Empuje/Tirón/Pierna,
// occasional Full body. Progressive overload — weights creep up over time.
function makeSessions() {
  const sessions = [];
  let id = 1;
  // pattern: train on Mon (1), Tue (2), Thu (4), Sat (6) roughly
  const trainDays = [1, 2, 4, 6];
  const rotation = [1, 2, 3, 1, 2, 3, 4]; // empuje, tirón, pierna, empuje, tirón, pierna, fullbody
  let rIdx = 0;

  for (let day = 1; day <= 26 * 7; day++) {
    const d = dateNDaysAgo(day);
    if (!trainDays.includes(d.getDay())) continue;
    // ~10% skip
    if ((day * 7) % 23 < 2) continue;

    const routine = ROUTINES.find(r => r.id === rotation[rIdx % rotation.length]);
    rIdx++;
    // progress factor: weights at the start (180d ago) ~85% of current; today=100%
    const progress = 0.82 + (1 - day / (26 * 7)) * 0.18;

    const sets = [];
    routine.items.forEach((item) => {
      const ex = EXERCISES.find(e => e.id === item.exerciseId);
      for (let s = 0; s < item.sets; s++) {
        const baseW = item.weight == null ? null : Math.round(item.weight * progress * 2) / 2;
        // slight intra-session fatigue: drop weight or reps on later sets
        let w = baseW;
        let r = item.reps;
        if (s === item.sets - 1 && Math.random() < 0.4 && baseW != null) {
          w = Math.round((baseW - 2.5) * 2) / 2;
        }
        if (s >= item.sets - 1 && Math.random() < 0.3) r = item.reps - 1;
        sets.push({
          exerciseId: ex.id,
          exerciseName: ex.name,
          position: s + 1,
          weightKg: w,
          reps: r,
        });
      }
    });

    const startedAt = new Date(d);
    startedAt.setHours(18, 30, 0, 0);
    const finishedAt = new Date(startedAt);
    finishedAt.setMinutes(finishedAt.getMinutes() + 55 + Math.floor(Math.random() * 25));

    sessions.push({
      id: id++,
      routineId: routine.id,
      routineName: routine.name,
      startedAt,
      finishedAt,
      durationMin: Math.round((finishedAt - startedAt) / 60000),
      sets,
      totalVolume: sets.reduce((acc, st) => acc + (st.weightKg || 0) * st.reps, 0),
    });
  }
  // Sort by startedAt descending so SESSIONS[0] is the most recent.
  sessions.sort((a, b) => b.startedAt - a.startedAt);
  return sessions;
}

const SESSIONS = makeSessions();

// ---- Body weight history (~180 days, declining trend with noise) ------------
function makeWeights() {
  const out = [];
  const start = 82.4;
  const end = 78.1;
  const N = 168;
  for (let i = N; i >= 0; i -= 1) {
    if (i % 2 === 0 && Math.random() < 0.25) continue; // not every day
    const t = 1 - i / N;
    const trend = start + (end - start) * t;
    const noise = (Math.sin(i * 0.5) * 0.25) + (Math.random() - 0.5) * 0.4;
    out.push({ date: ymd(dateNDaysAgo(i)), kg: Math.round((trend + noise) * 10) / 10 });
  }
  return out;
}
const WEIGHTS = makeWeights();

// ---- Measurements ----------------------------------------------------------
const MEASUREMENT_TYPES = [
  { id: 1, name: 'Cintura', unit: 'cm' },
  { id: 2, name: 'Brazo derecho', unit: 'cm' },
  { id: 3, name: 'Pecho', unit: 'cm' },
  { id: 4, name: 'Grasa corporal', unit: '%' },
];

function makeMeasurements() {
  const out = [];
  const trends = {
    1: { start: 87, end: 83 },
    2: { start: 36.5, end: 38.2 },
    3: { start: 102, end: 104 },
    4: { start: 19, end: 15.5 },
  };
  for (let i = 168; i >= 0; i -= 14) {
    MEASUREMENT_TYPES.forEach((m) => {
      const tr = trends[m.id];
      const t = 1 - i / 168;
      const v = tr.start + (tr.end - tr.start) * t + (Math.random() - 0.5) * 0.5;
      out.push({
        typeId: m.id,
        date: ymd(dateNDaysAgo(i)),
        value: Math.round(v * 10) / 10,
      });
    });
  }
  return out;
}
const MEASUREMENTS = makeMeasurements();

// ---- Derived: per-exercise progression --------------------------------------
function exerciseHistory(exerciseId) {
  // Returns { date, topSet, volume }[] sorted by date asc
  const out = [];
  [...SESSIONS].sort((a, b) => a.startedAt - b.startedAt).forEach((s) => {
    const sets = s.sets.filter(st => st.exerciseId === exerciseId);
    if (!sets.length) return;
    const topSet = sets.reduce((best, st) => (st.weightKg || 0) > (best.weightKg || 0) ? st : best, sets[0]);
    const volume = sets.reduce((a, st) => a + (st.weightKg || 0) * st.reps, 0);
    out.push({
      date: s.startedAt,
      sessionId: s.id,
      topSet,
      volume,
      sets: sets.length,
    });
  });
  return out;
}

function lastSessionForExercise(exerciseId, beforeSessionId = Infinity) {
  for (const s of SESSIONS) {
    if (s.id >= beforeSessionId) continue;
    if (s.sets.some(st => st.exerciseId === exerciseId)) return s;
  }
  return null;
}

// ---- Streak ----------------------------------------------------------------
function trainingDates() {
  return new Set(SESSIONS.map(s => ymd(s.startedAt)));
}
function currentStreak() {
  const dates = trainingDates();
  // streak = consecutive weeks with >=3 sessions
  let weeks = 0;
  for (let w = 0; w < 12; w++) {
    let count = 0;
    for (let d = 0; d < 7; d++) {
      const day = dateNDaysAgo(w * 7 + d);
      if (dates.has(ymd(day))) count++;
    }
    if (count >= 3) weeks++;
    else break;
  }
  return weeks;
}

// ---- This week stats -------------------------------------------------------
function thisWeekStats() {
  const sessionsThisWeek = SESSIONS.filter(s => (TODAY - s.startedAt) / (1000 * 60 * 60 * 24) < 7);
  const volume = sessionsThisWeek.reduce((a, s) => a + s.totalVolume, 0);
  const minutes = sessionsThisWeek.reduce((a, s) => a + s.durationMin, 0);
  return {
    sessions: sessionsThisWeek.length,
    sessionsGoal: 4,
    volume,
    volumeGoal: 18000,
    minutes,
    minutesGoal: 240,
  };
}

// ---- Calendar heatmap data (26 weeks) --------------------------------------
function heatmapWeeks() {
  // returns: [{ days: [{date, intensity 0-4, sessions: [Session]}]}, ...] 26 cols, 7 rows
  const sessionsByDay = {};
  SESSIONS.forEach(s => {
    const k = ymd(s.startedAt);
    sessionsByDay[k] = sessionsByDay[k] || [];
    sessionsByDay[k].push(s);
  });
  const weeks = [];
  // start: 26 weeks ago, aligned to Monday
  const start = dateNDaysAgo(26 * 7);
  // adjust to Monday of that week
  const offs = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - offs);
  for (let w = 0; w < 27; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start);
      day.setDate(day.getDate() + w * 7 + d);
      if (day > TODAY) {
        days.push({ date: day, future: true });
        continue;
      }
      const k = ymd(day);
      const sess = sessionsByDay[k] || [];
      const vol = sess.reduce((a, s) => a + s.totalVolume, 0);
      let intensity = 0;
      if (sess.length) intensity = Math.min(4, Math.ceil(vol / 1500));
      days.push({ date: day, intensity, sessions: sess });
    }
    weeks.push(days);
  }
  return weeks;
}

Object.assign(window, {
  TODAY, dateNDaysAgo, ymd, parseYmd, fmtDayShort, fmtRelative,
  EXERCISES, ROUTINES, SESSIONS, WEIGHTS,
  MEASUREMENT_TYPES, MEASUREMENTS,
  exerciseHistory, lastSessionForExercise,
  currentStreak, thisWeekStats, heatmapWeeks,
});
