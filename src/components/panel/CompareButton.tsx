import { T } from '../../theme';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ─── Compare-to-optimal button (with tooltip when disabled) ──────────────────

export function CompareButton({
  onClick,
  enabled,
  hasResult,
}: {
  onClick:   () => void;
  enabled:   boolean;
  hasResult: boolean;
}) {
  const btn = (
    <Button
      variant={enabled ? 'outline' : 'outline'}
      size="sm"
      onClick={onClick}
      disabled={!enabled}
      className="h-8 text-sm"
      style={
        enabled
          ? { borderColor: T.accent, color: T.accent }
          : undefined
      }
    >
      {hasResult ? 'Optimal computed' : 'Compare to optimal'}
    </Button>
  );

  if (enabled) return btn;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Wrap disabled button so tooltip can fire */}
          <span tabIndex={0} className="inline-flex">
            {btn}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          Available for ≤ 9 nodes
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
