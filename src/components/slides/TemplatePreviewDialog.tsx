import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Star, X, Bookmark, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScaledSlide } from './ScaledSlide';
import { SlideRenderer } from './SlideRenderer';
import { applyDemoTheme, type DemoThemeId, type SlideData } from './slideTypes';
import { getThemePack } from './themePacks';
import {
  DEMO_STYLES,
  INFOGRAPHIC_CATEGORIES,
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

/** Apply a demo theme to the template's slide and add hero defaults. Mirrors
 *  the gallery's themedTemplate helper so previewed cards match what gets
 *  inserted into the deck. */
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

  const activeTheme = themedTpl.theme;
  const pack = activeTheme ? getThemePack(activeTheme) : null;
  const categoryLabel = INFOGRAPHIC_CATEGORIES.find((c) => c.value === template.category)?.label;
  const styleLabel = DEMO_STYLES.find((s) => s.value === activeTheme)?.label;
  const paletteSwatches = pack
    ? [
        { label: 'Background', value: pack.palette.heroBg },
        { label: 'Foreground', value: pack.palette.fg },
        { label: 'Primary', value: pack.palette.primary },
        { label: 'Accent', value: pack.palette.accent },
      ]
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col gap-0">
        <DialogTitle className="sr-only">{template.name} template preview</DialogTitle>
        <DialogDescription className="sr-only">
          Preview the {template.name} template — try alternate styles and insert it into your deck.
        </DialogDescription>

        {/* Header — matches the PowerPoint Template Preview header chrome
            (chip + name + meta on the left, action row on the right). */}
        <div className="flex items-center justify-between border-b px-5 py-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="h-9 w-12 rounded-md border shrink-0"
              style={{
                background: pack?.palette.heroBg ?? 'hsl(var(--muted))',
                borderColor: 'rgba(255,255,255,0.12)',
              }}
            >
              <div className="flex gap-1 p-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: pack?.palette.accent ?? 'hsl(var(--primary))' }}
                />
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: pack?.palette.secondary ?? 'hsl(var(--secondary))' }}
                />
              </div>
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold truncate">{template.name}</h2>
              <p className="text-xs text-muted-foreground truncate">
                1 slide ·{' '}
                {[categoryLabel, styleLabel, template.description].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFavorite}
              className={cn('gap-1.5', isFavorite && 'text-amber-500 border-amber-400/50')}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={cn('h-3.5 w-3.5', isFavorite && 'fill-current')} />
              {isFavorite ? 'Favorited' : 'Favorite'}
            </Button>
            <Button
              size="sm"
              onClick={() => onUse(themedTpl)}
              className="gap-1.5"
              title="Insert this template into your deck"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Use template
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Slide deck — vertically stacked previews, scrolling. The hero slide
            renders full-size, followed by a "Try a different style" strip and
            a palette card, matching the composer preview's rhythm. */}
        <ScrollArea className="flex-1">
          <div className="p-5 space-y-5">
            {/* Hero slide */}
            <div className="rounded-xl border bg-card overflow-hidden shadow-lg">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Preview · {styleLabel ?? 'Default style'}
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={animated}
                    onChange={(e) => setAnimated(e.target.checked)}
                    className="accent-primary"
                  />
                  Animate
                </label>
              </div>
              <div className="aspect-video bg-muted">
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

            {/* Sample deck — shows the active theme applied across common
                slide layouts so users see how the template performs beyond the
                hero card. */}
            <SampleDeck
              template={themedTpl}
              activeTheme={activeTheme}
              brandColors={brandColors}
              brandFonts={brandFonts}
              animated={animated}
            />

            {/* Alternate styles */}
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Try a different style
                </p>
                {themeOverride && (
                  <button
                    type="button"
                    onClick={() => setThemeOverride(undefined)}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Reset to default
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {DEMO_STYLES.map((s) => (
                  <StyleVariantCard
                    key={s.value}
                    template={template}
                    style={s}
                    active={activeTheme === s.value}
                    onSelect={() => setThemeOverride(s.value)}
                    brandColors={brandColors}
                    brandFonts={brandFonts}
                  />
                ))}
              </div>
            </div>

            {/* Description + tags + slide contents */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border bg-card p-4 lg:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  About
                </p>
                <p className="text-sm text-foreground/90 leading-relaxed">{template.description}</p>
                {template.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-xl border bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Slide contents
                </p>
                <SlideContentsList slide={themedTpl.slide} />
              </div>
            </div>

            {/* Palette strip — identical pattern to the composer preview. */}
            {paletteSwatches && (
              <div className="rounded-xl border bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Palette
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {paletteSwatches.map((s) => (
                    <div key={s.label} className="flex items-center gap-2 rounded-md border p-2">
                      <div
                        className="h-8 w-8 rounded-md border shrink-0"
                        style={{ background: s.value }}
                      />
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold truncate">{s.label}</div>
                        <div className="text-[10px] font-mono text-muted-foreground truncate">
                          {String(s.value).startsWith('#') ? s.value : 'gradient'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function StyleVariantCard({
  template,
  style,
  active,
  onSelect,
  brandColors,
  brandFonts,
}: {
  template: InfographicTemplate;
  style: (typeof DEMO_STYLES)[number];
  active: boolean;
  onSelect: () => void;
  brandColors?: { primary?: string; secondary?: string; accent?: string };
  brandFonts?: { heading?: string; body?: string };
}) {
  const slideWithId = useMemo(() => {
    const t = themed(template, style.value);
    return { ...t.slide, id: `${template.id}__${style.value}` };
  }, [template, style.value]);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group text-left rounded-lg border overflow-hidden bg-muted transition-all',
        active
          ? 'border-primary ring-2 ring-primary/40 shadow-md'
          : 'border-border/60 hover:border-primary/60 hover:shadow-sm',
      )}
    >
      <div className="relative aspect-video">
        <ScaledSlide>
          <SlideRenderer
            slide={slideWithId}
            brandColors={brandColors}
            brandFonts={brandFonts}
            animated={false}
          />
        </ScaledSlide>
      </div>
      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-card border-t border-border/50">
        <span
          className="h-3 w-3 rounded-sm border border-border/40 shrink-0"
          style={{ background: style.swatch }}
        />
        <span className="text-[11px] font-medium truncate">{style.label}</span>
      </div>
    </button>
  );
}

function SlideContentsList({ slide }: { slide: Omit<SlideData, 'id'> }) {
  const rows: { label: string; value: string }[] = [];
  const push = (label: string, value: string | undefined | null) => {
    if (value && String(value).trim()) rows.push({ label, value: String(value) });
  };
  push('Layout', `${slide.layout}${slide.variation ? ` · ${slide.variation}` : ''}`);
  push('Title', slide.title);
  push('Subtitle', slide.subtitle);
  if (slide.body) push('Body', slide.body.length > 180 ? `${slide.body.slice(0, 180)}…` : slide.body);
  push('Quote author', slide.quoteAuthor);
  if (slide.stats?.length)
    push('Stats', slide.stats.map((s) => `• ${s.value} — ${s.label}`).join('\n'));
  if (slide.chart)
    push(
      'Chart',
      `${slide.chart.type}${slide.chart.title ? ` — ${slide.chart.title}` : ''}`,
    );
  if (slide.timeline?.length)
    push('Timeline', `${slide.timeline.length} step${slide.timeline.length === 1 ? '' : 's'}`);
  if (slide.process?.length)
    push('Process', `${slide.process.length} step${slide.process.length === 1 ? '' : 's'}`);
  if (slide.bgEffect?.type && slide.bgEffect.type !== 'none')
    push('Background', slide.bgEffect.type);

  if (rows.length === 0) {
    return <p className="text-xs text-muted-foreground italic">Blank starter — add your own content.</p>;
  }
  return (
    <dl className="space-y-2">
      {rows.map(({ label, value }) => (
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
  );
}

/** A small built-in set of sample slides used to show the template's theme
 *  applied across the most common layouts. We re-use the template's hero
 *  copy where it makes sense and fall back to generic but tasteful filler. */
const SAMPLE_DECK_BLUEPRINT: Array<Omit<SlideData, 'id'>> = [
  {
    layout: 'title',
    title: 'Project Kickoff',
    subtitle: 'Vision · Roadmap · Next steps',
    variant: 'gradient',
  },
  {
    layout: 'content',
    title: 'Agenda',
    body: '• Where we are today\n• What we are building\n• How we get there\n• Questions & discussion',
    variant: 'default',
  },
  {
    layout: 'stats',
    title: 'By the Numbers',
    variant: 'brand',
    stats: [
      { value: '2.4×', label: 'Faster delivery' },
      { value: '98%', label: 'Customer NPS' },
      { value: '12M', label: 'Active users' },
    ],
  },
  {
    layout: 'chart',
    title: 'Growth Trajectory',
    variant: 'default',
    chart: {
      type: 'bar',
      title: 'Quarterly revenue',
      data: [
        { label: 'Q1', value: 42 },
        { label: 'Q2', value: 58 },
        { label: 'Q3', value: 71 },
        { label: 'Q4', value: 96 },
      ],
    },
  },
  {
    layout: 'quote',
    title: '“Great design is invisible — but its impact is unforgettable.”',
    quoteAuthor: 'Design Team',
    variant: 'dark',
  },
  {
    layout: 'section',
    title: 'Thank You',
    subtitle: "Let's build something remarkable.",
    variant: 'gradient',
  },
];

function SampleDeck({
  template,
  activeTheme,
  brandColors,
  brandFonts,
  animated,
}: {
  template: InfographicTemplate;
  activeTheme?: DemoThemeId;
  brandColors?: { primary?: string; secondary?: string; accent?: string };
  brandFonts?: { heading?: string; body?: string };
  animated: boolean;
}) {
  const slides = useMemo(() => {
    // Borrow the hero title from the template for the first sample so the
    // deck feels personalised rather than generic.
    const hero = template.slide;
    const customised = SAMPLE_DECK_BLUEPRINT.map((s, i) => {
      if (i === 0 && hero.title) {
        return { ...s, title: hero.title, subtitle: hero.subtitle || s.subtitle };
      }
      return s;
    });
    const themedSlides = activeTheme
      ? applyDemoTheme(customised, activeTheme)
      : customised;
    const pack = activeTheme ? getThemePack(activeTheme) : null;
    return themedSlides.map((slide, i) => ({
      ...slide,
      id: `${template.id}__sample__${i}`,
      variation: slide.variation || (pack ? pack.variants[slide.layout] : undefined),
      imageUrl:
        slide.imageUrl ||
        (slide.layout === 'title' && pack ? pack.images[0]?.src : slide.imageUrl),
    }));
  }, [template, activeTheme]);

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sample deck
        </p>
        <span className="text-[11px] text-muted-foreground">
          {slides.length} preview slides
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className="group rounded-lg border border-border/60 bg-muted overflow-hidden hover:border-primary/60 hover:shadow-md transition-all"
          >
            <div className="aspect-video">
              <ScaledSlide>
                <SlideRenderer
                  slide={slide}
                  brandColors={brandColors}
                  brandFonts={brandFonts}
                  animated={animated}
                />
              </ScaledSlide>
            </div>
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-card border-t border-border/50">
              <span className="text-[11px] font-medium capitalize truncate">
                {slide.layout.replace('-', ' ')}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
  return (
    <dl className="space-y-2">
      {rows.map(({ label, value }) => (
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
  );
}
