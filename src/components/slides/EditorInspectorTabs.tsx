import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BadgeCheck,
  BoxSelect,
  CheckCircle2,
  FileText,
  Image,
  LayoutTemplate,
  Layers3,
  Palette,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Type,
  Wand2,
} from 'lucide-react';
import type { SlideData } from './slideTypes';
import { cn } from '@/lib/utils';

export type EditorInspectorTabId = 'content' | 'layout' | 'style' | 'media' | 'data' | 'advanced';

const tabs: Array<{ id: EditorInspectorTabId; label: string; icon: React.ElementType }> = [
  { id: 'content', label: 'Content', icon: Type },
  { id: 'layout', label: 'Layout', icon: LayoutTemplate },
  { id: 'style', label: 'Style', icon: Palette },
  { id: 'media', label: 'Media', icon: Image },
  { id: 'data', label: 'Data', icon: BarChart3 },
  { id: 'advanced', label: 'Advanced', icon: Settings2 },
];

const FieldCard: React.FC<{ label: string; value: string; icon: React.ElementType; tone?: 'default' | 'good' | 'warn' }> = ({ label, value, icon: Icon, tone = 'default' }) => (
  <div className={cn(
    'rounded-xl border p-3',
    tone === 'good' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    tone === 'warn' && 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    tone === 'default' && 'border-border bg-background text-foreground',
  )}>
    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</div>
    <div className="mt-1 text-xs font-black">{value}</div>
  </div>
);

const ControlButton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <button type="button" className="rounded-xl border border-border bg-background px-3 py-2 text-left text-[11px] font-bold transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary">
    {children}
  </button>
);

export const EditorInspectorTabs: React.FC<{
  slide?: SlideData;
  className?: string;
}> = ({ slide, className }) => {
  const [activeTab, setActiveTab] = useState<EditorInspectorTabId>('content');
  const slideSummary = useMemo(() => ({
    title: slide?.title || 'Untitled slide',
    layout: slide?.layout || 'No layout',
    variant: slide?.variant || 'default',
    hasImage: Boolean(slide?.imageUrl || slide?.images?.length),
    hasBody: Boolean(slide?.body),
    hasBackground: Boolean(slide?.bgColor || slide?.backgroundImage),
  }), [slide]);

  const renderPanel = () => {
    if (activeTab === 'content') {
      return (
        <div className="space-y-3">
          <FieldCard label="Title" value={slideSummary.title} icon={FileText} tone={slideSummary.title === 'Untitled slide' ? 'warn' : 'good'} />
          <FieldCard label="Body copy" value={slideSummary.hasBody ? 'Copy present' : 'Needs body or supporting line'} icon={Type} tone={slideSummary.hasBody ? 'good' : 'warn'} />
          <div className="grid grid-cols-2 gap-2">
            <ControlButton>Rewrite shorter</ControlButton>
            <ControlButton>Make executive</ControlButton>
            <ControlButton>Add proof point</ControlButton>
            <ControlButton>Fix hierarchy</ControlButton>
          </div>
        </div>
      );
    }

    if (activeTab === 'layout') {
      return (
        <div className="space-y-3">
          <FieldCard label="Current layout" value={slideSummary.layout} icon={LayoutTemplate} />
          <FieldCard label="Safe area" value="Margins visible" icon={BoxSelect} tone="good" />
          <div className="grid grid-cols-2 gap-2">
            <ControlButton>Auto-fit content</ControlButton>
            <ControlButton>Balance spacing</ControlButton>
            <ControlButton>Swap layout</ControlButton>
            <ControlButton>Align objects</ControlButton>
          </div>
        </div>
      );
    }

    if (activeTab === 'style') {
      return (
        <div className="space-y-3">
          <FieldCard label="Variant" value={slideSummary.variant} icon={Palette} />
          <FieldCard label="Background" value={slideSummary.hasBackground ? 'Custom background set' : 'Using theme background'} icon={Layers3} tone={slideSummary.hasBackground ? 'good' : 'default'} />
          <div className="grid grid-cols-2 gap-2">
            <ControlButton>Apply brand</ControlButton>
            <ControlButton>Improve contrast</ControlButton>
            <ControlButton>Polish type</ControlButton>
            <ControlButton>Dark mode view</ControlButton>
          </div>
        </div>
      );
    }

    if (activeTab === 'media') {
      return (
        <div className="space-y-3">
          <FieldCard label="Image slot" value={slideSummary.hasImage ? 'Media attached' : 'Drop image or choose asset'} icon={Image} tone={slideSummary.hasImage ? 'good' : 'warn'} />
          <FieldCard label="Logo safety" value="Exact logo only" icon={ShieldCheck} tone="good" />
          <div className="grid grid-cols-2 gap-2">
            <ControlButton>Replace image</ControlButton>
            <ControlButton>Crop smart</ControlButton>
            <ControlButton>Open assets</ControlButton>
            <ControlButton>Check rights</ControlButton>
          </div>
        </div>
      );
    }

    if (activeTab === 'data') {
      return (
        <div className="space-y-3">
          <FieldCard label="Data story" value={slide?.chartData ? 'Chart data detected' : 'No chart data on slide'} icon={BarChart3} tone={slide?.chartData ? 'good' : 'default'} />
          <FieldCard label="Readability" value="Labels must stay export-safe" icon={BadgeCheck} tone="good" />
          <div className="grid grid-cols-2 gap-2">
            <ControlButton>Add chart</ControlButton>
            <ControlButton>Use KPI card</ControlButton>
            <ControlButton>Annotate insight</ControlButton>
            <ControlButton>Check labels</ControlButton>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <FieldCard label="Automation" value="Command routes through canonical actions" icon={Wand2} tone="good" />
        <FieldCard label="Export risk" value="QA and preflight required" icon={AlertTriangle} tone="warn" />
        <div className="grid grid-cols-2 gap-2">
          <ControlButton>Run QA</ControlButton>
          <ControlButton>Export check</ControlButton>
          <ControlButton>Save snapshot</ControlButton>
          <ControlButton>View history</ControlButton>
        </div>
      </div>
    );
  };

  return (
    <div className={cn('rounded-2xl border border-border bg-card text-xs shadow-sm', className)}>
      <div className="border-b border-border p-3">
        <div className="flex items-center gap-2 font-black text-primary"><Sparkles className="h-4 w-4" /> Smart Inspector</div>
        <p className="mt-1 text-muted-foreground">Right-side editing controls organized by the task the user is trying to complete.</p>
      </div>
      <div className="grid grid-cols-3 gap-1 p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn('rounded-xl px-2 py-2 font-bold transition', active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground')}
            >
              <Icon className="mx-auto mb-1 h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="space-y-3 border-t border-border p-3">
        <div className="rounded-xl bg-muted p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-black capitalize">{activeTab} controls</div>
              <p className="mt-1 text-muted-foreground">{slideSummary.title} · {slideSummary.layout}</p>
            </div>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-primary">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.16em]">Selected layer</div>
              <div className="mt-1 font-black">Slide canvas</div>
            </div>
            <Layers3 className="h-4 w-4" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-black">
            <div className="rounded-lg bg-background/80 p-2 text-center text-foreground">Move</div>
            <div className="rounded-lg bg-background/80 p-2 text-center text-foreground">Resize</div>
            <div className="rounded-lg bg-background/80 p-2 text-center text-foreground">Lock</div>
          </div>
        </div>
        {renderPanel()}
        <div className="rounded-xl border border-border bg-background p-3 text-muted-foreground">
          <div className="mb-1 flex items-center gap-2 font-black text-foreground"><SlidersHorizontal className="h-3.5 w-3.5 text-primary" /> Control rule</div>
          Keep the current task obvious, make changes reversible, and reserve advanced controls for users who need them.
        </div>
      </div>
    </div>
  );
};
