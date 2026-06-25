import { motion, AnimatePresence } from 'framer-motion';
import { StepDef } from '../model/steps';
import { T } from '../theme';

export interface StepPanelProps {
  step: StepDef;
  metrics: {
    tourLength: number | null;
    mstWeight:  number;
    ratio:      number | null;
  };
  optimal:            { length: number } | null;
  useImprovedShortcut: boolean;
  onToggleShortcut:   (v: boolean) => void;
  onCompareOptimal:   () => void;
  canCompareOptimal:  boolean;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScanLine() {
  return (
    <div style={{
      height: '1px',
      background: `linear-gradient(90deg, transparent 0%, ${T.panelBorder} 20%, ${T.muted} 50%, ${T.panelBorder} 80%, transparent 100%)`,
      margin: '0',
    }} />
  );
}

interface DataFieldProps {
  label:     string;
  value:     string;
  unit?:     string;
  accent?:   'cyan' | 'amber' | 'dim';
  glow?:     boolean;
}

function DataField({ label, value, unit, accent = 'cyan', glow = false }: DataFieldProps) {
  const valueColor =
    accent === 'cyan'  ? T.cyan  :
    accent === 'amber' ? T.amber :
    T.label;

  const bgColor =
    glow && accent === 'cyan'  ? T.cyanFaint  :
    glow && accent === 'amber' ? T.amberDim   :
    'transparent';

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      gap:           '3px',
      padding:       '8px 10px',
      background:    bgColor,
      borderLeft:    `2px solid ${accent === 'cyan' ? T.muted : accent === 'amber' ? T.amber : T.textFaint}`,
      borderRadius:  '0 2px 2px 0',
      transition:    'background 0.3s ease',
    }}>
      <span style={{
        fontFamily:    T.mono,
        fontSize:      '9px',
        letterSpacing: '0.12em',
        color:         T.label,
        textTransform: 'uppercase' as const,
      }}>
        {label}
      </span>
      <span style={{
        fontFamily:    T.mono,
        fontSize:      '15px',
        fontWeight:    600,
        color:         valueColor,
        letterSpacing: '0.04em',
        lineHeight:    1,
        textShadow:    glow && accent === 'cyan' ? `0 0 10px ${T.cyanGlow}` : 'none',
      }}>
        {value}
        {unit && (
          <span style={{ fontSize: '10px', color: T.label, marginLeft: '3px', fontWeight: 400 }}>
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

function ShortcutToggle({
  value,
  onChange,
}: {
  value:    boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      gap:           '6px',
    }}>
      <span style={{
        fontFamily:    T.mono,
        fontSize:      '9px',
        letterSpacing: '0.12em',
        color:         T.label,
        textTransform: 'uppercase' as const,
      }}>
        Shortcut Mode
      </span>
      <div style={{
        display:        'flex',
        gap:            '0',
        border:         `1px solid ${T.muted}`,
        borderRadius:   '2px',
        overflow:       'hidden',
        width:          'fit-content',
      }}>
        {(['naive', 'improved'] as const).map((mode) => {
          const isActive = mode === 'improved' ? value : !value;
          return (
            <button
              key={mode}
              onClick={() => onChange(mode === 'improved')}
              style={{
                fontFamily:      T.mono,
                fontSize:        '10px',
                letterSpacing:   '0.08em',
                textTransform:   'uppercase' as const,
                padding:         '5px 10px',
                border:          'none',
                borderRight:     mode === 'naive' ? `1px solid ${T.muted}` : 'none',
                background:      isActive ? T.cyan       : T.panelDeep,
                color:           isActive ? '#001820'    : T.label,
                cursor:          'pointer',
                transition:      'background 0.15s ease, color 0.15s ease',
                fontWeight:      isActive ? 700 : 400,
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
      title={enabled ? 'Compute exact optimal tour (brute-force, ≤9 vertices)' : 'Add ≤9 vertices to enable optimal comparison'}
      style={{
        fontFamily:    T.mono,
        fontSize:      '10px',
        letterSpacing: '0.10em',
        textTransform: 'uppercase' as const,
        padding:       '7px 14px',
        border:        `1px solid ${enabled ? T.cyan : T.textFaint}`,
        borderRadius:  '2px',
        background:    enabled ? T.cyanFaint : 'transparent',
        color:         enabled ? T.cyan      : T.textFaint,
        cursor:        enabled ? 'pointer'   : 'not-allowed',
        boxShadow:     enabled ? `0 0 12px ${T.cyanGlow}, inset 0 0 8px rgba(0,229,255,0.04)` : 'none',
        transition:    'all 0.2s ease',
        whiteSpace:    'nowrap' as const,
        alignSelf:     'flex-start',
      }}
      onMouseEnter={e => {
        if (!enabled) return;
        (e.currentTarget as HTMLButtonElement).style.background = T.cyanGlow;
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 20px ${T.cyanGlow}, inset 0 0 12px rgba(0,229,255,0.08)`;
      }}
      onMouseLeave={e => {
        if (!enabled) return;
        (e.currentTarget as HTMLButtonElement).style.background = T.cyanFaint;
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 12px ${T.cyanGlow}, inset 0 0 8px rgba(0,229,255,0.04)`;
      }}
    >
      {hasResult ? '◎ Optimal Computed' : '◎ Compare to Optimal'}
    </button>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function StepPanel({
  step,
  metrics,
  optimal,
  useImprovedShortcut,
  onToggleShortcut,
  onCompareOptimal,
  canCompareOptimal,
}: StepPanelProps) {
  const showShortcut = step.id === 6 || step.id === 7;

  // Determine ratio accent: amber if ≥1.4, cyan otherwise
  const ratioAccent: 'cyan' | 'amber' =
    metrics.ratio !== null && metrics.ratio >= 1.4 ? 'amber' : 'cyan';

  const optimalDelta =
    optimal && metrics.tourLength !== null
      ? ((metrics.tourLength - optimal.length) / optimal.length) * 100
      : null;

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      background:    T.panel,
      border:        `1px solid ${T.panelBorder}`,
      borderRadius:  '4px',
      overflow:      'hidden',
      fontFamily:    T.mono,
    }}>

      {/* ── Header bar ──────────────────────────────────────── */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        gap:            '10px',
        padding:        '10px 14px',
        background:     T.panelDeep,
        borderBottom:   `1px solid ${T.panelBorder}`,
      }}>
        {/* Step badge */}
        <div style={{
          fontFamily:    T.mono,
          fontSize:      '9px',
          letterSpacing: '0.14em',
          color:         '#001820',
          background:    T.cyan,
          padding:       '2px 7px',
          borderRadius:  '2px',
          fontWeight:    700,
          flexShrink:    0,
        }}>
          {`STEP ${String(step.id).padStart(2, '0')}`}
        </div>

        {/* Animated title */}
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.h2
              key={step.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{   opacity: 0, x: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={{
                margin:        0,
                fontFamily:    T.mono,
                fontSize:      '13px',
                fontWeight:    600,
                letterSpacing: '0.04em',
                color:         T.white,
                lineHeight:    1.2,
              }}
            >
              {step.title}
            </motion.h2>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Explanation ──────────────────────────────────────── */}
      <div style={{ padding: '12px 14px', minHeight: '64px' }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={step.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{   opacity: 0, y: -4 }}
            transition={{ duration: 0.26, ease: 'easeOut', delay: 0.05 }}
            style={{
              margin:     0,
              fontFamily: T.mono,
              fontSize:   '12px',
              lineHeight: 1.65,
              color:      T.text,
              letterSpacing: '0.01em',
            }}
          >
            {step.explanation}
          </motion.p>
        </AnimatePresence>
      </div>

      <ScanLine />

      {/* ── Metrics row ──────────────────────────────────────── */}
      <div style={{
        display:  'flex',
        flexWrap: 'wrap',
        gap:      '2px',
        padding:  '10px 14px',
      }}>
        {/* MST weight — always shown */}
        <DataField
          label="MST Weight"
          value={metrics.mstWeight.toFixed(1)}
          accent="cyan"
        />

        {/* Tour length — when available */}
        {metrics.tourLength !== null && (
          <DataField
            label="Tour Length"
            value={metrics.tourLength.toFixed(1)}
            accent="cyan"
            glow={true}
          />
        )}

        {/* Approximation ratio — when available */}
        {metrics.ratio !== null && (
          <DataField
            label="Ratio"
            value={metrics.ratio.toFixed(3)}
            unit="×"
            accent={ratioAccent}
            glow={true}
          />
        )}

        {/* Optimal comparison — when computed */}
        {optimal !== null && (
          <DataField
            label="Optimal"
            value={optimal.length.toFixed(1)}
            accent="cyan"
          />
        )}

        {/* Delta from optimal */}
        {optimalDelta !== null && (
          <DataField
            label="vs Optimal"
            value={`+${optimalDelta.toFixed(1)}`}
            unit="%"
            accent={optimalDelta > 50 ? 'amber' : 'cyan'}
            glow={true}
          />
        )}
      </div>

      {/* ── Controls row (toggle + compare) — always visible ── */}
      <>
        <ScanLine />
        <div style={{
          display:    'flex',
          flexWrap:   'wrap',
          alignItems: 'center',
          gap:        '16px',
          padding:    '10px 14px',
        }}>
          {/* Shortcut toggle — dimmed but visible on non-shortcut steps */}
          <div style={{
            opacity:    showShortcut ? 1 : 0.28,
            transition: 'opacity 0.3s ease',
            pointerEvents: showShortcut ? 'auto' : 'none',
          }}>
            <ShortcutToggle
              value={useImprovedShortcut}
              onChange={onToggleShortcut}
            />
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Compare to optimal button */}
          <CompareButton
            onClick={onCompareOptimal}
            enabled={canCompareOptimal}
            hasResult={optimal !== null}
          />
        </div>
      </>
    </div>
  );
}
