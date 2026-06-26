import { motion, AnimatePresence } from 'framer-motion';
import { StepDef } from '../model/steps';
import { T } from '../theme';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface StepPanelProps {
  step: StepDef;
  metrics: {
    tourLength:    number | null;
    mstWeight:     number;
    ratio:         number | null;
    currentWeight: number;
  };
  optimal:             { length: number } | null;
  useImprovedShortcut: boolean;
  onToggleShortcut:    (v: boolean) => void;
  onCompareOptimal:    () => void;
  canCompareOptimal:   boolean;
  /** Vertex count for step 2 odd-degree display */
  oddVertexCount?: number;
  /** Which tour the graph is displaying (once the optimum is computed) */
  tourView?:   'christofides' | 'optimal' | 'both';
  onTourView?: (v: 'christofides' | 'optimal' | 'both') => void;
}

// ─── Step-specific metric label ───────────────────────────────────────────────

function stepMetricLabel(stepId: number): string | null {
  switch (stepId) {
    case 0: return null;
    case 1: return 'MST weight';
    case 2: return null;
    case 3: return 'Subgraph weight';
    case 4: return 'Matching weight';
    case 5: return 'Multigraph weight';
    case 6: return 'Tour length';
    case 7: return 'Tour length';
    default: return null;
  }
}

// ─── Compare-to-optimal button (with tooltip when disabled) ──────────────────

function CompareButton({
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

// ─── Current step metric display ─────────────────────────────────────────────

interface CurrentMetricProps {
  stepId:         number;
  currentWeight:  number;
  oddVertexCount: number;
}

function CurrentMetric({ stepId, currentWeight, oddVertexCount }: CurrentMetricProps) {
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

// ─── Shortcut toggle (Tabs-based) ─────────────────────────────────────────────

function ShortcutToggle({
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

function FinalSummary({ tourLength, mstWeight, optimal, onCompare, canCompare, tourView, onTourView }: FinalSummaryProps) {
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

// ─── Main component ───────────────────────────────────────────────────────────

export function StepPanel({
  step,
  metrics,
  optimal,
  useImprovedShortcut,
  onToggleShortcut,
  onCompareOptimal,
  canCompareOptimal,
  oddVertexCount = 0,
  tourView = 'both',
  onTourView = () => {},
}: StepPanelProps) {
  const isFinalStep  = step.id === 6 || step.id === 7;
  // Shortcut toggle only matters on the shortcutting steps (6–7).
  const showShortcut = isFinalStep;
  // Only render the metric section when the step actually has something to show:
  // the final tour summary, the odd-vertex count (step 2), or a labelled weight.
  const showMetric =
    isFinalStep || step.id === 2 || stepMetricLabel(step.id) !== null;

  return (
    <Card className="flex flex-col h-full overflow-hidden" style={{ borderColor: T.panelBorder }}>

      {/* ── Header: step badge + animated title ──────────────── */}
      <CardHeader
        className="flex-row items-center gap-3 py-3.5 px-4 space-y-0"
        style={{ background: T.panelDeep, borderBottom: `1px solid ${T.panelBorder}` }}
      >
        {/* Step badge — numeric, mono, accent */}
        <Badge
          variant="default"
          className="shrink-0 font-semibold tabular-nums text-xs rounded-sm"
          style={{ fontFamily: T.mono }}
        >
          {step.id + 1}/8
        </Badge>

        {/* Animated step title */}
        <div className="overflow-hidden flex-1">
          <AnimatePresence mode="wait">
            <motion.h2
              key={step.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{   opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="m-0 text-base font-semibold leading-snug"
              style={{ fontFamily: T.sans, color: T.text }}
            >
              {step.title}
            </motion.h2>
          </AnimatePresence>
        </div>
      </CardHeader>

      {/* ── Explanation ──────────────────────────────────────── */}
      <Separator />
      <CardContent
        className="px-4 py-4"
        style={{ borderBottom: showMetric || showShortcut ? `1px solid ${T.panelBorder}` : undefined }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={step.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{   opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: 'easeOut', delay: 0.05 }}
            className="m-0 text-sm leading-relaxed"
            style={{ fontFamily: T.sans, color: T.textMuted }}
          >
            {step.explanation}
          </motion.p>
        </AnimatePresence>
      </CardContent>

      {/* ── Current step metric — only when the step has one ──── */}
      {showMetric && (
        <CardContent
          className="px-4 py-4"
          style={{ borderBottom: showShortcut ? `1px solid ${T.panelBorder}` : undefined }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`metric-${step.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isFinalStep && metrics.tourLength !== null ? (
                <FinalSummary
                  tourLength={metrics.tourLength}
                  mstWeight={metrics.mstWeight}
                  ratio={metrics.ratio}
                  optimal={optimal}
                  onCompare={onCompareOptimal}
                  canCompare={canCompareOptimal}
                  tourView={tourView}
                  onTourView={onTourView}
                />
              ) : (
                <CurrentMetric
                  stepId={step.id}
                  currentWeight={metrics.currentWeight}
                  oddVertexCount={oddVertexCount}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      )}

      {/* ── Shortcut toggle — only on the shortcutting steps (6–7) ── */}
      {showShortcut && (
        <CardContent className="px-4 py-4">
          <ShortcutToggle value={useImprovedShortcut} onChange={onToggleShortcut} />
        </CardContent>
      )}
    </Card>
  );
}
