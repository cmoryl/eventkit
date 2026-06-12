import React, { useMemo, useState } from 'react';
import { BarChart3, Brain, CheckCircle2, FileText, Layers3, Palette, Play, Rocket, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';
import {
  gammaCreationPresets,
  gammaInspiredCapabilities,
  gammaCardBlocks,
  getGammaCapabilitiesByPriority,
  buildGammaDeckBrainPromptBlock,
  type GammaIntegrationPriority,
} from '@/services/gammaPresentationResearchService';
import { cn } from '@/lib/utils';

const priorityLabels: Record<GammaIntegrationPriority, string> = {
  ship_now: 'Ship now',
  next: 'Next',
  later: 'Later',
  research: 'Research',
};

const areaIcons: Record<string, React.ElementType> = {
  creation: Wand2,
  content_model: Layers3,
  theme: Palette,
  layout: Layers3,
  media: Sparkles,
  interaction: Rocket,
  presentation_runtime: Play,
  publishing: FileText,
  analytics: BarChart3,
  enterprise: ShieldCheck,
  integration: Brain,
  export: CheckCircle2,
};

export const GammaInspiredStudioPanel: React.FC<{ className?: string }> = ({ className }) => {
  const [priority, setPriority] = useState<GammaIntegrationPriority>('ship_now');
  const capabilities = useMemo(() => getGammaCapabilitiesByPriority(priority), [priority]);
  const promptBlock = useMemo(() => buildGammaDeckBrainPromptBlock(), []);

  return (
    <section className={cn('rounded-3xl border border-border bg-card p-5 shadow-sm', className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary">
            <Sparkles className="h-4 w-4" /> Gamma-inspired Studio Intelligence
          </div>
          <h3 className="mt-1 text-xl font-black tracking-tight">Card-first, AI-native presentation building</h3>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Research-backed feature map for bringing Gamma-like creation modes, cards, themes, smart layouts, accent media, runtime controls, publishing, and analytics into Presentation Studio.
          </p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-center text-xs text-primary">
          <div className="font-black">{gammaInspiredCapabilities.length}</div>
          <div>capabilities</div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-5">
        {gammaCreationPresets.map((preset) => (
          <div key={preset.mode} className="rounded-2xl border border-border bg-background p-3">
            <div className="text-xs font-black uppercase tracking-wide text-primary">{preset.label}</div>
            <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{preset.description}</p>
            {preset.defaultDeckStyle && (
              <div className="mt-2 rounded-full bg-secondary px-2 py-1 text-[10px] font-bold capitalize text-secondary-foreground">
                {preset.defaultDeckStyle}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(priorityLabels) as GammaIntegrationPriority[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setPriority(item)}
            className={cn('rounded-full border px-3 py-1.5 text-xs font-bold transition', priority === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-secondary')}
          >
            {priorityLabels[item]}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {capabilities.map((capability) => {
          const Icon = areaIcons[capability.area] || Sparkles;
          return (
            <article key={capability.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-black"><Icon className="h-4 w-4 text-primary" /> {capability.label}</div>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">{capability.area.replace('_', ' ')}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{capability.summary}</p>
              <div className="mt-3 rounded-xl bg-muted p-3 text-xs"><span className="font-bold">Studio update:</span> {capability.productImplication}</div>
            </article>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr,0.9fr]">
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Card/block primitives</div>
          <div className="grid grid-cols-2 gap-2">
            {gammaCardBlocks.map((block) => (
              <div key={block.id} className="rounded-xl border border-border bg-card p-3">
                <div className="text-xs font-black">{block.label}</div>
                <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{block.editorBehavior}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="mb-3 text-xs font-black uppercase tracking-wide text-muted-foreground">Deck Brain prompt block</div>
          <pre className="max-h-[280px] overflow-auto whitespace-pre-wrap rounded-xl bg-muted p-3 text-[11px] text-muted-foreground">{promptBlock}</pre>
        </div>
      </div>
    </section>
  );
};
