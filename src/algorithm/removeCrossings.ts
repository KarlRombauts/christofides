import { Vertex } from './graph';

export type Point = { x: number; y: number };

function orientation(p: Point, q: Point, r: Point): number {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (Math.abs(val) < 1e-12) return 0;
  return val > 0 ? 1 : 2;
}

// Proper intersection only: segments that merely share an endpoint do NOT cross.
export function segmentsCross(a: Point, b: Point, c: Point, d: Point): boolean {
  const o1 = orientation(a, b, c);
  const o2 = orientation(a, b, d);
  const o3 = orientation(c, d, a);
  const o4 = orientation(c, d, b);
  if (o1 === 0 || o2 === 0 || o3 === 0 || o4 === 0) return false;
  return o1 !== o2 && o3 !== o4;
}

function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Iterative 2-opt that only swaps when edges (i,i+1) and (j,j+1) properly cross.
// On a Euclidean plane, uncrossing a proper crossing strictly shortens the tour.
export function removeCrossings(
  tour: Vertex[],
  coords: Record<Vertex, Point>,
): Vertex[] {
  const n = tour.length - 1; // tour is closed: tour[0] === tour[n]
  if (n < 4) return [...tour];
  const result = tour.slice(0, -1);

  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 2; j < n; j++) {
        if (i === 0 && j === n - 1) continue; // adjacent across the closing edge
        const a = coords[result[i]];
        const b = coords[result[i + 1]];
        const c = coords[result[j]];
        const d = coords[result[(j + 1) % n]];
        if (segmentsCross(a, b, c, d)) {
          // reverse the segment between i+1 and j inclusive (standard 2-opt move)
          let lo = i + 1;
          let hi = j;
          while (lo < hi) {
            [result[lo], result[hi]] = [result[hi], result[lo]];
            lo++;
            hi--;
          }
          improved = true;
        }
      }
    }
  }

  result.push(result[0]);
  return result;
}
