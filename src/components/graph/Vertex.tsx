import { motion, AnimatePresence } from 'framer-motion';
import { PointerEvent } from 'react';
import { T } from '../../theme';

interface VertexProps {
  id: number;
  x: number;
  y: number;
  /** Vertex is in the current highlight set */
  active?: boolean;
  /** Step 2: odd-degree vertex — shows a pulsing ring */
  pulse?: boolean;
  onPointerDown?: (id: number, e: PointerEvent<SVGCircleElement>) => void;
  onPointerEnter?: (id: number, e: PointerEvent<SVGCircleElement>) => void;
}

// Nodes are the BRIGHTEST / most prominent layer.
// Inactive: dark warm fill (#3D3530), white label centered inside.
// Active: terracotta fill (#C0392B), white label.
// Pulse: soft expanding ring (odd-degree vertices, step 2).

const RADIUS = 13;          // large enough for 2-digit labels

const colorTransition = { type: 'tween', duration: 0.2, ease: 'easeInOut' } as const;

const pulseVariants = {
  initial: { r: RADIUS + 2, opacity: 0.5 },
  animate: {
    r: RADIUS + 20,
    opacity: 0,
    transition: {
      duration: 1.5,
      ease: 'easeOut',
      repeat: Infinity,
      repeatDelay: 0.4,
    },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
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
  const fill = active ? T.nodeActive : T.nodeDefault;
  const strokeColor = active ? T.accent : T.nodeStroke;
  const labelFill = '#FFFFFF';  // always white — contrast against both dark and terracotta

  return (
    <g style={{ cursor: onPointerDown ? 'grab' : 'default' }}>
      {/* Pulse ring for odd-degree vertices */}
      <AnimatePresence>
        {pulse && (
          <motion.circle
            key={`pulse-${id}`}
            cx={x}
            cy={y}
            fill="none"
            stroke={T.accent}
            strokeWidth={1.5}
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          />
        )}
      </AnimatePresence>

      {/* Main circle — dark/terracotta, no glow */}
      <motion.circle
        cx={x}
        cy={y}
        r={RADIUS}
        initial={false}
        animate={{
          fill,
          stroke: strokeColor,
          strokeWidth: active ? 2.5 : 1.5,
        }}
        transition={colorTransition}
        onPointerDown={onPointerDown ? (e) => onPointerDown(id, e as PointerEvent<SVGCircleElement>) : undefined}
        onPointerEnter={onPointerEnter ? (e) => onPointerEnter(id, e as PointerEvent<SVGCircleElement>) : undefined}
      />

      {/* Label centered INSIDE the node */}
      <motion.text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        initial={false}
        animate={{ fill: labelFill }}
        transition={colorTransition}
        style={{
          fontSize: '11px',
          fontFamily: T.mono,
          fontWeight: 600,
          letterSpacing: '0.02em',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {id}
      </motion.text>
    </g>
  );
}
