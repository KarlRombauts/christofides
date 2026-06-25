// @ts-ignore
import p5, { Vector } from 'p5';
//@ts-ignore
import { sketch } from 'p5js-wrapper';
import { without } from 'ramda';
import { christofidesSteps } from './algorithm/christofides';

import './style.css';
import {
  convertToGraph,
  getSubsetOfVisEdges,
  getSubsetOfVisVertices,
} from './visualisation/algoUtils';
import { Edge, renderBlueEdge, renderEdge } from './visualisation/Edge';
import {
  getDragOffset,
  getMousePos,
  setHoverState,
} from './visualisation/mouseUtils';
import {
  renderActiveVertex,
  renderInactiveVertex,
  Vertex,
} from './visualisation/Vertex';

let verts: Vertex[] = [];
let edges: Edge[] = [];
let numVerts = 5;
let displayText = 'Step 0: Fully connected, undirected graph';
let draggedVert: Vertex | undefined = undefined;
let dragOffset: Vector | undefined = undefined;
let step: keyof typeof christofidesSteps | undefined = undefined;

sketch.setup = function () {
  createCanvas(500, 500);

  for (let i = 0; i < numVerts; i++) {
    verts.push(new Vertex(i));
  }

  edges.push(new Edge(verts[0], verts[1]));
  fullyConnectGraph();
};

function fullyConnectGraph() {
  edges = [];
  for (let i = 0; i < verts.length; i++) {
    for (let j = i + 1; j < verts.length; j++) {
      edges.push(new Edge(verts[i], verts[j]));
    }
  }
}

sketch.draw = function () {
  background(230);

  const graph = convertToGraph(edges);
  if (step) {
    edges.forEach(renderEdge);
    verts.forEach(renderInactiveVertex);
    const output = christofidesSteps[step](graph);
    const outputEdges = getSubsetOfVisEdges(edges, output.edges);
    const outputVerts = getSubsetOfVisVertices(verts, output.vertices);
    outputEdges.forEach(renderBlueEdge);
    outputVerts.forEach(renderActiveVertex);
  } else {
    edges.forEach(renderEdge);
    verts.forEach(renderActiveVertex);
  }
  fill(0);
  textSize(20);
  text(displayText, 10, 490);
};

sketch.mouseMoved = function () {
  // edges.forEach(setHoverState);
  verts.forEach(setHoverState);
};

sketch.mousePressed = function () {
  const hoveredVert = verts.find((vert) => vert.state.hover);
  if (hoveredVert) {
    draggedVert = hoveredVert;
    if (draggedVert) {
      draggedVert.state.selected = true;
      dragOffset = getDragOffset(draggedVert);
    }
  } else {
    createVertex(getMousePos());
  }
};

function createVertex(position: Vector) {
  const newVert = new Vertex(++numVerts, position);
  newVert.state.hover = true;
  newVert.state.selected = true;
  verts.push(newVert);
  draggedVert = newVert;
  dragOffset = getDragOffset(draggedVert);
  fullyConnectGraph();
}

sketch.mouseReleased = function () {
  if (draggedVert) {
    draggedVert.state.selected = false;
    draggedVert = undefined;
  }
};

sketch.mouseDragged = function () {
  if (draggedVert && dragOffset) {
    draggedVert.position = Vector.sub(getMousePos(), dragOffset);
  }
};

sketch.keyPressed = function keyPressed() {
  switch (keyCode) {
    case BACKSPACE:
      return deleteUnderCursor();
  }

  switch (key) {
    case '1':
      step = 1;
      displayText = 'Step 1: Create MST';
      break;
    case '2':
      step = 2;
      displayText = 'Step 2: Find vertices with odd degree';
      break;
    case '3':
      step = 3;
      displayText = 'Step 3: Create induced subgraph';
      break;
    case '4':
      step = 4;
      displayText = 'Step 4: Find minimum-weight perfect matching';
      break;
    case '5':
      step = 5;
      displayText = 'Step 5: Combine matching with MST';
      break;
    case '6':
      step = 6;
      displayText = 'Step 6a: Apply simple shortcuts';
      break;
    case '7':
      step = 7;
      displayText = 'Step 6b: Use improved shortcut heuristic';
      break;
    case '0':
      step = undefined;
      displayText = 'Step 0: Fully connected, undirected graph';
      break;
  }
};

function deleteUnderCursor() {
  const hoveredVert = verts.find((vert) => vert.state.hover);
  if (hoveredVert) {
    deleteVert(hoveredVert);
  }
}

function deleteVert(vert: Vertex) {
  const edgesToDelete = edges.filter(
    (edge) => edge.v === vert || edge.u === vert,
  );
  edges = without(edgesToDelete, edges);
  verts = without([vert], verts);
}

const temp = {
  name: 'autoexport',
  data: [
    {
      type: 'library',
      id: 1,
      path: '/Volumes/GoogleDrive/My Drive/Obsidian/BetterBibtex/Quantum Research.json',
      status: 'done',
      translatorID: 'f4b52ab0-f878-4556-85a0-c7aeedd09dfc',
      meta: {
        revision: 523,
        created: 1660630651402,
        version: 0,
        updated: 1665418403028,
      },
      $loki: 1,
      error:
        'Unix error 13 during operation makeDir on file /Volumes/GoogleDrive (Permission denied)\n',
    },
  ],
  idIndex: null,
  binaryIndices: {
    type: { name: 'type', dirty: true, values: [0] },
    id: { name: 'id', dirty: true, values: [0] },
    status: { name: 'status', dirty: true, values: [0] },
    path: { name: 'path', dirty: true, values: [0] },
    translatorID: { name: 'translatorID', dirty: true, values: [0] },
    exportNotes: { name: 'exportNotes', dirty: true, values: [0] },
    useJournalAbbreviation: {
      name: 'useJournalAbbreviation',
      dirty: true,
      values: [0],
    },
    asciiBibLaTeX: { name: 'asciiBibLaTeX', dirty: true, values: [0] },
    asciiBibTeX: { name: 'asciiBibTeX', dirty: true, values: [0] },
    biblatexExtendedNameFormat: {
      name: 'biblatexExtendedNameFormat',
      dirty: true,
      values: [0],
    },
    bibtexParticleNoOp: {
      name: 'bibtexParticleNoOp',
      dirty: true,
      values: [0],
    },
    bibtexURL: { name: 'bibtexURL', dirty: true, values: [0] },
    DOIandURL: { name: 'DOIandURL', dirty: true, values: [0] },
  },
  constraints: null,
  uniqueNames: ['path'],
  transforms: {},
  objType: 'autoexport',
  dirty: true,
  cachedIndex: null,
  cachedBinaryIndex: null,
  cachedData: null,
  adaptiveBinaryIndices: false,
  transactional: false,
  cloneObjects: true,
  cloneMethod: 'parse-stringify',
  asyncListeners: false,
  disableMeta: false,
  disableChangesApi: true,
  disableDeltaChangesApi: true,
  autoupdate: false,
  serializableIndices: true,
  disableFreeze: true,
  ttl: null,
  maxId: 1,
  DynamicViews: [],
  events: {
    insert: [],
    update: [],
    'pre-insert': [],
    'pre-update': [],
    close: [],
    flushbuffer: [],
    error: [],
    delete: [null],
    warning: [null],
  },
  changes: [],
  dirtyIds: [],
};
