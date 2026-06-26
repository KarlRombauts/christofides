// Design tokens — "Editorial Paper"
// Light, calm, educational. One warm accent (terracotta/coral).
// No glow, no blur, no neon. Think Distill.pub meets a quality science textbook.
export const T = {
  // Surfaces
  bg:          '#F7F4F0',          // warm off-white page
  panel:       '#FFFFFF',          // card surface
  panelBorder: '#DDD8D0',          // subtle warm border
  panelDeep:   '#F2EDE7',          // slightly deeper panel fill

  // Primary accent — terracotta / warm coral
  accent:      '#C0392B',          // buttons, highlights, badges
  accentDim:   '#D4574A',          // hover state
  accentFaint: 'rgba(192,57,43,0.08)',  // faint tint backgrounds
  accentMid:   'rgba(192,57,43,0.18)', // medium tint

  // Graph layer colors (carefully calibrated contrast hierarchy)
  edgeBase:    '#C8BFB4',          // base/complete-graph edges: light warm gray — recede
  edgeFaded:   '#DDD8D2',          // base edges when highlight is active — fade further
  edgeHighlight: '#C0392B',        // highlighted MST/tour edges — same brightness as nodes
  nodeDefault: '#3D3530',          // node fill — darkest element (most prominent)
  nodeActive:  '#C0392B',          // active/highlighted node fill
  nodeStroke:  '#8A7F78',          // default node stroke

  // Typography
  text:        '#2B2320',          // primary body text
  textMuted:   '#7A6E68',          // secondary / label text
  textFaint:   '#AFA8A2',          // disabled / very dim

  // Font stacks
  serif:  '"IBM Plex Serif", "Georgia", "Times New Roman", serif',
  sans:   '"DM Sans", "Helvetica Neue", system-ui, sans-serif',
  mono:   '"IBM Plex Mono", "JetBrains Mono", "Courier New", monospace',
} as const;
