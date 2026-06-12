import React from 'react';
import { BriefcaseBusiness, Eye, Layers3, Minimize2 } from 'lucide-react';
import type { GammaDeckStyle } from '@/services/gammaPresentationResearchService';
import { cn } from '@/lib/utils';

const styles: Array<{ id: GammaDeckStyle; label: string; description: string; icon: React.ElementType }> = [
  { id: 'minimal', label: 'Minimal', description: 'Clean, sparse, precise, low visual noise.', icon: Minimize2 },
  { id: 'visual', label: 'Visual', description: 'Bolder layouts, more imagery, stronger rhythm.', icon: Eye },
  { id: 'classic', label: 'Classic', description: 'Familiar business deck pacing and structure.', icon: Layers3 },
  { id: 'consultant', label: 'Consultant', description: 'Strategic framing, executive logic, proof-first.', icon: BriefcaseBusiness },
];

export interface GammaDeckStylePickerProps {
  value: GammaDeckStyle;
  onChange: (style: GammaDeckStyle) => void;
  disabled?: boolean;
  compact?: boolean;
}

export const GammaDeckStylePicker: React.FC<GammaDeckStylePickerProps> = ({ value, onChange, disabled, compact }) => (
  <div className={cn('rounded-3xl border border-border bg-card/60 p-4 backdrop-blur-sm', compact && 'p-3')}>
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>
        <div className="text-xs font-black uppercase tracking-[0.18em] text-primary">Deck style</div>
        <p className="mt-1 text-xs text-muted-foreground">Gamma-inspired structure and writing voice. Theme still controls colors and fonts.</p>
      </div>
    </div>
    <div className={cn('grid gap-2', compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-4')}>
      {styles.map((style) => {
        const Icon = style.icon;
        const active = value === style.id;
        return (
          <button
            key={style.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(style.id)}
            className={cn(
              'rounded-2xl border p-3 text-left transition hover:border-primary/50 hover:bg-secondary',
              active ? 'border-primary bg-primary/10 ring-1 ring-primary/20' : 'border-border bg-background/70',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            <div className="flex items-center gap-2 text-sm font-bold"><Icon className="h-4 w-4 text-primary" /> {style.label}</div>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{style.description}</p>
          </button>
        );
      })}
    </div>
  </div>
);
