import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Star, X, Tag, Layout, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScaledSlide } from './ScaledSlide';
import { SlideRenderer } from './SlideRenderer';
import { applyDemoTheme, type DemoThemeId, type SlideData } from './slideTypes';
import { getThemePack } from './themePacks';
import {
  INFOGRAPHIC_CATEGORIES,
  DEMO_STYLES,
  type InfographicTemplate,
} from './infographicTemplates';

interface TemplatePreviewDialogProps {
  template: InfographicTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUse: (template: InfographicTemplate) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  brandColors?: { primary?: string; secondary?: string; accent?: string };
  brandFonts?: { heading?: string; body?: string };
}

/** Apply a demo theme to the template's slide and prep hero defaults so the
 *  preview matches what gets inserted into the deck. Mirrors the gallery's
 *  themedTemplate helper. */
function themed(template: InfographicTemplate, themeOverride?: DemoThemeId): InfographicTemplate {
  const theme = themeOverride ?? template.theme;
  if (!theme) return template;
  const [t] = applyDemoTheme([template.slide], theme);
  const pack = getThemePack(theme);
  const isTitleish = t.layout === 'title';
  const enriched: Omit<SlideData, 'id'> = {
    ...t,
    variation: t.variation || pack.variants[t.layout],
    imageUrl: t.imageUrl || (isTitleish ? pack.images[0]?.src : t.imageUrl),
  };
  return { ...template, slide: enriched, theme };
}

export function TemplatePreviewDialog({
  template,
  isOpen,
  onClose,
  onUse,
  isFavorite,
  onToggleFavorite,
  brandColors,
  brandFonts,
}: TemplatePreviewDialogProps) {
  const [themeOverride, setThemeOverride] = useState<DemoThemeId | undefined>(undefined);
  const [animated, setAnimated] = useState(true);

  // Reset transient preview state whenever a different template opens.
  useEffect(() => {
    if (template) {
      setThemeOverride(undefined);
      setAnimated(true);
    }
  }, [template?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const themedTpl = useMemo(
    () => (template ? themed(template, themeOverride) : null),
    [template, themeOverride],
  );

  const slideWithId = useMemo(() => {
    if (!themedTpl) return null;
    return { ...themedTpl.slide, id: themedTpl.id };
  }, [themedTpl]);

  if (!template || !themedTpl || !slideWithId) return null;

  const categoryLabel = INFOGRAPHIC_CATEGORIES.find((c) => c.value === template.category)?.label;
  const activeTheme = themedTpl.theme;
  const summaryRows = describeSlide(themedTpl.slide);

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[1280px] w-[95vw] h-[88vh] p-0 overflow-hidden flex flex-col gap-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <h2 className="text-base font-semibold truncate">{template.name}</h2>
            {categoryLabel && (
              <span className="text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                {categoryLabel}
              </span>
            )}
            {template.animated && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1 shrink-0">
                <Sparkles className="h-2.5 w-2.5" /> Animated
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onToggleFavorite}
              className={cn('gap-1.5', isFavorite && 'text-amber-500')}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={cn('h-4 w-4', isFavorite && 'fill-current')} />
              {isFavorite ? 'Favorited' : 'Favorite'}
            </Button>
            <Button type="button" size="sm" onClick={() => onUse(themedTpl)} className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Use template
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Preview */}
          <div className="flex-1 min-w-0 flex flex-col bg-muted/30">
            <div className="flex-1 min-h-0 p-6 flex items-center justify-center">
              <div className="w-full max-w-[1000px] aspect-video rounded-lg overflow-hidden border border-border/60 shadow-2xl bg-background">
                <ScaledSlide>
                  <SlideRenderer
                    slide={slideWithId}
                    brandColors={brandColors}
                    brandFonts={brandFonts}
                    animated={animated}
                  />
                </ScaledSlide>
              </div>
            </div>
            {/* Style swatches */}
            <div className="border-t bg-background/60 px-5 py-3 flex items-center gap-3 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground flex items-center gap-1.5">
                <Palette className="h-3 w-3" /> Preview style
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {DEMO_STYLES.map((s) => {
                  const isActive = activeTheme === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setThemeOverride(s.value)}
                      title={s.label}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] transition-all',
                        isActive
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border/60 bg-background/80 text-muted-foreground hover:text-foreground hover:border-border',
                      )}
                    >
                      <span
                        className="h-3 w-3 rounded-sm border border-border/40"
                        style={{ background: s.swatch }}
                      />
                      <span className="truncate max-w-[110px]">{s.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={animated}
                    onChange={(e) => setAnimated(e.target.checked)}
                    className="accent-primary"
                  />
                  Animate
                </label>
              </div>
            </div>
          </div>

          {/* Details panel */}
          <aside className="w-[320px] shrink-0 border-l overflow-y-auto p-5 space-y-5 bg-card">
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                About
              </h3>
              <p className="text-sm leading-relaxed text-foreground/90">{template.description}</p>
            </section>

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Layout className="h-3 w-3" /> Slide contents
              </h3>
              {summaryRows.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Blank starter — add your own content.</p>
              ) : (
                <dl className="space-y-2.5">
                  {summaryRows.map(({ label, value }) => (
                    <div key={label}>
                      <dt className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground/80">
                        {label}
                      </dt>
                      <dd className="text-xs text-foreground/90 mt-0.5 break-words whitespace-pre-wrap">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>

            {template.tags?.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Tag className="h-3 w-3" /> Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Build a human-friendly summary of the slide's payload for the details panel. */
function describeSlide(slide: Omit<SlideData, 'id'>): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  const push = (label: string, value: string | undefined | null) => {
    if (value && String(value).trim()) rows.push({ label, value: String(value) });
  };
  push('Layout', `${slide.layout}${slide.variation ? ` · ${slide.variation}` : ''}`);
  push('Title', slide.title);
  push('Subtitle', slide.subtitle);
  if (slide.body) push('Body', slide.body.length > 220 ? `${slide.body.slice(0, 220)}…` : slide.body);
  push('Quote author', slide.quoteAuthor);
  if (slide.stats?.length) {
    push('Stats', slide.stats.map((s) => `• ${s.value} — ${s.label}`).join('\n'));
  }
  if (slide.chart) {
    const series = slide.chart.data?.slice(0, 4).map((d) => `${d.label}: ${d.value}`).join(', ');
    push('Chart', `${slide.chart.type}${slide.chart.title ? ` — ${slide.chart.title}` : ''}${series ? `\n${series}${slide.chart.data.length > 4 ? '…' : ''}` : ''}`);
  }
  if (slide.timeline?.length) {
    push('Timeline', slide.timeline.map((t) => `• ${[t.date, t.title].filter(Boolean).join(' — ')}`).join('\n'));
  }
  if (slide.process?.length) {
    push('Process', slide.process.map((p, i) => `${i + 1}. ${p.title}`).join('\n'));
  }
  if (slide.bgEffect?.type && slide.bgEffect.type !== 'none') {
    push('Background effect', slide.bgEffect.type);
  }
  return rows;
}
