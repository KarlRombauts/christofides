import { useRef } from 'react';

// ─── Design tokens (Graph Paper Noir) ────────────────────────────────────────
const T = {
  bg:          '#08111a',
  panel:       '#0c1824',
  panelBorder: '#0d2030',
  panelDeep:   '#071016',
  cyan:        '#00e5ff',
  cyanDim:     '#00b8cc',
  cyanFaint:   'rgba(0,229,255,0.07)',
  cyanGlow:    'rgba(0,229,255,0.22)',
  muted:       '#2a4460',
  label:       '#4a7fa5',
  textFaint:   '#3d6080',
  white:       '#e8f4f8',
  mono:        '"JetBrains Mono", "Fira Code", "Courier New", monospace',
};

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

// ─── Button variants ──────────────────────────────────────────────────────────

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'play';

interface BtnProps {
  label:     string;
  onClick:   () => void;
  disabled?: boolean;
  variant?:  BtnVariant;
  wide?:     boolean;
  title?:    string;
}

function ConsoleBtn({ label, onClick, disabled = false, variant = 'secondary', wide = false, title }: BtnProps) {
  const isPrimary   = variant === 'primary';
  const isPlay      = variant === 'play';
  const isGhost     = variant === 'ghost';

  const base: React.CSSProperties = {
    fontFamily:    T.mono,
    fontSize:      '10px',
    fontWeight:    600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    padding:       isPlay ? '8px 20px' : '7px 12px',
    minWidth:      wide ? '88px' : isPlay ? '72px' : '52px',
    border:        '1px solid',
    borderColor:   disabled
      ? T.textFaint
      : isPrimary || isPlay
        ? T.cyan
        : isGhost
          ? T.textFaint
          : T.muted,
    borderRadius:  '2px',
    background:    disabled
      ? 'transparent'
      : isPrimary || isPlay
        ? T.cyanFaint
        : 'transparent',
    color:         disabled
      ? T.textFaint
      : isPrimary || isPlay
        ? T.cyan
        : isGhost
          ? T.label
          : T.label,
    cursor:        disabled ? 'not-allowed' : 'pointer',
    boxShadow:     !disabled && (isPrimary || isPlay)
      ? `0 0 10px ${T.cyanGlow}`
      : 'none',
    transition:    'all 0.15s ease',
    userSelect:    'none',
    flexShrink:    0,
  };

  function handleEnter(e: React.MouseEvent<HTMLButtonElement>) {
    if (disabled) return;
    const el = e.currentTarget;
    if (isPrimary || isPlay) {
      el.style.background = T.cyanGlow;
      el.style.boxShadow  = `0 0 18px ${T.cyanGlow}`;
    } else {
      el.style.borderColor = T.cyan;
      el.style.color       = T.cyan;
    }
  }
  function handleLeave(e: React.MouseEvent<HTMLButtonElement>) {
    if (disabled) return;
    const el = e.currentTarget;
    if (isPrimary || isPlay) {
      el.style.background = T.cyanFaint;
      el.style.boxShadow  = `0 0 10px ${T.cyanGlow}`;
    } else {
      el.style.borderColor = isGhost ? T.textFaint : T.muted;
      el.style.color       = T.label;
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

// ─── Vertex slider ────────────────────────────────────────────────────────────

function VertexSlider({
  value,
  onChange,
}: {
  value:    number;
  onChange: (n: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const MIN = 4;
  const MAX = 12;
  const pct = ((value - MIN) / (MAX - MIN)) * 100;

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      gap:           '6px',
      flex:          1,
      minWidth:      '120px',
    }}>
      {/* Label row */}
      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'baseline',
      }}>
        <span style={{
          fontFamily:    T.mono,
          fontSize:      '9px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color:         T.label,
        }}>
          Vertices
        </span>
        <span style={{
          fontFamily:  T.mono,
          fontSize:    '13px',
          fontWeight:  600,
          color:       T.cyan,
          letterSpacing: '0.04em',
          textShadow:  `0 0 8px ${T.cyanGlow}`,
        }}>
          {value}
        </span>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        style={{
          position:     'relative',
          height:       '3px',
          background:   T.muted,
          borderRadius: '2px',
          cursor:       'pointer',
        }}
      >
        {/* Fill */}
        <div style={{
          position:     'absolute',
          left:         0,
          top:          0,
          height:       '100%',
          width:        `${pct}%`,
          background:   T.cyan,
          borderRadius: '2px',
          boxShadow:    `0 0 6px ${T.cyanGlow}`,
          transition:   'width 0.1s ease',
        }} />

        {/* Native input (invisible, overlays for a11y) */}
        <input
          type="range"
          min={MIN}
          max={MAX}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position:   'absolute',
            inset:      '-8px 0',
            width:      '100%',
            opacity:    0,
            cursor:     'pointer',
            margin:     0,
          }}
          aria-label="Number of vertices"
        />

        {/* Thumb */}
        <div style={{
          position:      'absolute',
          left:          `calc(${pct}% - 5px)`,
          top:           '50%',
          transform:     'translateY(-50%)',
          width:         '10px',
          height:        '10px',
          borderRadius:  '2px',
          background:    T.cyan,
          border:        `2px solid #001820`,
          boxShadow:     `0 0 8px ${T.cyanGlow}`,
          pointerEvents: 'none',
          transition:    'left 0.1s ease',
        }} />
      </div>

      {/* Min/Max labels */}
      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: T.mono, fontSize: '8px', color: T.textFaint }}>{MIN}</span>
        <span style={{ fontFamily: T.mono, fontSize: '8px', color: T.textFaint }}>{MAX}</span>
      </div>
    </div>
  );
}

// ─── Step progress indicator ──────────────────────────────────────────────────

function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      gap:           '5px',
      minWidth:      '80px',
    }}>
      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'baseline',
      }}>
        <span style={{
          fontFamily:    T.mono,
          fontSize:      '9px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color:         T.label,
        }}>
          Progress
        </span>
        <span style={{
          fontFamily:  T.mono,
          fontSize:    '10px',
          color:       T.cyan,
          letterSpacing: '0.06em',
        }}>
          {current + 1}/{total}
        </span>
      </div>
      <div style={{
        display: 'flex',
        gap:     '3px',
      }}>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={{
              flex:         1,
              height:       '3px',
              borderRadius: '1px',
              background:   i <= current ? T.cyan : T.muted,
              boxShadow:    i === current ? `0 0 6px ${T.cyanGlow}` : 'none',
              transition:   'background 0.2s ease, box-shadow 0.2s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function ScanLine() {
  return (
    <div style={{
      height:     '1px',
      background: `linear-gradient(90deg, transparent 0%, #0d2030 20%, #2a4460 50%, #0d2030 80%, transparent 100%)`,
    }} />
  );
}

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
      borderRadius:  '4px',
      overflow:      'hidden',
      fontFamily:    T.mono,
    }}>

      {/* ── Navigation row ───────────────────────────────────── */}
      <div style={{
        display:     'flex',
        alignItems:  'center',
        gap:         '8px',
        padding:     '10px 14px',
        flexWrap:    'wrap',
      }}>

        {/* Prev / Next / Play cluster */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <ConsoleBtn
            label="◀ Prev"
            onClick={onPrev}
            disabled={atStart || playing}
            title="Previous step"
          />
          <ConsoleBtn
            label={playing ? '⏸ Pause' : '▶ Play'}
            onClick={onTogglePlay}
            variant="play"
            title={playing ? 'Pause auto-play' : 'Auto-play steps'}
          />
          <ConsoleBtn
            label="Next ▶"
            onClick={onNext}
            disabled={atEnd || playing}
            title="Next step"
          />
        </div>

        {/* Divider */}
        <div style={{
          width:      '1px',
          height:     '28px',
          background: T.panelBorder,
          flexShrink: 0,
          margin:     '0 2px',
        }} />

        {/* Reset / Randomize */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <ConsoleBtn
            label="↺ Reset"
            onClick={onReset}
            variant="ghost"
            title="Reset to step 0"
          />
          <ConsoleBtn
            label="⊞ Random"
            onClick={onRandomize}
            variant="ghost"
            title="Generate random graph"
          />
        </div>
      </div>

      <ScanLine />

      {/* ── Slider + progress row ────────────────────────────── */}
      <div style={{
        display:    'flex',
        alignItems: 'flex-start',
        gap:        '20px',
        padding:    '10px 14px',
        flexWrap:   'wrap',
      }}>
        <VertexSlider
          value={vertexCount}
          onChange={onVertexCount}
        />

        <div style={{
          width:      '1px',
          alignSelf:  'stretch',
          background: T.panelBorder,
          flexShrink: 0,
        }} />

        <StepProgress
          current={stepIndex}
          total={numSteps}
        />
      </div>
    </div>
  );
}
