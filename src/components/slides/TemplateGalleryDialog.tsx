import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Search, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScaledSlide } from './ScaledSlide';
import { SlideRenderer } from './SlideRenderer';
import {
  INFOGRAPHIC_TEMPLATES,
  INFOGRAPHIC_CATEGORIES,
  type InfographicTemplate,
  type InfographicCategory,
} from './infographicTemplates';

interface TemplateGalleryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: InfographicTemplate) => void;
  brandColors?: { primary?: string; secondary?: string; accent?: string };
  brandFonts?: { heading?: string; body?: string };
}

type CategoryFilter = 'all' | InfographicCategory;

export function TemplateGalleryDialog({
  isOpen,
  onClose,
  onSelect,
  brandColors,
  brandFonts,
}: TemplateGalleryDialogProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [animatedOnly, setAnimatedOnly] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return INFOGRAPHIC_TEMPLATES.filter((t) => {
      if (category !== 'all' && t.category !== category) return false;
      if (animatedOnly && !t.animated) return false;
      if (!q) return true;
      const haystack = `${t.name} ${t.description} ${t.tags.join(' ')} ${t.category}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [search, category, animatedOnly]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: INFOGRAPHIC_TEMPLATES.length };
    for (const t of INFOGRAPHIC_TEMPLATES) map[t.category] = (map[t.category] || 0) + 1;
    return map;
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[1400px] w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col gap-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold">Template Gallery</h2>
            <span className="text-xs text-muted-foreground">{filtered.length} of {INFOGRAPHIC_TEMPLATES.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates…"
                className="h-8 pl-8 w-[280px] text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={animatedOnly} onCheckedChange={setAnimatedOnly} id="animated-only" />
              <label htmlFor="animated-only" className="text-xs text-muted-foreground cursor-pointer">
                Animated only
              </label>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-[200px] border-r bg-muted/20 p-2 shrink-0 overflow-y-auto">
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide px-2 py-1.5">
              Categories
            </div>
            <CategoryButton
              label="All Templates"
              count={counts.all}
              active={category === 'all'}
              onClick={() => setCategory('all')}
            />
            {INFOGRAPHIC_CATEGORIES.map(({ value, label }) => (
              <CategoryButton
                key={value}
                label={label}
                count={counts[value] || 0}
                active={category === value}
                onClick={() => setCategory(value)}
              />
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-5">
            {filtered.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-2">
                <Search className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No templates match your filters.</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSearch(''); setCategory('all'); setAnimatedOnly(false); }}
                >
                  Reset filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isHovered={hoveredId === template.id}
                    onHoverChange={(hovered) => setHoveredId(hovered ? template.id : null)}
                    onSelect={() => { onSelect(template); onClose(); }}
                    brandColors={brandColors}
                    brandFonts={brandFonts}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CategoryButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between text-left rounded-md px-2.5 py-1.5 text-xs transition-colors',
        active
          ? 'bg-primary/10 text-foreground font-medium'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <span>{label}</span>
      <span className={cn('text-[10px] font-mono', active ? 'text-primary' : 'text-muted-foreground/60')}>
        {count}
      </span>
    </button>
  );
}

function TemplateCard({
  template,
  isHovered,
  onHoverChange,
  onSelect,
  brandColors,
  brandFonts,
}: {
  template: InfographicTemplate;
  isHovered: boolean;
  onHoverChange: (h: boolean) => void;
  onSelect: () => void;
  brandColors?: { primary?: string; secondary?: string; accent?: string };
  brandFonts?: { heading?: string; body?: string };
}) {
  // Stable id for the slide passed to SlideRenderer (not used by renderer but required by type)
  const slideWithId = useMemo(() => ({ ...template.slide, id: template.id }), [template]);
  const categoryLabel = INFOGRAPHIC_CATEGORIES.find((c) => c.value === template.category)?.label;

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onFocus={() => onHoverChange(true)}
      onBlur={() => onHoverChange(false)}
      className={cn(
        'group text-left flex flex-col rounded-lg border bg-card overflow-hidden transition-all',
        'hover:border-primary hover:shadow-lg hover:-translate-y-0.5',
        'focus:outline-none focus:ring-2 focus:ring-primary',
      )}
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        <ScaledSlide>
          <SlideRenderer slide={slideWithId} brandColors={brandColors} brandFonts={brandFonts} animated={isHovered} />
        </ScaledSlide>
        {template.animated && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-background/90 backdrop-blur-sm text-[9px] font-medium text-primary flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5" />
            Animated
          </div>
        )}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 pointer-events-none transition-colors" />
      </div>
      <div className="p-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium leading-snug">{template.name}</span>
          <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{categoryLabel}</span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
      </div>
    </button>
  );
}
