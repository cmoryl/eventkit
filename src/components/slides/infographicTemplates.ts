import type { SlideData } from './slideTypes';

export type InfographicCategory =
  | 'stats' | 'charts' | 'timelines' | 'process' | 'comparison' | 'lists' | 'hero' | 'sections';

export interface InfographicTemplate {
  id: string;
  name: string;
  category: InfographicCategory;
  description: string;
  tags: string[];
  /** Has motion/effects when previewed (used for the "show only animated" filter) */
  animated?: boolean;
  /** Slide payload — id is assigned at insert time */
  slide: Omit<SlideData, 'id'>;
}

export const INFOGRAPHIC_CATEGORIES: { value: InfographicCategory; label: string }[] = [
  { value: 'stats',      label: 'Stats & KPIs' },
  { value: 'charts',     label: 'Charts' },
  { value: 'timelines',  label: 'Timelines' },
  { value: 'process',    label: 'Process & Flow' },
  { value: 'comparison', label: 'Comparison' },
  { value: 'lists',      label: 'Lists & Agenda' },
  { value: 'hero',       label: 'Hero & Title' },
  { value: 'sections',   label: 'Sections & Quotes' },
];

export const INFOGRAPHIC_TEMPLATES: InfographicTemplate[] = [
  // ── Stats & KPIs ───────────────────────────────────────────────
  {
    id: 'stat-hero-roi',
    name: 'ROI Hero Number',
    category: 'stats',
    description: 'Single dramatic metric with context',
    tags: ['big-number', 'roi', 'hero', 'kpi'],
    animated: true,
    slide: {
      layout: 'big-number',
      title: 'Expected ROI',
      subtitle: 'based on current team size and process costs',
      variant: 'brand',
      stats: [{ value: '3.4×', label: 'return on investment in year one' }],
      bgEffect: { type: 'orbs', speed: 1, intensity: 0.55, count: 3, size: 50, blur: 90 },
    },
  },
  {
    id: 'stat-grid-4',
    name: '4-Up KPI Grid',
    category: 'stats',
    description: 'Four key performance indicators side by side',
    tags: ['kpi', 'metrics', 'dashboard', 'grid'],
    slide: {
      layout: 'stats',
      title: 'Quarterly Highlights',
      variant: 'minimal',
      stats: [
        { value: '$14.2M', label: 'ARR' },
        { value: '↑ 31%', label: 'QoQ Growth' },
        { value: '134%', label: 'Net Retention' },
        { value: '94', label: 'NPS' },
      ],
    },
  },
  {
    id: 'stat-ranked-3',
    name: 'Top 3 Stats',
    category: 'stats',
    description: 'Three ranked KPIs with brand emphasis',
    tags: ['kpi', 'metrics', 'top-3'],
    animated: true,
    slide: {
      layout: 'stats',
      title: 'Year in Numbers',
      variant: 'gradient',
      stats: [
        { value: '420K', label: 'Total Users' },
        { value: '$20M', label: 'ARR' },
        { value: '97%', label: 'Retention' },
      ],
      bgEffect: { type: 'particles', speed: 0.8, intensity: 0.5, count: 28, direction: 'up' },
    },
  },
  {
    id: 'stat-big-percent',
    name: 'Hero Percentage',
    category: 'stats',
    description: 'A single percentage as the slide centerpiece',
    tags: ['big-number', 'percent', 'hero'],
    animated: true,
    slide: {
      layout: 'big-number',
      title: 'Customer Retention',
      subtitle: 'industry benchmark: 78%',
      variant: 'dark',
      stats: [{ value: '97%', label: 'of customers renewed last year' }],
      bgEffect: { type: 'mesh', speed: 0.7, intensity: 0.5, blur: 70, hueRotate: 60 },
    },
  },

  // ── Charts ───────────────────────────────────────────────────────
  {
    id: 'chart-bar-quarterly',
    name: 'Quarterly Bar Chart',
    category: 'charts',
    description: 'Vertical bars across four quarters',
    tags: ['bar', 'quarterly', 'revenue', 'chart'],
    slide: {
      layout: 'chart',
      title: 'Quarterly Revenue',
      variant: 'default',
      chart: {
        type: 'bar',
        title: 'Revenue by quarter ($M)',
        data: [
          { label: 'Q1', value: 0.9 }, { label: 'Q2', value: 1.1 },
          { label: 'Q3', value: 1.2 }, { label: 'Q4', value: 1.5 },
        ],
      },
    },
  },
  {
    id: 'chart-line-trend',
    name: 'Growth Trend Line',
    category: 'charts',
    description: 'Six-month growth trajectory',
    tags: ['line', 'trend', 'growth', 'chart'],
    animated: true,
    slide: {
      layout: 'chart',
      title: 'Monthly Active Users',
      variant: 'minimal',
      chart: {
        type: 'line',
        title: 'MAU growth (last 6 months)',
        data: [
          { label: 'Jan', value: 6.2 }, { label: 'Feb', value: 6.9 }, { label: 'Mar', value: 7.8 },
          { label: 'Apr', value: 8.5 }, { label: 'May', value: 9.4 }, { label: 'Jun', value: 10.8 },
        ],
      },
      bgEffect: { type: 'grid', speed: 1, intensity: 0.25, spacing: 50, dotSize: 1.5, pulseDepth: 0.4 },
    },
  },
  {
    id: 'chart-donut',
    name: 'Composition Donut',
    category: 'charts',
    description: 'Donut chart showing share of whole',
    tags: ['donut', 'composition', 'share', 'chart'],
    slide: {
      layout: 'chart',
      title: 'Where Users Spend Time',
      variant: 'brand',
      chart: {
        type: 'doughnut',
        title: 'Feature usage share',
        data: [
          { label: 'Editor', value: 42 }, { label: 'Library', value: 23 },
          { label: 'Sharing', value: 18 }, { label: 'Settings', value: 9 }, { label: 'Other', value: 8 },
        ],
      },
    },
  },
  {
    id: 'chart-multi-series',
    name: 'Before/After Comparison Bars',
    category: 'charts',
    description: 'Two-series bar chart for comparing periods',
    tags: ['bar', 'multi-series', 'comparison', 'chart'],
    slide: {
      layout: 'chart',
      title: 'Skill Confidence (pre vs post)',
      variant: 'default',
      chart: {
        type: 'bar',
        title: 'Self-rated 1-10',
        data: [
          { label: 'Research', value: 4 }, { label: 'Design', value: 5 },
          { label: 'Prototype', value: 3 }, { label: 'Test', value: 4 },
        ],
        series2: [
          { label: 'Research', value: 8 }, { label: 'Design', value: 9 },
          { label: 'Prototype', value: 7 }, { label: 'Test', value: 8 },
        ],
        series1Name: 'Before', series2Name: 'After',
      },
    },
  },

  // ── Timelines ──────────────────────────────────────────────────
  {
    id: 'timeline-horizontal',
    name: 'Horizontal Milestone Rail',
    category: 'timelines',
    description: 'Four numbered milestones along a horizontal rail',
    tags: ['timeline', 'milestones', 'horizontal'],
    slide: {
      layout: 'timeline',
      title: 'Roadmap',
      variant: 'default',
      timeline: [
        { date: 'Q1', title: 'Launch v2.0', description: 'New editor + collaboration' },
        { date: 'Q2', title: 'EU Expansion', description: 'GDPR-ready, EU region live' },
        { date: 'Q3', title: 'Mobile App', description: 'iOS + Android GA' },
        { date: 'Q4', title: '$10M ARR', description: 'Revenue milestone hit' },
      ],
    },
  },
  {
    id: 'timeline-year-review',
    name: 'Year in Review',
    category: 'timelines',
    description: 'Quarterly highlights across a full year',
    tags: ['timeline', 'annual', 'year', 'review'],
    animated: true,
    slide: {
      layout: 'timeline',
      title: 'A Year of Milestones',
      variant: 'gradient',
      timeline: [
        { date: 'Q1', title: 'Series B', description: '$30M raised' },
        { date: 'Q2', title: 'EU Launch', description: '12 markets live' },
        { date: 'Q3', title: 'Platform API', description: '200+ integrations' },
        { date: 'Q4', title: '$20M ARR', description: '2× year-over-year' },
      ],
      bgEffect: { type: 'particles', speed: 0.7, intensity: 0.4, count: 22, direction: 'up' },
    },
  },
  {
    id: 'timeline-roadmap-launch',
    name: 'Launch Roadmap',
    category: 'timelines',
    description: 'Product launch plan from beta to GA',
    tags: ['timeline', 'roadmap', 'launch', 'product'],
    slide: {
      layout: 'timeline',
      title: 'Launch Plan',
      variant: 'minimal',
      timeline: [
        { date: 'Now', title: 'Early Access', description: 'Waitlist + invite-only' },
        { date: 'Month 1', title: 'Public Beta', description: 'Open sign-up, free tier' },
        { date: 'Month 3', title: 'GA', description: 'Paid plans live' },
        { date: 'Month 6', title: 'Platform', description: 'Developer API GA' },
      ],
    },
  },

  // ── Process & Flow ─────────────────────────────────────────────
  {
    id: 'process-linear-4',
    name: 'Linear 4-Step Process',
    category: 'process',
    description: 'Four numbered steps connected by arrows',
    tags: ['process', 'linear', 'steps', 'workflow'],
    slide: {
      layout: 'process',
      title: 'Our Method',
      variant: 'default',
      process: [
        { title: 'Discover', description: 'Frame the problem' },
        { title: 'Design', description: 'Sketch solutions' },
        { title: 'Build', description: 'Prototype quickly' },
        { title: 'Test', description: 'Validate with users' },
      ],
    },
  },
  {
    id: 'process-funnel-5',
    name: 'Conversion Funnel',
    category: 'process',
    description: 'Five-stage acquisition funnel',
    tags: ['process', 'funnel', 'conversion', 'acquisition'],
    animated: true,
    slide: {
      layout: 'process',
      title: 'Our Funnel',
      variant: 'brand',
      process: [
        { title: 'Visit', description: '1.2M sessions' },
        { title: 'Signup', description: '340K accounts' },
        { title: 'Activate', description: '210K aha moments' },
        { title: 'Subscribe', description: '46K paying' },
        { title: 'Advocate', description: '8K referrers' },
      ],
      bgEffect: { type: 'orbs', speed: 0.8, intensity: 0.4, count: 2, size: 70, blur: 100 },
    },
  },

  // ── Comparison ────────────────────────────────────────────────
  {
    id: 'comparison-before-after',
    name: 'Before vs After',
    category: 'comparison',
    description: 'Side-by-side comparison with VS divider',
    tags: ['comparison', 'before-after', 'vs'],
    slide: {
      layout: 'comparison',
      title: 'Before vs After',
      variant: 'default',
      body: 'Manual processes\nSlow turnaround\nHigh error rate\nFragmented tools\n---\nAutomated workflows\nInstant results\n99.9% accuracy\nOne unified platform',
    },
  },
  {
    id: 'comparison-pros-cons',
    name: 'Pros vs Cons',
    category: 'comparison',
    description: 'Two-column tradeoff analysis',
    tags: ['comparison', 'pros-cons', 'tradeoffs'],
    slide: {
      layout: 'two-column',
      title: 'Tradeoffs',
      variant: 'minimal',
      body: '✓ Faster time-to-market\n✓ Lower upfront cost\n✓ Easier to iterate\n✓ Lower team size\n---\n✗ Less customization\n✗ Vendor dependency\n✗ Limited offline mode\n✗ Higher long-term cost',
    },
  },

  // ── Lists & Agenda ────────────────────────────────────────────
  {
    id: 'list-agenda-numbered',
    name: 'Numbered Agenda',
    category: 'lists',
    description: 'Six-item agenda with numbered indicators',
    tags: ['agenda', 'list', 'numbered', 'toc'],
    slide: {
      layout: 'agenda',
      title: 'Agenda',
      variant: 'default',
      body: 'Welcome & Introductions\nFinancial Highlights\nProduct Roadmap\nMarket Opportunity\nKey Risks\nQ&A',
    },
  },
  {
    id: 'list-key-points',
    name: 'Key Points Bullets',
    category: 'lists',
    description: 'Four-bullet content slide',
    tags: ['list', 'bullets', 'content'],
    slide: {
      layout: 'content',
      title: 'Key Takeaways',
      variant: 'default',
      body: '• Revenue grew 31% quarter-over-quarter\n• Three new enterprise customers signed\n• Product hit 4 major milestones\n• Team expanded by 12 hires',
    },
  },

  // ── Hero & Title ──────────────────────────────────────────────
  {
    id: 'hero-gradient-title',
    name: 'Gradient Title with Orbs',
    category: 'hero',
    description: 'Dramatic opening slide with animated orbs',
    tags: ['title', 'hero', 'opening', 'gradient'],
    animated: true,
    slide: {
      layout: 'title',
      title: 'The Future of Work',
      subtitle: 'How automation is reshaping every industry',
      variant: 'gradient',
      bgEffect: { type: 'orbs', speed: 1, intensity: 0.6, count: 3, size: 55, blur: 80 },
    },
  },
  {
    id: 'hero-bold-statement',
    name: 'Bold Statement',
    category: 'hero',
    description: 'High-contrast title with a sweeping light beam',
    tags: ['title', 'hero', 'bold', 'statement'],
    animated: true,
    slide: {
      layout: 'title',
      title: 'We Don\'t Compete on Price.',
      subtitle: 'We compete on outcomes.',
      variant: 'bold',
      bgEffect: { type: 'beam', speed: 0.9, intensity: 0.55, angle: 30, width: 220 },
    },
  },

  // ── Sections & Quotes ─────────────────────────────────────────
  {
    id: 'section-divider-mesh',
    name: 'Chapter Divider (Animated Mesh)',
    category: 'sections',
    description: 'Transition slide with rotating gradient mesh',
    tags: ['section', 'divider', 'transition', 'chapter'],
    animated: true,
    slide: {
      layout: 'section',
      title: 'Part Two',
      subtitle: 'Where we go from here',
      variant: 'dark',
      bgEffect: { type: 'mesh', speed: 0.6, intensity: 0.45, blur: 70, hueRotate: 60 },
    },
  },
  {
    id: 'section-featured-quote',
    name: 'Featured Quote',
    category: 'sections',
    description: 'Large pull quote with attribution',
    tags: ['quote', 'testimonial', 'featured'],
    animated: true,
    slide: {
      layout: 'quote',
      title: '"This is the first tool our team actually uses every day. The ROI was obvious within two weeks."',
      quoteAuthor: 'VP of Operations, Fortune 500',
      variant: 'brand',
      bgEffect: { type: 'particles', speed: 0.6, intensity: 0.4, count: 18, direction: 'float' },
    },
  },
];
