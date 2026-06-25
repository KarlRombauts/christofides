import { AnimatePresence, motion } from 'framer-motion';
import { PointerEvent, useId } from 'react';
import { Edge as AlgoEdge, Vertex } from '../algorithm/graph';
import { PositionedVertex } from '../model/graphModel';
import { Edge } from './Edge';
import { Vertex as VertexComp } from './Vertex';

export interface GraphCanvasProps {
  /** Positioned vertices for all nodes in the graph */
  verts: PositionedVertex[];
  /** All edges — rendered muted in the background */
  baseEdges: AlgoEdge[];
  /** Subset to highlight (electric cyan, on top of base edges) */
  highlightEdges: AlgoEdge[];
  /** Vertex ids that are "active" (highlighted fill) */
  highlightVertices: Vertex[];
  /** Vertex ids that show the pulse animation (odd-degree vertices, step 2) */
  pulseVertices?: Vertex[];
  /** Canvas width in px (also used as SVG viewBox width) */
  width?: number;
  /** Canvas height in px (also used as SVG viewBox height) */
  height?: number;
  onVertexPointerDown?: (id: Vertex, e: PointerEvent<SVGCircleElement>) => void;
  onVertexPointerEnter?: (id: Vertex, e: PointerEvent<SVGCircleElement>) => void;
  onBackgroundPointerDown?: (e: PointerEvent<SVGSVGElement>) => void;
  /** Propagated SVG-level pointer events for drag handling */
  _onSvgPointerMove?: (e: PointerEvent<SVGSVGElement>) => void;
  _onSvgPointerUp?: (e: PointerEvent<SVGSVGElement>) => void;
  _onSvgPointerLeave?: (e: PointerEvent<SVGSVGElement>) => void;
}

// Design: "Graph Paper Noir"
// SVG stage with a near-black background and an ultra-faint grid pattern.
// Base edges are ghost-like; highlight edges glow with an electric signal.
// SVG defs hold the blur filter used by highlight edges for soft glow.

const GRID_SIZE = 32;
const GRID_COLOR = '#0d1e2e';
const BG_COLOR = '#08111a';

function GraphGrid({ width, height }: { width: number; height: number }) {
  const cols = Math.ceil(width / GRID_SIZE);
  const rows = Math.ceil(height / GRID_SIZE);
  return (
    <g stroke={GRID_COLOR} strokeWidth={0.5} opacity={1}>
      {Array.from({ length: cols + 1 }, (_, i) => (
        <line
          key={`col-${i}`}
          x1={i * GRID_SIZE} y1={0}
          x2={i * GRID_SIZE} y2={height}
        />
      ))}
      {Array.from({ length: rows + 1 }, (_, i) => (
        <line
          key={`row-${i}`}
          x1={0} y1={i * GRID_SIZE}
          x2={width} y2={i * GRID_SIZE}
        />
      ))}
    </g>
  );
}

function edgeKey(e: AlgoEdge) {
  return `${Math.min(e.v, e.u)}-${Math.max(e.v, e.u)}`;
}

export function GraphCanvas({
  verts,
  baseEdges,
  highlightEdges,
  highlightVertices,
  pulseVertices = [],
  width = 600,
  height = 500,
  onVertexPointerDown,
  onVertexPointerEnter,
  onBackgroundPointerDown,
  _onSvgPointerMove,
  _onSvgPointerUp,
  _onSvgPointerLeave,
}: GraphCanvasProps) {
  const uid = useId();
  const glowFilterId = `glow-${uid}`.replace(/:/g, '');

  // Build id→position lookup for resolving edge endpoints
  const posMap = new Map<Vertex, { x: number; y: number }>();
  for (const v of verts) posMap.set(v.id, { x: v.x, y: v.y });

  const activeSet = new Set<Vertex>(highlightVertices);
  const pulseSet = new Set<Vertex>(pulseVertices);

  // Determine which base edges are not also in highlight (avoid double-drawing)
  const highlightKeys = new Set(highlightEdges.map(edgeKey));
  const pureBaseEdges = baseEdges.filter((e) => !highlightKeys.has(edgeKey(e)));

  function edgeCoords(e: AlgoEdge) {
    const a = posMap.get(e.v);
    const b = posMap.get(e.u);
    if (!a || !b) return null;
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{
        display: 'block',
        background: BG_COLOR,
        borderRadius: '4px',
        // Thin border to frame the instrument panel
        outline: '1px solid #0d2030',
      }}
      onPointerDown={onBackgroundPointerDown}
      onPointerMove={_onSvgPointerMove}
      onPointerUp={_onSvgPointerUp}
      onPointerLeave={_onSvgPointerLeave}
    >
      <defs>
        {/* Blur filter for highlight edge glow */}
        <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
        </filter>
      </defs>

      {/* Faint grid background */}
      <GraphGrid width={width} height={height} />

      {/* Base (muted) edges — ghost layer */}
      <g role="group" aria-label="base edges">
        {pureBaseEdges.map((e) => {
          const coords = edgeCoords(e);
          if (!coords) return null;
          return (
            <Edge
              key={edgeKey(e)}
              {...coords}
              highlight={false}
            />
          );
        })}
      </g>

      {/* Highlight edges — electric cyan signal layer, rendered on top.
          AnimatePresence is inside the <g> so the keyed motion.g elements
          are its DIRECT children — required for exit animations to fire. */}
      <g role="group" aria-label="highlight edges">
        <AnimatePresence>
          {highlightEdges.map((e) => {
            const coords = edgeCoords(e);
            if (!coords) return null;
            return (
              <motion.g
                key={`hl-${edgeKey(e)}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Edge
                  {...coords}
                  highlight={true}
                  filterId={glowFilterId}
                />
              </motion.g>
            );
          })}
        </AnimatePresence>
      </g>

      {/* Vertices — rendered last so they sit on top of all edges */}
      <g role="group" aria-label="vertices">
        {verts.map((v) => (
          <VertexComp
            key={v.id}
            id={v.id}
            x={v.x}
            y={v.y}
            active={activeSet.has(v.id)}
            pulse={pulseSet.has(v.id)}
            onPointerDown={onVertexPointerDown}
            onPointerEnter={onVertexPointerEnter}
          />
        ))}
      </g>
    </svg>
  );
}
