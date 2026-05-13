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
