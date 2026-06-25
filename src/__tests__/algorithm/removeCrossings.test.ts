import { describe, expect, it } from 'vitest';
import {
  Point,
  removeCrossings,
  segmentsCross,
} from '../../algorithm/removeCrossings';

const coords: Record<number, Point> = {
  0: { x: 0, y: 0 },
  1: { x: 10, y: 0 },
  2: { x: 10, y: 10 },
  3: { x: 0, y: 10 },
};

function tourLength(tour: number[], c: Record<number, Point>): number {
  let total = 0;
  for (let i = 0; i < tour.length - 1; i++) {
    const a = c[tour[i]];
    const b = c[tour[i + 1]];
    total += Math.hypot(a.x - b.x, a.y - b.y);
  }
  return total;
}

describe('segmentsCross', () => {
  it('detects a proper crossing', () => {
    expect(
      segmentsCross({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 10, y: 0 }),
    ).toBe(true);
  });

  it('returns false for segments that only share an endpoint', () => {
    expect(
      segmentsCross({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }),
    ).toBe(false);
  });

  it('returns false for non-intersecting segments', () => {
    expect(
      segmentsCross({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 5 }, { x: 1, y: 5 }),
    ).toBe(false);
  });
});

describe('removeCrossings', () => {
  it('uncrosses a self-intersecting tour', () => {
    // 0 -> 2 -> 1 -> 3 -> 0 crosses; optimal square is 0 1 2 3 0
    const crossed = [0, 2, 1, 3, 0];
    const result = removeCrossings(crossed, coords);
    expect(result[0]).toBe(result[result.length - 1]); // still closed
    expect(new Set(result.slice(0, -1))).toEqual(new Set([0, 1, 2, 3]));
    expect(tourLength(result, coords)).toBeLessThan(tourLength(crossed, coords));
  });

  it('leaves an already-optimal tour unchanged in length', () => {
    const optimal = [0, 1, 2, 3, 0];
    const result = removeCrossings(optimal, coords);
    expect(tourLength(result, coords)).toBeCloseTo(tourLength(optimal, coords));
  });

  it('never increases tour length', () => {
    const t = [0, 2, 3, 1, 0];
    const result = removeCrossings(t, coords);
    expect(tourLength(result, coords)).toBeLessThanOrEqual(
      tourLength(t, coords) + 1e-9,
    );
  });
});
