import { motion, AnimatePresence } from 'framer-motion';
import { PointerEvent } from 'react';

interface VertexProps {
  id: number;
  x: number;
  y: number;
  /** Vertex is in the current highlight set */
  active?: boolean;
  /** Step 2: minimum-weight matching — vertex is odd-degree, pulsing */
  pulse?: boolean;
  onPointerDown?: (id: number, e: PointerEvent<SVGCircleElement>) => void;
  onPointerEnter?: (id: number, e: PointerEvent<SVGCircleElement>) => void;
}

// Design: "Graph Paper Noir"
// Inactive: dark fill, thin slate ring, monospace label in muted teal.
// Active: electric cyan fill with bright white label; inner dot appears.
// Pulse: expanding translucent ring that radiates outward and fades — signals odd-degree vertices.

const INACTIVE_FILL = '#0f1c2b';
const INACTIVE_STROKE = '#2a4460';
const INACTIVE_LABEL = '#4a7fa5';

const ACTIVE_FILL = '#00e5ff';
const ACTIVE_STROKE = '#00e5ff';
const ACTIVE_LABEL = '#001820';

const RADIUS = 11;
const ACTIVE_RADIUS = 13;

const transition = { type: 'spring', stiffness: 280, damping: 22 } as const;
const colorTransition = { type: 'tween', duration: 0.3, ease: 'easeInOut' } as const;

const pulseVariants = {
  initial: { r: RADIUS + 2, opacity: 0.7, strokeOpacity: 0.7 },
  animate: {
    r: RADIUS + 18,
    opacity: 0,
    strokeOpacity: 0,
    transition: {
      duration: 1.4,
      ease: 'easeOut',
      repeat: Infinity,
      repeatDelay: 0.3,
    },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export function Vertex({
  id,
  x,
  y,
  active = false,
  pulse = false,
  onPointerDown,
  onPointerEnter,
}: VertexProps) {
  const r = active ? ACTIVE_RADIUS : RADIUS;
  const fill = active ? ACTIVE_FILL : INACTIVE_FILL;
  const stroke = active ? ACTIVE_STROKE : INACTIVE_STROKE;
  const labelColor = active ? ACTIVE_LABEL : INACTIVE_LABEL;

  return (
    <g style={{ cursor: onPointerDown ? 'pointer' : 'default' }}>
      {/* Pulse ring for odd-degree vertices */}
      <AnimatePresence>
        {pulse && (
          <motion.circle
            key={`pulse-${id}`}
            cx={x}
            cy={y}
            fill="none"
            stroke="#00e5ff"
            strokeWidth={1.5}
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          />
        )}
      </AnimatePresence>

      {/* Main circle */}
      <motion.circle
        cx={x}
        cy={y}
        initial={false}
        animate={{ r, fill, stroke, strokeWidth: active ? 2 : 1.5 }}
        transition={{ r: transition, fill: colorTransition, stroke: colorTransition, strokeWidth: colorTransition }}
        onPointerDown={onPointerDown ? (e) => onPointerDown(id, e as PointerEvent<SVGCircleElement>) : undefined}
        onPointerEnter={onPointerEnter ? (e) => onPointerEnter(id, e as PointerEvent<SVGCircleElement>) : undefined}
      />

      {/* Inner dot (appears when active) */}
      <AnimatePresence>
        {active && (
          <motion.circle
            key={`dot-${id}`}
            cx={x}
            cy={y}
            r={3}
            fill="#ffffff"
            initial={{ opacity: 0, r: 0 }}
            animate={{ opacity: 1, r: 3 }}
            exit={{ opacity: 0, r: 0 }}
            transition={colorTransition}
            style={{ pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>

      {/* Vertex label — monospace, precision instrument style */}
      <motion.text
        x={x}
        y={y + (active ? ACTIVE_RADIUS : RADIUS) + 14}
        textAnchor="middle"
        dominantBaseline="auto"
        initial={false}
        animate={{ fill: labelColor }}
        transition={colorTransition}
        style={{
          fontSize: '10px',
          fontFamily: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
          fontWeight: 500,
          letterSpacing: '0.04em',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {id}
      </motion.text>
    </g>
  );
}
