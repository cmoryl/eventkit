import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Globe, Calendar, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

type EntityFilter = 'brand' | 'event' | 'product';

interface BrandCard {
  id: string;
  name: string;
  slug: string | null;
  shareToken: string | null;
  parentBrandId: string | null;
  type: EntityFilter;
  logoUrl: string | null;
  coverImage: string | null;
  tagline: string | null;
  date: string | null;
  location: string | null;
  colors: string[];
  updatedAt: string;
}

interface BrandHubGalleryProps {
  onSelectBrand: (token: string | null, slug: string | null) => void;
  isImporting: boolean;
  /** Restrict tabs / default tab. Defaults to 'all' (Brands tab). */
  defaultEntity?: EntityFilter;
  /** Optional scoping to a parent brand's universe (for events/products). */
  parentBrandShareToken?: string;
  parentBrandSlug?: string;
  /** Which BrandHub backend to query. Defaults to 'brandhub'. */
  hubSource?: 'brandhub' | 'gasalley';
}

const TAB_META: Record<
  EntityFilter,
  { label: string; icon: React.ComponentType<{ className?: string }>; emptyHint: string }
> = {
  brand: { label: 'Brands', icon: Globe, emptyHint: 'No public brands found' },
  event: { label: 'Events', icon: Calendar, emptyHint: 'No public events found' },
  product: { label: 'Products', icon: Package, emptyHint: 'No public products found' },
};

export const BrandHubGallery: React.FC<BrandHubGalleryProps> = ({
  onSelectBrand,
  isImporting,
  defaultEntity = 'brand',
  parentBrandShareToken,
  parentBrandSlug,
}) => {
  const [activeTab, setActiveTab] = useState<EntityFilter>(defaultEntity);
  const [items, setItems] = useState<BrandCard[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('browse-brandhub-entity', {
        body: {
          entity: activeTab,
          search: debouncedSearch,
          limit: 30,
          offset: 0,
          parentBrandShareToken,
          parentBrandSlug,
        },
      });

      if (error || !data?.success) {
        console.warn('Browse error:', error || data?.error);
        setItems([]);
        return;
      }
      setItems((data.items || []) as BrandCard[]);
    } catch (e) {
      console.warn('Browse failed:', e);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, debouncedSearch, parentBrandShareToken, parentBrandSlug]);

  useEffect(() => {
    load();
  }, [load]);

  const meta = TAB_META[activeTab];

  return (
    <div className="space-y-3">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EntityFilter)}>
        <TabsList className="grid w-full grid-cols-3">
          {(Object.keys(TAB_META) as EntityFilter[]).map((key) => {
            const { label, icon: Icon } = TAB_META[key];
            return (
              <TabsTrigger key={key} value={key} className="gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(TAB_META) as EntityFilter[]).map((key) => (
          <TabsContent key={key} value={key} className="mt-3">
            {/* shared body — the active tab's data lives in `items` */}
            {key === activeTab && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${meta.label.toLowerCase()}...`}
                    className="pl-9"
                    disabled={isImporting}
                  />
                </div>

                <ScrollArea className="h-[300px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : items.length === 0 ? (
                    <div className="flex items-center justify-center h-full py-8 text-sm text-muted-foreground">
                      {debouncedSearch ? `No ${meta.label.toLowerCase()} match "${debouncedSearch}"` : meta.emptyHint}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {items.map((item) => {
                        const Icon = TAB_META[item.type].icon;
                        return (
                          <button
                            key={`${item.type}-${item.id}`}
                            onClick={() => onSelectBrand(item.shareToken, item.slug)}
                            disabled={isImporting}
                            className="group relative flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all text-left disabled:opacity-50"
                          >
                            <div className="w-full h-16 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                              {item.logoUrl ? (
                                <img
                                  src={item.logoUrl}
                                  alt={item.name}
                                  className="h-12 w-auto object-contain"
                                  loading="lazy"
                                />
                              ) : item.coverImage ? (
                                <img
                                  src={item.coverImage}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="text-2xl font-bold text-muted-foreground/30">
                                  {item.name.charAt(0)}
                                </div>
                              )}
                            </div>

                            <span className="text-xs font-medium text-foreground truncate w-full text-center">
                              {item.name}
                            </span>

                            {item.tagline && (
                              <span className="text-[10px] text-muted-foreground truncate w-full text-center -mt-1">
                                {item.tagline}
                              </span>
                            )}

                            {item.colors.length > 0 && (
                              <div className="flex gap-0.5">
                                {item.colors.map((hex, i) => (
                                  <div
                                    key={i}
                                    className="w-3 h-3 rounded-full border border-border/50"
                                    style={{ backgroundColor: hex }}
                                  />
                                ))}
                              </div>
                            )}

                            <div className="absolute top-1.5 right-1.5">
                              <Icon className="h-3 w-3 text-muted-foreground/60" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
