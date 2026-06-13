import React, { useMemo, useState } from 'react';
import { BookOpenText, Target } from 'lucide-react';
import {
  buildNarrativeDeckRecipe,
  type PresentationNarrativeIntent,
  type PresentationNarrativeProfile,
} from '@/services/presentationNarrativeEngineService';
import { cn } from '@/lib/utils';

const intents: Array<{ id: PresentationNarrativeIntent; label: string }> = [
  { id: 'persuade', label: 'Persuade' },
  { id: 'inform', label: 'Inform' },
  { id: 'train', label: 'Train' },
  { id: 'sell', label: 'Sell' },
  { id: 'report', label: 'Report' },
  { id: 'launch', label: 'Launch' },
  { id: 'align', label: 'Align' },
];

export const PresentationNarrativePanel: React.FC<{ className?: string }> = ({ className }) => {
  const [intent, setIntent] = useState<PresentationNarrativeIntent>('persuade');
  const profile: PresentationNarrativeProfile = {
    intent,
    audience: 'executive audience',
    tension: 'complex information needs to become a clear decision story',
    desiredAction: 'approve the next step',
    evidenceLevel: 'balanced',
  };
  const recipe = useMemo(() => buildNarrativeDeckRecipe({ title: 'Narrative Recipe', profile }), [intent]);

  return (
    <section className={cn('rounded-3xl border border-border bg-card p-5 shadow-sm', className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary"><BookOpenText className="h-4 w-4" /> Narrative Engine</div>
          <h3 className="mt-1 text-xl font-black tracking-tight">Intent-driven story architecture</h3>
          <p className="mt-1 text-sm text-muted-foreground">Choose the deck intent and the system maps it to the right Smart Block sequence.</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-center text-xs text-primary">
          <div className="font-black">{recipe.slides.length}</div>
          <div>story beats</div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {intents.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setIntent(item.id)}
            className={cn('rounded-full border px-3 py-1.5 text-xs font-bold transition', intent === item.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-secondary')}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-background p-4 text-xs text-muted-foreground">
        <div className="mb-2 flex items-center gap-2 font-bold text-foreground"><Target className="h-4 w-4 text-primary" /> {profile.desiredAction}</div>
        {profile.tension}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {recipe.slides.map((slide, index) => (
          <article key={slide.id} className="rounded-2xl border border-border bg-background p-4 text-xs">
            <div className="text-[10px] font-bold uppercase text-muted-foreground">Beat {index + 1} · {slide.layout}</div>
            <div className="mt-1 text-sm font-black">{slide.title}</div>
            <p className="mt-2 text-muted-foreground">{slide.purpose}</p>
          </article>
        ))}
      </div>
    </section>
  );
};
