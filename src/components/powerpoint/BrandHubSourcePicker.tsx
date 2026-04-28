import React, { useEffect, useState } from "react";
import { Loader2, Library, X, Globe, Calendar, Package, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Entity = "brand" | "event" | "product";

const ICONS: Record<Entity, React.ComponentType<{ className?: string }>> = {
  brand: Globe,
  event: Calendar,
  product: Package,
};

interface BrowseItem {
  id: string;
  name: string;
  slug: string | null;
  shareToken: string | null;
  type: Entity;
  logoUrl: string | null;
  coverImage: string | null;
  tagline: string | null;
  colors: string[];
}

export interface BrandHubSourcePick {
  type: Entity;
  id: string;
  name: string;
  slug: string | null;
  shareToken: string | null;
  /** Fully fetched normalized brand/guide payload from `fetch-brandhub-brand` */
  payload: Record<string, unknown>;
}

interface Props {
  /** Currently picked source (so we can render a chip + clear). */
  picked: BrandHubSourcePick | null;
  /** Called when user picks an item or clears it. */
  onPick: (pick: BrandHubSourcePick | null) => void;
  disabled?: boolean;
}

export const BrandHubSourcePicker: React.FC<Props> = ({ picked, onPick, disabled }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Entity>("event");
  const [items, setItems] = useState<BrowseItem[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingFull, setFetchingFull] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    supabase.functions
      .invoke("browse-brandhub-entity", {
        body: { entity: tab, search: debouncedSearch, limit: 30 },
      })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data?.success) {
          setItems([]);
          return;
        }
        setItems((data.items || []) as BrowseItem[]);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tab, debouncedSearch, open]);

  const handlePick = async (item: BrowseItem) => {
    setFetchingFull(item.id);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-brandhub-brand", {
        body: { shareToken: item.shareToken || undefined, slug: item.slug || undefined },
      });
      if (error || data?.success === false || !data?.brand) {
        toast({
          title: "Couldn't load from BrandHub",
          description: data?.error || error?.message || "Try another item.",
          variant: "destructive",
        });
        return;
      }
      onPick({
        type: item.type,
        id: item.id,
        name: item.name,
        slug: item.slug,
        shareToken: item.shareToken,
        payload: data.brand as Record<string, unknown>,
      });
      setOpen(false);
      toast({ title: `${item.name} loaded`, description: "Will be used as deck inspiration." });
    } finally {
      setFetchingFull(null);
    }
  };

  if (picked && !open) {
    const Icon = ICONS[picked.type];
    return (
      <div className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary/5 px-2.5 py-1.5 text-xs">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span className="font-medium truncate flex-1">{picked.name}</span>
        <span className="text-[10px] text-muted-foreground uppercase">{picked.type}</span>
        <button
          type="button"
          onClick={() => onPick(null)}
          disabled={disabled}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Clear BrandHub source"
        >
          <X className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={disabled}
          className="text-[10px] underline text-muted-foreground hover:text-foreground"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md border border-dashed border-border hover:border-primary/50 hover:bg-accent/30 transition-colors text-sm text-muted-foreground"
      >
        <Library className="h-4 w-4" />
        {open ? "Close BrandHub picker" : "Pick a brand, event or product from BrandHub"}
      </button>

      {open && (
        <div className="rounded-md border bg-background/60 p-3 space-y-2">
          <Tabs value={tab} onValueChange={(v) => setTab(v as Entity)}>
            <TabsList className="grid w-full grid-cols-3 h-8">
              <TabsTrigger value="brand" className="text-xs gap-1.5">
                <Globe className="h-3 w-3" /> Brands
              </TabsTrigger>
              <TabsTrigger value="event" className="text-xs gap-1.5">
                <Calendar className="h-3 w-3" /> Events
              </TabsTrigger>
              <TabsTrigger value="product" className="text-xs gap-1.5">
                <Package className="h-3 w-3" /> Products
              </TabsTrigger>
            </TabsList>

            {(["brand", "event", "product"] as Entity[]).map((t) => (
              <TabsContent key={t} value={t} className="mt-2 space-y-2">
                {t === tab && (
                  <>
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={`Search ${t}s…`}
                      className="h-8 text-xs"
                      disabled={disabled}
                    />
                    <ScrollArea className="h-[220px]">
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : items.length === 0 ? (
                        <div className="text-center py-6 text-xs text-muted-foreground">
                          {debouncedSearch ? "No matches" : `No public ${t}s`}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {items.map((item) => {
                            const Icon = ICONS[item.type];
                            const busy = fetchingFull === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handlePick(item)}
                                disabled={disabled || !!fetchingFull}
                                className="w-full flex items-center gap-2 p-2 rounded-md border border-border/60 hover:border-primary/40 hover:bg-accent/30 transition-colors text-left disabled:opacity-50"
                              >
                                <div className="h-8 w-8 rounded bg-muted overflow-hidden flex items-center justify-center shrink-0">
                                  {item.logoUrl ? (
                                    <img src={item.logoUrl} alt="" className="h-full w-full object-contain" loading="lazy" />
                                  ) : item.coverImage ? (
                                    <img src={item.coverImage} alt="" className="h-full w-full object-cover" loading="lazy" />
                                  ) : (
                                    <Icon className="h-4 w-4 text-muted-foreground/60" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate">{item.name}</div>
                                  {item.tagline && (
                                    <div className="text-[10px] text-muted-foreground truncate">{item.tagline}</div>
                                  )}
                                  {item.colors.length > 0 && (
                                    <div className="flex gap-0.5 mt-1">
                                      {item.colors.slice(0, 5).map((hex, i) => (
                                        <div
                                          key={i}
                                          className="w-2 h-2 rounded-full border border-border/40"
                                          style={{ backgroundColor: hex }}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {busy ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                                ) : (
                                  <Check className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full text-xs h-7"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
};
