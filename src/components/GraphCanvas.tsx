import { AnimatePresence, motion } from 'framer-motion';
import { PointerEvent, useMemo, useState } from 'react';
import { Edge as AlgoEdge, Vertex } from '../algorithm/graph';
import { PositionedVertex } from '../model/graphModel';
import { Edge, EdgeHoverInfo, EdgeWeightTooltip } from './Edge';
import { Vertex as VertexComp } from './Vertex';
import { T } from '../theme';

export interface GraphCanvasProps {
  /** Positioned vertices for all nodes in the graph */
  verts: PositionedVertex[];
  /** All edges — rendered muted in the background */
  baseEdges: AlgoEdge[];
  /** Subset to highlight (accent color, on top of base edges) */
  highlightEdges: AlgoEdge[];
  /** Optional exact-optimal tour to overlay for comparison (dashed, teal) */
  compareEdges?: AlgoEdge[];
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
  compareEdges = [],
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

  // Hovered edge's weight tooltip — rendered on a top-most layer so no edge
  // or node ever paints over it.
  const [hoverTip, setHoverTip] = useState<EdgeHoverInfo | null>(null);

  // Optimal-tour overlay coordinates (resolved once per change).
  const compareEdgeData = useMemo(() => {
    return compareEdges.flatMap((e) => {
      const a = posMap.get(e.v);
      const b = posMap.get(e.u);
      if (!a || !b) return [];
      return [{ key: `opt-${edgeKey(e)}`, x1: a.x, y1: a.y, x2: b.x, y2: b.y }];
    });
  }, [compareEdges, posMap]);
  const showCompare = compareEdgeData.length > 0;

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
            onHover={setHoverTip}
          />
        ))}
      </g>

      {/* Highlight edges — terracotta accent, rendered on top.
          Always wrapped in AnimatePresence so the structure never changes
          between drag and rest (a structural swap on drag-release would remount
          everything and fade it back in). Instead the transition is made
          instant WHILE dragging — so edges snap live with the node and don't
          fade on release — and returns to a 0.25s cross-fade for step changes. */}
      <g role="group" aria-label="highlight edges">
        <AnimatePresence>
          {highlightEdgeData.map(({ key, x1, y1, x2, y2, weight }) => (
            <motion.g
              key={key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: dragging ? 0 : 0.25 }}
            >
              <Edge
                x1={x1} y1={y1} x2={x2} y2={y2}
                highlight={true}
                weight={weight}
                dragging={dragging}
                onHover={setHoverTip}
              />
            </motion.g>
          ))}
        </AnimatePresence>
      </g>

      {/* Optimal-tour overlay — dashed teal, above the Christofides tour so the
          two can be compared, but below the nodes. */}
      {showCompare && (
        <g role="group" aria-label="optimal tour">
          {compareEdgeData.map(({ key, x1, y1, x2, y2 }) => (
            <line
              key={key}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={T.optimal}
              strokeWidth={2.5}
              strokeDasharray="6 5"
              strokeLinecap="round"
              style={{ pointerEvents: 'none' }}
            />
          ))}
        </g>
      )}

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

      {/* Legend (only when overlaying the optimal tour) — bottom-left */}
      {showCompare && (
        <g transform={`translate(14, ${height - 40})`} style={{ pointerEvents: 'none' }}>
          <line x1={0} y1={4} x2={22} y2={4} stroke={T.edgeHighlight} strokeWidth={2.5} strokeLinecap="round" />
          <text x={28} y={8} style={{ fontSize: '11px', fontFamily: T.sans, fill: T.textMuted }}>
            Christofides
          </text>
          <line x1={0} y1={22} x2={22} y2={22} stroke={T.optimal} strokeWidth={2.5} strokeDasharray="6 5" strokeLinecap="round" />
          <text x={28} y={26} style={{ fontSize: '11px', fontFamily: T.sans, fill: T.textMuted }}>
            Optimal
          </text>
        </g>
      )}

      {/* Hovered edge weight — drawn last so it sits above every edge and node */}
      {!dragging && hoverTip && <EdgeWeightTooltip {...hoverTip} />}
    </svg>
  );
}
