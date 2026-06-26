import { describe, expect, it } from 'vitest';
import { buildGraph, coordsOf, PositionedVertex } from '../../model/graphModel';
import { tourLength } from '../../model/metrics';
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

  // Change 1: improved shortcut must never be worse than naive
  describe('christofidesTour (step 6) improved <= naive invariant', () => {
    function naiveTourLength(g: ReturnType<typeof buildGraph>): number {
      // Re-implement naive tour for comparison: uniq(circuit) + close
      // We can't call the internal function, so we compute via step 6 with useImproved=false
      const naiveResult = STEPS[6].compute(g, {}, false);
      return tourLength(naiveResult.edges);
    }

    function improvedTourLength(g: ReturnType<typeof buildGraph>): number {
      const improvedResult = STEPS[6].compute(g, {}, true);
      return tourLength(improvedResult.edges);
    }

    it('improved tour is never longer than naive tour for deterministic 5-vertex instance', () => {
      const improvedLen = improvedTourLength(graph);
      const naiveLen = naiveTourLength(graph);
      expect(improvedLen).toBeLessThanOrEqual(naiveLen);
    });

    it('improved tour is never longer than naive across 50 random 8-12 node instances', () => {
      const seed = 42;
      // Simple pseudo-random number generator for reproducibility
      let s = seed;
      function rand(): number {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
      }

      for (let trial = 0; trial < 50; trial++) {
        const n = 8 + Math.floor(rand() * 5); // 8..12
        const trialVerts: PositionedVertex[] = Array.from({ length: n }, (_, i) => ({
          id: i,
          x: rand() * 500,
          y: rand() * 500,
        }));
        const g = buildGraph(trialVerts);
        const improvedLen = improvedTourLength(g);
        const naiveLen = naiveTourLength(g);
        expect(improvedLen).toBeLessThanOrEqual(naiveLen);
      }
    });
  });
});
