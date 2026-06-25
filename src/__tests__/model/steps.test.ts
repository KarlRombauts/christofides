import { describe, expect, it } from 'vitest';
import { buildGraph, coordsOf, PositionedVertex } from '../../model/graphModel';
import { STEPS } from '../../model/steps';

const verts: PositionedVertex[] = [
  { id: 0, x: 0, y: 0 },
  { id: 1, x: 100, y: 0 },
  { id: 2, x: 100, y: 100 },
  { id: 3, x: 0, y: 100 },
  { id: 4, x: 50, y: 50 },
];
const graph = buildGraph(verts);
const coords = coordsOf(verts);

describe('STEPS', () => {
  it('has 8 steps with ids 0..7', () => {
    expect(STEPS.map((s) => s.id)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it('step 0 returns the full graph edges', () => {
    expect(STEPS[0].compute(graph, coords, true).edges.length).toBe(graph.edges.length);
  });

  it('step 7 returns a closed tour over all vertices', () => {
    const result = STEPS[7].compute(graph, coords, true);
    const used = new Set<number>();
    result.edges.forEach((e) => { used.add(e.v); used.add(e.u); });
    expect(used.size).toBe(verts.length);
  });

  it('every step exposes a non-empty title and explanation', () => {
    STEPS.forEach((s) => {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.explanation.length).toBeGreaterThan(0);
    });
  });
});
