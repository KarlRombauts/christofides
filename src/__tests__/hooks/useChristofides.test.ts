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
});
