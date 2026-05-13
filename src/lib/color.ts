function parseHex(hex: string): { r: number; g: number; b: number } {
  const m = hex.replace('#', '');
  return {
    r: parseInt(m.slice(0, 2), 16),
    g: parseInt(m.slice(2, 4), 16),
    b: parseInt(m.slice(4, 6), 16),
  };
}

function toHex(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
}

/**
 * Linear-RGB approximation of CSS `color-mix(in oklab, A pctA%, B (100-pctA)%)`.
 * Good enough for the heatmap intensities; not a perceptually-uniform mix.
 */
export function mixRgb(a: string, b: string, pctA: number): string {
  const A = parseHex(a);
  const B = parseHex(b);
  const w = pctA / 100;
  const r = A.r * w + B.r * (1 - w);
  const g = A.g * w + B.g * (1 - w);
  const bl = A.b * w + B.b * (1 - w);
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
}
