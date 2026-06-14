import React from 'react';
import { Check, MonitorPlay, Sparkles, BarChart3, Quote, CalendarDays, Layers3, Zap } from 'lucide-react';
import type { DeckTemplate } from './TemplateGallery';
import { cn } from '@/lib/utils';

const isLight = (hex: string) => {
  const bg = hex.replace('#', '');
  if (bg.length < 6) return false;
  const r = parseInt(bg.slice(0, 2), 16);
  const g = parseInt(bg.slice(2, 4), 16);
  const b = parseInt(bg.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 180;
};

const badgeFor = (template: DeckTemplate) => {
  if (template.id.includes('enterprise-ai')) return 'AI command deck';
  if (template.id.includes('global-launch') || template.id.includes('event-experience')) return 'Event system';
  if (template.id.includes('data-observatory')) return 'Data story deck';
  if (template.id.includes('case-study')) return 'Proof story deck';
  if (template.id.includes('product-os')) return 'Product launch';
  if (template.id.includes('boardroom')) return 'Boardroom pack';
  if (template.id.includes('brand-governance')) return 'Brand rules kit';
  if (template.id.includes('thought-leadership')) return 'Editorial POV';
  if (template.id.includes('workshop')) return 'Training lab';
  if (template.id.includes('transperfect')) return 'Global brand deck';
  if (template.id.includes('corporate')) return 'Executive report';
  if (template.id.includes('editorial')) return 'Editorial keynote';
  if (template.id.includes('startup')) return 'Launch narrative';
  if (template.id.includes('terracotta')) return 'Warm story deck';
  if (template.id.includes('brutalist')) return 'Bold pitch deck';
  if (template.id.includes('dark')) return 'Dark product deck';
  return 'Prebuilt deck';
};

const getVisualMode = (template: DeckTemplate) => {
  if (template.id.includes('transperfect')) return 'orb';
  if (template.id.includes('enterprise-ai')) return 'tech';
  if (template.id.includes('global-launch') || template.id.includes('event-experience')) return 'event';
  if (template.id.includes('data-observatory')) return 'data';
  if (template.id.includes('product-os')) return 'product';
  if (template.id.includes('brand-governance')) return 'governance';
  if (template.id.includes('workshop')) return 'workshop';
  if (template.id.includes('corporate') || template.id.includes('boardroom')) return 'executive';
  if (template.id.includes('editorial') || template.id.includes('thought-leadership') || template.id.includes('case-study')) return 'editorial';
  if (template.id.includes('startup')) return 'startup';
  if (template.id.includes('terracotta')) return 'organic';
  if (template.id.includes('brutalist')) return 'brutalist';
  if (template.id.includes('dark')) return 'tech';
  return isLight(template.palette.bg) ? 'libraryLight' : 'libraryDark';
};

const OrbVisual = ({ t }: { t: DeckTemplate }) => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -right-12 -top-10 h-44 w-44 rounded-full blur-xl" style={{ background: `radial-gradient(circle, ${t.palette.accent}, transparent 68%)` }} />
    <div className="absolute bottom-2 left-8 h-36 w-36 rounded-full blur-lg" style={{ background: `radial-gradient(circle, ${t.palette.secondary}, transparent 70%)` }} />
    <div className="absolute left-6 top-20 h-16 w-48 rounded-full border" style={{ borderColor: `${t.palette.accent}66` }} />
  </div>
);

const TechVisual = ({ t }: { t: DeckTemplate }) => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 opacity-35" style={{ backgroundImage: `linear-gradient(90deg, ${t.palette.accent}33 1px, transparent 1px), linear-gradient(${t.palette.accent}22 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
    <div className="absolute right-5 top-5 h-24 w-40 rounded-2xl border p-3 shadow-2xl" style={{ borderColor: `${t.palette.accent}55`, background: `${t.palette.bg}CC` }}>
      <div className="mb-2 flex gap-1"><span className="h-2 w-2 rounded-full" style={{ background: t.palette.accent }} /><span className="h-2 w-2 rounded-full" style={{ background: t.palette.secondary }} /></div>
      <div className="space-y-1.5"><div className="h-1.5 rounded-full" style={{ background: t.palette.text }} /><div className="h-1.5 w-2/3 rounded-full opacity-50" style={{ background: t.palette.text }} /><div className="h-8 rounded-lg opacity-40" style={{ background: t.palette.accent }} /></div>
    </div>
  </div>
);

const DataVisual = ({ t }: { t: DeckTemplate }) => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute right-5 top-7 h-32 w-44 rounded-3xl border p-3" style={{ borderColor: `${t.palette.accent}55`, background: `${t.palette.bg}AA` }}>
      <div className="mb-3 flex items-end gap-1.5">
        {[32, 54, 44, 76, 61, 88].map((height, index) => <span key={index} className="w-4 rounded-t" style={{ height, background: index === 5 ? t.palette.accent : `${t.palette.secondary}AA` }} />)}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {[t.palette.accent, t.palette.secondary, t.palette.text].map((color) => <span key={color} className="h-6 rounded-lg opacity-70" style={{ background: color }} />)}
      </div>
    </div>
    <div className="absolute bottom-8 right-12 h-16 w-28 rounded-full border opacity-50" style={{ borderColor: t.palette.accent }} />
  </div>
);

const EventVisual = ({ t }: { t: DeckTemplate }) => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute right-4 top-4 h-40 w-48 rounded-[2rem] border" style={{ borderColor: `${t.palette.text}33`, background: `linear-gradient(135deg, ${t.palette.secondary}88, ${t.palette.accent}55)` }} />
    <div className="absolute right-10 top-12 h-20 w-28 rounded-2xl bg-black/20 backdrop-blur" />
    <div className="absolute bottom-8 right-8 flex gap-2">
      {[t.palette.accent, t.palette.secondary, t.palette.text].map((color) => <span key={color} className="h-8 w-12 rounded-xl border" style={{ background: `${color}AA`, borderColor: `${t.palette.text}33` }} />)}
    </div>
  </div>
);

const ProductVisual = ({ t }: { t: DeckTemplate }) => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute right-8 top-7 h-36 w-52 rounded-[2rem] border-4 shadow-2xl" style={{ borderColor: `${t.palette.text}55`, background: `${t.palette.bg}CC` }}>
      <div className="m-3 h-24 rounded-2xl" style={{ background: `linear-gradient(135deg, ${t.palette.accent}88, ${t.palette.secondary}66)` }} />
    </div>
    <div className="absolute right-28 top-36 h-2 w-20 rounded-full" style={{ background: t.palette.text }} />
  </div>
);

const GovernanceVisual = ({ t }: { t: DeckTemplate }) => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute right-10 top-12 grid h-36 w-44 grid-cols-2 gap-3">
      {[0, 1, 2, 3].map((i) => <div key={i} className="rounded-2xl border border-dashed p-2" style={{ borderColor: `${t.palette.accent}99`, background: `${t.palette.secondary}55` }}><div className="h-full rounded-xl" style={{ background: i % 2 ? t.palette.bg : t.palette.text }} /></div>)}
    </div>
  </div>
);

const WorkshopVisual = ({ t }: { t: DeckTemplate }) => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute right-6 top-8 grid h-36 w-44 grid-cols-2 gap-3 rotate-[-5deg]">
      {[t.palette.accent, t.palette.secondary, `${t.palette.accent}AA`, `${t.palette.secondary}AA`].map((color, index) => <div key={index} className="rounded-2xl p-3 shadow-xl" style={{ background: color }}><div className="h-1.5 w-2/3 rounded-full bg-white/70" /><div className="mt-2 h-1.5 w-1/2 rounded-full bg-white/45" /></div>)}
    </div>
  </div>
);

const EditorialVisual = ({ t }: { t: DeckTemplate }) => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute right-5 top-5 h-36 w-28 rounded-t-full" style={{ background: `linear-gradient(180deg, ${t.palette.accent}, ${t.palette.secondary})` }} />
    <div className="absolute right-10 top-24 h-24 w-32 bg-white/20 backdrop-blur-sm" />
    <div className="absolute left-5 top-5 h-1 w-20" style={{ background: t.palette.accent }} />
  </div>
);

const ExecutiveVisual = ({ t }: { t: DeckTemplate }) => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute right-5 top-7 flex h-28 w-40 items-end gap-2 rounded-2xl border p-3" style={{ borderColor: `${t.palette.accent}55`, background: `${t.palette.bg}66` }}>
      {[45, 70, 55, 86, 62].map((h, i) => <span key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i === 3 ? t.palette.accent : `${t.palette.secondary}AA` }} />)}
    </div>
    <div className="absolute bottom-8 right-6 h-px w-44" style={{ background: t.palette.accent }} />
  </div>
);

const StartupVisual = ({ t }: { t: DeckTemplate }) => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -right-8 top-8 h-32 w-56 rotate-[-12deg] rounded-[32px]" style={{ background: t.palette.accent }} />
    <div className="absolute right-8 top-20 h-28 w-44 rotate-[8deg] rounded-[28px] border-4" style={{ borderColor: t.palette.secondary, background: `${t.palette.bg}BB` }} />
    <Zap className="absolute right-20 top-28 h-10 w-10" style={{ color: t.palette.text }} />
  </div>
);

const OrganicVisual = ({ t }: { t: DeckTemplate }) => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute right-8 top-4 h-44 w-32 rounded-full" style={{ background: `${t.palette.secondary}99` }} />
    <div className="absolute right-20 top-20 h-24 w-24 rounded-full" style={{ background: `${t.palette.accent}88` }} />
    <div className="absolute right-10 top-20 h-28 w-px rotate-12" style={{ background: t.palette.text }} />
  </div>
);

const BrutalistVisual = ({ t }: { t: DeckTemplate }) => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute right-0 top-0 flex h-full w-1/2 items-center justify-center text-[9rem] font-black leading-none opacity-90" style={{ color: t.palette.accent }}>01</div>
    <div className="absolute right-8 bottom-8 h-14 w-36 border-4" style={{ borderColor: t.palette.text }} />
  </div>
);

const LibraryVisual = ({ t }: { t: DeckTemplate }) => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute right-4 top-4 grid h-32 w-40 grid-cols-2 gap-2">
      {[t.palette.accent, t.palette.secondary, `${t.palette.text}99`, `${t.palette.bg}CC`].map((color, i) => <div key={i} className="rounded-2xl border" style={{ background: color, borderColor: `${t.palette.text}33` }} />)}
    </div>
  </div>
);

const Visual = ({ template }: { template: DeckTemplate }) => {
  const mode = getVisualMode(template);
  if (mode === 'orb') return <OrbVisual t={template} />;
  if (mode === 'tech') return <TechVisual t={template} />;
  if (mode === 'data') return <DataVisual t={template} />;
  if (mode === 'event') return <EventVisual t={template} />;
  if (mode === 'product') return <ProductVisual t={template} />;
  if (mode === 'governance') return <GovernanceVisual t={template} />;
  if (mode === 'workshop') return <WorkshopVisual t={template} />;
  if (mode === 'editorial') return <EditorialVisual t={template} />;
  if (mode === 'executive') return <ExecutiveVisual t={template} />;
  if (mode === 'startup') return <StartupVisual t={template} />;
  if (mode === 'organic') return <OrganicVisual t={template} />;
  if (mode === 'brutalist') return <BrutalistVisual t={template} />;
  return <LibraryVisual t={template} />;
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
      <Visual template={template} />

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
