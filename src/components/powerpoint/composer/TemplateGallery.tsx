import React, { useEffect, useMemo, useState } from "react";
import { Check, LayoutGrid, Search, X, Bookmark, Globe2, Loader2, Trash2 } from "lucide-react";
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
    className={`group relative rounded-xl border overflow-hidden text-left transition-all ${
      selected ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/50"
    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <div
      className="aspect-[16/10] p-3 flex flex-col justify-between"
      style={{ background: t.palette.bg, color: t.palette.text }}
    >
      <div>
        <div className="text-[10px] font-bold leading-tight truncate" style={{ color: t.palette.text }}>
          {t.name}
        </div>
        <div className="h-[2px] w-6 mt-1 rounded-full" style={{ background: t.palette.accent }} />
      </div>
      <div className="flex gap-1">
        <div className="h-1.5 flex-1 rounded-full" style={{ background: t.palette.accent }} />
        <div className="h-1.5 flex-1 rounded-full opacity-60" style={{ background: t.palette.secondary }} />
        <div className="h-1.5 w-3 rounded-full opacity-30" style={{ background: t.palette.text }} />
      </div>
    </div>
    <div className="px-2.5 py-1.5 bg-card border-t">
      <p className="text-[11px] text-muted-foreground truncate">{t.description || "Template"}</p>
    </div>
    {selected && (
      <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
        <Check className="h-3 w-3" />
      </div>
    )}
  </button>
);

export const TemplateGallery: React.FC<Props> = ({ selectedId, onSelect, onOpenInEditor, disabled, variant = "compact" }) => {
  const [browseOpen, setBrowseOpen] = useState(false);
  const [search, setSearch] = useState("");
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
    if (!q) return all;
    return all.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q),
    );
  }, [search, savedAsDeckTemplates]);

  const isShowcase = variant === "showcase";

  return (
    <div className={`${isShowcase ? "max-w-6xl" : "max-w-3xl"} mx-auto pt-2 space-y-3`}>
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {isShowcase ? "Pick a fully-built template" : "Pick a template"}
          </p>
          {isShowcase && (
            <p className="text-[11px] text-muted-foreground/80 mt-0.5">
              Each template includes a title, card grid, stats and quote layouts — ready to populate.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setBrowseOpen(true)}
          className="text-[11px] text-primary hover:underline flex items-center gap-1"
        >
          <LayoutGrid className="h-3 w-3" />
          Browse all {ALL_DECK_TEMPLATES.length}
        </button>
      </div>

      {isShowcase ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DECK_TEMPLATES.map((t) => (
            <TemplateDemoCard
              key={t.id}
              template={t}
              selected={selectedId === t.id}
              disabled={disabled}
              onClick={() => setPreviewTemplate(t)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DECK_TEMPLATES.map((t) => (
            <TemplateCard
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
        <DialogContent className="max-w-6xl w-[95vw] h-[88vh] p-0 overflow-hidden flex flex-col gap-0">
          <div className="flex items-center justify-between border-b px-5 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold">All Deck Templates</h2>
              <span className="text-xs text-muted-foreground">
                {filtered.length} of {ALL_DECK_TEMPLATES.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search templates…"
                  className="h-8 pl-8 w-[260px] text-xs"
                />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setBrowseOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-5 space-y-6">
              {!search.trim() && savedAsDeckTemplates.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Bookmark className="h-3 w-3" />
                    My Templates
                    {loadingSaved && <Loader2 className="h-3 w-3 animate-spin" />}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {savedAsDeckTemplates.map((t) => {
                      const savedId = t.id.replace(/^saved:/, "");
                      const saved = savedTemplates.find((s) => s.id === savedId);
                      const ownedByMe = saved?.user_id === user?.id;
                      return (
                        <div key={t.id} className="relative group">
                          <TemplateCard
                            template={t}
                            selected={selectedId === t.id}
                            disabled={disabled}
                            onClick={() => setPreviewTemplate(t)}
                          />
                          {saved?.is_shared && (
                            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-[9px] font-bold flex items-center gap-1">
                              <Globe2 className="h-2.5 w-2.5" />
                              Shared
                            </div>
                          )}
                          {ownedByMe && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSaved(savedId, t.name);
                              }}
                              className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-background/90 border opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground"
                              title="Delete saved template"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!search.trim() && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Featured · fully-built demos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {DECK_TEMPLATES.map((t) => (
                      <TemplateDemoCard
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
                {!search.trim() && (
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Library
                  </h3>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(search.trim() ? filtered : LIBRARY_TEMPLATES).map((t) => (
                    <TemplateCard
                      key={t.id}
                      template={t}
                      selected={selectedId === t.id}
                      disabled={disabled}
                      onClick={() => setPreviewTemplate(t)}
                    />
                  ))}
                  {filtered.length === 0 && (
                    <div className="col-span-full text-center text-sm text-muted-foreground py-12">
                      No templates match "{search}".
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
