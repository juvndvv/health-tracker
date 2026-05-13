import { describe, it, expect } from 'vitest';
import { ymd, parseYmd, fmtDayShort, fmtRelative } from '@/lib/date';

describe('ymd / parseYmd', () => {
  it('roundtrips a date', () => {
    const d = new Date(2026, 4, 13);
    expect(ymd(d)).toBe('2026-05-13');
    expect(parseYmd('2026-05-13').getTime()).toBe(d.getTime());
  });
});

describe('fmtDayShort', () => {
  it('formats Spanish short day', () => {
    expect(fmtDayShort(new Date(2026, 4, 13))).toBe('mié 13 may');
  });
});

describe('fmtRelative', () => {
  const today = new Date(2026, 4, 13);
  it('returns hoy for today', () => {
    expect(fmtRelative(today, today)).toBe('hoy');
  });
  it('returns ayer for yesterday', () => {
    const y = new Date(2026, 4, 12);
    expect(fmtRelative(y, today)).toBe('ayer');
  });
  it('returns "hace N días" for 2-6 days', () => {
    expect(fmtRelative(new Date(2026, 4, 10), today)).toBe('hace 3 días');
  });
  it('returns "hace 1 semana" for 7-13 days', () => {
    expect(fmtRelative(new Date(2026, 4, 5), today)).toBe('hace 1 semana');
  });
  it('returns "hace N semanas" for 14-29 days', () => {
    expect(fmtRelative(new Date(2026, 3, 29), today)).toBe('hace 2 semanas');
  });
  it('returns "hace 1 mes" for 30-59 days', () => {
    expect(fmtRelative(new Date(2026, 3, 1), today)).toBe('hace 1 mes');
  });
});
