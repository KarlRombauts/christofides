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
    </div>
  );
}
