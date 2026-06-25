import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGraphInteraction } from '../../hooks/useGraphInteraction';

const initial = [{ id: 0, x: 0, y: 0 }, { id: 1, x: 10, y: 10 }];

describe('useGraphInteraction', () => {
  it('adds a vertex with a fresh id', () => {
    const { result } = renderHook(() => useGraphInteraction(initial));
    act(() => result.current.addVertex(5, 5));
    expect(result.current.verts).toHaveLength(3);
    expect(result.current.verts[2].id).toBe(2);
  });

  it('moves a vertex', () => {
    const { result } = renderHook(() => useGraphInteraction(initial));
    act(() => result.current.moveVertex(0, 99, 99));
    expect(result.current.verts.find((v) => v.id === 0)).toMatchObject({ x: 99, y: 99 });
  });

  it('deletes a vertex', () => {
    const { result } = renderHook(() => useGraphInteraction(initial));
    act(() => result.current.deleteVertex(1));
    expect(result.current.verts.map((v) => v.id)).toEqual([0]);
  });
});
