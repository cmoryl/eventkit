import React, { useMemo } from 'react';
import { Check, MonitorPlay, Sparkles, BarChart3, Quote, CalendarDays, Layers3 } from 'lucide-react';
import type { DeckTemplate } from './TemplateGallery';
import { cn } from '@/lib/utils';
import { ScaledSlide } from '@/components/slides/ScaledSlide';
import { SlideRenderer } from '@/components/slides/SlideRenderer';
import { resolveDemoThemeId, type SlideData } from '@/components/slides/slideTypes';
import { getThemePack } from '@/components/slides/themePacks';

const isLight = (hex: string) => {
  const bg = hex.replace('#', '');
  if (bg.length < 6) return false;
  const r = parseInt(bg.slice(0, 2), 16);
  const g = parseInt(bg.slice(2, 4), 16);
  const b = parseInt(bg.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 180;
};

const badgeFor = (template: DeckTemplate) => {
  if (template.id.includes('transperfect')) return 'Global brand deck';
  if (template.id.includes('corporate')) return 'Executive report';
  if (template.id.includes('editorial')) return 'Editorial keynote';
  if (template.id.includes('startup')) return 'Launch narrative';
  if (template.id.includes('terracotta')) return 'Warm story deck';
  if (template.id.includes('brutalist')) return 'Bold pitch deck';
  if (template.id.includes('dark')) return 'Dark product deck';
  return 'Prebuilt deck';
};

/** Per-template blueprints — each template gets a distinct mix of layouts
 *  so the mini-deck previews don't all look the same. */
const blueprintFor = (t: DeckTemplate): Array<Omit<SlideData, 'id'>> => {
  const id = t.id.toLowerCase();

  if (id.includes('transperfect')) {
    return [
      { layout: 'title', title: t.name, subtitle: t.description, variant: 'gradient' },
      { layout: 'big-number', title: '120+', body: 'Languages delivered at scale', variant: 'brand' },
      { layout: 'timeline', title: 'Global rollout', variant: 'default', timeline: [
        { year: 'Q1', label: 'Kickoff' }, { year: 'Q2', label: 'Pilot' }, { year: 'Q3', label: 'Launch' },
      ] as any },
    ];
  }
  if (id.includes('modern-dark') || id === 'dark') {
    return [
      { layout: 'title', title: t.name, subtitle: t.description, variant: 'bold' },
      { layout: 'chart', title: 'Monthly active users', variant: 'default', chart: {
        type: 'line', labels: ['Jan','Feb','Mar','Apr','May'], datasets: [{ label: 'MAU', data: [12,18,24,31,42] }],
      } as any },
      { layout: 'two-column', title: 'Ship faster', body: '✓ Type-safe\n✓ Fast HMR\n✓ Edge-ready\n---\n✗ Boilerplate\n✗ Slow builds\n✗ Lock-in', variant: 'minimal' },
    ];
  }
  if (id.includes('editorial')) {
    return [
      { layout: 'full-image', title: t.name, subtitle: 'An editorial keynote', variant: 'default' },
      { layout: 'quote', title: '"Design is intelligence made visible."', quoteAuthor: 'Alina Wheeler', variant: 'minimal' },
      { layout: 'image-left', title: 'A long-form story', body: 'Chapter one\nChapter two\nChapter three', variant: 'default' },
    ];
  }
  if (id.includes('corporate') || id.includes('navy')) {
    return [
      { layout: 'title', title: t.name, subtitle: t.description, variant: 'default' },
      { layout: 'stats', title: 'FY results', variant: 'brand', stats: [
        { value: '$1.2B', label: 'Revenue' }, { value: '38%', label: 'YoY' }, { value: '4.1x', label: 'EPS' },
      ] as any },
      { layout: 'comparison', title: 'Before vs after', body: 'Manual ops\nWeekly reports\nHigh variance\n---\nAutomated\nReal-time\n99.9% SLA', variant: 'default' },
    ];
  }
  if (id.includes('startup') || id.includes('vibrant')) {
    return [
      { layout: 'title', title: t.name, subtitle: t.description, variant: 'bold' },
      { layout: 'process', title: 'How it works', variant: 'default', process: [
        { step: '1', label: 'Sign up' }, { step: '2', label: 'Connect' }, { step: '3', label: 'Launch' },
      ] as any },
      { layout: 'big-number', title: '10×', body: 'Faster onboarding than incumbents', variant: 'brand' },
    ];
  }
  if (id.includes('terracotta') || id.includes('warm')) {
    return [
      { layout: 'image-right', title: t.name, body: 'A warm, lifestyle-led narrative', variant: 'default' },
      { layout: 'quote', title: '"Slow down. Notice the light."', quoteAuthor: 'Studio Notes', variant: 'minimal' },
      { layout: 'stats', title: 'Wellness pulse', variant: 'minimal', stats: [
        { value: '88%', label: 'Calmer' }, { value: '2h', label: 'Saved/wk' }, { value: '4.9★', label: 'Rating' },
      ] as any },
    ];
  }
  if (id.includes('brutalist') || id.includes('mono')) {
    return [
      { layout: 'section', title: t.name, subtitle: t.description, variant: 'bold' },
      { layout: 'big-number', title: '01', body: 'No rules. Just type.', variant: 'default' },
      { layout: 'content', title: 'Manifesto', body: '• Stark\n• Loud\n• Honest\n• Unmissable', variant: 'default' },
    ];
  }

  // Library / fallback — varied based on id hash so cards don't repeat.
  const buckets: Array<Array<Omit<SlideData, 'id'>>> = [
    [
      { layout: 'title', title: t.name, subtitle: t.description, variant: 'gradient' },
      { layout: 'stats', title: 'Highlights', variant: 'brand', stats: [
        { value: '94%', label: 'Adoption' }, { value: '2.4×', label: 'Faster' }, { value: '12M', label: 'Users' },
      ] as any },
      { layout: 'quote', title: '"Make it obvious."', quoteAuthor: 'Studio', variant: 'dark' },
    ],
    [
      { layout: 'full-image', title: t.name, subtitle: t.description, variant: 'default' },
      { layout: 'timeline', title: 'Journey', variant: 'default', timeline: [
        { year: '2023', label: 'Idea' }, { year: '2024', label: 'Build' }, { year: '2025', label: 'Scale' },
      ] as any },
      { layout: 'content', title: "What's inside", body: '• Story\n• Data\n• Vision', variant: 'default' },
    ],
    [
      { layout: 'title', title: t.name, subtitle: t.description, variant: 'bold' },
      { layout: 'chart', title: 'Growth', variant: 'default', chart: {
        type: 'bar', labels: ['Q1','Q2','Q3','Q4'], datasets: [{ label: 'Rev', data: [8,14,22,35] }],
      } as any },
      { layout: 'two-column', title: 'Pros & cons', body: '✓ Clear\n✓ Modular\n✓ Fast\n---\n✗ Cluttered\n✗ Slow\n✗ Rigid', variant: 'minimal' },
    ],
    [
      { layout: 'image-left', title: t.name, body: t.description, variant: 'default' },
      { layout: 'process', title: 'Approach', variant: 'default', process: [
        { step: '1', label: 'Discover' }, { step: '2', label: 'Design' }, { step: '3', label: 'Deliver' },
      ] as any },
      { layout: 'big-number', title: '3×', body: 'More output, same team', variant: 'brand' },
    ],
  ];
  let hash = 0;
  for (let i = 0; i < t.id.length; i++) hash = (hash * 31 + t.id.charCodeAt(i)) >>> 0;
  return buckets[hash % buckets.length];
};

/** Apply the template's OWN palette to slides — so library templates don't all
 *  collapse into "modern-dark" or "editorial-light" via the demo-pack fallback. */
const themeWithTemplate = (
  blueprint: Array<Omit<SlideData, 'id'>>,
  t: DeckTemplate,
): Array<Omit<SlideData, 'id'>> => {
  return blueprint.map((s) => ({
    ...s,
    bgColor: t.palette.bg,
  }));
};

/** Real, themed 3-slide fanned mini-deck shown in the top-right of each card. */
const DeckPreviewVisual = ({ t }: { t: DeckTemplate }) => {
  const slides = useMemo(() => {
    const themeId = resolveDemoThemeId(t.id, { bg: t.palette.bg, text: t.palette.text });
    const pack = getThemePack(themeId);
    const blueprint = blueprintFor(t);
    const themed = themeWithTemplate(blueprint, t);
    return themed.map((s, i) => ({
      ...s,
      id: `${t.id}__poster__${i}`,
      variation: s.variation || pack.variants[s.layout],
      imageUrl:
        s.imageUrl || (['title','full-image','image-left','image-right'].includes(s.layout) ? pack.images[i % Math.max(1, pack.images.length)]?.src : s.imageUrl),
    }));
  }, [t]);

  const brandColors = {
    primary: t.palette.accent,
    secondary: t.palette.secondary,
    accent: t.palette.accent,
  };

  return (
    <div className="pointer-events-none absolute right-4 top-4 h-[58%] w-[52%]">
      {/* Back slide */}
      <div
        className="absolute right-[-2%] top-[-4%] aspect-video w-[70%] overflow-hidden rounded-md shadow-xl ring-1 ring-black/30"
        style={{ transform: 'rotate(7deg)', opacity: 0.5 }}
      >
        <ScaledSlide>
          <SlideRenderer slide={slides[2]} brandColors={brandColors} animated={false} />
        </ScaledSlide>
      </div>
      {/* Middle slide */}
      <div
        className="absolute right-[8%] top-[6%] aspect-video w-[78%] overflow-hidden rounded-md shadow-2xl ring-1 ring-black/35"
        style={{ transform: 'rotate(-4deg)', opacity: 0.85 }}
      >
        <ScaledSlide>
          <SlideRenderer slide={slides[1]} brandColors={brandColors} animated={false} />
        </ScaledSlide>
      </div>
      {/* Front (hero) slide */}
      <div
        className="absolute right-[2%] top-[18%] aspect-video w-[88%] overflow-hidden rounded-md shadow-2xl ring-1 ring-black/40 transition-transform duration-300 group-hover:-translate-y-1"
      >
        <ScaledSlide>
          <SlideRenderer slide={slides[0]} brandColors={brandColors} animated={false} />
        </ScaledSlide>
      </div>
    </div>
  );
};



export interface TemplatePosterPreviewProps {
  template: DeckTemplate;
  selected?: boolean;
  disabled?: boolean;
  saved?: boolean;
  shared?: boolean;
  dense?: boolean;
  onClick?: () => void;
}

export const TemplatePosterPreview: React.FC<TemplatePosterPreviewProps> = ({ template, selected, disabled, saved, shared, dense, onClick }) => {
  const light = isLight(template.palette.bg);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-[32px] border text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl',
        dense ? 'min-h-[220px]' : 'min-h-[310px]',
        selected ? 'border-primary ring-2 ring-primary/40' : 'border-border/70 hover:border-primary/50',
        disabled && 'cursor-not-allowed opacity-50',
      )}
      style={{ color: template.palette.text }}
    >
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${template.palette.bg}, ${light ? '#FFFFFF' : '#0B1020'})` }} />
      <div className="absolute inset-0 opacity-80" style={{ background: `radial-gradient(circle at 18% 18%, ${template.palette.accent}66, transparent 34%), radial-gradient(circle at 82% 18%, ${template.palette.secondary}55, transparent 36%)` }} />
      <DeckPreviewVisual t={template} />

      <div className="relative flex h-full min-h-[inherit] flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex max-w-[75%] flex-wrap gap-2">
            <span className="rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide backdrop-blur-md" style={{ borderColor: `${template.palette.text}33`, background: `${template.palette.bg}70` }}>{badgeFor(template)}</span>
            {saved && <span className="rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide backdrop-blur-md" style={{ borderColor: `${template.palette.text}33`, background: `${template.palette.accent}33` }}>Saved</span>}
            {shared && <span className="rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide backdrop-blur-md" style={{ borderColor: `${template.palette.text}33`, background: `${template.palette.secondary}33` }}>Shared</span>}
          </div>
          {selected && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"><Check className="h-4 w-4" /></span>}
        </div>

        <div className={cn('max-w-[72%]', dense ? 'pt-10' : 'pt-24')}>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1 w-14 rounded-full" style={{ background: template.palette.accent }} />
            <Sparkles className="h-4 w-4 opacity-70" />
          </div>
          <h3 className={cn('font-black leading-[0.92] tracking-tight drop-shadow-sm', dense ? 'text-xl' : 'text-3xl')}>{template.name}</h3>
          <p className="mt-3 line-clamp-2 text-sm font-semibold opacity-80">{template.description || 'Prebuilt PowerPoint system'}</p>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-5">
          <div className="rounded-2xl border p-2 backdrop-blur-md" style={{ borderColor: `${template.palette.text}22`, background: `${template.palette.bg}55` }}><BarChart3 className="h-4 w-4" /><div className="mt-2 h-1 rounded-full" style={{ background: template.palette.accent }} /></div>
          <div className="rounded-2xl border p-2 backdrop-blur-md" style={{ borderColor: `${template.palette.text}22`, background: `${template.palette.bg}55` }}><Quote className="h-4 w-4" /><div className="mt-2 h-1 rounded-full" style={{ background: template.palette.secondary }} /></div>
          <div className="rounded-2xl border p-2 backdrop-blur-md" style={{ borderColor: `${template.palette.text}22`, background: `${template.palette.bg}55` }}><CalendarDays className="h-4 w-4" /><div className="mt-2 h-1 rounded-full" style={{ background: template.palette.text }} /></div>
          <div className="rounded-2xl border p-2 backdrop-blur-md" style={{ borderColor: `${template.palette.text}22`, background: `${template.palette.bg}55` }}><Layers3 className="h-4 w-4" /><div className="mt-2 h-1 rounded-full" style={{ background: template.palette.accent }} /></div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs font-bold opacity-85">
          <span className="flex items-center gap-2"><MonitorPlay className="h-4 w-4" /> Full deck system</span>
          <span className="flex gap-1.5">{[template.palette.accent, template.palette.secondary, template.palette.text].map((color) => <span key={color} className="h-4 w-4 rounded-full border" style={{ background: color, borderColor: `${template.palette.text}44` }} />)}</span>
        </div>
      </div>
    </button>
  );
};
