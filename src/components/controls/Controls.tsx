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
import { cn } from '@/lib/utils';
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
