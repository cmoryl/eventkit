import React, { useMemo } from 'react';
import { ChefHat, CheckCircle2 } from 'lucide-react';
import type { PresentationSmartBlockType } from '@/services/presentationSmartBlockService';
import { buildPresentationDeckRecipe } from '@/services/presentationDeckRecipeService';
import { cn } from '@/lib/utils';

export const PresentationDeckRecipePanel: React.FC<{
  title?: string;
  goal?: string;
  selectedSmartBlocks?: PresentationSmartBlockType[];
  className?: string;
}> = ({ title = 'Presentation Deck Recipe', goal, selectedSmartBlocks, className }) => {
  const recipe = useMemo(() => buildPresentationDeckRecipe({ title, goal, selectedSmartBlocks }), [title, goal, selectedSmartBlocks]);

  return (
    <section className={cn('rounded-3xl border border-border bg-card p-5 shadow-sm', className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary"><ChefHat className="h-4 w-4" /> Deck Recipe</div>
          <h3 className="mt-1 text-xl font-black tracking-tight">Deterministic slide plan</h3>
          <p className="mt-1 text-sm text-muted-foreground">A recipe-based deck structure built from Smart Blocks, with editable regions and quality checks.</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-center text-xs text-primary">
          <div className="font-black">{recipe.slides.length}</div>
          <div>recipe slides</div>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-border bg-background p-4 text-xs text-muted-foreground">
        <span className="font-bold text-foreground">Arc:</span> {recipe.narrativeArc}
      </div>

      <div className="space-y-3">
        {recipe.slides.map((slide, index) => (
          <article key={slide.id} className="rounded-2xl border border-border bg-background p-4 text-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase text-muted-foreground">Slide {index + 1} · {slide.layout}</div>
                <div className="mt-1 text-sm font-black">{slide.title}</div>
              </div>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-muted-foreground">{slide.purpose}</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <div className="rounded-xl bg-muted p-2"><span className="font-bold">Inputs:</span> {slide.requiredInputs.join(', ')}</div>
              <div className="rounded-xl bg-muted p-2"><span className="font-bold">Editable:</span> {slide.editableRegions.join(', ')}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
