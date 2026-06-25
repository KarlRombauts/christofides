import { describe, expect, it } from 'vitest';
import { buildGraph, coordsOf, PositionedVertex } from '../../model/graphModel';

const verts: PositionedVertex[] = [
  { id: 0, x: 0, y: 0 },
  { id: 1, x: 60, y: 0 },
  { id: 2, x: 0, y: 80 },
];

describe('buildGraph', () => {
  it('fully connects vertices (n*(n-1)/2 edges)', () => {
    expect(buildGraph(verts).edges).toHaveLength(3);
  });

  it('weights edges by rounded distance / 20', () => {
    const graph = buildGraph(verts);
    const e01 = graph.edges.find((e) => e.v === 0 && e.u === 1)!;
    expect(e01.weight).toBe(Math.round(60 / 20)); // 3
  });
});

describe('coordsOf', () => {
  it('maps vertex id to point', () => {
    expect(coordsOf(verts)[1]).toEqual({ x: 60, y: 0 });
  });
});
