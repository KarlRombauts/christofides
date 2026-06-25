import { Edge, Graph, Vertex } from '../algorithm/graph';
import { kruskalMST } from '../algorithm/kruskal';

export function tourLength(tourEdges: Edge[]): number {
  return tourEdges.reduce((sum, e) => sum + e.weight, 0);
}

export function mstWeight(graph: Graph): number {
  return tourLength(kruskalMST(graph));
}

export function approximationRatio(tourEdges: Edge[], graph: Graph): number {
  const lower = mstWeight(graph);
  return lower === 0 ? 0 : tourLength(tourEdges) / lower;
}

function weightLookup(graph: Graph): Record<Vertex, Record<Vertex, number>> {
  const w: Record<Vertex, Record<Vertex, number>> = {};
  for (const e of graph.edges) {
    (w[e.v] ??= {})[e.u] = e.weight;
    (w[e.u] ??= {})[e.v] = e.weight;
  }
  return w;
}

export function bruteForceOptimal(
  verts: { id: Vertex }[],
  graph: Graph,
): { tour: Vertex[]; length: number } | null {
  const ids = verts.map((v) => v.id);
  if (ids.length > 9) return null;
  if (ids.length < 2) return { tour: [...ids], length: 0 };

  const w = weightLookup(graph);
  const [first, ...rest] = ids;
  let best: { tour: Vertex[]; length: number } | null = null;

  const permute = (prefix: Vertex[], remaining: Vertex[]) => {
    if (remaining.length === 0) {
      const tour = [first, ...prefix, first];
      let len = 0;
      for (let i = 0; i < tour.length - 1; i++) len += w[tour[i]][tour[i + 1]];
      if (!best || len < best.length) best = { tour, length: len };
      return;
    }
    for (let i = 0; i < remaining.length; i++) {
      const next = remaining[i];
      permute([...prefix, next], [...remaining.slice(0, i), ...remaining.slice(i + 1)]);
    }
  };
  permute([], rest);
  return best;
}
