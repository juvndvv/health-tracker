import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bodyWeightQueries } from './index';

export const bodyWeightKey = ['body-weight'] as const;

export function useWeights() {
  return useQuery({ queryKey: bodyWeightKey, queryFn: () => bodyWeightQueries.listAll() });
}

export function useWeightsSince(daysAgo: number) {
  return useQuery({
    queryKey: [...bodyWeightKey, 'since', daysAgo] as const,
    queryFn: () => bodyWeightQueries.listSince(daysAgo),
  });
}

export function useLastWeight() {
  return useQuery({
    queryKey: [...bodyWeightKey, 'last'] as const,
    queryFn: () => bodyWeightQueries.lastWeight(),
  });
}

export function useUpsertWeight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { recordedOn: string; weightKg: number }) =>
      bodyWeightQueries.upsertWeight(vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: bodyWeightKey }),
  });
}

export function useDeleteWeight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => bodyWeightQueries.deleteWeight(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: bodyWeightKey }),
  });
}
