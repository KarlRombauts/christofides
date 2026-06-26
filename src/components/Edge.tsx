import { motion } from 'framer-motion';
import { useState } from 'react';
import { T } from '../theme';

// Hit-area width for hover detection (invisible wider transparent stroke)
const HIT_AREA = 12;

/** Info passed up so the parent can render the weight tooltip ABOVE all edges. */
export interface EdgeHoverInfo {
  mx: number;
  my: number;
  weight: number;
  highlight: boolean;
}

interface EdgeProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  highlight?: boolean;
  /** Edge weight to show on hover */
  weight?: number;
  /** When true, the base edge fades further (a highlight is active in the scene) */
  dimmed?: boolean;
  filterId?: string; // kept for API compat, not used
  /** When true, render as plain static <line> — no Framer Motion, no hover — for drag perf */
  dragging?: boolean;
  /** Report hover so the parent can draw the weight label on a top-most layer. */
  onHover?: (info: EdgeHoverInfo | null) => void;
}

const transition = { type: 'tween', duration: 0.25, ease: 'easeInOut' } as const;

export function Edge({
  x1, y1, x2, y2,
  highlight = false,
  weight,
  dimmed = false,
  filterId: _filterId,
  dragging = false,
  onHover,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false);

  // ── Fast path: during drag, skip Framer Motion entirely ──────────────────────
  if (dragging) {
    if (highlight) {
      return (
        <line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={T.edgeHighlight}
          strokeOpacity={1}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      );
    }
    const opacity = dimmed ? 0.3 : 0.55;
    return (
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={T.edgeBase}
        strokeOpacity={opacity}
        strokeWidth={1}
        strokeLinecap="round"
      />
    );
  }

  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  function enter() {
    setHovered(true);
    if (onHover && weight !== undefined) onHover({ mx, my, weight, highlight });
  }
  function leave() {
    setHovered(false);
    onHover?.(null);
  }

  if (highlight) {
    return (
      <g>
        {/* Hit area */}
        <line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="transparent"
          strokeWidth={HIT_AREA}
          strokeLinecap="round"
          style={{ cursor: 'crosshair' }}
          onMouseEnter={enter}
          onMouseLeave={leave}
        />
        {/* Visible highlight edge */}
        <motion.line
          x1={x1} y1={y1} x2={x2} y2={y2}
          initial={false}
          animate={{
            stroke: hovered ? T.accentDim : T.edgeHighlight,
            strokeOpacity: 1,
            strokeWidth: hovered ? 3 : 2.5,
          }}
          transition={transition}
          strokeLinecap="round"
          style={{ pointerEvents: 'none' }}
        />
      </g>
    );
  }

  // Base (non-highlighted) edge.
  const opacity = dimmed ? 0.3 : 0.55;

  return (
    <g>
      {/* Hit area for hover */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="transparent"
        strokeWidth={HIT_AREA}
        strokeLinecap="round"
        style={{ cursor: 'crosshair' }}
        onMouseEnter={enter}
        onMouseLeave={leave}
      />
      {/* Visible base edge */}
      <motion.line
        x1={x1} y1={y1} x2={x2} y2={y2}
        initial={false}
        animate={{
          stroke: hovered ? T.textMuted : T.edgeBase,
          strokeOpacity: hovered ? 0.8 : opacity,
          strokeWidth: hovered ? 1.5 : 1,
        }}
        transition={transition}
        strokeLinecap="round"
        style={{ pointerEvents: 'none' }}
      />
    </g>
  );
}

/** Weight tooltip — rendered by the parent on a top-most layer so no edge covers it. */
export function EdgeWeightTooltip({ mx, my, weight, highlight }: EdgeHoverInfo) {
  const label = String(Math.round(weight));
  const w = Math.max(28, label.length * 8 + 14);
  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect
        x={mx - w / 2}
        y={my - 10}
        width={w}
        height={18}
        rx={3}
        fill={T.panel}
        stroke={T.panelBorder}
        strokeWidth={1}
      />
      <text
        x={mx}
        y={my + 4}
        textAnchor="middle"
        style={{
          fontSize: '10px',
          fontFamily: T.mono,
          fontWeight: 600,
          fill: highlight ? T.accent : T.text,
          userSelect: 'none',
        }}
      >
        {label}
      </text>
    </g>
  );
}
