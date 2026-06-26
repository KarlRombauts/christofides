// src/__tests__/components/StepPanel.test.tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepPanel } from '../../components/panel';
import { STEPS } from '../../model/steps';

describe('StepPanel', () => {
  it('shows the step title', () => {
    render(
      <StepPanel
        step={STEPS[1]}
        metrics={{ tourLength: null, mstWeight: 12, ratio: null, currentWeight: 0 }}
        optimal={null}
        useImprovedShortcut={true}
        onToggleShortcut={() => {}}
        onCompareOptimal={() => {}}
        canCompareOptimal={true}
      />,
    );
    expect(screen.getByText(/Minimum spanning tree/i)).toBeTruthy();
  });
});
