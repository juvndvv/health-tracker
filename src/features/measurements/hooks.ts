import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { measurementQueries } from './index';
import type { MeasurementUnit } from './queries';

export const measurementsKey = ['measurements'] as const;
export const measurementTypesKey = ['measurement-types'] as const;

export function useMeasurementTypes() {
  return useQuery({
    queryKey: measurementTypesKey,
    queryFn: () => measurementQueries.listTypes(),
  });
}

export function useAllMeasurementTypes() {
  return useQuery({
    queryKey: [...measurementTypesKey, 'all'] as const,
    queryFn: () => measurementQueries.listAllTypes(),
  });
}

export function useMeasurements(typeId: number | null, sinceDaysAgo?: number) {
  return useQuery({
    queryKey:
      typeId != null
        ? ([...measurementsKey, typeId, sinceDaysAgo ?? 'all'] as const)
        : ([...measurementsKey, 'none'] as const),
    queryFn: () => measurementQueries.listMeasurements(typeId!, sinceDaysAgo),
    enabled: typeId != null,
  });
}

export function useLastMeasurement(typeId: number | null) {
  return useQuery({
    queryKey:
      typeId != null
        ? ([...measurementsKey, typeId, 'last'] as const)
        : ([...measurementsKey, 'none-last'] as const),
    queryFn: () => measurementQueries.lastFor(typeId!),
    enabled: typeId != null,
  });
}

export function useCreateMeasurementType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { name: string; unit: MeasurementUnit }) =>
      measurementQueries.createType(vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: measurementTypesKey }),
  });
}

export function useArchiveMeasurementType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => measurementQueries.archiveType(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: measurementTypesKey }),
  });
}

export function useUpsertMeasurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { typeId: number; recordedOn: string; value: number }) =>
      measurementQueries.upsertMeasurement(vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: measurementsKey }),
  });
}

export function useDeleteMeasurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => measurementQueries.deleteMeasurement(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: measurementsKey }),
  });
}
