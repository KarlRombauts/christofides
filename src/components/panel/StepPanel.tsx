import { motion, AnimatePresence } from 'framer-motion';
import { StepDef } from '../../model/steps';
import { T } from '../../theme';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { stepMetricLabel } from './stepMetricLabel';
import { CurrentMetric } from './CurrentMetric';
import { ShortcutToggle } from './ShortcutToggle';
import { FinalSummary } from './FinalSummary';

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
