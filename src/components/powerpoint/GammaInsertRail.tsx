import React from 'react';
import { BarChart3, ChevronRight, FileText, Footprints, Image, Layers3, PanelTop, Sparkles, SquareStack, ToggleRight, Type } from 'lucide-react';
import { gammaCardBlocks, type GammaInspiredCardBlock } from '@/services/gammaPresentationResearchService';
import { cn } from '@/lib/utils';

const blockIcons: Record<GammaInspiredCardBlock['type'], React.ElementType> = {
  text: Type,
  image: Image,
  accent_image: PanelTop,
  chart: BarChart3,
  smart_layout: Layers3,
  toggle: ToggleRight,
  nested_card: SquareStack,
  footnote: Footprints,
  embed: FileText,
  infographic: Sparkles,
};

export interface GammaInsertRailProps {
  onInsertBlock?: (block: GammaInspiredCardBlock) => void;
  className?: string;
}

export const GammaInsertRail: React.FC<GammaInsertRailProps> = ({ onInsertBlock, className }) => {
  return (
    <aside className={cn('w-[280px] shrink-0 border-l border-border bg-card p-4', className)}>
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm font-black text-primary">
          <Sparkles className="h-4 w-4" /> Insert Rail
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Gamma-inspired blocks for cards, slides, docs, and web outputs.</p>
      </div>

      <div className="space-y-2">
        {gammaCardBlocks.map((block) => {
          const Icon = blockIcons[block.type];
          return (
            <button
              key={block.id}
              type="button"
              onClick={() => onInsertBlock?.(block)}
              className="group w-full rounded-2xl border border-border bg-background p-3 text-left transition hover:border-primary/50 hover:bg-secondary"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Icon className="h-4 w-4 text-primary" /> {block.label}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5" />
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{block.editorBehavior}</p>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
