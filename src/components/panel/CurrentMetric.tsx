import { T } from '../../theme';
import { stepMetricLabel } from './stepMetricLabel';

// ─── Current step metric display ─────────────────────────────────────────────

interface CurrentMetricProps {
  stepId:         number;
  currentWeight:  number;
  oddVertexCount: number;
}

export function CurrentMetric({ stepId, currentWeight, oddVertexCount }: CurrentMetricProps) {
  const label = stepMetricLabel(stepId);

  if (stepId === 2) {
    return (
      <div className="flex items-baseline gap-2">
        <span
          className="text-3xl font-semibold leading-none tabular-nums"
          style={{ fontFamily: T.mono, color: T.accent }}
        >
          {oddVertexCount}
        </span>
        <span className="text-sm" style={{ fontFamily: T.sans, color: T.textMuted }}>
          odd-degree vertices
        </span>
      </div>
    );
  }

  if (!label) return null;

  return (
    <div className="flex items-baseline gap-2">
      <span
        className="text-3xl font-semibold leading-none tabular-nums"
        style={{ fontFamily: T.mono, color: T.text }}
      >
        {Math.round(currentWeight)}
      </span>
      <span className="text-sm" style={{ fontFamily: T.sans, color: T.textMuted }}>
        {label}
      </span>
    </div>
  );
}
