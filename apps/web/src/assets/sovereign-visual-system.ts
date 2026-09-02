export interface VisualThemeToken {
  id: string;
  name: string;
  hex: string;
  description: string;
}

export const SOVEREIGN_COLOR_SYSTEM: Record<string, VisualThemeToken> = {
  earthDark: {
    id: 'earth-dark',
    name: 'Deep Earth',
    hex: '#2a2520',
    description: 'Baseline foundation and grounded presence'
  },
  earthMid: {
    id: 'earth-mid',
    name: 'Warm Gray',
    hex: '#6b5d52',
    description: 'Introspective context and calm structure'
  },
  warmTan: {
    id: 'warm-tan',
    name: 'Soft Tan',
    hex: '#8b7f78',
    description: 'Emerging clarity and balanced reflection'
  },
  accentLight: {
    id: 'accent-light',
    name: 'Light Warmth',
    hex: '#c9b59a',
    description: 'Insight highlights and luminous accents'
  },
  cream: {
    id: 'cream',
    name: 'Off-White',
    hex: '#f5f1ed',
    description: 'High-contrast typography and clear legibility'
  },
  clay: {
    id: 'clay',
    name: 'Sovereign Clay',
    hex: '#dda273',
    description: 'Primary Self Baseline distinction accent'
  },
  sage: {
    id: 'sage',
    name: 'Quiet Sage',
    hex: '#9fbaa1',
    description: 'People & Relational Bridge distinction accent'
  },
  slate: {
    id: 'slate',
    name: 'System Slate',
    hex: '#8ba8c4',
    description: 'Whole System & Dynamics distinction accent'
  }
};

export const SOVEREIGN_ICONS = {
  baselineFoundation: 'layered-earth',
  conversationThread: 'ascending-line-with-clarity-nodes',
  peopleConnection: 'two-paths-meeting',
  systemView: 'interconnected-circles-with-distinct-people',
  alignmentFit: 'balance-scale-with-gentle-weight'
} as const;
