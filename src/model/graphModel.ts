import { Edge, Graph, Vertex } from '../algorithm/graph';
import { Point } from '../algorithm/removeCrossings';

export type PositionedVertex = { id: Vertex; x: number; y: number };

const SCALE = 20;

function weight(a: PositionedVertex, b: PositionedVertex): number {
  return Math.round(Math.hypot(a.x - b.x, a.y - b.y) / SCALE);
}

export function buildGraph(verts: PositionedVertex[]): Graph {
  const edges: Edge[] = [];
  for (let i = 0; i < verts.length; i++) {
    for (let j = i + 1; j < verts.length; j++) {
      edges.push(new Edge(verts[i].id, verts[j].id, weight(verts[i], verts[j])));
    }
  }
  return new Graph(edges, verts.map((v) => v.id));
}

export function coordsOf(verts: PositionedVertex[]): Record<Vertex, Point> {
  const out: Record<Vertex, Point> = {};
  verts.forEach((v) => {
    out[v.id] = { x: v.x, y: v.y };
  });
  return out;
}
