import { T } from '../../theme';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompareButton } from './CompareButton';

// ─── Final step summary (steps 6–7) ──────────────────────────────────────────

interface FinalSummaryProps {
  tourLength: number;
  mstWeight:  number;
  ratio:      number | null;
  optimal:    { length: number } | null;
  onCompare:  () => void;
  canCompare: boolean;
  tourView:   'christofides' | 'optimal' | 'both';
  onTourView: (v: 'christofides' | 'optimal' | 'both') => void;
}

export function FinalSummary({ tourLength, mstWeight, optimal, onCompare, canCompare, tourView, onTourView }: FinalSummaryProps) {
  const ratioToOptimal =
    optimal !== null && optimal.length > 0 ? tourLength / optimal.length : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Tour length headline */}
      <div className="flex items-baseline gap-2">
        <span
          className="text-4xl font-semibold leading-none tabular-nums"
          style={{ fontFamily: T.mono, color: T.text }}
        >
          {Math.round(tourLength)}
        </span>
        <span className="text-sm" style={{ fontFamily: T.sans, color: T.textMuted }}>
          tour length
        </span>
      </div>

      {/* Guarantee statement */}
      <p
        className="text-sm leading-relaxed"
        style={{ fontFamily: T.sans, color: T.textMuted }}
      >
        Christofides guarantees a tour within{' '}
        <span style={{ color: T.text, fontWeight: 500 }}>1.5×</span>
        {' '}the optimal tour.
      </p>

      {/* MST lower bound */}
      <p
        className="text-xs"
        style={{ fontFamily: T.sans, color: T.textFaint }}
      >
        MST lower bound:{' '}
        <span style={{ fontFamily: T.mono }}>{Math.round(mstWeight)}</span>
        {' '}(optimal ≥ this)
      </p>

      {/* Optimal result + view toggle, or the compare button */}
      {optimal !== null && ratioToOptimal !== null ? (
        <>
          <div
            className="px-3.5 py-2.5 rounded-md text-sm leading-relaxed"
            style={{
              background:   T.panelDeep,
              border:       `1px solid ${T.panelBorder}`,
              fontFamily:   T.sans,
              color:        T.text,
            }}
          >
            {ratioToOptimal <= 1.005 ? (
              <>
                <strong>Optimal: <span style={{ fontFamily: T.mono }}>{Math.round(optimal.length)}</span></strong>
                {' — matched! '}
                <span style={{ color: T.accent, fontWeight: 600 }}>1.00× optimal ✓</span>
              </>
            ) : (
              <>
                <strong>Optimal: <span style={{ fontFamily: T.mono }}>{Math.round(optimal.length)}</span></strong>
                {' — this tour is '}
                <span style={{ color: T.accent, fontWeight: 600 }}>
                  {ratioToOptimal.toFixed(2)}× optimal
                </span>
                {ratioToOptimal <= 1.5 ? ' ✓ within the guarantee.' : '.'}
              </>
            )}
          </div>

          {/* View toggle — isolate either tour, or overlay both */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm" style={{ color: T.textMuted, fontFamily: T.sans }}>
              Show on graph
            </span>
            <Tabs value={tourView} onValueChange={(v) => onTourView(v as 'christofides' | 'optimal' | 'both')}>
              <TabsList className="h-8">
                <TabsTrigger value="christofides" className="text-sm h-6 px-3">Christofides</TabsTrigger>
                <TabsTrigger value="optimal" className="text-sm h-6 px-3">Optimal</TabsTrigger>
                <TabsTrigger value="both" className="text-sm h-6 px-3">Both</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </>
      ) : (
        <CompareButton onClick={onCompare} enabled={canCompare} hasResult={false} />
      )}
    </div>
  );
}
