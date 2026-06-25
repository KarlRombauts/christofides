import { describe, expect, it } from 'vitest';
import { Edge, Graph } from '../../algorithm/graph';
import {
  approximationRatio,
  bruteForceOptimal,
  mstWeight,
  tourLength,
} from '../../model/metrics';

describe('tourLength', () => {
  it('sums edge weights', () => {
    expect(tourLength([new Edge(0, 1, 3), new Edge(1, 2, 4)])).toBe(7);
  });
});

describe('mstWeight', () => {
  it('totals the MST edges', () => {
    const g = new Graph([new Edge(0, 1, 1), new Edge(1, 2, 2), new Edge(0, 2, 5)]);
    expect(mstWeight(g)).toBe(3); // 1 + 2
  });
});

describe('approximationRatio', () => {
  it('is tourLength / mstWeight', () => {
    const g = new Graph([new Edge(0, 1, 1), new Edge(1, 2, 2), new Edge(0, 2, 5)]);
    expect(approximationRatio([new Edge(0, 1, 3), new Edge(1, 2, 3)], g)).toBeCloseTo(2);
  });
});

describe('bruteForceOptimal', () => {
  it('returns null above 9 vertices', () => {
    const verts = Array.from({ length: 10 }, (_, i) => ({ id: i }));
    expect(bruteForceOptimal(verts, new Graph())).toBeNull();
  });

  it('finds the exact optimum for a small square', () => {
    // unit square: optimal perimeter tour = 4
    const g = new Graph([
      new Edge(0, 1, 1), new Edge(1, 2, 1), new Edge(2, 3, 1),
      new Edge(3, 0, 1), new Edge(0, 2, 2), new Edge(1, 3, 2),
    ]);
    const verts = [0, 1, 2, 3].map((id) => ({ id }));
    expect(bruteForceOptimal(verts, g)!.length).toBe(4);
  });
});
