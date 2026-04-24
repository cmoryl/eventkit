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
      { layout: 'stats', title: 'By the Numbers', variant: 'brand', stats: [{ value: '10K+', label: 'Users' }, { value: '99.9%', label: 'Uptime' }, { value: '4.8★', label: 'Rating' }] },
      { layout: 'quote', title: '"Innovation distinguishes between a leader and a follower."', quoteAuthor: 'Steve Jobs', variant: 'dark' },
      { layout: 'section', title: 'Thank You', subtitle: 'Questions?', variant: 'gradient' },
    ],
  },
  {
    name: 'Pitch Deck',
    slides: [
      { layout: 'title', title: 'Company Name', subtitle: 'Tagline that captures your vision', variant: 'bold' },
      { layout: 'content', title: 'The Problem', body: '• Pain point one\n• Pain point two\n• Pain point three', variant: 'default' },
      { layout: 'content', title: 'Our Solution', body: '• Feature one\n• Feature two\n• Feature three', variant: 'default' },
      { layout: 'stats', title: 'Traction', variant: 'brand', stats: [{ value: '$2M', label: 'ARR' }, { value: '150%', label: 'Growth' }, { value: '500+', label: 'Customers' }] },
      { layout: 'comparison', title: 'Before vs After', body: 'Manual processes\nSlow turnaround\nHigh error rate\n---\nAutomated workflows\nInstant results\n99.9% accuracy', variant: 'default' },
      { layout: 'section', title: 'Let\'s Talk', subtitle: 'hello@company.com', variant: 'gradient' },
    ],
  },
  {
    name: 'Workshop',
    slides: [
      { layout: 'title', title: 'Workshop Title', subtitle: 'Hands-on learning session', variant: 'brand' },
      { layout: 'content', title: 'What You\'ll Learn', body: '• Skill one\n• Skill two\n• Skill three\n• Skill four', variant: 'default' },
      { layout: 'image-left', title: 'Step-by-Step', body: '1. First step\n2. Second step\n3. Third step', variant: 'default' },
      { layout: 'two-column', title: 'Tips & Tricks', body: '✓ Do this\n✓ And this\n✓ Also this\n---\n✗ Avoid this\n✗ And this\n✗ Also this', variant: 'minimal' },
      { layout: 'section', title: 'Practice Time!', subtitle: '15 minutes', variant: 'bold' },
    ],
  },
  {
    name: 'Report',
    slides: [
      { layout: 'title', title: 'Q4 Report', subtitle: 'Performance Overview', variant: 'minimal' },
      { layout: 'stats', title: 'Key Metrics', variant: 'default', stats: [{ value: '↑ 24%', label: 'Revenue' }, { value: '↑ 18%', label: 'Users' }, { value: '↓ 5%', label: 'Churn' }, { value: '92', label: 'NPS' }] },
      { layout: 'comparison', title: 'Q3 vs Q4', body: 'Revenue: $1.2M\nUsers: 8,500\nChurn: 7%\n---\nRevenue: $1.5M\nUsers: 10,000\nChurn: 5%', variant: 'default' },
      { layout: 'content', title: 'Next Quarter Goals', body: '• Launch v2.0\n• Expand to EU market\n• Hire 10 engineers\n• Achieve $2M ARR', variant: 'default' },
      { layout: 'section', title: 'Questions?', variant: 'dark' },
    ],
  },
];
