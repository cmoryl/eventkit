import React, { useMemo, useState } from 'react';
import { ArrowRight, Bot, CheckCircle2, LayoutDashboard, Layers3, Palette, Rocket, Search, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';
import { routePresentationCommand } from '@/services/presentationCommandRouterService';

const lanes = [
  { id: 'source', label: 'Source', detail: 'Files, URLs, pasted notes, old decks', icon: Layers3 },
  { id: 'generate', label: 'Generate', detail: 'Outline, deck recipe, smart blocks', icon: Wand2 },
  { id: 'design', label: 'Design', detail: 'Themes, templates, master slides', icon: Palette },
  { id: 'assets', label: 'Assets', detail: 'Drag/drop logos, renders, charts, images', icon: LayoutDashboard },
  { id: 'qa', label: 'QA', detail: 'Brand, logo, export, accessibility', icon: ShieldCheck },
  { id: 'publish', label: 'Publish', detail: 'PPTX, PDF, share, reuse', icon: Rocket },
];

const gammaBeaters = [
  'Exact-logo governance instead of logo approximation',
  'Template slots with controlled drag/drop zones',
  'Export readiness and PPTX fidelity before handoff',
  'Asset intelligence tied to each slide template',
  'Human-review gates for enterprise brand safety',
];

export const PresentationBetterThanGammaSurface: React.FC = () => {
  const [command, setCommand] = useState('Turn this into an executive keynote with premium assets and export QA');
  const route = useMemo(() => routePresentationCommand(command), [command]);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
      <div className="relative border-b border-border bg-gradient-to-br from-primary/15 via-background to-background p-6">
        <div className="absolute right-6 top-6 hidden rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-primary backdrop-blur md:block">
          Better than Gamma mode
        </div>
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-black uppercase tracking-[0.18em]">
            <Bot className="h-3.5 w-3.5" /> AI Presentation OS
          </div>
          <h2 className="text-3xl font-black tracking-tight md:text-4xl">Command-first deck creation, with enterprise controls.</h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            A production interface for creating, editing, governing, and exporting brand-safe presentations with richer template systems and asset-aware workflows.
          </p>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              className="h-14 w-full rounded-2xl border border-border bg-background/90 pl-11 pr-4 text-sm font-semibold outline-none ring-0 transition focus:border-primary"
              placeholder="Describe the deck, audience, style, and export goal..."
            />
          </label>
          <button type="button" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-sm">
            Run deck operator <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Production workflow
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {lanes.map((lane) => {
              const Icon = lane.icon;
              return (
                <div key={lane.id} className="rounded-2xl border border-border bg-background/80 p-4">
                  <Icon className="mb-3 h-5 w-5 text-primary" />
                  <div className="font-black">{lane.label}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{lane.detail}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border bg-muted/35 p-5 lg:border-l lg:border-t-0">
          <div className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-primary">Command route</div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="text-sm font-black">{route.intent.label}</div>
            <p className="mt-1 text-xs text-muted-foreground">{route.summary}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {route.actions.slice(0, 4).map((action) => (
                <span key={action.id} className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">{action.label}</span>
              ))}
            </div>
          </div>

          <div className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-primary">Why this beats Gamma</div>
          <div className="mt-3 space-y-2">
            {gammaBeaters.map((item) => (
              <div key={item} className="flex items-start gap-2 rounded-xl bg-background/80 p-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
