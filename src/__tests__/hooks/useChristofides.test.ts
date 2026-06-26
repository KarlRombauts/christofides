import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useChristofides } from '../../hooks/useChristofides';
import { circularLayout } from '../../lib/layout';

const verts = circularLayout(6, 500, 500);

describe('useChristofides', () => {
  it('reports mstWeight at every step', () => {
    const { result } = renderHook(() => useChristofides(verts, 1, true));
    expect(result.current.metrics.mstWeight).toBeGreaterThan(0);
    expect(result.current.metrics.tourLength).toBeNull();
  });

  it('reports a tour length and ratio at step 7', () => {
    const { result } = renderHook(() => useChristofides(verts, 7, true));
    expect(result.current.metrics.tourLength).toBeGreaterThan(0);
    expect(result.current.metrics.ratio).toBeGreaterThan(0);
  });

  // Change 3: currentWeight per-step metric
  it('currentWeight equals mstWeight on step 1 (MST step)', () => {
    const { result } = renderHook(() => useChristofides(verts, 1, true));
    expect(result.current.metrics.currentWeight).toBe(result.current.metrics.mstWeight);
  });

  it('currentWeight equals tourLength on step 7 (final tour step)', () => {
    const { result } = renderHook(() => useChristofides(verts, 7, true));
    expect(result.current.metrics.currentWeight).toBe(result.current.metrics.tourLength);
  });

  it('currentWeight is 0 for step 2 (odd-vertices, no edges in result)', () => {
    const { result } = renderHook(() => useChristofides(verts, 2, true));
    expect(result.current.metrics.currentWeight).toBe(0);
  });
});
