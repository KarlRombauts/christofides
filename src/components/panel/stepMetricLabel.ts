// ─── Step-specific metric label ───────────────────────────────────────────────

export function stepMetricLabel(stepId: number): string | null {
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
