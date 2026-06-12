import React, { useEffect, useMemo, useState } from "react";
import { Check, LayoutGrid, Search, X, Bookmark, Globe2, Loader2, Trash2, Sparkles, Wand2, Layers3, MonitorPlay, Star } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ALL_PRESENTATION_TEMPLATES } from "@/config/editableTemplates/presentationTemplates";
import { TemplateDemoCard } from "./TemplateDemoCard";
import { TemplatePreviewDialog } from "./TemplatePreviewDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface DeckTemplate {
  id: string;
  name: string;
  description: string;
  themePrompt: string;
  palette: { bg: string; text: string; accent: string; secondary: string };
}

export const DECK_TEMPLATES: DeckTemplate[] = [
  {
    id: "transperfect-2026",
    name: "TransPerfect 2026",
    description: "Gradient orbs · Geist · global authority",
    themePrompt:
      "TransPerfect 2026 brand system. Use the official brand imagery library: large soft gradient ORBS and SPHERES in turquoise #A1F9F9, lavender/violet #8B5CF6 → #C2A3FF, and electric blue #4D88FF, set against deep navy #03002C backgrounds — like glowing planets, eclipses, or aurora blooms. Hero/title slides: full-bleed deep-navy background with a single luminous gradient arc rising from the bottom (turquoise → cyan → soft white). Section dividers: two large overlapping orbs (lavender + cyan) on navy, eclipse-style. Content slides: alabaster #E7E3DA or blue-white #E0E8F5 backgrounds with a subtle orb glow in one corner. Card slides: navy → indigo → soft-blue diagonal gradient backgrounds. Typography: Geist Sans — Bold headings (tight tracking -2 to -4), Regular body. Primary text #FFFFFF on dark, #03002C on light. Accents in 10% only: turquoise #A1F9F9, lavender #C2A3FF, orange #FF9878, pink #EC388A. NEVER use vertical light bars or rays — the motif is soft, round, glowing gradient orbs and atmospheric light blooms only. Generous whitespace, soft transitions. Tone: authoritative, modern, human, transformative, cosmic.",
    palette: { bg: "#03002C", text: "#FFFFFF", accent: "#A1F9F9", secondary: "#C2A3FF" },
  },
  {
    id: "modern-dark",
    name: "Modern Dark",
    description: "High-contrast tech vibe",
    themePrompt: "modern dark theme, near-black background (#0B0F19), white text, electric cyan accents",
    palette: { bg: "#0B0F19", text: "#FFFFFF", accent: "#22D3EE", secondary: "#A5B4FC" },
  },
  {
    id: "editorial-light",
    name: "Editorial Light",
    description: "Magazine-style minimal",
    themePrompt: "editorial light theme, off-white background, charcoal text, single warm accent, generous whitespace",
    palette: { bg: "#F7F5F1", text: "#1A1A1A", accent: "#C4654A", secondary: "#8B7355" },
  },
  {
    id: "corporate-navy",
    name: "Corporate Navy",
    description: "Investor-ready authority",
    themePrompt: "corporate navy theme, deep navy background, ivory text, gold accents, executive feel",
    palette: { bg: "#0F1B3D", text: "#F5F0E0", accent: "#C9A84C", secondary: "#3B6FA0" },
  },
  {
    id: "vibrant-startup",
    name: "Vibrant Startup",
    description: "Bold, energetic launch",
    themePrompt: "vibrant startup theme, white background, hot coral accent, deep indigo headings, playful and confident",
    palette: { bg: "#FFFFFF", text: "#1E1B4B", accent: "#F96167", secondary: "#6366F1" },
  },
  {
    id: "warm-terracotta",
    name: "Warm Terracotta",
    description: "Lifestyle & wellness",
    themePrompt: "warm terracotta theme, sand background, terracotta accents, sage green secondary, organic feel",
    palette: { bg: "#E7E8D1", text: "#2D2D2D", accent: "#B85042", secondary: "#A7BEAE" },
  },
  {
    id: "mono-brutalist",
    name: "Mono Brutalist",
    description: "Stark black & white",
    themePrompt: "brutalist monochrome theme, pure white background, pure black text, single bright yellow accent, oversized type",
    palette: { bg: "#FFFFFF", text: "#000000", accent: "#FFEB3B", secondary: "#666666" },
  },
];

// Convert library templates (PRESENTATION_SLIDE / WEBINAR / STREAM) into DeckTemplate shape
const LIBRARY_TEMPLATES: DeckTemplate[] = ALL_PRESENTATION_TEMPLATES.map((t) => {
  const bg =
    t.background?.type === "solid"
      ? t.background.value
      : t.background?.type === "gradient"
      ? t.background.value
      : "#0F172A";
  const colors = t.defaultColors || ({} as any);
  const palette = {
    bg: typeof bg === "string" && bg.startsWith("#") ? bg : colors.background || "#0F172A",
    text: colors.text || "#FFFFFF",
    accent: colors.accent || colors.primary || "#3B82F6",
    secondary: colors.secondary || "#64748B",
  };
  return {
    id: t.id,
    name: t.name,
    description: t.description || "",
    themePrompt: `${t.name.toLowerCase()} layout — ${t.description || ""}. Use ${palette.bg} background, ${palette.text} text, ${palette.accent} accents.`,
    palette: { ...palette, bg: typeof bg === "string" ? bg : palette.bg },
  } as DeckTemplate;
});

// Combined catalog: theme presets first, then full library
export const ALL_DECK_TEMPLATES: DeckTemplate[] = [...DECK_TEMPLATES, ...LIBRARY_TEMPLATES];

interface Props {
  selectedId: string | null;
  onSelect: (template: DeckTemplate) => void;
  /** Optional: open the template's starter deck directly in the Slide Editor. */
  onOpenInEditor?: (template: DeckTemplate) => void;
  disabled?: boolean;
  /** "compact" = small cards (legacy). "showcase" = rich demo cards at top of blank mode. */
  variant?: "compact" | "showcase";
}

type TemplateFilter = "all" | "featured" | "saved" | "library" | "dark" | "light";

const isLightTemplate = (t: DeckTemplate) => {
  const bg = t.palette.bg.replace("#", "");
  if (bg.length < 6) return false;
  const r = parseInt(bg.slice(0, 2), 16);
  const g = parseInt(bg.slice(2, 4), 16);
  const b = parseInt(bg.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 180;
};

const templateBadge = (t: DeckTemplate) => {
  if (t.id.includes("transperfect")) return "Brand system";
  if (t.id.includes("dark") || !isLightTemplate(t)) return "Dark mode";
  if (t.id.includes("editorial")) return "Editorial";
  if (t.id.includes("corporate")) return "Executive";
  if (t.id.includes("startup")) return "Launch";
  if (t.id.includes("brutalist")) return "Bold";
  return isLightTemplate(t) ? "Light deck" : "Premium";
};

const MiniSlideStack: React.FC<{ template: DeckTemplate }> = ({ template }) => (
  <div className="absolute right-4 top-4 flex -space-x-5 opacity-95 transition-transform duration-500 group-hover:translate-y-[-3px]">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="h-16 w-24 rounded-lg border shadow-2xl backdrop-blur-sm"
        style={{
          background: i === 0
            ? `linear-gradient(135deg, ${template.palette.bg}, ${template.palette.secondary})`
            : i === 1
            ? `linear-gradient(135deg, ${template.palette.accent}, ${template.palette.bg})`
            : template.palette.bg,
          borderColor: `${template.palette.text}33`,
          transform: `rotate(${(i - 1) * 5}deg) translateY(${i * 8}px)`,
        }}
      >
        <div className="p-2">
          <div className="mb-2 h-1.5 w-10 rounded-full" style={{ background: template.palette.accent }} />
          <div className="space-y-1">
            <div className="h-1 rounded-full opacity-80" style={{ background: template.palette.text }} />
            <div className="h-1 w-2/3 rounded-full opacity-40" style={{ background: template.palette.text }} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const PremiumTemplateCard: React.FC<{
  template: DeckTemplate;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  saved?: boolean;
  shared?: boolean;
}> = ({ template: t, selected, disabled, onClick, saved, shared }) => {
  const light = isLightTemplate(t);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group relative min-h-[260px] overflow-hidden rounded-[28px] border text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
        selected ? "border-primary ring-2 ring-primary/40" : "border-border/70 hover:border-primary/50",
        disabled && "cursor-not-allowed opacity-50",
      )}
      style={{ color: t.palette.text }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 18% 18%, ${t.palette.accent}77 0, transparent 32%), radial-gradient(circle at 82% 28%, ${t.palette.secondary}66 0, transparent 34%), linear-gradient(135deg, ${t.palette.bg}, ${light ? "#FFFFFF" : "#111827"})`,
        }}
      />
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `linear-gradient(90deg, ${t.palette.text}18 1px, transparent 1px), linear-gradient(${t.palette.text}12 1px, transparent 1px)`, backgroundSize: "28px 28px" }} />
      <MiniSlideStack template={t} />
      <div className="relative flex h-full min-h-[260px] flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-md" style={{ borderColor: `${t.palette.text}33`, background: `${t.palette.bg}66` }}>{templateBadge(t)}</span>
            {saved && <span className="rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-md" style={{ borderColor: `${t.palette.text}33`, background: `${t.palette.accent}33` }}>Saved</span>}
            {shared && <span className="rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-md" style={{ borderColor: `${t.palette.text}33`, background: `${t.palette.secondary}33` }}>Shared</span>}
          </div>
          {selected && <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"><Check className="h-4 w-4" /></span>}
        </div>

        <div className="max-w-[72%] pt-16">
          <div className="mb-3 h-1 w-16 rounded-full" style={{ background: t.palette.accent }} />
          <h3 className="text-2xl font-black leading-[0.95] tracking-tight drop-shadow-sm">{t.name}</h3>
          <p className="mt-3 text-sm font-medium opacity-80 line-clamp-2">{t.description || "Presentation template"}</p>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2 text-xs font-semibold opacity-85">
            <MonitorPlay className="h-4 w-4" />
            Built deck preview
          </div>
          <div className="flex gap-1.5">
            {[t.palette.accent, t.palette.secondary, t.palette.text].map((color) => (
              <span key={color} className="h-4 w-4 rounded-full border" style={{ background: color, borderColor: `${t.palette.text}55` }} />
            ))}
          </div>
        </div>
      </div>
    </button>
  );
};

const TemplateCard: React.FC<{
  template: DeckTemplate;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}> = ({ template: t, selected, disabled, onClick }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`group relative rounded-2xl border overflow-hidden text-left transition-all hover:-translate-y-0.5 hover:shadow-xl ${
      selected ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/50"
    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <div
      className="aspect-[16/10] p-3 flex flex-col justify-between relative"
      style={{ background: `radial-gradient(circle at 25% 20%, ${t.palette.accent}66, transparent 35%), linear-gradient(135deg, ${t.palette.bg}, ${t.palette.secondary})`, color: t.palette.text }}
    >
      <div className="absolute right-2 top-2 h-8 w-12 rounded-md border opacity-70" style={{ borderColor: `${t.palette.text}44`, background: `${t.palette.bg}AA` }} />
      <div>
        <div className="text-[10px] font-bold leading-tight truncate" style={{ color: t.palette.text }}>
          {t.name}
        </div>
        <div className="h-[2px] w-7 mt-1 rounded-full" style={{ background: t.palette.accent }} />
      </div>
      <div className="flex gap-1">
        <div className="h-1.5 flex-1 rounded-full" style={{ background: t.palette.accent }} />
        <div className="h-1.5 flex-1 rounded-full opacity-60" style={{ background: t.palette.secondary }} />
        <div className="h-1.5 w-3 rounded-full opacity-30" style={{ background: t.palette.text }} />
      </div>
    </div>
    <div className="px-3 py-2 bg-card border-t">
      <p className="text-[11px] font-medium truncate">{t.name}</p>
      <p className="text-[10px] text-muted-foreground truncate">{t.description || "Template"}</p>
    </div>
    {selected && (
      <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
        <Check className="h-3.5 w-3.5" />
      </div>
    )}
  </button>
);

export const TemplateGallery: React.FC<Props> = ({ selectedId, onSelect, onOpenInEditor, disabled, variant = "compact" }) => {
  const [browseOpen, setBrowseOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TemplateFilter>("all");
  const [previewTemplate, setPreviewTemplate] = useState<DeckTemplate | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<
    Array<{ id: string; user_id: string; name: string; description: string | null; palette: any; theme_prompt: string | null; is_shared: boolean }>
  >([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Load saved deck templates (own + shared)
  useEffect(() => {
    if (!isAuthenticated) {
      setSavedTemplates([]);
      return;
    }
    let active = true;
    setLoadingSaved(true);
    supabase
      .from("deck_templates")
      .select("id,user_id,name,description,palette,theme_prompt,is_shared")
      .eq("source_kind", "preview")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        setLoadingSaved(false);
        if (error) {
          console.warn("[TemplateGallery] failed to load saved templates", error);
          return;
        }
        setSavedTemplates(data || []);
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.id]);

  const savedAsDeckTemplates: DeckTemplate[] = useMemo(
    () =>
      savedTemplates.map((s) => ({
        id: `saved:${s.id}`,
        name: s.name,
        description: s.description || (s.is_shared ? "Shared template" : "My template"),
        themePrompt: s.theme_prompt || "",
        palette: {
          bg: s.palette?.bg || "#0F172A",
          text: s.palette?.text || "#FFFFFF",
          accent: s.palette?.accent || "#3B82F6",
          secondary: s.palette?.secondary || "#64748B",
        },
      })),
    [savedTemplates],
  );

  const handleDeleteSaved = async (savedId: string, name: string) => {
    if (!confirm(`Delete saved template "${name}"?`)) return;
    const { error } = await supabase.from("deck_templates").delete().eq("id", savedId);
    if (error) {
      toast({ title: "Couldn't delete", description: error.message, variant: "destructive" });
      return;
    }
    setSavedTemplates((prev) => prev.filter((s) => s.id !== savedId));
    toast({ title: "Template deleted" });
  };

  const filtered = useMemo(() => {
    const all = [...savedAsDeckTemplates, ...ALL_DECK_TEMPLATES];
    const q = search.trim().toLowerCase();
    return all.filter((t) => {
      const matchesSearch = !q || t.name.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q);
      const matchesFilter =
        filter === "all" ||
        (filter === "featured" && DECK_TEMPLATES.some((featured) => featured.id === t.id)) ||
        (filter === "saved" && t.id.startsWith("saved:")) ||
        (filter === "library" && LIBRARY_TEMPLATES.some((library) => library.id === t.id)) ||
        (filter === "dark" && !isLightTemplate(t)) ||
        (filter === "light" && isLightTemplate(t));
      return matchesSearch && matchesFilter;
    });
  }, [search, filter, savedAsDeckTemplates]);

  const isShowcase = variant === "showcase";
  const showcaseTemplates = savedAsDeckTemplates.length ? [...savedAsDeckTemplates.slice(0, 2), ...DECK_TEMPLATES].slice(0, 8) : DECK_TEMPLATES;

  return (
    <div className={`${isShowcase ? "max-w-7xl" : "max-w-4xl"} mx-auto pt-2 space-y-4`}>
      <div className="relative overflow-hidden rounded-[28px] border border-border bg-card/80 p-5 shadow-sm">
        <div className="absolute inset-0 opacity-70" style={{ background: "radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.18), transparent 32%), radial-gradient(circle at 85% 10%, hsl(var(--accent) / 0.18), transparent 28%)" }} />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-4 w-4" /> Presentation Template Studio
            </div>
            <h2 className="text-2xl font-black tracking-tight">Choose a deck system, not just a theme.</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Prebuilt PowerPoint systems with title, section, stats, quote, card, and story slides ready for Brand Brain-driven generation.</p>
          </div>
          <button
            type="button"
            onClick={() => setBrowseOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg hover:bg-primary/90"
          >
            <LayoutGrid className="h-4 w-4" />
            Browse all {ALL_DECK_TEMPLATES.length + savedAsDeckTemplates.length}
          </button>
        </div>
      </div>

      {isShowcase ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {showcaseTemplates.map((t) => (
            <PremiumTemplateCard
              key={t.id}
              template={t}
              selected={selectedId === t.id}
              disabled={disabled}
              saved={t.id.startsWith("saved:")}
              shared={Boolean(savedTemplates.find((s) => `saved:${s.id}` === t.id)?.is_shared)}
              onClick={() => setPreviewTemplate(t)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DECK_TEMPLATES.map((t) => (
            <PremiumTemplateCard
              key={t.id}
              template={t}
              selected={selectedId === t.id}
              disabled={disabled}
              onClick={() => setPreviewTemplate(t)}
            />
          ))}
        </div>
      )}

      <Dialog open={browseOpen} onOpenChange={setBrowseOpen}>
        <DialogContent className="max-w-7xl w-[96vw] h-[90vh] p-0 overflow-hidden flex flex-col gap-0">
          <div className="relative overflow-hidden border-b px-6 py-5 shrink-0">
            <div className="absolute inset-0 opacity-70" style={{ background: "radial-gradient(circle at 12% 12%, hsl(var(--primary) / 0.16), transparent 30%), radial-gradient(circle at 85% 0%, hsl(var(--accent) / 0.16), transparent 26%)" }} />
            <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg"><LayoutGrid className="h-5 w-5" /></div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">PowerPoint Template Gallery</h2>
                  <p className="text-sm text-muted-foreground">{filtered.length} templates showing · {DECK_TEMPLATES.length} featured · {LIBRARY_TEMPLATES.length} library · {savedAsDeckTemplates.length} saved</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search templates, moods, use cases…"
                    className="h-11 w-full rounded-2xl pl-10 text-sm sm:w-[360px]"
                  />
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setBrowseOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="relative mt-4 flex flex-wrap gap-2">
              {([
                ["all", "All"],
                ["featured", "Featured"],
                ["saved", "My Templates"],
                ["library", "Library"],
                ["dark", "Dark"],
                ["light", "Light"],
              ] as Array<[TemplateFilter, string]>).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={cn("rounded-full border px-3 py-1.5 text-xs font-bold transition", filter === id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background/70 hover:bg-secondary")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8">
              {!search.trim() && filter === "all" && savedAsDeckTemplates.length > 0 && (
                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    <Bookmark className="h-3.5 w-3.5" /> My Templates {loadingSaved && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  </h3>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {savedAsDeckTemplates.map((t) => {
                      const savedId = t.id.replace(/^saved:/, "");
                      const saved = savedTemplates.find((s) => s.id === savedId);
                      const ownedByMe = saved?.user_id === user?.id;
                      return (
                        <div key={t.id} className="relative group">
                          <PremiumTemplateCard
                            template={t}
                            selected={selectedId === t.id}
                            disabled={disabled}
                            saved
                            shared={saved?.is_shared}
                            onClick={() => setPreviewTemplate(t)}
                          />
                          {saved?.is_shared && (
                            <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-bold flex items-center gap-1">
                              <Globe2 className="h-3 w-3" /> Shared
                            </div>
                          )}
                          {ownedByMe && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSaved(savedId, t.name);
                              }}
                              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/90 border opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground"
                              title="Delete saved template"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!search.trim() && (filter === "all" || filter === "featured") && (
                <div>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground"><Star className="h-3.5 w-3.5" /> Featured deck systems</h3>
                    <span className="text-xs text-muted-foreground">Large previews · full demo decks · editor-ready</span>
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {DECK_TEMPLATES.map((t) => (
                      <PremiumTemplateCard
                        key={t.id}
                        template={t}
                        selected={selectedId === t.id}
                        disabled={disabled}
                        onClick={() => setPreviewTemplate(t)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground"><Layers3 className="h-3.5 w-3.5" /> {search.trim() || filter !== "all" ? "Matching templates" : "Template library"}</h3>
                  <span className="text-xs text-muted-foreground">{filtered.length} available</span>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {(search.trim() || filter !== "all" ? filtered : LIBRARY_TEMPLATES).map((t) => (
                    <PremiumTemplateCard
                      key={t.id}
                      template={t}
                      selected={selectedId === t.id}
                      disabled={disabled}
                      saved={t.id.startsWith("saved:")}
                      shared={Boolean(savedTemplates.find((s) => `saved:${s.id}` === t.id)?.is_shared)}
                      onClick={() => setPreviewTemplate(t)}
                    />
                  ))}
                  {filtered.length === 0 && (
                    <div className="col-span-full rounded-3xl border border-dashed border-border py-16 text-center">
                      <Wand2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                      <div className="font-semibold">No templates match “{search}”.</div>
                      <p className="mt-1 text-sm text-muted-foreground">Try a different mood, use case, or layout keyword.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <TemplatePreviewDialog
        template={previewTemplate}
        open={!!previewTemplate}
        onOpenChange={(o) => !o && setPreviewTemplate(null)}
        onUse={(t) => {
          onSelect(t);
          setBrowseOpen(false);
        }}
        onOpenInEditor={
          onOpenInEditor
            ? (t) => {
                onOpenInEditor(t);
                setBrowseOpen(false);
              }
            : undefined
        }
        disabled={disabled}
      />
    </div>
  );
};
