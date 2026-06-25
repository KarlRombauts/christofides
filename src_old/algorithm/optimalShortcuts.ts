import { intersection, range } from 'ramda';
import { Edge, Vertex } from './graph';
import { getDuplicates } from './helper/arrayUtils';
import { AdjacencyList, buildAdjacencyList, mod } from './utils';

class Shortcut {
  startIndex: number;
  endIndex: number;
  path: Vertex[];

  constructor(path: Vertex[], startIndex: number, endIndex: number) {
    this.path = path;
    this.startIndex = startIndex;
    this.endIndex = endIndex;
  }

  getStartVertex() {
    return this.path[this.startIndex];
  }

  getEndVertex() {
    return this.path[this.endIndex];
  }

  getSkippedVertices() {
    if (this.endIndex < this.startIndex) {
      // If the shortcut wraps around to the start of the array
      const firstHalf = this.path.slice(this.startIndex + 1, this.path.length);
      const secondtHalf = this.path.slice(0, this.endIndex);
      return firstHalf.concat(secondtHalf);
    }
    return this.path.slice(this.startIndex + 1, this.endIndex);
  }

  getAllVertices() {
    return [
      this.getStartVertex(),
      ...this.getSkippedVertices(),
      this.getEndVertex(),
    ];
  }

  canConcat(shortcut: Shortcut) {
    return (
      intersection(this.getSkippedVertices(), shortcut.getSkippedVertices())
        .length === 0
    );
  }
  concat(shortcut: Shortcut) {
    return new Shortcut(this.path, this.startIndex, shortcut.endIndex);
  }

  getFullCost(adjacencyList: AdjacencyList) {
    const vertices = this.getAllVertices();
    let cost = 0;
    for (let i = 0; i < vertices.length - 1; i++) {
      const u = vertices[i];
      const v = vertices[i + 1];
      cost += adjacencyList[u][v];
    }
    return cost;
  }

  getShortcutCost(adjacencyList: AdjacencyList) {
    const u = this.getStartVertex();
    const v = this.getEndVertex();
    return adjacencyList[u][v];
  }

  getShortcutSavings(adjacencyList: AdjacencyList) {
    return (
      this.getFullCost(adjacencyList) - this.getShortcutCost(adjacencyList)
    );
  }

  getIndicesToRemove() {
    if (this.endIndex < this.startIndex) {
      const firstHalf = range(this.startIndex + 1, this.path.length);
      const secondtHalf = range(0, this.endIndex);
      return firstHalf.concat(secondtHalf);
    }
    return range(this.startIndex + 1, this.endIndex);
  }
}

function getShortcutCandidates(path: Vertex[]) {
  path = path.slice(0, -1);
  const duplicates = getDuplicates(path);

  let candidates: Shortcut[] = [];
  let prevCandidates: Shortcut[] = [];
  let currentCandidates: Shortcut[] = [];
  for (let i = 0; i < path.length; i++) {
    const current = path[i];
    const prevIndex = mod(i - 1, path.length);
    const nextIndex = mod(i + 1, path.length);
    if (duplicates.includes(current)) {
      const currentShortcut = new Shortcut(path, prevIndex, nextIndex);
      currentCandidates.push(currentShortcut);
      for (let prevShortcut of prevCandidates) {
        if (prevShortcut.canConcat(currentShortcut)) {
          currentCandidates.push(prevShortcut.concat(currentShortcut));
        }
      }
    }
    candidates = candidates.concat(prevCandidates);
    prevCandidates = currentCandidates;
    currentCandidates = [];
  }
  candidates = candidates.concat(prevCandidates);
  return candidates;
}

function sortShortcutCandidates(
  adjacencyList: AdjacencyList,
  candidates: Shortcut[],
) {
  return candidates.sort((a, b) => {
    return (
      b.getShortcutSavings(adjacencyList) - a.getShortcutSavings(adjacencyList)
    );
  });
}

export function applyOptimalShortcuts(edges: Edge[], path: Vertex[]) {
  const adjacencyList = buildAdjacencyList(edges);
  const candidates = getShortcutCandidates(path);
  const shortcutsToApply = getBestShortcutCandidates(adjacencyList, candidates);

  return applyShortcuts(path, shortcutsToApply);
}

function getBestShortcutCandidates(
  adjacencyList: AdjacencyList,
  candidates: Shortcut[],
) {
  const best: Shortcut[] = [];
  const markedVertices = new Set<Vertex>();
  for (let candidate of sortShortcutCandidates(adjacencyList, candidates)) {
    const skippedVertices = candidate.getSkippedVertices();
    if (skippedVertices.every((vertex) => !markedVertices.has(vertex))) {
      skippedVertices.forEach((vertex) => markedVertices.add(vertex));
      best.push(candidate);
    }
  }
  return best;
}

function getIndicesToRemove(candidates: Shortcut[]) {
  let indices: Vertex[] = [];
  for (let candidate of candidates) {
    indices = indices.concat(candidate.getIndicesToRemove());
  }
  return indices.sort((a, b) => b - a);
}

function applyShortcuts(path: Vertex[], shortcuts: Shortcut[]) {
  const indices = getIndicesToRemove(shortcuts);
  const output = path.slice(0, -1);
  indices.sort((a, b) => b - a);
  for (let index of indices) {
    output.splice(index, 1);
  }
  output.push(output[0]);
  return output;
}
