import { create } from 'zustand';

export type DraftSet = {
  exerciseId: number;
  exerciseName: string;
  muscleGroup: string;
  targetReps: number;
  targetWeight: number | null;
  weight: number | null;
  reps: number;
  completed: boolean;
};

type State = {
  sessionId: number | null;
  routineId: number | null;
  routineName: string | null;
  sets: DraftSet[];
  activeIdx: number;
  startedAt: number | null;

  init: (init: {
    sessionId: number;
    routineId: number;
    routineName: string;
    sets: DraftSet[];
  }) => void;
  update: (idx: number, patch: Partial<DraftSet>) => void;
  complete: (idx: number) => void;
  setActive: (idx: number) => void;
  appendSetAt: (idx: number) => void;
  clear: () => void;
};

export const useWorkoutDraft = create<State>((set) => ({
  sessionId: null,
  routineId: null,
  routineName: null,
  sets: [],
  activeIdx: 0,
  startedAt: null,
  init: (i) => set({ ...i, activeIdx: 0, startedAt: Date.now() }),
  update: (idx, patch) =>
    set((s) => ({ sets: s.sets.map((x, i) => (i === idx ? { ...x, ...patch } : x)) })),
  complete: (idx) =>
    set((s) => {
      const current = s.sets[idx];
      if (!current) return s;
      const next = s.sets.findIndex((x, i) => i > idx && !x.completed);
      const sets = s.sets.map((x, i) => {
        if (i === idx) return { ...x, completed: true };
        if (i === next && x.exerciseId === current.exerciseId && !x.completed) {
          return { ...x, weight: current.weight, reps: current.reps };
        }
        return x;
      });
      return { sets, activeIdx: next === -1 ? idx : next };
    }),
  setActive: (idx) => set({ activeIdx: idx }),
  appendSetAt: (idx) =>
    set((s) => {
      const last = s.sets[idx];
      if (!last) return s;
      const dup: DraftSet = { ...last, completed: false };
      return { sets: [...s.sets.slice(0, idx + 1), dup, ...s.sets.slice(idx + 1)] };
    }),
  clear: () =>
    set({
      sessionId: null,
      routineId: null,
      routineName: null,
      sets: [],
      activeIdx: 0,
      startedAt: null,
    }),
}));
