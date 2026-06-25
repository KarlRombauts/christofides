import { motion } from 'framer-motion';

interface EdgeProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  highlight?: boolean;
  /** Unique key string for AnimatePresence (passed externally, not used here) */
  filterId?: string;
}

// Design: "Graph Paper Noir"
// Muted edges are dark slate whispers; highlight edges are electric cyan with layered glow.
// Two motion.line layers for highlight: a diffuse glow beneath + a crisp signal line on top.

const MUTED_COLOR = '#1e3048';
const MUTED_OPACITY = 0.55;
const MUTED_WIDTH = 1;

const GLOW_COLOR = '#00e5ff';
const GLOW_OPACITY = 0.18;
const GLOW_WIDTH = 6;

const SIGNAL_COLOR = '#00e5ff';
const SIGNAL_OPACITY = 1;
const SIGNAL_WIDTH = 1.5;

const transition = { type: 'tween', duration: 0.35, ease: 'easeInOut' } as const;

export function Edge({ x1, y1, x2, y2, highlight = false, filterId }: EdgeProps) {
  if (highlight) {
    return (
      <g>
        {/* Diffuse glow layer */}
        <motion.line
          x1={x1} y1={y1} x2={x2} y2={y2}
          initial={false}
          animate={{
            stroke: GLOW_COLOR,
            strokeOpacity: GLOW_OPACITY,
            strokeWidth: GLOW_WIDTH,
          }}
          transition={transition}
          strokeLinecap="round"
          filter={filterId ? `url(#${filterId})` : undefined}
        />
        {/* Crisp signal line */}
        <motion.line
          x1={x1} y1={y1} x2={x2} y2={y2}
          initial={false}
          animate={{
            stroke: SIGNAL_COLOR,
            strokeOpacity: SIGNAL_OPACITY,
            strokeWidth: SIGNAL_WIDTH,
          }}
          transition={transition}
          strokeLinecap="round"
        />
      </g>
    );
  }

  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      initial={false}
      animate={{
        stroke: MUTED_COLOR,
        strokeOpacity: MUTED_OPACITY,
        strokeWidth: MUTED_WIDTH,
      }}
      transition={transition}
      strokeLinecap="round"
    />
  );
}
