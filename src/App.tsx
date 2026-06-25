import { PointerEvent, useCallback, useEffect, useRef, useState } from 'react';
import { GraphCanvas } from './components/GraphCanvas';
import { StepPanel } from './components/StepPanel';
import { Controls } from './components/Controls';
import { useGraphInteraction } from './hooks/useGraphInteraction';
import { useChristofides } from './hooks/useChristofides';
import { circularLayout, randomLayout } from './lib/layout';
import { STEPS } from './model/steps';
import { bruteForceOptimal } from './model/metrics';
import { T } from './theme';

// ─── Canvas dimensions (fixed) ───────────────────────────────────────────────
const CANVAS_W = 600;
const CANVAS_H = 500;
const DEFAULT_VERTEX_COUNT = 7;

// ─── Initial layout ───────────────────────────────────────────────────────────
const INITIAL_VERTS = circularLayout(DEFAULT_VERTEX_COUNT, CANVAS_W, CANVAS_H);

// ─── SVG coordinate conversion ────────────────────────────────────────────────
// Converts a pointer event's client coords into SVG viewBox coords.
function svgCoordsOf(
  e: { clientX: number; clientY: number },
  svg: SVGSVGElement,
) {
  const rect = svg.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
    y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
  };
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [stepIndex, setStepIndex] = useState(0);
  const [useImprovedShortcut, setUseImprovedShortcut] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [vertexCount, setVertexCount] = useState(DEFAULT_VERTEX_COUNT);
  const [optimal, setOptimal] = useState<{ length: number } | null>(null);

  // ── Graph interaction ────────────────────────────────────────────────────────
  const { verts, addVertex, moveVertex, deleteVertex, reset } =
    useGraphInteraction(INITIAL_VERTS);

  // ── Algorithm ────────────────────────────────────────────────────────────────
  const { step, result, graph, metrics } = useChristofides(
    verts,
    stepIndex,
    useImprovedShortcut,
  );

  // ── Drag / hover state ───────────────────────────────────────────────────────
  // Which vertex is being dragged (null = none).
  const draggingId = useRef<number | null>(null);
  // Which vertex the pointer is hovering (for Backspace-delete).
  const hoveredId = useRef<number | null>(null);

  // ── Keyboard delete ──────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Backspace' && hoveredId.current !== null) {
        deleteVertex(hoveredId.current);
        hoveredId.current = null;
        setOptimal(null);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deleteVertex]);

  // ── Pointer callbacks ────────────────────────────────────────────────────────
  const onVertexPointerDown = useCallback(
    (id: number, e: PointerEvent<SVGCircleElement>) => {
      // Prevent the SVG background handler from firing
      e.stopPropagation();
      draggingId.current = id;
      // Capture pointer so pointermove fires even if cursor leaves the circle
      (e.currentTarget as SVGCircleElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const onVertexPointerEnter = useCallback(
    (id: number, _e: PointerEvent<SVGCircleElement>) => {
      hoveredId.current = id;
    },
    [],
  );

  // SVG-level pointer events (wired through GraphCanvas _onSvg* props)
  const onSvgPointerMove = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      if (draggingId.current === null) return;
      const coords = svgCoordsOf(e, e.currentTarget as SVGSVGElement);
      moveVertex(draggingId.current, coords.x, coords.y);
    },
    [moveVertex],
  );

  const onSvgPointerUp = useCallback(
    (_e: PointerEvent<SVGSVGElement>) => {
      draggingId.current = null;
    },
    [],
  );

  const onSvgPointerLeave = useCallback(
    (_e: PointerEvent<SVGSVGElement>) => {
      hoveredId.current = null;
    },
    [],
  );

  const onBackgroundPointerDown = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      // Ignore if a drag is in progress (vertex consumed the event via stopPropagation)
      if (draggingId.current !== null) return;
      const coords = svgCoordsOf(e, e.currentTarget as SVGSVGElement);
      addVertex(coords.x, coords.y);
      setOptimal(null);
    },
    [addVertex],
  );

  // ── Play / auto-advance ───────────────────────────────────────────────────────
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPlay = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPlaying(false);
  }, []);

  const onTogglePlay = useCallback(() => {
    if (playing) {
      stopPlay();
      return;
    }
    // If already at last step, wrap to start
    if (stepIndex >= STEPS.length - 1) {
      setStepIndex(0);
    }
    setPlaying(true);
    intervalRef.current = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next >= STEPS.length - 1) {
          // Stop after landing on the last step
          setTimeout(stopPlay, 0);
          return STEPS.length - 1;
        }
        return next;
      });
    }, 1500);
  }, [playing, stepIndex, stopPlay]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, []);

  // ── Navigation ────────────────────────────────────────────────────────────────
  const onPrev = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const onNext = useCallback(() => {
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  }, []);

  const onReset = useCallback(() => {
    setStepIndex(0);
    stopPlay();
  }, [stopPlay]);

  const onRandomize = useCallback(() => {
    reset(randomLayout(vertexCount, CANVAS_W, CANVAS_H));
    setStepIndex(0);
    setOptimal(null);
    stopPlay();
  }, [reset, vertexCount, stopPlay]);

  const onVertexCount = useCallback(
    (n: number) => {
      setVertexCount(n);
      reset(circularLayout(n, CANVAS_W, CANVAS_H));
      setStepIndex(0);
      setOptimal(null);
      stopPlay();
    },
    [reset, stopPlay],
  );

  // ── Compare to optimal ────────────────────────────────────────────────────────
  const canCompareOptimal = verts.length <= 9;

  const onCompareOptimal = useCallback(() => {
    if (!canCompareOptimal) return;
    const res = bruteForceOptimal(verts, graph);
    if (res) setOptimal({ length: res.length });
  }, [verts, graph, canCompareOptimal]);

  // ── Algorithm result → canvas props ──────────────────────────────────────────
  const highlightEdges = result.edges;
  const highlightVertices = result.vertices;
  // On step 2 (odd-degree vertices), also pass them as pulseVertices
  const pulseVertices = stepIndex === 2 ? result.vertices : [];

  // ─── Responsive breakpoint ────────────────────────────────────────────────────
  const [isWide, setIsWide] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 900 : true,
  );
  useEffect(() => {
    function onResize() {
      setIsWide(window.innerWidth >= 900);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight:     '100dvh',
        background:    T.bg,
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        padding:       isWide ? '28px 24px 32px' : '16px 12px 24px',
        boxSizing:     'border-box',
        fontFamily:    T.mono,
      }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <header
        style={{
          width:         '100%',
          maxWidth:      '1020px',
          marginBottom:  isWide ? '20px' : '14px',
          display:       'flex',
          flexWrap:      'wrap',
          alignItems:    'baseline',
          gap:           '14px',
          borderBottom:  `1px solid ${T.panelBorder}`,
          paddingBottom: isWide ? '14px' : '10px',
        }}
      >
        <div
          style={{
            fontFamily:    T.mono,
            fontSize:      isWide ? '11px' : '9px',
            fontWeight:    700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color:         T.cyan,
            textShadow:    `0 0 18px ${T.cyanGlow}`,
          }}
        >
          Christofides
        </div>
        <div
          style={{
            fontFamily:    T.mono,
            fontSize:      isWide ? '10px' : '8px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color:         T.label,
          }}
        >
          1.5-Approximation Algorithm · Interactive Explainer
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            fontFamily:    T.mono,
            fontSize:      '9px',
            letterSpacing: '0.1em',
            color:         T.textFaint,
            whiteSpace:    'nowrap',
          }}
        >
          Click canvas to add · Drag to move · Hover + ⌫ to delete
        </div>
      </header>

      {/* ── Main content: graph + panel side-by-side (wide) or stacked ── */}
      <div
        style={{
          width:         '100%',
          maxWidth:      '1020px',
          display:       'flex',
          flexDirection: isWide ? 'row' : 'column',
          gap:           '16px',
          alignItems:    isWide ? 'flex-start' : 'stretch',
          marginBottom:  '16px',
        }}
      >
        {/* ── Graph canvas ───────────────────────────────────────── */}
        <div style={{ flexShrink: 0, position: 'relative' }}>
          {/* Subtle CRT scanline overlay */}
          <div
            style={{
              position:        'absolute',
              inset:           0,
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.055) 2px, rgba(0,0,0,0.055) 4px)',
              pointerEvents:   'none',
              zIndex:          2,
              borderRadius:    '4px',
            }}
          />
          <GraphCanvas
            verts={verts}
            baseEdges={graph.edges}
            highlightEdges={highlightEdges}
            highlightVertices={highlightVertices}
            pulseVertices={pulseVertices}
            width={CANVAS_W}
            height={CANVAS_H}
            onVertexPointerDown={onVertexPointerDown}
            onVertexPointerEnter={onVertexPointerEnter}
            onBackgroundPointerDown={onBackgroundPointerDown}
            _onSvgPointerMove={onSvgPointerMove}
            _onSvgPointerUp={onSvgPointerUp}
            _onSvgPointerLeave={onSvgPointerLeave}
          />
        </div>

        {/* ── Step panel ─────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <StepPanel
            step={step}
            metrics={metrics}
            optimal={optimal}
            useImprovedShortcut={useImprovedShortcut}
            onToggleShortcut={setUseImprovedShortcut}
            onCompareOptimal={onCompareOptimal}
            canCompareOptimal={canCompareOptimal}
          />
        </div>
      </div>

      {/* ── Controls (full width) ──────────────────────────────────── */}
      <div style={{ width: '100%', maxWidth: '1020px' }}>
        <Controls
          stepIndex={stepIndex}
          numSteps={STEPS.length}
          playing={playing}
          onPrev={onPrev}
          onNext={onNext}
          onTogglePlay={onTogglePlay}
          onReset={onReset}
          onRandomize={onRandomize}
          vertexCount={vertexCount}
          onVertexCount={onVertexCount}
        />
      </div>
    </div>
  );
}
