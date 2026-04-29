import type { SlideData, DemoThemeId } from './slideTypes';

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
  /** Default demo deck style this template was designed for. Drives the
   *  Template Gallery's "Style" filter and the default themed preview. */
  theme?: DemoThemeId;
  /** Slide payload — id is assigned at insert time */
  slide: Omit<SlideData, 'id'>;
}

/** Ordered list of demo deck styles surfaced in the Template Gallery sidebar. */
export const DEMO_STYLES: { value: DemoThemeId; label: string; swatch: string }[] = [
  { value: 'transperfect',     label: 'TransPerfect 2026', swatch: '#03002C' },
  { value: 'modern-dark',      label: 'Modern Dark',       swatch: '#0B0F19' },
  { value: 'editorial-light',  label: 'Editorial Light',   swatch: '#F7F5F1' },
  { value: 'corporate-navy',   label: 'Corporate Navy',    swatch: '#0F1B3D' },
  { value: 'vibrant-startup',  label: 'Vibrant Startup',   swatch: '#1E1B4B' },
  { value: 'warm-terracotta',  label: 'Warm Terracotta',   swatch: '#B85042' },
  { value: 'mono-brutalist',   label: 'Mono Brutalist',    swatch: '#000000' },
];

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
      variation: 'split',
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
      variation: 'grid',
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
      variation: 'ranked',
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
      variation: 'gauge',
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
      variation: 'callout',
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
      variation: 'takeaway',
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
      variation: 'vertical',
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
      variation: 'zigzag',
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
      variation: 'cards',
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
      variation: 'split',
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
      variation: 'magazine',
      title: '"This is the first tool our team actually uses every day. The ROI was obvious within two weeks."',
      quoteAuthor: 'VP of Operations, Fortune 500',
      variant: 'brand',
      bgEffect: { type: 'particles', speed: 0.6, intensity: 0.4, count: 18, direction: 'float' },
    },
  },

  // ── Stats & KPIs (additional) ─────────────────────────────────
  {
    id: 'stat-trend-dashboard',
    name: 'KPI Trend Dashboard',
    category: 'stats',
    description: 'Four KPIs with trend arrows for at-a-glance health',
    tags: ['kpi', 'dashboard', 'trend', 'metrics'],
    slide: {
      layout: 'stats',
      variation: 'cards',
      title: 'Health Dashboard',
      variant: 'default',
      stats: [
        { value: '↑ 24%', label: 'Revenue' },
        { value: '↑ 18%', label: 'Users' },
        { value: '↓ 5%', label: 'Churn' },
        { value: '92', label: 'NPS' },
      ],
    },
  },
  {
    id: 'stat-quarterly-vs',
    name: 'Quarterly vs Prior Period',
    category: 'stats',
    description: 'Three KPIs showing quarter-over-quarter movement',
    tags: ['kpi', 'qoq', 'comparison', 'metrics'],
    animated: true,
    slide: {
      layout: 'stats',
      title: 'This Quarter vs Last',
      variant: 'minimal',
      stats: [
        { value: '+$1.4M', label: 'Net New ARR' },
        { value: '+312', label: 'New Customers' },
        { value: '−2.1pp', label: 'Churn Reduction' },
      ],
      bgEffect: { type: 'grid', speed: 0.8, intensity: 0.25, spacing: 60, dotSize: 1.5, pulseDepth: 0.3 },
    },
  },

  // ── Charts (additional) ────────────────────────────────────────
  {
    id: 'chart-pie-mix',
    name: 'Revenue Mix Pie',
    category: 'charts',
    description: 'Pie chart showing revenue split across segments',
    tags: ['pie', 'composition', 'mix', 'chart'],
    slide: {
      layout: 'chart',
      title: 'Revenue by Segment',
      variant: 'default',
      chart: {
        type: 'pie',
        title: 'Where revenue came from this year',
        data: [
          { label: 'Enterprise', value: 58 },
          { label: 'Mid-market', value: 27 },
          { label: 'SMB', value: 15 },
        ],
      },
    },
  },
  {
    id: 'chart-actual-vs-target',
    name: 'Actual vs Target Bars',
    category: 'charts',
    description: 'Two-series bars comparing performance to plan',
    tags: ['bar', 'target', 'plan-vs-actual', 'chart'],
    slide: {
      layout: 'chart',
      variation: 'with-stat',
      title: 'Performance vs Plan',
      variant: 'minimal',
      chart: {
        type: 'bar',
        title: 'Quarterly revenue ($M)',
        data: [
          { label: 'Q1', value: 4.2 }, { label: 'Q2', value: 5.1 },
          { label: 'Q3', value: 6.4 }, { label: 'Q4', value: 7.8 },
        ],
        series2: [
          { label: 'Q1', value: 4.0 }, { label: 'Q2', value: 5.0 },
          { label: 'Q3', value: 6.0 }, { label: 'Q4', value: 7.0 },
        ],
        series1Name: 'Actual', series2Name: 'Target',
      },
    },
  },
  {
    id: 'chart-multi-line',
    name: 'Year-Over-Year Lines',
    category: 'charts',
    description: 'Two trend lines comparing this year to last',
    tags: ['line', 'yoy', 'comparison', 'trend'],
    animated: true,
    slide: {
      layout: 'chart',
      title: 'YoY Growth Comparison',
      variant: 'default',
      chart: {
        type: 'line',
        title: 'Monthly active users (thousands)',
        data: [
          { label: 'Jan', value: 22 }, { label: 'Feb', value: 25 }, { label: 'Mar', value: 29 },
          { label: 'Apr', value: 33 }, { label: 'May', value: 38 }, { label: 'Jun', value: 44 },
        ],
        series2: [
          { label: 'Jan', value: 14 }, { label: 'Feb', value: 16 }, { label: 'Mar', value: 18 },
          { label: 'Apr', value: 20 }, { label: 'May', value: 22 }, { label: 'Jun', value: 25 },
        ],
        series1Name: 'This Year', series2Name: 'Last Year',
      },
      bgEffect: { type: 'grid', speed: 1, intensity: 0.2, spacing: 50, dotSize: 1.5, pulseDepth: 0.4 },
    },
  },
  {
    id: 'chart-donut-traffic',
    name: 'Traffic by Channel',
    category: 'charts',
    description: 'Donut showing acquisition channel mix',
    tags: ['donut', 'traffic', 'channels', 'acquisition'],
    slide: {
      layout: 'chart',
      title: 'Traffic by Channel',
      variant: 'minimal',
      chart: {
        type: 'doughnut',
        title: 'Acquisition mix',
        data: [
          { label: 'Organic', value: 38 }, { label: 'Paid', value: 24 },
          { label: 'Referral', value: 18 }, { label: 'Social', value: 14 }, { label: 'Direct', value: 6 },
        ],
      },
    },
  },

  // ── Timelines (additional) ─────────────────────────────────────
  {
    id: 'timeline-project-phases',
    name: 'Project Phase Timeline',
    category: 'timelines',
    description: 'Five-phase project lifecycle with status hints',
    tags: ['timeline', 'project', 'phases', 'lifecycle'],
    slide: {
      layout: 'timeline',
      variation: 'cards',
      title: 'Project Phases',
      variant: 'default',
      timeline: [
        { date: 'Phase 1', title: 'Discovery', description: 'Research & alignment' },
        { date: 'Phase 2', title: 'Design', description: 'Architecture & specs' },
        { date: 'Phase 3', title: 'Build', description: 'Implementation sprint' },
        { date: 'Phase 4', title: 'Test', description: 'QA & user validation' },
        { date: 'Phase 5', title: 'Launch', description: 'Production rollout' },
      ],
    },
  },
  {
    id: 'timeline-company-history',
    name: 'Company History',
    category: 'timelines',
    description: 'Founding to today milestones',
    tags: ['timeline', 'history', 'founding', 'milestones'],
    animated: true,
    slide: {
      layout: 'timeline',
      variation: 'zigzag',
      title: 'Our Story',
      variant: 'dark',
      timeline: [
        { date: '2018', title: 'Founded', description: 'Two co-founders, one garage' },
        { date: '2020', title: 'Seed Round', description: '$3M from top angels' },
        { date: '2022', title: 'Product-Market Fit', description: '50K active users' },
        { date: '2024', title: 'Series B', description: '$45M, 200 employees' },
      ],
      bgEffect: { type: 'mesh', speed: 0.5, intensity: 0.4, blur: 80, hueRotate: 30 },
    },
  },

  // ── Process & Flow (additional) ───────────────────────────────
  {
    id: 'process-discovery-build-launch',
    name: '3-Step: Discover → Build → Launch',
    category: 'process',
    description: 'Compact three-step product process',
    tags: ['process', 'product', 'launch', '3-step'],
    slide: {
      layout: 'process',
      variation: 'stairs',
      title: 'How We Ship',
      variant: 'minimal',
      process: [
        { title: 'Discover', description: 'Customer research + problem framing' },
        { title: 'Build', description: 'Prototype, iterate, measure' },
        { title: 'Launch', description: 'Roll out, monitor, expand' },
      ],
    },
  },
  {
    id: 'process-customer-journey',
    name: 'Customer Journey',
    category: 'process',
    description: 'Five touchpoints from first visit to advocacy',
    tags: ['process', 'journey', 'customer', 'lifecycle'],
    slide: {
      layout: 'process',
      variation: 'cards',
      title: 'Customer Journey',
      variant: 'default',
      process: [
        { title: 'Awareness', description: 'First touchpoint' },
        { title: 'Consider', description: 'Compare options' },
        { title: 'Purchase', description: 'Convert to customer' },
        { title: 'Adopt', description: 'Aha moment' },
        { title: 'Advocate', description: 'Refer others' },
      ],
    },
  },
  {
    id: 'process-pdca',
    name: 'Plan-Do-Check-Act Cycle',
    category: 'process',
    description: 'Classic continuous improvement loop',
    tags: ['process', 'pdca', 'methodology', 'cycle'],
    animated: true,
    slide: {
      layout: 'process',
      variation: 'circular',
      title: 'Continuous Improvement',
      variant: 'brand',
      process: [
        { title: 'Plan', description: 'Define goals + hypothesis' },
        { title: 'Do', description: 'Run small experiment' },
        { title: 'Check', description: 'Measure results' },
        { title: 'Act', description: 'Standardize or pivot' },
      ],
      bgEffect: { type: 'orbs', speed: 0.7, intensity: 0.4, count: 2, size: 60, blur: 90 },
    },
  },

  // ── Comparison (additional) ────────────────────────────────────
  {
    id: 'comparison-old-vs-new',
    name: 'Old Way vs New Way',
    category: 'comparison',
    description: 'Status quo versus modernized approach',
    tags: ['comparison', 'old-vs-new', 'modernization'],
    slide: {
      layout: 'comparison',
      variation: 'stacked',
      title: 'The Old Way vs The New Way',
      variant: 'minimal',
      body: 'Spreadsheets everywhere\nManual data entry\nWeekly status emails\nFire-drill reporting\n---\nOne source of truth\nAuto-synced data\nReal-time dashboards\nProactive alerts',
    },
  },
  {
    id: 'comparison-self-vs-cloud',
    name: 'Self-Hosted vs Cloud',
    category: 'comparison',
    description: 'Two-column tradeoff between deployment models',
    tags: ['comparison', 'cloud', 'self-hosted', 'deployment'],
    slide: {
      layout: 'two-column',
      variation: 'wide-left',
      title: 'Deployment Models',
      variant: 'default',
      body: '✓ Full data control\n✓ Custom integrations\n✓ One-time license\n✗ Ops + maintenance\n✗ Slower upgrades\n---\n✓ Auto upgrades\n✓ Elastic scale\n✓ Lower TCO\n✗ Network dependency\n✗ Less customization',
    },
  },
  {
    id: 'comparison-quadrant-2x2',
    name: 'Strategic Quadrant',
    category: 'comparison',
    description: 'Four-quadrant 2×2 framing of options',
    tags: ['comparison', 'quadrant', '2x2', 'strategy'],
    slide: {
      layout: 'two-column',
      variation: 'stacked',
      title: 'Build vs Buy Decision',
      variant: 'minimal',
      body: 'Build (high effort, high control)\n→ Core differentiators\n→ Long-term IP\n→ Strategic moats\n---\nBuy (low effort, fast)\n→ Commodity functions\n→ Industry standards\n→ Time-sensitive needs',
    },
  },

  // ── Lists & Agenda (additional) ────────────────────────────────
  {
    id: 'list-workshop-agenda',
    name: 'Workshop Agenda',
    category: 'lists',
    description: 'Five-segment workshop session plan',
    tags: ['agenda', 'workshop', 'session'],
    slide: {
      layout: 'agenda',
      title: 'Workshop Plan',
      variant: 'brand',
      body: 'Welcome & Goals (15m)\nWarm-up Exercise (20m)\nDeep-Dive Discussion (40m)\nHands-on Practice (30m)\nWrap-up & Next Steps (15m)',
    },
  },
  {
    id: 'list-top-5-priorities',
    name: 'Top 5 Priorities',
    category: 'lists',
    description: 'Numbered priority list with rationale',
    tags: ['list', 'priorities', 'top-5', 'numbered'],
    slide: {
      layout: 'content',
      title: 'Top 5 Priorities for Next Quarter',
      variant: 'default',
      body: '1. Hit $5M ARR — closing key enterprise pipeline\n2. Launch platform API — unlock partner ecosystem\n3. Reduce churn to <2% — invest in onboarding\n4. Hire 10 engineers — expand product velocity\n5. EU compliance certification — enable expansion',
    },
  },

  // ── Hero & Title (additional) ──────────────────────────────────
  {
    id: 'hero-annual-report',
    name: 'Annual Report Cover',
    category: 'hero',
    description: 'Year-stamped report cover with elegant gradient',
    tags: ['title', 'annual-report', 'cover', 'hero'],
    animated: true,
    slide: {
      layout: 'title',
      title: '2025 Annual Report',
      subtitle: 'A year of momentum',
      variant: 'gradient',
      bgEffect: { type: 'mesh', speed: 0.5, intensity: 0.55, blur: 70, hueRotate: 60 },
    },
  },
  {
    id: 'hero-conference-talk',
    name: 'Conference Talk Opening',
    category: 'hero',
    description: 'High-impact title slide for talks and keynotes',
    tags: ['title', 'conference', 'talk', 'keynote'],
    animated: true,
    slide: {
      layout: 'title',
      variation: 'asymmetric',
      title: 'Designing for Trust',
      subtitle: 'Lessons from shipping to 5 million users',
      variant: 'dark',
      bgEffect: { type: 'particles', speed: 1, intensity: 0.5, count: 35, direction: 'up' },
    },
  },

  // ── Variations showcase ────────────────────────────────────────
  {
    id: 'quote-punch',
    name: 'Oversized Punch Quote',
    category: 'sections',
    description: 'Giant text fills the frame for maximum visual impact',
    tags: ['quote', 'bold', 'impact', 'typography'],
    animated: true,
    slide: {
      layout: 'quote',
      variation: 'punch',
      title: '"Speed is the ultimate competitive advantage."',
      quoteAuthor: 'Reid Hoffman',
      variant: 'dark',
      bgEffect: { type: 'grain', speed: 1, intensity: 0.35, density: 0.6 },
    },
  },
  {
    id: 'comparison-bars-feature',
    name: 'Feature Comparison Bars',
    category: 'comparison',
    description: 'Bar-head comparison highlighting your advantage on each dimension',
    tags: ['comparison', 'features', 'competitive', 'bars'],
    slide: {
      layout: 'comparison',
      variation: 'bars',
      title: 'How We Stack Up',
      variant: 'default',
      body: 'Ease of setup\nTime to first value\nIntegration depth\nEnterprise readiness\n---\nCompetitor\nCompetitor\nCompetitor\nCompetitor',
    },
  },
  {
    id: 'content-two-col',
    name: 'Two-Column Content',
    category: 'lists',
    description: 'Body text split into two balanced columns',
    tags: ['content', 'columns', 'two-column', 'layout'],
    slide: {
      layout: 'content',
      variation: 'columns',
      title: 'What We Learned',
      variant: 'default',
      body: 'Users want speed above all else\nSimplicity beats feature richness\nMobile is the primary surface\nOnboarding drives retention\n---\nEnterprise needs audit trails\nPricing drives expansion\nSupport SLA is a deal-breaker\nSecurity review blocks sales',
    },
  },
  {
    id: 'content-icon-markers',
    name: 'Icon-Marked Points',
    category: 'lists',
    description: 'Bullet points with accent icon markers for visual separation',
    tags: ['content', 'icons', 'bullets', 'visual'],
    slide: {
      layout: 'content',
      variation: 'icons',
      title: 'Why We Win',
      variant: 'brand',
      body: '10× faster time-to-value than legacy tools\nZero-config integrations with 200+ apps\nEnterprise security built in from day one\nWorld-class support with <1h response',
    },
  },
  {
    id: 'content-card-grid',
    name: 'Card Grid Points',
    category: 'lists',
    description: 'Each bullet rendered as an elevated card — ideal for key messages',
    tags: ['content', 'cards', 'grid', 'key-points'],
    animated: true,
    slide: {
      layout: 'content',
      variation: 'cards',
      title: 'Strategic Pillars',
      variant: 'minimal',
      body: 'Win enterprise\nExpand platform\nGrow ecosystem\nIncrease retention',
      bgEffect: { type: 'grid', speed: 0.8, intensity: 0.2, spacing: 55, dotSize: 1.5, pulseDepth: 0.4 },
    },
  },
  {
    id: 'two-col-image-text',
    name: 'Image + Text Panel',
    category: 'sections',
    description: 'Left image pane with right-side body text — editorial layout',
    tags: ['two-column', 'image', 'editorial', 'layout'],
    slide: {
      layout: 'two-column',
      variation: 'image-text',
      title: 'The Problem We Solve',
      variant: 'default',
      body: 'Teams waste 30% of their time hunting for information spread across a dozen disconnected tools.\n\nWe bring everything into one place so your people can focus on work that matters.',
    },
  },
  {
    id: 'comparison-vs-split',
    name: 'VS Split Comparison',
    category: 'comparison',
    description: 'Classic two-panel VS divider — your brand on the left, competitor on the right',
    tags: ['comparison', 'vs', 'competitive', 'split'],
    slide: {
      layout: 'comparison',
      title: 'Us vs The Old Way',
      variant: 'brand',
      body: 'Instant onboarding\nAI-powered automation\nReal-time collaboration\nTransparent pricing\n---\nWeeks of setup\nManual everything\nEmail-based handoffs\nHidden seat fees',
    },
  },
  {
    id: 'chart-callout-highlight',
    name: 'Chart with Annotation',
    category: 'charts',
    description: 'Bar chart with a key data point called out for emphasis',
    tags: ['chart', 'callout', 'annotation', 'bar'],
    animated: true,
    slide: {
      layout: 'chart',
      variation: 'callout',
      title: 'Revenue by Region',
      variant: 'brand',
      chart: {
        type: 'bar',
        title: 'FY revenue ($M)',
        data: [
          { label: 'NA', value: 6.4 }, { label: 'EMEA', value: 3.1 },
          { label: 'APAC', value: 2.2 }, { label: 'LATAM', value: 0.8 },
        ],
      },
      bgEffect: { type: 'orbs', speed: 0.7, intensity: 0.35, count: 2, size: 60, blur: 100 },
    },
  },
  {
    id: 'stat-cards-exec',
    name: 'Executive KPI Cards',
    category: 'stats',
    description: 'KPIs rendered as elevated floating cards — premium look for exec audiences',
    tags: ['stats', 'kpi', 'cards', 'executive'],
    animated: true,
    slide: {
      layout: 'stats',
      variation: 'cards',
      title: 'Key Metrics',
      variant: 'gradient',
      stats: [
        { value: '$28M', label: 'ARR' },
        { value: '↑ 41%', label: 'Growth YoY' },
        { value: '118%', label: 'NRR' },
        { value: '4.8★', label: 'G2 Rating' },
      ],
      bgEffect: { type: 'mesh', speed: 0.5, intensity: 0.45, blur: 80, hueRotate: 60 },
    },
  },

  // ── Sections & Quotes (additional) ─────────────────────────────
  {
    id: 'section-thank-you',
    name: 'Thank You Closing',
    category: 'sections',
    description: 'Final slide with contact and thanks',
    tags: ['section', 'thank-you', 'closing', 'contact'],
    animated: true,
    slide: {
      layout: 'section',
      title: 'Thank You',
      subtitle: 'Let\'s keep the conversation going — hello@company.com',
      variant: 'gradient',
      bgEffect: { type: 'beam', speed: 0.7, intensity: 0.45, angle: 30, width: 200 },
    },
  },
];

/* ------------------------------------------------------------------ */
/* Default demo-style assignment                                      */
/* Distributes the 7 demo deck styles across all templates so the     */
/* gallery showcases the full TransPerfect / Modern Dark / Editorial /*/
/* Corporate / Vibrant / Terracotta / Brutalist look-and-feel.        */
/* ------------------------------------------------------------------ */
const STYLE_CYCLE: DemoThemeId[] = [
  'transperfect',
  'modern-dark',
  'corporate-navy',
  'vibrant-startup',
  'editorial-light',
  'warm-terracotta',
  'mono-brutalist',
];

// Curated overrides — pin templates to the style they read best in.
const STYLE_OVERRIDES: Record<string, DemoThemeId> = {
  'stat-hero-roi':            'transperfect',
  'stat-grid-4':              'editorial-light',
  'stat-ranked-3':            'transperfect',
  'stat-big-percent':         'modern-dark',
  'stat-trend-dashboard':     'modern-dark',
  'stat-quarterly-vs':        'corporate-navy',
  'chart-bar-quarterly':      'transperfect',
  'chart-line-trend':         'modern-dark',
  'chart-donut':              'vibrant-startup',
  'chart-multi-series':       'corporate-navy',
  'chart-pie-mix':            'warm-terracotta',
  'chart-actual-vs-target':   'transperfect',
  'timeline-horizontal':      'corporate-navy',
  'timeline-year-review':     'transperfect',
  'timeline-roadmap-launch':  'modern-dark',
  'process-linear-4':         'editorial-light',
  'process-funnel-5':         'vibrant-startup',
  'comparison-before-after':  'editorial-light',
  'comparison-pros-cons':     'mono-brutalist',
  'list-agenda-numbered':     'corporate-navy',
  'list-key-points':          'editorial-light',
  'hero-gradient-title':      'transperfect',
  'hero-bold-statement':      'mono-brutalist',
  'section-divider-mesh':     'modern-dark',
  'section-featured-quote':   'warm-terracotta',
  'section-thank-you':        'transperfect',
};

for (let i = 0; i < INFOGRAPHIC_TEMPLATES.length; i++) {
  const t = INFOGRAPHIC_TEMPLATES[i];
  if (!t.theme) {
    t.theme = STYLE_OVERRIDES[t.id] ?? STYLE_CYCLE[i % STYLE_CYCLE.length];
  }
}
