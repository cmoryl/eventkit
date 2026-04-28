import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Presentation, Wand2, Download, Play,
  ArrowRight, Layers, LayoutGrid, Zap, FileDown,
  ChevronRight, Star, Bot, Palette, Crown,
} from 'lucide-react';
import transperfectHero from '@/assets/templates/transperfect-hero.jpg';
import transperfectSection from '@/assets/templates/transperfect-section-bg.jpg';
import transperfectLight from '@/assets/templates/transperfect-light-pattern.jpg';
import transperfectCard from '@/assets/templates/transperfect-card.jpg';
import transperfectCaseStudy from '@/assets/templates/transperfect-case-study.jpg';
import { Button } from '@/components/ui/button';
import { AppNavHeader } from '@/components/layout/AppNavHeader';
import { SlideEditor } from '@/components/slides/SlideEditor';
import { SlideRenderer } from '@/components/slides/SlideRenderer';
import { TemplateGalleryDialog } from '@/components/slides/TemplateGalleryDialog';
import { INFOGRAPHIC_TEMPLATES, type InfographicTemplate } from '@/components/slides/infographicTemplates';
import type { SlideData } from '@/components/slides/slideTypes';
import { useActiveBrand } from '@/hooks/useActiveBrand';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/auth/AuthModal';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';

// ── Curated featured templates ───────────────────────────────────────────
const FEATURED_IDS = [
  'hero-bold-statement',
  'stat-hero-roi',
  'timeline-year-review',
  'process-pdca',
  'stat-big-percent',
  'chart-bar-quarterly',
  'comparison-before-after',
  'section-featured-quote',
  'hero-conference-talk',
  'stat-ranked-3',
  'quote-punch',
  'content-card-grid',
];

const FEATURED = FEATURED_IDS
  .map(id => INFOGRAPHIC_TEMPLATES.find(t => t.id === id))
  .filter(Boolean) as InfographicTemplate[];

// ── Stats strip ──────────────────────────────────────────────────────────
const STATS = [
  { value: '49', label: 'Templates', icon: LayoutGrid },
  { value: '16', label: 'Slide Layouts', icon: Layers },
  { value: '9', label: 'Transitions', icon: Play },
  { value: 'AI', label: 'Auto-generate', icon: Wand2 },
];

// ── Feature cards ────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Bot,
    title: 'AI Slide Generator',
    body: 'Describe your topic and get a full narrative deck — complete with speaker notes — in under a minute.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Palette,
    title: '27 Visual Variations',
    body: 'Every layout ships with multiple design alternates: grids, gauges, zigzag timelines, ranked bars, and more.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Zap,
    title: 'Animated Backgrounds',
    body: 'Seven GPU-friendly live effects — orbs, particles, mesh, waves, grain, grid, and beam — all editable.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: FileDown,
    title: 'PPTX Export',
    body: 'Export a native PowerPoint file with embedded fonts, brand colors, and slide transitions baked in.',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

// ── How it works ─────────────────────────────────────────────────────────
const HOW = [
  {
    step: '01',
    title: 'Pick a template or describe your deck',
    body: 'Browse 49 live-preview templates or type a topic and let the AI build your narrative structure.',
  },
  {
    step: '02',
    title: 'Customise every detail',
    body: 'Swap layouts, switch variations, animate backgrounds, and drop in your brand colors and fonts.',
  },
  {
    step: '03',
    title: 'Present or export',
    body: 'Run a full-screen presentation with 9 transition effects, or export a pixel-perfect PPTX file.',
  },
];

// ── Tiny slide preview card ───────────────────────────────────────────────
const SLIDE_W = 1920;
const SLIDE_H = 1080;

function MiniSlide({ template }: { template: InfographicTemplate }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.05);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(w / SLIDE_W);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className="relative w-full rounded-md overflow-hidden border border-border/40"
      style={{ paddingBottom: '56.25%' }}
    >
      <div className="absolute inset-0">
        <div style={{ width: SLIDE_W, height: SLIDE_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <SlideRenderer slide={{ ...template.slide, id: `mini-${template.id}` } as SlideData} animated={false} />
        </div>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  onClick,
  onSelectSibling,
}: {
  template: InfographicTemplate;
  onClick: () => void;
  onSelectSibling?: (t: InfographicTemplate) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.1);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(w / SLIDE_W);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const siblings = useMemo(
    () =>
      INFOGRAPHIC_TEMPLATES.filter(
        (t) => t.category === template.category && t.id !== template.id
      ).slice(0, 3),
    [template.category, template.id]
  );

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 16:9 container */}
      <div
        onClick={onClick}
        ref={containerRef}
        className="relative w-full rounded-xl overflow-hidden border border-border/50 group-hover:border-primary/50 shadow-md group-hover:shadow-xl group-hover:shadow-primary/10 transition-all duration-300"
        style={{ paddingBottom: '56.25%' }}
      >
        <div className="absolute inset-0">
          {/* Scaled slide */}
          <div
            style={{
              width: SLIDE_W,
              height: SLIDE_H,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            <SlideRenderer slide={{ ...template.slide, id: 'preview' } as SlideData} animated={hovered} />
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-sm font-medium shadow-lg">
            <Play className="w-3.5 h-3.5" />
            Use Template
          </div>
        </div>

        {/* Animated badge */}
        {template.animated && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-semibold">
              <Sparkles className="w-2.5 h-2.5" /> Live
            </span>
          </div>
        )}
      </div>

      <div className="mt-2.5 px-0.5">
        <p className="text-sm font-medium text-foreground truncate" onClick={onClick}>{template.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{template.description}</p>
      </div>

      {/* Sub-slide thumbnails (sibling layouts in same category) */}
      {siblings.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {siblings.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectSibling ? onSelectSibling(s) : onClick();
              }}
              className="block w-full rounded-md overflow-hidden hover:ring-2 hover:ring-primary/60 transition-all"
              title={s.name}
            >
              <MiniSlide template={s} />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}


// ── Hero animated slide preview ───────────────────────────────────────────
function HeroSlideStack() {
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.1);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(w / SLIDE_W);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const heroTemplate = INFOGRAPHIC_TEMPLATES.find(t => t.id === 'stat-hero-roi')!;

  return (
    <motion.div
      className="relative w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
      {/* Shadow slide 2 */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden border border-border/30 opacity-40"
        style={{ transform: 'rotate(3deg) scale(0.96) translateY(8px)', zIndex: 0 }}
      >
        <div
          ref={null}
          style={{ width: SLIDE_W, height: SLIDE_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          <SlideRenderer
            slide={{
              ...(INFOGRAPHIC_TEMPLATES.find(t => t.id === 'timeline-year-review')?.slide ?? {}),
              id: 'bg2',
            } as SlideData}
          />
        </div>
      </div>

      {/* Shadow slide 1 */}
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden border border-border/30 opacity-60"
        style={{ transform: 'rotate(-1.5deg) scale(0.98) translateY(4px)', zIndex: 1 }}
      >
        <div style={{ paddingBottom: '56.25%', position: 'relative' }}>
          <div
            style={{ position: 'absolute', inset: 0 }}
          >
            <div
              style={{ width: SLIDE_W, height: SLIDE_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}
            >
              <SlideRenderer
                slide={{
                  ...(INFOGRAPHIC_TEMPLATES.find(t => t.id === 'process-pdca')?.slide ?? {}),
                  id: 'bg1',
                } as SlideData}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Front slide */}
      <div
        className="relative rounded-2xl overflow-hidden border border-border shadow-2xl shadow-primary/20"
        style={{ paddingBottom: '56.25%', zIndex: 2 }}
        ref={containerRef}
      >
        <div className="absolute inset-0">
          <div style={{ width: SLIDE_W, height: SLIDE_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <SlideRenderer
              slide={{ ...heroTemplate.slide, id: 'hero-preview' } as SlideData}
              animated={hovered}
            />
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <motion.div
        className="absolute -bottom-3 -left-3 z-10 bg-card border border-border rounded-xl px-3 py-2 shadow-lg flex items-center gap-2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9 }}
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Wand2 className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-xs font-semibold">AI Generated</p>
          <p className="text-[10px] text-muted-foreground">in 8 seconds</p>
        </div>
      </motion.div>

      <motion.div
        className="absolute -top-3 -right-3 z-10 bg-card border border-border rounded-xl px-3 py-2 shadow-lg flex items-center gap-2"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
        <div>
          <p className="text-xs font-semibold">49 Templates</p>
          <p className="text-[10px] text-muted-foreground">ready to use</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function SlidesPage() {
  const navigate = useNavigate();
  const { activeBrand } = useActiveBrand();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [pendingSlides, setPendingSlides] = useState<SlideData[] | undefined>();

  // Gallery dialog state (for "Browse All" button)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const openBlankEditor = () => {
    setPendingSlides(undefined);
    setEditorKey(k => k + 1);
    setIsEditorOpen(true);
  };

  const openWithTemplate = (template: InfographicTemplate) => {
    setPendingSlides([{ ...template.slide, id: uuidv4() }]);
    setEditorKey(k => k + 1);
    setIsEditorOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onAuthSuccess={() => setShowAuthModal(false)}
      />

      {/* Editor overlay */}
      <SlideEditor
        key={editorKey}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        assetType="presentation"
        assetName="New Presentation"
        brand={activeBrand as any}
        initialSlides={pendingSlides}
      />

      {/* Template gallery standalone dialog */}
      <TemplateGalleryDialog
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelect={(template) => {
          setIsGalleryOpen(false);
          openWithTemplate(template);
        }}
      />

      {/* ── Animated Background ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <motion.div
          className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px]"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[160px]"
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ── Nav ── */}
      <AppNavHeader
        subtitle="Presentation Builder"
        onGetStarted={openBlankEditor}
        onSignIn={() => setShowAuthModal(true)}
        actions={
          <Button size="sm" onClick={openBlankEditor} className="gap-2">
            <Presentation className="w-4 h-4" />
            <span className="hidden sm:inline">New Presentation</span>
          </Button>
        }
      />

      {/* ── Hero ── */}
      <section className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Presentation Builder
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5"
              >
                Build Beautiful{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
                  Presentations
                </span>{' '}
                in Minutes
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-muted-foreground mb-8 max-w-lg"
              >
                49 live-preview templates, AI generation, animated backgrounds,
                27 layout variations, and one-click PPTX export — all in your browser.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-3"
              >
                <Button
                  size="lg"
                  onClick={openBlankEditor}
                  className="text-base px-6 py-5 rounded-xl shadow-lg shadow-primary/25 gap-2"
                >
                  <Presentation className="w-5 h-5" />
                  New Presentation
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsGalleryOpen(true)}
                  className="text-base px-6 py-5 rounded-xl gap-2"
                >
                  <LayoutGrid className="w-5 h-5" />
                  Browse Templates
                </Button>
              </motion.div>

              {/* Trust line */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center gap-4 mt-6 text-sm text-muted-foreground"
              >
                {['No account needed', 'Export to PPTX', 'AI-generated decks'].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right: slide stack preview */}
            <div className="relative">
              <HeroSlideStack />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="py-8 border-y border-border/50 bg-muted/20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map(({ value, label, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Templates ── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              Start from a Template
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Hover to animate. Click to open in the editor.
            </p>
          </motion.div>

          {/* Featured brand template */}
          <motion.button
            type="button"
            onClick={() => navigate('/agent/powerpoint?template=transperfect-2026')}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.005 }}
            className="group relative w-full mb-8 overflow-hidden rounded-2xl border border-border/60 bg-card text-left shadow-sm hover:shadow-xl transition-shadow block"
          >
            <div className="grid md:grid-cols-[1.4fr_1fr]">
              <div className="relative aspect-[16/9] md:aspect-auto md:min-h-[320px] overflow-hidden">
                <img
                  src={transperfectHero}
                  alt="TransPerfect 2026 brand template preview"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#03002C]/70 via-[#003FC7]/20 to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur text-xs font-semibold">
                  <Crown className="h-3.5 w-3.5 text-amber-500" />
                  New brand template
                </div>
              </div>
              <div className="p-8 flex flex-col justify-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">TransPerfect 2026</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Deep navy gradients, glowing orbs, and atmospheric light blooms.
                    Built from the official TransPerfect 2026 brand system with curated imagery.
                  </p>
                </div>

                {/* Sub-slide previews */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                    Includes layouts
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { src: transperfectHero, label: 'Hero' },
                      { src: transperfectSection, label: 'Section' },
                      { src: transperfectCard, label: 'Card' },
                      { src: transperfectCaseStudy, label: 'Case study' },
                      { src: transperfectLight, label: 'Divider' },
                    ].slice(0, 4).map((s) => (
                      <div
                        key={s.label}
                        className="relative aspect-[16/10] rounded-md overflow-hidden border border-border/40 shadow-sm"
                      >
                        <img src={s.src} alt={s.label} className="absolute inset-0 w-full h-full object-cover" />
                        <span className="absolute bottom-0.5 left-1 text-[8px] font-medium text-white/90 drop-shadow">
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {['#03002C', '#003FC7', '#A1F9F9', '#C2A3FF'].map((c) => (
                    <span
                      key={c}
                      className="h-5 w-5 rounded-full border border-border/40 shadow-sm"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  Generate with this template
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </motion.button>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {FEATURED.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.06, 0.4) }}
              >
                <TemplateCard
                  template={template}
                  onClick={() => openWithTemplate(template)}
                  onSelectSibling={(t) => openWithTemplate(t)}
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsGalleryOpen(true)}
              className="gap-2 rounded-xl px-8"
            >
              <LayoutGrid className="w-4 h-4" />
              Browse All 49 Templates
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="py-20 px-6 bg-muted/20 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Everything You Need</h2>
            <p className="text-muted-foreground text-lg">
              From blank canvas to boardroom-ready deck.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, body, gradient }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className={cn(
                  'w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-sm',
                  gradient
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              How It{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Works
              </span>
            </h2>
          </motion.div>

          <div className="space-y-10">
            {HOW.map(({ step, title, body }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 text-primary-foreground font-bold text-sm">
                  {step}
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-semibold mb-1">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25">
            <Presentation className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Build Your Deck?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
            Open the editor, pick a template, or let AI write your entire presentation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={openBlankEditor}
              className="text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/25 gap-2"
            >
              <Presentation className="w-5 h-5" />
              New Presentation
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsGalleryOpen(true)}
              className="text-lg px-8 py-6 rounded-xl gap-2"
            >
              <LayoutGrid className="w-5 h-5" />
              Browse Templates
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-medium text-sm">EventKIT</span>
          </button>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <button onClick={() => navigate('/')} className="hover:text-foreground transition-colors">Home</button>
            <button onClick={openBlankEditor} className="hover:text-foreground transition-colors">Slide Editor</button>
            <button onClick={() => navigate('/agent/powerpoint')} className="hover:text-foreground transition-colors">AI Agent</button>
          </nav>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
