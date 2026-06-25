import { useMemo } from 'react';
import { buildGraph, coordsOf, PositionedVertex } from '../model/graphModel';
import { approximationRatio, mstWeight, tourLength } from '../model/metrics';
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
    return {
      step,
      result,
      graph,
      metrics: {
        mstWeight: mstWeight(graph),
        tourLength: isTour ? tourLength(result.edges) : null,
        ratio: isTour ? approximationRatio(result.edges, graph) : null,
      },
    };
  }, [verts, stepIndex, useImprovedShortcut]);
}
