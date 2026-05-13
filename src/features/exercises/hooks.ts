import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseQueries } from './index';
import type { MuscleGroup } from '@/db/schema';

export const exercisesKey = ['exercises'] as const;

export function useExercises() {
  return useQuery({ queryKey: exercisesKey, queryFn: () => exerciseQueries.listActive() });
}

export function useAllExercises() {
  return useQuery({ queryKey: [...exercisesKey, 'all'], queryFn: () => exerciseQueries.listAll() });
}

export function useCreateExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { name: string; muscleGroup: MuscleGroup }) => exerciseQueries.createExercise(vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: exercisesKey }),
  });
}

export function useArchiveExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => exerciseQueries.archiveExercise(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: exercisesKey }),
  });
}

export function useRestoreExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => exerciseQueries.restoreExercise(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: exercisesKey }),
  });
}
