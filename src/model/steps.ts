import { christofidesSteps } from "../algorithm/christofides";
import { findEulerianPath } from "../algorithm/findEulerianPath";
import { findOddVertices } from "../algorithm/findOddVertices";
import { Edge, Graph, Vertex } from "../algorithm/graph";
import { pathToEdges } from "../algorithm/helper/path";
import { kruskalMST } from "../algorithm/kruskal";
import { minimumWeightPerfectMatching } from "../algorithm/minimumMatching";
import { applyOptimalShortcuts } from "../algorithm/optimalShortcuts";
import { Point, removeCrossings } from "../algorithm/removeCrossings";
import { tourLength } from "../model/metrics";
import { uniq } from "ramda";

export type StepResult = { edges: Edge[]; vertices: Vertex[] };
export type StepDef = {
  id: number;
  title: string;
  explanation: string;
  compute: (
    graph: Graph,
    coords: Record<Vertex, Point>,
    useImprovedShortcut: boolean,
  ) => StepResult;
};

function asResult(graph: Graph): StepResult {
  return { edges: graph.edges, vertices: [...graph.vertices] };
}

function eulerianCircuit(graph: Graph): Vertex[] {
  const mst = kruskalMST(graph);
  const odd = findOddVertices(mst);
  const matching = minimumWeightPerfectMatching(
    graph.getInducedSubgraph(odd).edges,
  );
  return findEulerianPath(new Graph([...mst, ...matching]).edges);
}

function naiveTour(circuit: Vertex[]): Vertex[] {
  const tour = uniq(circuit);
  tour.push(tour[0]);
  return tour;
}

function christofidesTour(graph: Graph, useImproved: boolean): Vertex[] {
  const circuit = eulerianCircuit(graph);
  const naive = naiveTour(circuit);
  if (!useImproved) return naive;
  const improved = applyOptimalShortcuts(graph.edges, circuit);
  // Safety net: never return improved if it's longer than naive
  const improvedLen = tourLength(pathToEdges(graph.edges, improved));
  const naiveLen = tourLength(pathToEdges(graph.edges, naive));
  return improvedLen <= naiveLen ? improved : naive;
}

export const STEPS: StepDef[] = [
  {
    id: 0,
    title: "Complete weighted graph",
    explanation:
      'The Travelling Salesman Problem is a classic computer science question that asks what the shortest possible path you can take to visit every city once and return home. Naively checking every possible loop takes O(n!) time which scales terribly. Christofide\'s algorithm finds a "pretty good" path in polynomial time. Christofide\'s is an 1.5 approximation algorithm, meaning that our "pretty good" path is at most 1.5 times longer than the optimal solution',
    compute: (g) => asResult(g),
  },
  {
    id: 1,
    title: "Minimum spanning tree",
    explanation:
      "The first step of the algorithm is to compute a minimum spanning tree (MST). There are a few algorithms that do this efficiently, in this case we are using Kruskal's algorithm. The total weight of the MST acts as lower bound on the optimal tour.",
    compute: (g) => asResult(christofidesSteps[1](g)),
  },
  {
    id: 2,
    title: "Odd-degree vertices",
    explanation:
      "Next, we can observe that a tour needs every vertex to have even degree. The highlighted verticies all touch an odd number of MST edges. These are the ones we must fix.",
    compute: (g) => {
      const mst = kruskalMST(g);
      return { edges: mst, vertices: findOddVertices(mst) };
    },
  },
  {
    id: 3,
    title: "Induced subgraph",
    explanation:
      "We want to add an aditional edge to each of these vertices, which we can do by finding a low cost pairing between these verticies. So first we consider only the connections among the odd-degree vertices which are the candidates edges for pairing them up.",
    compute: (g) => asResult(christofidesSteps[3](g)),
  },
  {
    id: 4,
    title: "Minimum-weight perfect matching",
    explanation:
      "Now we pair up the odd vertices as cheaply as possible using Edmonds' blossom algorithm.",
    compute: (g) => asResult(christofidesSteps[4](g)),
  },
  {
    id: 5,
    title: "Union: tree + matching",
    explanation:
      "Combine the spanning tree with the matching. Now every vertex has even degree, so an Eulerian circuit (one that uses every edge) exists.",
    compute: (g) => asResult(christofidesSteps[5](g)),
  },
  {
    id: 6,
    title: "Shortcut to a tour",
    explanation:
      "Walk the Eulerian circuit and skip vertices already visited. Naive skipping works; the improved heuristic chooses which repeats to skip for a tighter tour. This tour is guaranteed within 1.5× of optimal.",
    compute: (g, _coords, useImproved) => {
      const tour = christofidesTour(g, useImproved);
      return { edges: pathToEdges(g.edges, tour), vertices: tour };
    },
  },
  {
    id: 7,
    title: "Remove crossing edges (2-opt)",
    explanation:
      "Any two tour edges that cross can be swapped to shorten the tour. Uncrossing them improves the actual result, though it does not change the 1.5× worst-case guarantee.",
    compute: (g, coords, useImproved) => {
      const tour = christofidesTour(g, useImproved);
      const uncrossed = removeCrossings(tour, coords);
      return { edges: pathToEdges(g.edges, uncrossed), vertices: uncrossed };
    },
  },
];
