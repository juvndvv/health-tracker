import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { routineQueries } from '@/features/routines';
import { sessionQueries } from '@/features/sessions';
import { useWorkoutDraft, type DraftSet } from '@/features/sessions/state';
import { useTheme } from '@/theme/useTheme';

export default function WorkoutStart() {
  const p = useTheme();
  const router = useRouter();
  const { routineId } = useLocalSearchParams<{ routineId?: string }>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = Number(routineId);
      if (!id || isNaN(id)) {
        router.back();
        return;
      }
      const routine = await routineQueries.getRoutineWithItems(id);
      if (!routine) {
        router.back();
        return;
      }

      const sets: DraftSet[] = [];
      for (const item of routine.items) {
        const last = await sessionQueries.lastSessionForExercise(item.exerciseId);
        const lastSets = (last?.sets ?? []).filter((s) => s.exerciseId === item.exerciseId);
        const seedWeight = lastSets[0]?.weightKg ?? item.targetWeightKg ?? null;
        const seedReps = lastSets[0]?.reps ?? item.targetReps;
        for (let i = 0; i < item.targetSets; i++) {
          sets.push({
            exerciseId: item.exerciseId,
            exerciseName: item.exerciseName,
            muscleGroup: item.muscleGroup,
            targetReps: item.targetReps,
            targetWeight: item.targetWeightKg,
            weight: seedWeight,
            reps: seedReps,
            completed: false,
          });
        }
      }

      const session = await sessionQueries.startSession({
        routineId: id,
        routineName: routine.name,
      });
      if (cancelled) return;
      useWorkoutDraft.getState().init({
        sessionId: session.id,
        routineId: id,
        routineName: routine.name,
        sets,
      });
      router.replace(`/workout/${session.id}`);
    })();
    return () => {
      cancelled = true;
    };
  }, [routineId, router]);

  return (
    <View style={{ flex: 1, backgroundColor: p.bg, justifyContent: 'center' }}>
      <ActivityIndicator color={p.accent.primary} />
    </View>
  );
}
