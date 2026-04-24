// Slide data types for the editor
export type SlideLayout =
  | 'title' | 'content' | 'image-left' | 'image-right' | 'blank'
  | 'section' | 'two-column' | 'quote' | 'stats' | 'full-image'
  | 'comparison' | 'timeline' | 'process' | 'chart';

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  title?: string;
  data: Array<{ label: string; value: number }>;
  /** Optional second series for grouped bar/line */
  series2?: Array<{ label: string; value: number }>;
  series2Name?: string;
  series1Name?: string;
}

export interface TimelineStep {
  date?: string;
  title: string;
  description?: string;
}

export interface ProcessStep {
  title: string;
  description?: string;
}

export interface SlideData {
  id: string;
  layout: SlideLayout;
  title: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  /** Extracted images as data URLs */
  images?: string[];
  notes?: string;
  variant: 'default' | 'dark' | 'gradient' | 'minimal' | 'brand' | 'bold';
  /** Custom background color (hex) */
  bgColor?: string;
  /** Text alignment override */
  textAlign?: 'left' | 'center' | 'right';
  /** Heading font size override (px at 1920x1080) */
  headingSize?: number;
  /** Body font size override (px at 1920x1080) */
  bodySize?: number;
  /** Quote attribution */
  quoteAuthor?: string;
  /** Stats entries for stats layout */
  stats?: { value: string; label: string }[];
  /** Chart configuration for chart layout */
  chart?: ChartData;
  /** Timeline steps for timeline layout */
  timeline?: TimelineStep[];
  /** Process steps for process layout */
  process?: ProcessStep[];
  /** AI-suggested image search query (used for smart matching) */
  imageQuery?: string;
  /** AI-suggested BrandHub category for the image */
  assetCategory?: string;
  /** True if AI flagged this slide to need manual image pick */
  needsImage?: boolean;
}

export const DEFAULT_SLIDES: SlideData[] = [
  {
    id: 'slide-1',
    layout: 'title',
    title: 'Presentation Title',
    subtitle: 'Your subtitle goes here',
    variant: 'gradient',
  },
  {
    id: 'slide-2',
    layout: 'content',
    title: 'Key Points',
    body: '• First important point\n• Second important point\n• Third important point',
    variant: 'default',
  },
  {
    id: 'slide-3',
    layout: 'section',
    title: 'Thank You',
    subtitle: 'Questions?',
    variant: 'dark',
  },
];

export const SLIDE_TEMPLATES: { name: string; slides: Omit<SlideData, 'id'>[] }[] = [
  {
    name: 'Keynote',
    slides: [
      { layout: 'title', title: 'Keynote Title', subtitle: 'Speaker Name • Date', variant: 'gradient' },
      { layout: 'content', title: 'Agenda', body: '• Introduction\n• Key Topics\n• Demo\n• Q&A', variant: 'default' },
      { layout: 'stats', title: 'By the Numbers', variant: 'brand', stats: [
        { value: '10K+', label: 'Active Users' },
        { value: '99.9%', label: 'Uptime SLA' },
        { value: '4.8★', label: 'CSAT Rating' },
        { value: '38', label: 'Countries' },
      ]},
      { layout: 'chart', title: 'Monthly Active Users', variant: 'default', chart: {
        type: 'line', title: 'MAU growth (last 6 months)',
        data: [
          { label: 'Jan', value: 6200 }, { label: 'Feb', value: 6900 }, { label: 'Mar', value: 7800 },
          { label: 'Apr', value: 8500 }, { label: 'May', value: 9400 }, { label: 'Jun', value: 10800 },
        ],
      }},
      { layout: 'chart', title: 'Where Users Spend Time', variant: 'minimal', chart: {
        type: 'doughnut', title: 'Feature usage share',
        data: [
          { label: 'Editor', value: 42 }, { label: 'Library', value: 23 },
          { label: 'Sharing', value: 18 }, { label: 'Settings', value: 9 }, { label: 'Other', value: 8 },
        ],
      }},
      { layout: 'quote', title: '"Innovation distinguishes between a leader and a follower."', quoteAuthor: 'Steve Jobs', variant: 'dark' },
      { layout: 'section', title: 'Thank You', subtitle: 'Questions?', variant: 'gradient' },
    ],
  },
  {
    name: 'Pitch Deck',
    slides: [
      { layout: 'title', title: 'Company Name', subtitle: 'Tagline that captures your vision', variant: 'bold' },
      { layout: 'content', title: 'The Problem', body: '• Pain point one\n• Pain point two\n• Pain point three', variant: 'default' },
      { layout: 'stats', title: 'Market Size', variant: 'minimal', stats: [
        { value: '$84B', label: 'TAM' },
        { value: '$12B', label: 'SAM' },
        { value: '$1.4B', label: 'SOM by 2028' },
      ]},
      { layout: 'content', title: 'Our Solution', body: '• Feature one\n• Feature two\n• Feature three', variant: 'default' },
      { layout: 'chart', title: 'ARR Growth', variant: 'brand', chart: {
        type: 'bar', title: 'Annual recurring revenue ($M)',
        data: [
          { label: '2021', value: 0.4 }, { label: '2022', value: 1.1 },
          { label: '2023', value: 2.0 }, { label: '2024', value: 4.6 }, { label: '2025E', value: 9.2 },
        ],
      }},
      { layout: 'stats', title: 'Traction', variant: 'brand', stats: [
        { value: '$2M', label: 'ARR' },
        { value: '150%', label: 'YoY Growth' },
        { value: '500+', label: 'Customers' },
        { value: '118%', label: 'Net Retention' },
      ]},
      { layout: 'chart', title: 'Revenue Mix', variant: 'default', chart: {
        type: 'pie', title: 'Revenue by segment',
        data: [
          { label: 'Enterprise', value: 58 }, { label: 'Mid-market', value: 27 }, { label: 'SMB', value: 15 },
        ],
      }},
      { layout: 'comparison', title: 'Before vs After', body: 'Manual processes\nSlow turnaround\nHigh error rate\n---\nAutomated workflows\nInstant results\n99.9% accuracy', variant: 'default' },
      { layout: 'timeline', title: 'Roadmap', variant: 'default', timeline: [
        { date: 'Q1', title: 'Launch v2.0', description: 'New editor + collaboration' },
        { date: 'Q2', title: 'EU Expansion', description: 'GDPR-ready, EU region' },
        { date: 'Q3', title: 'Mobile App', description: 'iOS + Android GA' },
        { date: 'Q4', title: '$10M ARR', description: 'Reach milestone' },
      ]},
      { layout: 'section', title: 'Let\'s Talk', subtitle: 'hello@company.com', variant: 'gradient' },
    ],
  },
  {
    name: 'Workshop',
    slides: [
      { layout: 'title', title: 'Workshop Title', subtitle: 'Hands-on learning session', variant: 'brand' },
      { layout: 'content', title: 'What You\'ll Learn', body: '• Skill one\n• Skill two\n• Skill three\n• Skill four', variant: 'default' },
      { layout: 'stats', title: 'Today\'s Session', variant: 'minimal', stats: [
        { value: '90', label: 'Minutes' },
        { value: '4', label: 'Exercises' },
        { value: '3', label: 'Live Demos' },
      ]},
      { layout: 'process', title: 'Our Method', variant: 'default', process: [
        { title: 'Discover', description: 'Frame the problem' },
        { title: 'Design', description: 'Sketch solutions' },
        { title: 'Build', description: 'Prototype quickly' },
        { title: 'Test', description: 'Validate with users' },
      ]},
      { layout: 'image-left', title: 'Step-by-Step', body: '1. First step\n2. Second step\n3. Third step', variant: 'default' },
      { layout: 'chart', title: 'Skill Confidence (pre vs post)', variant: 'default', chart: {
        type: 'bar', title: 'Self-rated 1-10',
        data: [
          { label: 'Research', value: 4 }, { label: 'Design', value: 5 },
          { label: 'Prototype', value: 3 }, { label: 'Test', value: 4 },
        ],
        series2: [
          { label: 'Research', value: 8 }, { label: 'Design', value: 9 },
          { label: 'Prototype', value: 7 }, { label: 'Test', value: 8 },
        ],
        series1Name: 'Before', series2Name: 'After',
      }},
      { layout: 'two-column', title: 'Tips & Tricks', body: '✓ Do this\n✓ And this\n✓ Also this\n---\n✗ Avoid this\n✗ And this\n✗ Also this', variant: 'minimal' },
      { layout: 'section', title: 'Practice Time!', subtitle: '15 minutes', variant: 'bold' },
    ],
  },
  {
    name: 'Report',
    slides: [
      { layout: 'title', title: 'Q4 Report', subtitle: 'Performance Overview', variant: 'minimal' },
      { layout: 'stats', title: 'Key Metrics', variant: 'default', stats: [
        { value: '↑ 24%', label: 'Revenue' },
        { value: '↑ 18%', label: 'Users' },
        { value: '↓ 5%', label: 'Churn' },
        { value: '92', label: 'NPS' },
      ]},
      { layout: 'chart', title: 'Quarterly Revenue', variant: 'default', chart: {
        type: 'bar', title: 'Revenue by quarter ($M)',
        data: [
          { label: 'Q1', value: 0.9 }, { label: 'Q2', value: 1.1 },
          { label: 'Q3', value: 1.2 }, { label: 'Q4', value: 1.5 },
        ],
      }},
      { layout: 'chart', title: 'Revenue by Region', variant: 'minimal', chart: {
        type: 'doughnut', title: 'Geographic split',
        data: [
          { label: 'NA', value: 52 }, { label: 'EMEA', value: 28 },
          { label: 'APAC', value: 14 }, { label: 'LATAM', value: 6 },
        ],
      }},
      { layout: 'chart', title: 'User Growth Trend', variant: 'default', chart: {
        type: 'line', title: 'Monthly active users (thousands)',
        data: [
          { label: 'Jul', value: 6.4 }, { label: 'Aug', value: 7.1 }, { label: 'Sep', value: 7.8 },
          { label: 'Oct', value: 8.5 }, { label: 'Nov', value: 9.2 }, { label: 'Dec', value: 10.0 },
        ],
      }},
      { layout: 'comparison', title: 'Q3 vs Q4', body: 'Revenue: $1.2M\nUsers: 8,500\nChurn: 7%\nNPS: 84\n---\nRevenue: $1.5M\nUsers: 10,000\nChurn: 5%\nNPS: 92', variant: 'default' },
      { layout: 'stats', title: 'Operational Health', variant: 'brand', stats: [
        { value: '99.97%', label: 'Uptime' },
        { value: '142ms', label: 'P95 Latency' },
        { value: '0.04%', label: 'Error Rate' },
        { value: '12m', label: 'MTTR' },
      ]},
      { layout: 'content', title: 'Next Quarter Goals', body: '• Launch v2.0\n• Expand to EU market\n• Hire 10 engineers\n• Achieve $2M ARR', variant: 'default' },
      { layout: 'section', title: 'Questions?', variant: 'dark' },
    ],
  },
  {
    name: 'Data Story',
    slides: [
      { layout: 'title', title: 'The State of Our Market', subtitle: 'A data-driven narrative', variant: 'gradient' },
      { layout: 'stats', title: 'Headline Numbers', variant: 'brand', stats: [
        { value: '3.2x', label: 'Category Growth' },
        { value: '64%', label: 'Adoption Rate' },
        { value: '$48B', label: 'Spend in 2025' },
        { value: '12M', label: 'New Buyers' },
      ]},
      { layout: 'chart', title: 'Category Growth (5 years)', variant: 'default', chart: {
        type: 'line', title: 'Total addressable spend ($B)',
        data: [
          { label: '2021', value: 15 }, { label: '2022', value: 22 },
          { label: '2023', value: 31 }, { label: '2024', value: 39 }, { label: '2025', value: 48 },
        ],
      }},
      { layout: 'chart', title: 'Where the Money Goes', variant: 'minimal', chart: {
        type: 'pie', title: 'Spend by category',
        data: [
          { label: 'Software', value: 41 }, { label: 'Services', value: 27 },
          { label: 'Hardware', value: 19 }, { label: 'Training', value: 13 },
        ],
      }},
      { layout: 'chart', title: 'Adoption by Segment', variant: 'default', chart: {
        type: 'bar', title: '% of companies adopting',
        data: [
          { label: 'Enterprise', value: 78 }, { label: 'Mid-market', value: 61 },
          { label: 'SMB', value: 42 }, { label: 'Startup', value: 71 },
        ],
      }},
      { layout: 'stats', title: 'What It Means', variant: 'minimal', stats: [
        { value: '+18pp', label: 'YoY Adoption' },
        { value: '7 of 10', label: 'Plan to Expand' },
        { value: '<2 yrs', label: 'Avg Payback' },
      ]},
      { layout: 'section', title: 'The Takeaway', subtitle: 'The window to lead is now', variant: 'dark' },
    ],
  },
  {
    name: 'Infographic',
    slides: [
      { layout: 'title', title: 'Year in Review', subtitle: 'Visualized', variant: 'bold' },
      { layout: 'stats', title: 'At a Glance', variant: 'brand', stats: [
        { value: '1.2M', label: 'Sessions' },
        { value: '340K', label: 'Signups' },
        { value: '92%', label: 'Retention' },
        { value: '4.9★', label: 'App Rating' },
      ]},
      { layout: 'chart', title: 'Traffic by Channel', variant: 'minimal', chart: {
        type: 'doughnut', title: 'Acquisition mix',
        data: [
          { label: 'Organic', value: 38 }, { label: 'Paid', value: 24 },
          { label: 'Referral', value: 18 }, { label: 'Social', value: 14 }, { label: 'Direct', value: 6 },
        ],
      }},
      { layout: 'process', title: 'Our Funnel', variant: 'default', process: [
        { title: 'Visit', description: '1.2M sessions' },
        { title: 'Signup', description: '340K accounts' },
        { title: 'Activate', description: '210K aha moments' },
        { title: 'Pay', description: '46K subscribers' },
      ]},
      { layout: 'chart', title: 'Engagement Over Time', variant: 'default', chart: {
        type: 'line', title: 'Daily active users (k)',
        data: [
          { label: 'Jan', value: 22 }, { label: 'Mar', value: 28 }, { label: 'May', value: 35 },
          { label: 'Jul', value: 41 }, { label: 'Sep', value: 49 }, { label: 'Nov', value: 58 },
        ],
      }},
      { layout: 'timeline', title: 'Milestones', variant: 'minimal', timeline: [
        { date: 'Feb', title: 'Mobile launch', description: 'iOS + Android' },
        { date: 'May', title: '100K users', description: 'Crossed milestone' },
        { date: 'Aug', title: 'Series A', description: '$12M raised' },
        { date: 'Nov', title: 'Global rollout', description: '38 countries live' },
      ]},
      { layout: 'section', title: 'Onward', subtitle: 'The story continues', variant: 'gradient' },
    ],
  },
];
