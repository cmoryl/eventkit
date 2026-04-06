import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Globe, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

interface BrandCard {
  id: string;
  name: string;
  slug: string | null;
  shareToken: string | null;
  type: 'brand' | 'event';
  logoUrl: string | null;
  coverImage: string | null;
  colors: string[];
  updatedAt: string;
}

interface BrandHubGalleryProps {
  onSelectBrand: (token: string | null, slug: string | null) => void;
  isImporting: boolean;
}

export const BrandHubGallery: React.FC<BrandHubGalleryProps> = ({
  onSelectBrand,
  isImporting,
}) => {
  const [brands, setBrands] = useState<BrandCard[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadBrands = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('browse-brandhub-brands', {
        body: { search: debouncedSearch, limit: 30, offset: 0 },
      });

      if (error || !data?.success) {
        console.warn('Browse error:', error || data?.error);
        setBrands([]);
        return;
      }

      setBrands(data.brands || []);
    } catch (e) {
      console.warn('Browse failed:', e);
      setBrands([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search brands & events..."
          className="pl-9"
          disabled={isImporting}
        />
      </div>

      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : brands.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            {debouncedSearch ? 'No brands found' : 'No public brands available'}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {brands.map((brand) => (
              <button
                key={`${brand.type}-${brand.id}`}
                onClick={() => onSelectBrand(brand.shareToken, brand.slug)}
                disabled={isImporting}
                className="group relative flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all text-left disabled:opacity-50"
              >
                {/* Cover/Logo */}
                <div className="w-full h-16 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                  {brand.logoUrl ? (
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className="h-12 w-auto object-contain"
                      loading="lazy"
                    />
                  ) : brand.coverImage ? (
                    <img
                      src={brand.coverImage}
                      alt={brand.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-muted-foreground/30">
                      {brand.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Name */}
                <span className="text-xs font-medium text-foreground truncate w-full text-center">
                  {brand.name}
                </span>

                {/* Color swatches */}
                {brand.colors.length > 0 && (
                  <div className="flex gap-0.5">
                    {brand.colors.map((hex, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-full border border-border/50"
                        style={{ backgroundColor: hex as string }}
                      />
                    ))}
                  </div>
                )}

                {/* Type badge */}
                <div className="absolute top-1.5 right-1.5">
                  {brand.type === 'event' ? (
                    <Calendar className="h-3 w-3 text-muted-foreground/60" />
                  ) : (
                    <Globe className="h-3 w-3 text-muted-foreground/60" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
