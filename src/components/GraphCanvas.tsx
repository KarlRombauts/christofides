import { AnimatePresence, motion } from 'framer-motion';
import { PointerEvent, useMemo } from 'react';
import { Edge as AlgoEdge, Vertex } from '../algorithm/graph';
import { PositionedVertex } from '../model/graphModel';
import { Edge } from './Edge';
import { Vertex as VertexComp } from './Vertex';
import { T } from '../theme';

export interface GraphCanvasProps {
  /** Positioned vertices for all nodes in the graph */
  verts: PositionedVertex[];
  /** All edges — rendered muted in the background */
  baseEdges: AlgoEdge[];
  /** Subset to highlight (accent color, on top of base edges) */
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
  /** When true, edges snap (no Framer Motion animation) for drag performance */
  dragging?: boolean;
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
  dragging = false,
  onVertexPointerDown,
  onVertexPointerEnter,
  onBackgroundPointerDown,
  _onSvgPointerMove,
  _onSvgPointerUp,
  _onSvgPointerLeave,
}: GraphCanvasProps) {

  // Memoize position map and edge derivations for performance
  const posMap = useMemo(() => {
    const m = new Map<Vertex, { x: number; y: number }>();
    for (const v of verts) m.set(v.id, { x: v.x, y: v.y });
    return m;
  }, [verts]);

  // Memoize weight lookup from base edges (distance between two vertices)
  const weightMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of baseEdges) {
      m.set(edgeKey(e), e.weight);
    }
    return m;
  }, [baseEdges]);

  const activeSet = useMemo(() => new Set<Vertex>(highlightVertices), [highlightVertices]);
  const pulseSet = useMemo(() => new Set<Vertex>(pulseVertices), [pulseVertices]);

  const highlightKeys = useMemo(
    () => new Set(highlightEdges.map(edgeKey)),
    [highlightEdges],
  );

  // Base edges that are NOT also highlighted (avoid double-drawing)
  const pureBaseEdges = useMemo(
    () => baseEdges.filter((e) => !highlightKeys.has(edgeKey(e))),
    [baseEdges, highlightKeys],
  );

  // Are there any highlighted edges active in this scene?
  const hasHighlights = highlightEdges.length > 0;

  // Precompute all data needed to render base edges — coords + weight resolved once per edge.
  // Deps: pureBaseEdges (changes when baseEdges/highlightKeys change), posMap (changes on drag),
  // weightMap (changes when baseEdges change), hasHighlights (controls dimmed flag).
  const baseEdgeData = useMemo(() => {
    return pureBaseEdges.flatMap((e) => {
      const a = posMap.get(e.v);
      const b = posMap.get(e.u);
      if (!a || !b) return [];
      const key = edgeKey(e);
      return [{ key, x1: a.x, y1: a.y, x2: b.x, y2: b.y, weight: weightMap.get(key) }];
    });
  }, [pureBaseEdges, posMap, weightMap]);

  // Precompute all data needed to render highlight edges.
  // Deps: highlightEdges (changes on step toggle), posMap (changes on drag), weightMap.
  const highlightEdgeData = useMemo(() => {
    return highlightEdges.flatMap((e) => {
      const a = posMap.get(e.v);
      const b = posMap.get(e.u);
      if (!a || !b) return [];
      const key = edgeKey(e);
      return [{ key: `hl-${key}`, x1: a.x, y1: a.y, x2: b.x, y2: b.y, weight: weightMap.get(key) }];
    });
  }, [highlightEdges, posMap, weightMap]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{
        display: 'block',
        background: T.bg,
        borderRadius: '6px',
        border: `1px solid ${T.panelBorder}`,
      }}
      onPointerDown={onBackgroundPointerDown}
      onPointerMove={_onSvgPointerMove}
      onPointerUp={_onSvgPointerUp}
      onPointerLeave={_onSvgPointerLeave}
    >
      {/* No SVG defs needed — no glow filters */}

      {/* Base edges — plain static lines for performance.
          They recede visually: light warm gray, low contrast.
          When highlights are active, they fade even further (dimmed=true). */}
      <g role="group" aria-label="base edges">
        {baseEdgeData.map(({ key, x1, y1, x2, y2, weight }) => (
          <Edge
            key={key}
            x1={x1} y1={y1} x2={x2} y2={y2}
            highlight={false}
            weight={weight}
            dimmed={hasHighlights}
            dragging={dragging}
          />
        ))}
      </g>

      {/* Highlight edges — terracotta accent, rendered on top.
          Only these animate; AnimatePresence handles enter/exit. */}
      <g role="group" aria-label="highlight edges">
        <AnimatePresence>
          {highlightEdgeData.map(({ key, x1, y1, x2, y2, weight }) => (
            <motion.g
              key={key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Edge
                x1={x1} y1={y1} x2={x2} y2={y2}
                highlight={true}
                weight={weight}
                dragging={dragging}
              />
            </motion.g>
          ))}
        </AnimatePresence>
      </g>

      {/* Vertices — rendered last, sit on top of all edges.
          Nodes are the brightest / most prominent layer. */}
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
