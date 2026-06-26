import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Shuffle,
  Minus,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
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
const MAX_VERTS = 40;

// ─── Step progress (pill dots) ────────────────────────────────────────────────

function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Pill dot timeline */}
      <div className="flex items-center gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={{
              width:        i === current ? '18px' : '6px',
              height:       '6px',
              borderRadius: '3px',
              background:   i <= current ? T.accent : T.panelBorder,
              transition:   'all 0.2s ease',
              flexShrink:   0,
            }}
          />
        ))}
      </div>
      {/* Text counter — sans font, sentence-case, comfortable size */}
      <span
        className="text-sm whitespace-nowrap tabular-nums"
        style={{ color: T.textMuted, fontFamily: T.sans }}
      >
        Step {current + 1} of {total}
      </span>
    </div>
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
    <div className="flex items-center gap-2.5">
      <span
        className="text-sm"
        style={{ color: T.textMuted, fontFamily: T.sans }}
      >
        Nodes
      </span>
      <div className="flex items-center border rounded-md overflow-hidden" style={{ borderColor: T.panelBorder }}>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Decrease node count"
          disabled={value <= MIN_VERTS}
          onClick={() => onChange(Math.max(MIN_VERTS, value - 1))}
          className="h-8 w-8 rounded-none border-r"
          style={{ borderColor: T.panelBorder }}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span
          className="px-3 text-sm font-semibold tabular-nums select-none"
          style={{
            minWidth:   '2.5rem',
            textAlign:  'center',
            fontFamily: T.mono,
            color:      T.text,
          }}
        >
          {value}
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Increase node count"
          disabled={value >= MAX_VERTS}
          onClick={() => onChange(Math.min(MAX_VERTS, value + 1))}
          className="h-8 w-8 rounded-none border-l"
          style={{ borderColor: T.panelBorder }}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      <span
        className="text-xs"
        style={{ color: T.textFaint, fontFamily: T.sans }}
      >
        {MIN_VERTS}–{MAX_VERTS}
      </span>
    </div>
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
    <div
      className="flex flex-col rounded-lg border overflow-hidden"
      style={{ background: T.panel, borderColor: T.panelBorder }}
    >
      {/* ── Row 1: Playback + step progress ──────────────────── */}
      <div
        className="flex items-center gap-2 px-4 py-3 flex-wrap"
        style={{ borderBottom: `1px solid ${T.panelBorder}` }}
      >
        {/* Playback label — sentence-case, comfortable size, no mono */}
        <span
          className="text-xs mr-1"
          style={{ color: T.textFaint, fontFamily: T.sans }}
        >
          Playback
        </span>

        {/* Prev / Play(Pause) / Next / Reset */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            aria-label="Previous step"
            disabled={atStart || playing}
            onClick={onPrev}
            className="h-8 gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm">Prev</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            aria-label={playing ? 'Pause auto-play' : 'Auto-play all steps'}
            onClick={onTogglePlay}
            className={cn(
              'h-8 gap-1.5 font-medium',
              // When playing, keep it visually distinct
            )}
          >
            {playing
              ? <><Pause className="h-4 w-4" /><span className="text-sm">Pause</span></>
              : <><Play  className="h-4 w-4" /><span className="text-sm">Play</span></>
            }
          </Button>

          <Button
            variant="outline"
            size="sm"
            aria-label="Next step"
            disabled={atEnd || playing}
            onClick={onNext}
            className="h-8 gap-1.5"
          >
            <span className="text-sm">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            aria-label="Return to step 1"
            onClick={onReset}
            className="h-8 gap-1.5"
            style={{ color: T.textMuted }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="text-sm">Reset</span>
          </Button>
        </div>

        <Separator orientation="vertical" className="mx-1 h-5 self-center" />

        {/* Step progress */}
        <StepProgress current={stepIndex} total={numSteps} />
      </div>

      {/* ── Row 2: Graph settings ─────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 py-3 flex-wrap">
        {/* Section label — sentence-case, readable size */}
        <span
          className="text-xs"
          style={{ color: T.textFaint, fontFamily: T.sans }}
        >
          Graph
        </span>

        <NodeStepper value={vertexCount} onChange={onVertexCount} />

        <Button
          variant="ghost"
          size="sm"
          aria-label="Generate a new random graph with the current node count"
          onClick={onRandomize}
          className="h-8 gap-1.5"
          style={{ color: T.textMuted }}
        >
          <Shuffle className="h-3.5 w-3.5" />
          <span className="text-sm">Randomize</span>
        </Button>
      </div>
    </div>
  );
}
