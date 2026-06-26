import { T } from '../../theme';

// ─── Step progress (pill dots) ────────────────────────────────────────────────

export function StepProgress({ current, total }: { current: number; total: number }) {
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
