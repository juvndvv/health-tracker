import { describe, it, expect } from 'vitest';
import { suggestedRoutine } from '@/features/progress/derived';

describe('suggestedRoutine', () => {
  it('returns null when there are no active routines', () => {
    expect(suggestedRoutine([], {})).toBeNull();
    expect(suggestedRoutine([{ id: 1, archivedAt: 100 }], {})).toBeNull();
  });
  it('returns the smallest id when nothing has been used', () => {
    const routines = [
      { id: 3, archivedAt: null },
      { id: 1, archivedAt: null },
      { id: 2, archivedAt: null },
    ];
    expect(suggestedRoutine(routines, {})).toBe(1);
  });
  it('returns the least recently used', () => {
    const routines = [
      { id: 1, archivedAt: null },
      { id: 2, archivedAt: null },
    ];
    expect(suggestedRoutine(routines, { 1: 1000, 2: 500 })).toBe(2);
  });
  it('skips archived routines', () => {
    const routines = [
      { id: 1, archivedAt: 5 },
      { id: 2, archivedAt: null },
    ];
    expect(suggestedRoutine(routines, { 2: 1000 })).toBe(2);
  });
  it('breaks ties by ascending id', () => {
    const routines = [
      { id: 3, archivedAt: null },
      { id: 1, archivedAt: null },
    ];
    expect(suggestedRoutine(routines, { 1: 500, 3: 500 })).toBe(1);
  });
});
