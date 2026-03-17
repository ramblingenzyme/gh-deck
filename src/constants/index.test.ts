import { describe, it, expect } from 'vitest';
import { mkId } from './index';

describe('mkId', () => {
  it('returns an integer', () => {
    const id = mkId();
    expect(Number.isInteger(id)).toBe(true);
  });

  it('is monotonically increasing', () => {
    const a = mkId();
    const b = mkId();
    const c = mkId();
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });

  it('produces no duplicates across many calls', () => {
    const ids = Array.from({ length: 50 }, () => mkId());
    const unique = new Set(ids);
    expect(unique.size).toBe(50);
  });
});
