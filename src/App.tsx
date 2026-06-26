import { PointerEvent, useCallback, useEffect, useRef, useState } from 'react';
import { GraphCanvas } from './components/GraphCanvas';
import { StepPanel } from './components/StepPanel';
import { Controls } from './components/Controls';
import { useGraphInteraction } from './hooks/useGraphInteraction';
import { useChristofides } from './hooks/useChristofides';
import { circularLayout, randomLayout } from './lib/layout';
import { STEPS } from './model/steps';
import { bruteForceOptimal } from './model/metrics';
import { pathToEdges } from './algorithm/helper/path';
import { T } from './theme';

// ─── Canvas dimensions (fixed) ───────────────────────────────────────────────
const CANVAS_W = 600;
const CANVAS_H = 500;
const DEFAULT_VERTEX_COUNT = 7;

// ─── Initial layout ───────────────────────────────────────────────────────────
const INITIAL_VERTS = circularLayout(DEFAULT_VERTEX_COUNT, CANVAS_W, CANVAS_H);

// ─── SVG coordinate conversion ────────────────────────────────────────────────
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
  const [optimal, setOptimal] = useState<{ length: number; tour: number[] } | null>(null);
  // Which tour to display once the optimum has been computed.
  const [tourView, setTourView] = useState<'christofides' | 'optimal' | 'both'>('both');

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
  const draggingId = useRef<number | null>(null);
  const hoveredId = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ── Keyboard delete ──────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Backspace' && hoveredId.current !== null) {
        e.preventDefault();
        if (verts.length > 3) {
          deleteVertex(hoveredId.current);
          hoveredId.current = null;
          setOptimal(null);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deleteVertex, verts.length]);

  // ── Pointer callbacks ────────────────────────────────────────────────────────
  const onVertexPointerDown = useCallback(
    (id: number, e: PointerEvent<SVGCircleElement>) => {
      e.stopPropagation();
      draggingId.current = id;
      setIsDragging(true);
      setOptimal(null); // geometry is about to change — stored optimum is stale
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
      setIsDragging(false);
    },
    [],
  );

  const onSvgPointerLeave = useCallback(
    (_e: PointerEvent<SVGSVGElement>) => {
      hoveredId.current = null;
      setIsDragging(false);
    },
    [],
  );

  const onBackgroundPointerDown = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
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
    if (stepIndex >= STEPS.length - 1) {
      setStepIndex(0);
    }
    setPlaying(true);
    intervalRef.current = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next >= STEPS.length - 1) {
          setTimeout(stopPlay, 0);
          return STEPS.length - 1;
        }
        return next;
      });
    }, 1500);
  }, [playing, stepIndex, stopPlay]);

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
    if (res) {
      setOptimal({ length: res.length, tour: res.tour });
      setTourView('both');
    }
  }, [verts, graph, canCompareOptimal]);

  // ── Canvas props ──────────────────────────────────────────────────────────────
  // Step 0 shows the complete graph itself: render its edges as the muted base
  // layer (no accent), keeping nodes prominent — accenting every edge just makes
  // the complete graph an unreadable mess. Later steps accent their result edges.
  const highlightVertices = result.vertices;
  const pulseVertices = stepIndex === 2 ? result.vertices : [];
  // For step 2: pass the count of odd-degree vertices
  const oddVertexCount = stepIndex === 2 ? result.vertices.length : 0;

  // Tour display: on the final steps, once the optimum is computed, the view
  // toggle decides whether we show the Christofides tour, the optimal, or both.
  const isFinalStep = stepIndex === 6 || stepIndex === 7;
  const showingOptimal = !!optimal && isFinalStep;
  let highlightEdges = stepIndex === 0 ? [] : result.edges;
  let compareEdges: typeof result.edges = [];
  if (showingOptimal) {
    if (tourView === 'optimal') highlightEdges = []; // hide the Christofides tour
    if (tourView !== 'christofides') compareEdges = pathToEdges(graph.edges, optimal!.tour);
  }

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
        padding:       isWide ? '36px 24px 40px' : '20px 14px 28px',
        boxSizing:     'border-box',
      }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <header
        style={{
          width:         '100%',
          maxWidth:      '1020px',
          marginBottom:  isWide ? '28px' : '18px',
          paddingBottom: isWide ? '20px' : '14px',
          borderBottom:  `1px solid ${T.panelBorder}`,
        }}
      >
        <h1
          style={{
            fontFamily:    T.sans,
            fontSize:      isWide ? '24px' : '19px',
            fontWeight:    600,
            color:         T.text,
            margin:        0,
            letterSpacing: '-0.02em',
            lineHeight:    1.2,
          }}
        >
          Christofides Algorithm
        </h1>
        <p
          style={{
            fontFamily: T.sans,
            fontSize:   isWide ? '14px' : '13px',
            color:      T.textMuted,
            margin:     '5px 0 0 0',
            lineHeight: 1.5,
            fontWeight: 400,
          }}
        >
          An interactive walkthrough of the 1.5-approximation algorithm for the
          Travelling Salesman Problem.
        </p>
      </header>

      {/* ── Main content: graph + panel side-by-side (wide) or stacked ── */}
      <div
        style={{
          width:         '100%',
          maxWidth:      '1020px',
          display:       'flex',
          flexDirection: isWide ? 'row' : 'column',
          gap:           '20px',
          alignItems:    isWide ? 'flex-start' : 'stretch',
          marginBottom:  '16px',
        }}
      >
        {/* ── Graph canvas + hint caption ────────────────────── */}
        <div style={{ flexShrink: 0 }}>
          <GraphCanvas
            verts={verts}
            baseEdges={graph.edges}
            highlightEdges={highlightEdges}
            compareEdges={compareEdges}
            highlightVertices={highlightVertices}
            pulseVertices={pulseVertices}
            width={CANVAS_W}
            height={CANVAS_H}
            dragging={isDragging}
            onVertexPointerDown={onVertexPointerDown}
            onVertexPointerEnter={onVertexPointerEnter}
            onBackgroundPointerDown={onBackgroundPointerDown}
            _onSvgPointerMove={onSvgPointerMove}
            _onSvgPointerUp={onSvgPointerUp}
            _onSvgPointerLeave={onSvgPointerLeave}
          />
          {/* Canvas interaction hints — placed directly below the canvas */}
          <p
            style={{
              fontFamily: T.sans,
              fontSize:   '12px',
              color:      T.textFaint,
              marginTop:  '8px',
              lineHeight: 1.5,
            }}
          >
            Click canvas to add a node · Drag to move · Hover + ⌫ to delete
          </p>
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
            oddVertexCount={oddVertexCount}
            tourView={tourView}
            onTourView={setTourView}
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
