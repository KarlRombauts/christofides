// src/lib/layout.ts
import { PositionedVertex } from '../model/graphModel';

// Node circle radius (matches the Vertex render radius). Random placement keeps
// at least one radius of empty space between node edges, so nodes never overlap.
const NODE_RADIUS = 13;
const MIN_SEPARATION = NODE_RADIUS * 3; // 2r (touching) + 1r gap

export function circularLayout(n: number, width: number, height: number): PositionedVertex[] {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * 0.38;
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { id: i, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
}

export function randomLayout(n: number, width: number, height: number): PositionedVertex[] {
  const pad = 40;
  const rx = () => pad + Math.random() * (width - 2 * pad);
  const ry = () => pad + Math.random() * (height - 2 * pad);

  const verts: PositionedVertex[] = [];
  for (let i = 0; i < n; i++) {
    let x = rx();
    let y = ry();
    // Rejection sampling: keep MIN_SEPARATION from every placed node so none
    // overlap. Fall back to the last sample if the canvas is too dense.
    for (let attempt = 0; attempt < 200; attempt++) {
      const ok = verts.every(
        (v) => Math.hypot(v.x - x, v.y - y) >= MIN_SEPARATION,
      );
      if (ok) break;
      x = rx();
      y = ry();
    }
    verts.push({ id: i, x, y });
  }
  return verts;
}
