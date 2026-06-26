import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Shuffle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { T } from '../../theme';
import { StepProgress } from './StepProgress';
import { NodeStepper } from './NodeStepper';

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
        className="flex flex-col gap-2.5 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2"
        style={{ borderBottom: `1px solid ${T.panelBorder}` }}
      >
        {/* Playback label — desktop only */}
        <span
          className="hidden sm:inline text-xs mr-1"
          style={{ color: T.textFaint, fontFamily: T.sans }}
        >
          Playback
        </span>

        {/* Prev / Play(Pause) / Next fill the row on mobile; Reset is compact */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            aria-label="Previous step"
            disabled={atStart || playing}
            onClick={onPrev}
            className="h-8 gap-1.5 flex-1 sm:flex-initial"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm">Prev</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            aria-label={playing ? 'Pause auto-play' : 'Auto-play all steps'}
            onClick={onTogglePlay}
            className="h-8 gap-1.5 font-medium flex-1 sm:flex-initial"
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
            className="h-8 gap-1.5 flex-1 sm:flex-initial"
          >
            <span className="text-sm">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            aria-label="Return to step 1"
            onClick={onReset}
            className="h-8 gap-1.5 px-2 sm:px-3"
            style={{ color: T.textMuted }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-sm">Reset</span>
          </Button>
        </div>

        <Separator orientation="vertical" className="hidden sm:block mx-1 h-5 self-center" />

        {/* Step progress — centered on its own line on mobile */}
        <div className="flex w-full justify-center sm:w-auto sm:justify-start">
          <StepProgress current={stepIndex} total={numSteps} />
        </div>
      </div>

      {/* ── Row 2: Graph settings ─────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 flex-wrap sm:justify-start sm:gap-4">
        {/* Section label — desktop only */}
        <span
          className="hidden sm:inline text-xs"
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
