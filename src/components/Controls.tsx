import React from 'react';
import { T } from '../theme';

export interface ControlsProps {
  stepIndex:     number;
  numSteps:      number;
  playing:       boolean;
  onPrev:        () => void;
  onNext:        () => void;
  onTogglePlay:  () => void;
  onReset:       () => void;
  onRandomize:   () => void;
  vertexCount:   number;
  onVertexCount: (n: number) => void;
}

const MIN_VERTS = 4;
const MAX_VERTS = 12;

// ─── Base button component ────────────────────────────────────────────────────

interface BtnProps {
  label:     React.ReactNode;
  onClick:   () => void;
  disabled?: boolean;
  variant?:  'primary' | 'secondary' | 'ghost';
  title?:    string;
  wide?:     boolean;
}

function Btn({ label, onClick, disabled = false, variant = 'secondary', title, wide }: BtnProps) {
  const isPrimary = variant === 'primary';
  const isGhost   = variant === 'ghost';

  const base: React.CSSProperties = {
    fontFamily:    T.mono,
    fontSize:      '12px',
    fontWeight:    isPrimary ? 600 : 500,
    letterSpacing: '0.06em',
    padding:       isPrimary ? '9px 20px' : '8px 14px',
    minWidth:      wide ? '80px' : undefined,
    border:        `1px solid ${disabled ? T.panelBorder : isPrimary ? T.accent : T.panelBorder}`,
    borderRadius:  '4px',
    background:    disabled
      ? 'transparent'
      : isPrimary
        ? T.accent
        : 'transparent',
    color:         disabled
      ? T.textFaint
      : isPrimary
        ? '#FFFFFF'
        : isGhost
          ? T.textMuted
          : T.text,
    cursor:        disabled ? 'not-allowed' : 'pointer',
    transition:    'all 0.15s ease',
    userSelect:    'none',
    flexShrink:    0,
    lineHeight:    1,
  };

  function handleEnter(e: React.MouseEvent<HTMLButtonElement>) {
    if (disabled) return;
    const el = e.currentTarget as HTMLButtonElement;
    if (isPrimary) {
      el.style.background = T.accentDim;
    } else {
      el.style.borderColor = T.textMuted;
      el.style.color = T.text;
    }
  }

  function handleLeave(e: React.MouseEvent<HTMLButtonElement>) {
    if (disabled) return;
    const el = e.currentTarget as HTMLButtonElement;
    if (isPrimary) {
      el.style.background = T.accent;
    } else {
      el.style.borderColor = T.panelBorder;
      el.style.color = isGhost ? T.textMuted : T.text;
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={base}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {label}
    </button>
  );
}

// ─── Node count stepper ───────────────────────────────────────────────────────

function NodeStepper({
  value,
  onChange,
}: {
  value:    number;
  onChange: (n: number) => void;
}) {
  return (
    <div style={{
      display:    'flex',
      alignItems: 'center',
      gap:        '10px',
    }}>
      <span style={{
        fontFamily:    T.mono,
        fontSize:      '12px',
        color:         T.textMuted,
        fontWeight:    500,
        letterSpacing: '0.04em',
      }}>
        Nodes
      </span>
      <div style={{
        display:      'flex',
        alignItems:   'center',
        border:       `1px solid ${T.panelBorder}`,
        borderRadius: '4px',
        overflow:     'hidden',
      }}>
        <button
          onClick={() => onChange(Math.max(MIN_VERTS, value - 1))}
          disabled={value <= MIN_VERTS}
          title="Fewer nodes"
          aria-label="Decrease node count"
          style={{
            fontFamily:  T.mono,
            fontSize:    '16px',
            lineHeight:  1,
            padding:     '5px 10px',
            border:      'none',
            borderRight: `1px solid ${T.panelBorder}`,
            background:  'transparent',
            color:       value <= MIN_VERTS ? T.textFaint : T.text,
            cursor:      value <= MIN_VERTS ? 'not-allowed' : 'pointer',
          }}
        >
          −
        </button>
        <span style={{
          fontFamily:  T.mono,
          fontSize:    '14px',
          fontWeight:  600,
          color:       T.text,
          padding:     '5px 12px',
          minWidth:    '36px',
          textAlign:   'center',
          userSelect:  'none',
        }}>
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(MAX_VERTS, value + 1))}
          disabled={value >= MAX_VERTS}
          title="More nodes"
          aria-label="Increase node count"
          style={{
            fontFamily:  T.mono,
            fontSize:    '16px',
            lineHeight:  1,
            padding:     '5px 10px',
            border:      'none',
            borderLeft:  `1px solid ${T.panelBorder}`,
            background:  'transparent',
            color:       value >= MAX_VERTS ? T.textFaint : T.text,
            cursor:      value >= MAX_VERTS ? 'not-allowed' : 'pointer',
          }}
        >
          +
        </button>
      </div>
      <span style={{
        fontFamily: T.mono,
        fontSize:   '11px',
        color:      T.textFaint,
      }}>
        {MIN_VERTS}–{MAX_VERTS}
      </span>
    </div>
  );
}

// ─── Step progress (dots + "Step N of M" label) ───────────────────────────────

function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div style={{
      display:    'flex',
      alignItems: 'center',
      gap:        '10px',
    }}>
      {/* Dot timeline */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={{
              width:        i === current ? '18px' : '6px',
              height:       '6px',
              borderRadius: '3px',
              background:   i <= current ? T.accent : T.panelBorder,
              transition:   'all 0.2s ease',
            }}
          />
        ))}
      </div>
      {/* Text counter */}
      <span style={{
        fontFamily:    T.mono,
        fontSize:      '12px',
        color:         T.textMuted,
        letterSpacing: '0.04em',
        whiteSpace:    'nowrap',
      }}>
        Step {current + 1} of {total}
      </span>
    </div>
  );
}

// ─── Vertical divider ─────────────────────────────────────────────────────────

function VDivider() {
  return (
    <div style={{
      width:      '1px',
      alignSelf:  'stretch',
      background: T.panelBorder,
      flexShrink: 0,
      margin:     '0 4px',
    }} />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Controls({
  stepIndex,
  numSteps,
  playing,
  onPrev,
  onNext,
  onTogglePlay,
  onReset,
  onRandomize,
  vertexCount,
  onVertexCount,
}: ControlsProps) {
  const atStart = stepIndex === 0;
  const atEnd   = stepIndex >= numSteps - 1;

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      background:    T.panel,
      border:        `1px solid ${T.panelBorder}`,
      borderRadius:  '6px',
      overflow:      'hidden',
    }}>

      {/* ── Row 1: Playback + step progress ──────────────────── */}
      <div style={{
        display:    'flex',
        alignItems: 'center',
        gap:        '8px',
        padding:    '12px 18px',
        flexWrap:   'wrap',
        borderBottom: `1px solid ${T.panelBorder}`,
      }}>
        {/* Playback group label */}
        <span style={{
          fontFamily:    T.mono,
          fontSize:      '10px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          color:         T.textFaint,
          marginRight:   '4px',
        }}>
          Playback
        </span>

        {/* Prev / Play / Next / Reset */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Btn
            label="← Prev"
            onClick={onPrev}
            disabled={atStart || playing}
            title="Previous step"
          />
          <Btn
            label={playing ? '⏸ Pause' : '▶ Play'}
            onClick={onTogglePlay}
            variant="primary"
            title={playing ? 'Pause auto-play' : 'Auto-play all steps'}
          />
          <Btn
            label="Next →"
            onClick={onNext}
            disabled={atEnd || playing}
            title="Next step"
          />
          <Btn
            label="↺ Reset"
            onClick={onReset}
            variant="ghost"
            title="Return to step 1"
          />
        </div>

        <VDivider />

        {/* Step progress indicator — right next to playback */}
        <StepProgress current={stepIndex} total={numSteps} />
      </div>

      {/* ── Row 2: Graph settings ─────────────────────────────── */}
      <div style={{
        display:    'flex',
        alignItems: 'center',
        gap:        '16px',
        padding:    '12px 18px',
        flexWrap:   'wrap',
      }}>
        {/* Graph settings label */}
        <span style={{
          fontFamily:    T.mono,
          fontSize:      '10px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          color:         T.textFaint,
        }}>
          Graph
        </span>

        {/* Node count stepper */}
        <NodeStepper
          value={vertexCount}
          onChange={onVertexCount}
        />

        {/* Randomize — with graph settings, NOT with reset */}
        <Btn
          label="Randomize"
          onClick={onRandomize}
          variant="ghost"
          title="Generate a new random graph with the current node count"
        />
      </div>
    </div>
  );
}
