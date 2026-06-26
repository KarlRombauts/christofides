import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { T } from '../../theme';

const MIN_VERTS = 4;
const MAX_VERTS = 40;

// ─── Node count stepper ───────────────────────────────────────────────────────

function clampVerts(n: number): number {
  return Math.min(MAX_VERTS, Math.max(MIN_VERTS, n));
}

export function NodeStepper({
  value,
  onChange,
}: {
  value:    number;
  onChange: (n: number) => void;
}) {
  // Local draft so the user can clear the field and type a multi-digit number;
  // the value is clamped and committed on blur / Enter.
  const [draft, setDraft] = useState(String(value));
  useEffect(() => { setDraft(String(value)); }, [value]);

  function commit() {
    const n = parseInt(draft, 10);
    const next = Number.isNaN(n) ? value : clampVerts(n);
    onChange(next);
    setDraft(String(next));
  }

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
          onClick={() => onChange(clampVerts(value - 1))}
          className="h-8 w-8 rounded-none border-r"
          style={{ borderColor: T.panelBorder }}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <input
          type="text"
          inputMode="numeric"
          aria-label="Node count"
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ''))}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          className="px-1 text-sm font-semibold tabular-nums bg-transparent outline-none focus:bg-black/[0.03]"
          style={{
            width:      '2.75rem',
            textAlign:  'center',
            fontFamily: T.mono,
            color:      T.text,
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Increase node count"
          disabled={value >= MAX_VERTS}
          onClick={() => onChange(clampVerts(value + 1))}
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
