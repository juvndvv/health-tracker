const DAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'] as const;
const MONTHS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
] as const;

export function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseYmd(s: string): Date {
  const parts = s.split('-').map(Number) as [number, number, number];
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
}

export function fmtDayShort(d: Date): string {
  return `${DAYS[d.getDay()]!} ${d.getDate()} ${MONTHS[d.getMonth()]!}`;
}

export function fmtRelative(d: Date, now: Date = new Date()): string {
  const t0 = new Date(now);
  t0.setHours(0, 0, 0, 0);
  const d0 = new Date(d);
  d0.setHours(0, 0, 0, 0);
  const days = Math.round((t0.getTime() - d0.getTime()) / 86400000);
  if (days <= 0) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 7) return `hace ${days} días`;
  if (days < 14) return 'hace 1 semana';
  if (days < 30) return `hace ${Math.floor(days / 7)} semanas`;
  if (days < 60) return 'hace 1 mes';
  return `hace ${Math.floor(days / 30)} meses`;
}
