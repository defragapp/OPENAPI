export interface VisualThemeToken {
  id: string;
  name: string;
  hex: string;
  description: string;
}

export const SOVEREIGN_COLOR_SYSTEM: Record<string, VisualThemeToken> = {
  bg0: {
    id: 'bg-0',
    name: 'Canvas Black',
    hex: '#0b0d10',
    description: 'Root background foundation'
  },
  bg1: {
    id: 'bg-1',
    name: 'Obsidian Surface',
    hex: '#12161c',
    description: 'Card and container background'
  },
  bg2: {
    id: 'bg-2',
    name: 'Elevated Surface',
    hex: '#1a2029',
    description: 'Elevated card and hover surface'
  },
  earth0: {
    id: 'earth-0',
    name: 'Deep Earth',
    hex: '#2a2520',
    description: 'Baseline foundation and grounded presence'
  },
  earth1: {
    id: 'earth-1',
    name: 'Warm Gray',
    hex: '#6b5d52',
    description: 'Introspective context and calm structure'
  },
  earth2: {
    id: 'earth-2',
    name: 'Soft Tan',
    hex: '#8b7f78',
    description: 'Emerging clarity and balanced reflection'
  },
  cream: {
    id: 'cream',
    name: 'Off-White',
    hex: '#f5f1ed',
    description: 'High-contrast typography and clear legibility'
  },
  accent: {
    id: 'accent',
    name: 'Light Warmth',
    hex: '#c9b59a',
    description: 'Insight highlights and luminous accents'
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

export const SOVEREIGN_MOTION_TOKENS = {
  fast: '160ms',
  med: '260ms',
  slow: '420ms',
  ease: 'cubic-bezier(0.16, 1, 0.3, 1)'
} as const;

export const SOVEREIGN_ICONS = {
  baselineFoundation: 'layered-earth',
  conversationThread: 'ascending-line-with-clarity-nodes',
  peopleConnection: 'two-paths-meeting',
  systemView: 'interconnected-circles-with-distinct-people',
  alignmentFit: 'balance-scale-with-gentle-weight'
} as const;
