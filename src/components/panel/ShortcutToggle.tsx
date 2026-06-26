import { T } from '../../theme';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── Shortcut toggle (Tabs-based) ─────────────────────────────────────────────

export function ShortcutToggle({
  value,
  onChange,
}: {
  value:    boolean;
  onChange: (v: boolean) => void;
}) {
  const current = value ? 'improved' : 'naive';
  const description = value
    ? 'Improved: when a vertex repeats in the circuit, choose which visit to skip so the resulting shortcut is as short as possible.'
    : 'Naive: walk the Eulerian circuit and skip every vertex already visited, keeping its first occurrence.';
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="text-sm"
        style={{ color: T.textMuted, fontFamily: T.sans }}
      >
        Shortcut mode
      </span>
      <Tabs
        value={current}
        onValueChange={(v) => onChange(v === 'improved')}
      >
        <TabsList className="h-8">
          <TabsTrigger value="naive" className="text-sm h-6 px-3">
            Naive
          </TabsTrigger>
          <TabsTrigger value="improved" className="text-sm h-6 px-3">
            Improved
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <p
        className="text-xs leading-relaxed"
        style={{ color: T.textFaint, fontFamily: T.sans }}
      >
        {description}
      </p>
    </div>
  );
}
