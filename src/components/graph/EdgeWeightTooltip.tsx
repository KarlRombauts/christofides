import { T } from '../../theme';
import { EdgeHoverInfo } from './Edge';

/** Weight tooltip — rendered by the parent on a top-most layer so no edge covers it. */
export function EdgeWeightTooltip({ mx, my, weight, highlight }: EdgeHoverInfo) {
  const label = String(Math.round(weight));
  const w = Math.max(28, label.length * 8 + 14);
  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect
        x={mx - w / 2}
        y={my - 10}
        width={w}
        height={18}
        rx={3}
        fill={T.panel}
        stroke={T.panelBorder}
        strokeWidth={1}
      />
      <text
        x={mx}
        y={my + 4}
        textAnchor="middle"
        style={{
          fontSize: '10px',
          fontFamily: T.mono,
          fontWeight: 600,
          fill: highlight ? T.accent : T.text,
          userSelect: 'none',
        }}
      >
        {label}
      </text>
    </g>
  );
}
