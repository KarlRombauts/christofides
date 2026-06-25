import { union, uniq } from 'ramda';
import { findEulerianPath } from './findEulerianPath';
import { findOddVertices } from './findOddVertices';
import { Graph } from './graph';
import { pathToEdges } from './helper/path';
import { kruskalMST } from './kruskal';
import { minimumWeightPerfectMatching } from './minimumMatching';
import { applyOptimalShortcuts } from './optimalShortcuts';

export function christofides(graph: Graph) {
  const mst = kruskalMST(graph);
  const oddVertices = findOddVertices(mst);
  const subgraph = graph.getInducedSubgraph(oddVertices);
  const minimumMatching = minimumWeightPerfectMatching(subgraph.edges);
  const unionGraph = new Graph([...mst, ...minimumMatching]);

  const eulerianPath = findEulerianPath(unionGraph.edges);
  const hamiltonianPath = applyOptimalShortcuts(graph.edges, eulerianPath);
  const tspEdges = pathToEdges(graph.edges, hamiltonianPath);
  return new Graph(tspEdges);
}

export function christofidesStep1(graph: Graph) {
  const mst = kruskalMST(graph);
  return new Graph(mst);
}

export function christofidesStep2(graph: Graph) {
  const mst = kruskalMST(graph);
  const oddVertices = findOddVertices(mst);
  return new Graph([], oddVertices);
}

export function christofidesStep3(graph: Graph) {
  const mst = kruskalMST(graph);
  const oddVertices = findOddVertices(mst);
  return graph.getInducedSubgraph(oddVertices);
}

export function christofidesStep4(graph: Graph) {
  const mst = kruskalMST(graph);
  const oddVertices = findOddVertices(mst);
  const subgraph = graph.getInducedSubgraph(oddVertices);
  const minimumMatching = minimumWeightPerfectMatching(subgraph.edges);
  return new Graph(minimumMatching);
}

export function christofidesStep5(graph: Graph) {
  const mst = kruskalMST(graph);
  const oddVertices = findOddVertices(mst);
  const subgraph = graph.getInducedSubgraph(oddVertices);
  const minimumMatching = minimumWeightPerfectMatching(subgraph.edges);
  return new Graph(union(mst, minimumMatching));
}

export function christofidesStep6(graph: Graph) {
  const mst = kruskalMST(graph);
  const oddVertices = findOddVertices(mst);
  const subgraph = graph.getInducedSubgraph(oddVertices);
  const minimumMatching = minimumWeightPerfectMatching(subgraph.edges);
  const unionGraph = new Graph([...mst, ...minimumMatching]);

  const eulerianPath = findEulerianPath(unionGraph.edges);
  const hamiltonianPath = uniq(eulerianPath);
  hamiltonianPath.push(hamiltonianPath[0]);
  const tspEdges = pathToEdges(graph.edges, hamiltonianPath);
  return new Graph(tspEdges);
}

export function christofidesStep7(graph: Graph) {
  const mst = kruskalMST(graph);
  const oddVertices = findOddVertices(mst);
  const subgraph = graph.getInducedSubgraph(oddVertices);
  const minimumMatching = minimumWeightPerfectMatching(subgraph.edges);
  const unionGraph = new Graph([...mst, ...minimumMatching]);

  const eulerianPath = findEulerianPath(unionGraph.edges);
  const hamiltonianPath = applyOptimalShortcuts(graph.edges, eulerianPath);
  const tspEdges = pathToEdges(graph.edges, hamiltonianPath);
  return new Graph(tspEdges);
}

export const christofidesSteps = {
  [1]: christofidesStep1,
  [2]: christofidesStep2,
  [3]: christofidesStep3,
  [4]: christofidesStep4,
  [5]: christofidesStep5,
  [6]: christofidesStep6,
  [7]: christofidesStep7,
};
