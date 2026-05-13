import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routineQueries } from './index';

export const routinesKey = ['routines'] as const;
export const routineKey = (id: number) => ['routines', id] as const;

export function useRoutines() {
  return useQuery({ queryKey: routinesKey, queryFn: () => routineQueries.listActive() });
}

export function useAllRoutines() {
  return useQuery({ queryKey: [...routinesKey, 'all'], queryFn: () => routineQueries.listAll() });
}

export function useRoutine(id: number | null) {
  return useQuery({
    queryKey: id != null ? routineKey(id) : ['routines', 'none'],
    queryFn: () => routineQueries.getRoutineWithItems(id!),
    enabled: id != null,
  });
}

export function useCreateRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => routineQueries.createRoutine(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: routinesKey }),
  });
}

export function useAddRoutineItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      routineId: number;
      exerciseId: number;
      position: number;
      targetSets: number;
      targetReps: number;
      targetWeightKg: number | null;
    }) =>
      routineQueries.addItem(
        vars.routineId,
        vars.exerciseId,
        vars.position,
        vars.targetSets,
        vars.targetReps,
        vars.targetWeightKg,
      ),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: routinesKey });
      qc.invalidateQueries({ queryKey: routineKey(vars.routineId) });
    },
  });
}

export function useUpdateRoutineItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      itemId: number;
      routineId: number;
      patch: Partial<{ targetSets: number; targetReps: number; targetWeightKg: number | null }>;
    }) => routineQueries.updateItem(vars.itemId, vars.patch),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: routineKey(vars.routineId) });
      qc.invalidateQueries({ queryKey: routinesKey });
    },
  });
}

export function useRemoveRoutineItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { itemId: number; routineId: number }) =>
      routineQueries.removeItem(vars.itemId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: routineKey(vars.routineId) });
      qc.invalidateQueries({ queryKey: routinesKey });
    },
  });
}

export function useReorderRoutineItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { routineId: number; idsInOrder: number[] }) =>
      routineQueries.reorderItems(vars.routineId, vars.idsInOrder),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: routineKey(vars.routineId) }),
  });
}

export function useArchiveRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => routineQueries.archiveRoutine(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: routinesKey }),
  });
}

export function useRestoreRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => routineQueries.restoreRoutine(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: routinesKey }),
  });
}

export function useDuplicateRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number; newName: string }) =>
      routineQueries.duplicateRoutine(vars.id, vars.newName),
    onSuccess: () => qc.invalidateQueries({ queryKey: routinesKey }),
  });
}
