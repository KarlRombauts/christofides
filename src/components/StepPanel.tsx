import { motion, AnimatePresence } from 'framer-motion';
import { StepDef } from '../model/steps';
import { T } from '../theme';

export interface StepPanelProps {
  step: StepDef;
  metrics: {
    tourLength:    number | null;
    mstWeight:     number;
    ratio:         number | null;
    currentWeight: number;
  };
  optimal:             { length: number } | null;
  useImprovedShortcut: boolean;
  onToggleShortcut:    (v: boolean) => void;
  onCompareOptimal:    () => void;
  canCompareOptimal:   boolean;
  /** Vertex count for step 2 odd-degree display */
  oddVertexCount?: number;
}

// ─── Step-specific metric label ───────────────────────────────────────────────

function stepMetricLabel(stepId: number): string | null {
  switch (stepId) {
    case 0: return null;             // complete graph — no weight to show
    case 1: return 'MST weight';
    case 2: return null;             // shows count, not weight
    case 3: return 'Subgraph weight';
    case 4: return 'Matching weight';
    case 5: return 'Multigraph weight';
    case 6: return 'Tour length';
    case 7: return 'Tour length';
    default: return null;
  }
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div style={{
      height:     '1px',
      background: T.panelBorder,
      margin:     '0',
    }} />
  );
}

// ─── Shortcut toggle ─────────────────────────────────────────────────────────

function ShortcutToggle({
  value,
  onChange,
}: {
  value:    boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span style={{
        fontFamily:    T.mono,
        fontSize:      '10px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
        color:         T.textMuted,
        fontWeight:    500,
      }}>
        Shortcut mode
      </span>
      <div style={{
        display:      'flex',
        border:       `1px solid ${T.panelBorder}`,
        borderRadius: '4px',
        overflow:     'hidden',
        width:        'fit-content',
      }}>
        {(['naive', 'improved'] as const).map((mode, i) => {
          const isActive = mode === 'improved' ? value : !value;
          return (
            <button
              key={mode}
              onClick={() => onChange(mode === 'improved')}
              style={{
                fontFamily:    T.mono,
                fontSize:      '11px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
                padding:       '6px 14px',
                border:        'none',
                borderRight:   i === 0 ? `1px solid ${T.panelBorder}` : 'none',
                background:    isActive ? T.accent : T.panel,
                color:         isActive ? '#FFFFFF' : T.textMuted,
                cursor:        'pointer',
                transition:    'background 0.15s ease, color 0.15s ease',
                fontWeight:    isActive ? 600 : 400,
              }}
            >
              {mode}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Compare to optimal button ───────────────────────────────────────────────

function CompareButton({
  onClick,
  enabled,
  hasResult,
}: {
  onClick:   () => void;
  enabled:   boolean;
  hasResult: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      title={
        enabled
          ? 'Compute exact optimal tour (brute-force, ≤9 vertices)'
          : 'Reduce to ≤9 vertices to compare with optimal'
      }
      style={{
        fontFamily:  T.mono,
        fontSize:    '11px',
        letterSpacing: '0.06em',
        textTransform: 'uppercase' as const,
        padding:     '8px 16px',
        border:      `1px solid ${enabled ? T.accent : T.panelBorder}`,
        borderRadius: '4px',
        background:  enabled ? T.accentFaint : 'transparent',
        color:       enabled ? T.accent : T.textFaint,
        cursor:      enabled ? 'pointer' : 'not-allowed',
        transition:  'all 0.15s ease',
        whiteSpace:  'nowrap' as const,
        fontWeight:  500,
      }}
      onMouseEnter={e => {
        if (!enabled) return;
        (e.currentTarget as HTMLButtonElement).style.background = T.accentMid;
      }}
      onMouseLeave={e => {
        if (!enabled) return;
        (e.currentTarget as HTMLButtonElement).style.background = T.accentFaint;
      }}
    >
      {hasResult ? 'Optimal computed' : 'Compare to optimal'}
    </button>
  );
}

// ─── Current step metric display ─────────────────────────────────────────────

interface CurrentMetricProps {
  stepId:         number;
  currentWeight:  number;
  oddVertexCount: number;
}

function CurrentMetric({ stepId, currentWeight, oddVertexCount }: CurrentMetricProps) {
  const label = stepMetricLabel(stepId);

  if (stepId === 2) {
    return (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{
          fontFamily: T.mono,
          fontSize:   '28px',
          fontWeight: 600,
          color:      T.accent,
          lineHeight: 1,
        }}>
          {oddVertexCount}
        </span>
        <span style={{
          fontFamily: T.sans,
          fontSize:   '13px',
          color:      T.textMuted,
        }}>
          odd-degree vertices
        </span>
      </div>
    );
  }

  if (!label) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
      <span style={{
        fontFamily: T.mono,
        fontSize:   '28px',
        fontWeight: 600,
        color:      T.text,
        lineHeight: 1,
      }}>
        {Math.round(currentWeight)}
      </span>
      <span style={{
        fontFamily: T.sans,
        fontSize:   '13px',
        color:      T.textMuted,
      }}>
        {label}
      </span>
    </div>
  );
}

// ─── Final step summary (steps 6–7) ──────────────────────────────────────────

interface FinalSummaryProps {
  tourLength:    number;
  mstWeight:     number;
  ratio:         number | null;
  optimal:       { length: number } | null;
  onCompare:     () => void;
  canCompare:    boolean;
}

function FinalSummary({ tourLength, mstWeight, optimal, onCompare, canCompare }: FinalSummaryProps) {
  // Christofides bounds the tour at 1.5x the OPTIMAL tour. The MST is only a
  // lower bound on the optimum (optimal >= MST), so tour/MST is NOT the quantity
  // the guarantee limits — it can exceed 1.5 while the tour is well within the
  // guarantee. The honest ratio against the optimum is only knowable once the
  // optimum is computed (brute force, <=9 vertices), so we show it only then.
  const ratioToOptimal =
    optimal !== null && optimal.length > 0 ? tourLength / optimal.length : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Tour length headline */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{
          fontFamily: T.mono,
          fontSize:   '32px',
          fontWeight: 600,
          color:      T.text,
          lineHeight: 1,
        }}>
          {Math.round(tourLength)}
        </span>
        <span style={{ fontFamily: T.sans, fontSize: '14px', color: T.textMuted }}>
          tour length
        </span>
      </div>

      {/* The guarantee — stated against the optimal, not the MST */}
      <div style={{
        fontFamily: T.sans,
        fontSize:   '13px',
        color:      T.textMuted,
        lineHeight: 1.5,
      }}>
        Christofides guarantees a tour within{' '}
        <span style={{ color: T.text, fontWeight: 500 }}>1.5×</span>
        {' '}the optimal tour.
      </div>

      {/* MST shown as what it is: a lower bound on the optimum */}
      <div style={{ fontFamily: T.mono, fontSize: '12px', color: T.textFaint }}>
        MST lower bound: {Math.round(mstWeight)}
        {' '}
        <span style={{ fontFamily: T.sans }}>(optimal ≥ this)</span>
      </div>

      {/* Actual ratio vs the true optimum — only once it's been computed */}
      {optimal !== null && ratioToOptimal !== null ? (
        <div style={{
          padding:      '10px 14px',
          background:   T.panelDeep,
          borderRadius: '4px',
          border:       `1px solid ${T.panelBorder}`,
          fontFamily:   T.sans,
          fontSize:     '13px',
          color:        T.text,
          lineHeight:   1.5,
        }}>
          {ratioToOptimal <= 1.005 ? (
            <>
              <strong>Optimal: {Math.round(optimal.length)}</strong>
              {' — matched! '}
              <span style={{ color: T.accent, fontWeight: 600 }}>1.00× optimal ✓</span>
            </>
          ) : (
            <>
              <strong>Optimal: {Math.round(optimal.length)}</strong>
              {' — this tour is '}
              <span style={{ color: T.accent, fontWeight: 600 }}>
                {ratioToOptimal.toFixed(2)}× optimal
              </span>
              {ratioToOptimal <= 1.5 ? ' ✓ within the guarantee.' : '.'}
            </>
          )}
        </div>
      ) : (
        <CompareButton
          onClick={onCompare}
          enabled={canCompare}
          hasResult={false}
        />
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function StepPanel({
  step,
  metrics,
  optimal,
  useImprovedShortcut,
  onToggleShortcut,
  onCompareOptimal,
  canCompareOptimal,
  oddVertexCount = 0,
}: StepPanelProps) {
  const showShortcut = step.id === 6 || step.id === 7;
  const isFinalStep  = step.id === 6 || step.id === 7;

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      background:    T.panel,
      border:        `1px solid ${T.panelBorder}`,
      borderRadius:  '6px',
      overflow:      'hidden',
      height:        '100%',
    }}>

      {/* ── Header bar ──────────────────────────────────────── */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '12px',
        padding:      '14px 18px',
        background:   T.panelDeep,
        borderBottom: `1px solid ${T.panelBorder}`,
      }}>
        {/* Step badge */}
        <div style={{
          fontFamily:    T.mono,
          fontSize:      '10px',
          letterSpacing: '0.1em',
          color:         '#FFFFFF',
          background:    T.accent,
          padding:       '3px 8px',
          borderRadius:  '3px',
          fontWeight:    600,
          flexShrink:    0,
        }}>
          {String(step.id + 1).padStart(2, '0')} / {8}
        </div>

        {/* Animated step title */}
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.h2
              key={step.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{   opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                margin:        0,
                fontFamily:    T.serif,
                fontSize:      '15px',
                fontWeight:    600,
                color:         T.text,
                lineHeight:    1.3,
              }}
            >
              {step.title}
            </motion.h2>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Explanation ──────────────────────────────────────── */}
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${T.panelBorder}` }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={step.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{   opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: 'easeOut', delay: 0.05 }}
            style={{
              margin:     0,
              fontFamily: T.sans,
              fontSize:   '14px',
              lineHeight: 1.65,
              color:      T.textMuted,
            }}
          >
            {step.explanation}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── Current step metric ───────────────────────────────── */}
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${T.panelBorder}`, minHeight: '72px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`metric-${step.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isFinalStep && metrics.tourLength !== null ? (
              <FinalSummary
                tourLength={metrics.tourLength}
                mstWeight={metrics.mstWeight}
                ratio={metrics.ratio}
                optimal={optimal}
                onCompare={onCompareOptimal}
                canCompare={canCompareOptimal}
              />
            ) : (
              <CurrentMetric
                stepId={step.id}
                currentWeight={metrics.currentWeight}
                oddVertexCount={oddVertexCount}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Shortcut toggle (steps 6–7) ───────────────────────── */}
      <div style={{
        padding:    '14px 18px',
        opacity:    showShortcut ? 1 : 0.3,
        transition: 'opacity 0.3s ease',
        pointerEvents: showShortcut ? 'auto' : 'none',
      }}>
        <ShortcutToggle
          value={useImprovedShortcut}
          onChange={onToggleShortcut}
        />
      </div>

      {/* Compare to optimal — shown on non-final steps, below shortcut */}
      {!isFinalStep && (
        <>
          <Divider />
          <div style={{ padding: '14px 18px' }}>
            <CompareButton
              onClick={onCompareOptimal}
              enabled={canCompareOptimal}
              hasResult={optimal !== null}
            />
          </div>
        </>
      )}
    </div>
  );
}
