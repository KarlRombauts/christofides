import { useMemo } from 'react';
import { buildGraph, coordsOf, PositionedVertex } from '../model/graphModel';
import { mstWeight, tourLength } from '../model/metrics';
import { STEPS } from '../model/steps';

export function useChristofides(
  verts: PositionedVertex[],
  stepIndex: number,
  useImprovedShortcut: boolean,
) {
  return useMemo(() => {
    const graph = buildGraph(verts);
    const coords = coordsOf(verts);
    const step = STEPS[stepIndex];
    const result = step.compute(graph, coords, useImprovedShortcut);
    const isTour = stepIndex === 6 || stepIndex === 7;
    const currentWeight = tourLength(result.edges);
    // Compute MST weight once — reuse as lower bound for the ratio (avoids a
    // second Kruskal run inside approximationRatio).
    const mst = mstWeight(graph);
    const ratio = isTour && mst > 0 ? currentWeight / mst : null;
    return {
      step,
      result,
      graph,
      metrics: {
        mstWeight: mst,
        tourLength: isTour ? currentWeight : null,
        ratio,
        currentWeight,
      },
    };
  }, [verts, stepIndex, useImprovedShortcut]);
}
