import { describe, it, expect } from 'vitest';
import { mixRgb } from '@/lib/color';

describe('mixRgb', () => {
  it('returns first color at 100% mix', () => {
    expect(mixRgb('#FF0000', '#000000', 100)).toBe('#ff0000');
  });
  it('returns second color at 0% mix', () => {
    expect(mixRgb('#FF0000', '#000000', 0)).toBe('#000000');
  });
  it('mixes 50/50 red+black to dark red', () => {
    expect(mixRgb('#FF0000', '#000000', 50)).toBe('#800000');
  });
  it('handles white + black at 50% → grey', () => {
    expect(mixRgb('#FFFFFF', '#000000', 50)).toBe('#808080');
  });
});
