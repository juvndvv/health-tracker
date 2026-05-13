import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionQueries } from './index';

export const sessionsKey = ['sessions'] as const;
export const sessionKey = (id: number) => ['sessions', id] as const;

export function useSessions() {
  return useQuery({
    queryKey: sessionsKey,
    queryFn: () => sessionQueries.listSessions({}),
  });
}

export function useSessionsWithSets() {
  return useQuery({
    queryKey: [...sessionsKey, 'with-sets'] as const,
    queryFn: () => sessionQueries.listSessionsWithSets({}),
  });
}

export function useSession(id: number | null) {
  return useQuery({
    queryKey: id != null ? sessionKey(id) : ['sessions', 'none'],
    queryFn: () => sessionQueries.getSessionWithSets(id!),
    enabled: id != null,
  });
}

export function useStartSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { routineId: number; routineName: string }) =>
      sessionQueries.startSession(vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionsKey }),
  });
}

export function useAppendSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      sessionId: number;
      exerciseId: number;
      exerciseName: string;
      position: number;
      weightKg: number | null;
      reps: number;
    }) => sessionQueries.appendSet(vars),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: sessionsKey });
      qc.invalidateQueries({ queryKey: sessionKey(vars.sessionId) });
    },
  });
}

export function useFinishSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: number) => sessionQueries.finishSession(sessionId),
    onSuccess: (_, sessionId) => {
      qc.invalidateQueries({ queryKey: sessionsKey });
      qc.invalidateQueries({ queryKey: sessionKey(sessionId) });
    },
  });
}

export function useAbandonSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: number) => sessionQueries.abandonSession(sessionId),
    onSuccess: (_, sessionId) => {
      qc.invalidateQueries({ queryKey: sessionsKey });
      qc.invalidateQueries({ queryKey: sessionKey(sessionId) });
    },
  });
}
