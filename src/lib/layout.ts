// src/lib/layout.ts
import { PositionedVertex } from '../model/graphModel';

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
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    x: pad + Math.random() * (width - 2 * pad),
    y: pad + Math.random() * (height - 2 * pad),
  }));
}
