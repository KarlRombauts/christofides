// src/__tests__/components/GraphCanvas.test.tsx
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { GraphCanvas } from '../../components/graph';
import { buildGraph } from '../../model/graphModel';
import { circularLayout } from '../../lib/layout';

describe('GraphCanvas', () => {
  it('renders a vertex per node', () => {
    const verts = circularLayout(5, 500, 500);
    const graph = buildGraph(verts);
    const { container } = render(
      <GraphCanvas verts={verts} baseEdges={graph.edges} highlightEdges={[]} highlightVertices={[]} />,
    );
    expect(container.querySelectorAll('circle').length).toBe(5);
  });
});
