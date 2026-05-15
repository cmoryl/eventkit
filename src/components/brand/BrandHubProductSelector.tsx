import React, { useState, useEffect, useCallback } from 'react';
import { Check, ChevronDown, Package, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export interface BrandHubProduct {
  id: string;
  name: string;
  slug: string | null;
  shareToken: string | null;
  tagline?: string | null;
  logoUrl?: string | null;
  colors?: string[];
}

interface Props {
  /** The active brand's BrandHub share token (lets us scope products to that brand). */
  parentBrandShareToken?: string | null;
  className?: string;
  onProductSelected?: (product: BrandHubProduct | null) => void;
}

const SESSION_KEY = (token: string) => `brandhub-active-product-${token}`;

/**
 * Live dropdown of BrandHub products linked to the active brand.
 * Always fetches fresh on open — no caching.
 */
export const BrandHubProductSelector: React.FC<Props> = ({
  parentBrandShareToken,
  className,
  onProductSelected,
}) => {
  const [products, setProducts] = useState<BrandHubProduct[]>([]);
  const [activeProduct, setActiveProduct] = useState<BrandHubProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Restore last-selected product from sessionStorage when brand changes
  useEffect(() => {
    if (!parentBrandShareToken) {
      setActiveProduct(null);
      return;
    }
    try {
      const raw = sessionStorage.getItem(SESSION_KEY(parentBrandShareToken));
      if (raw) {
        const parsed = JSON.parse(raw) as BrandHubProduct;
        setActiveProduct(parsed);
        onProductSelected?.(parsed);
      } else {
        setActiveProduct(null);
        onProductSelected?.(null);
      }
    } catch {
      setActiveProduct(null);
    }
    setHasFetched(false);
    setProducts([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentBrandShareToken]);

  const fetchProducts = useCallback(async () => {
    if (!parentBrandShareToken) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('browse-brandhub-entity', {
        body: {
          entity: 'product',
          parentBrandShareToken,
          limit: 50,
        },
      });
      if (error || !data?.success) {
        setProducts([]);
        return;
      }
      const items = (data.items || []) as BrandHubProduct[];
      setProducts(items);
    } catch (e) {
      console.warn('Product fetch failed:', e);
      setProducts([]);
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [parentBrandShareToken]);

  // Fetch on first open
  const handleOpenChange = (open: boolean) => {
    if (open && !hasFetched && !isLoading) fetchProducts();
  };

  const handleSelect = (product: BrandHubProduct | null) => {
    setActiveProduct(product);
    onProductSelected?.(product);
    if (parentBrandShareToken) {
      try {
        if (product) {
          sessionStorage.setItem(SESSION_KEY(parentBrandShareToken), JSON.stringify(product));
        } else {
          sessionStorage.removeItem(SESSION_KEY(parentBrandShareToken));
        }
      } catch {
        // ignore
      }
    }
  };

  if (!parentBrandShareToken) return null;

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all',
            'bg-muted/50 hover:bg-muted border border-border/50 text-foreground',
            className,
          )}
        >
          <Package className="w-3 h-3 text-muted-foreground" />
          <span className="max-w-[120px] truncate">
            {activeProduct?.name || 'Products'}
          </span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <div className="px-3 py-1.5 border-b border-border flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            BrandHub Products
          </p>
          {isLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
        </div>

        {hasFetched && products.length === 0 && !isLoading && (
          <div className="px-3 py-3 text-xs text-muted-foreground text-center">
            No products linked to this brand yet
          </div>
        )}

        {activeProduct && (
          <>
            <DropdownMenuItem
              onClick={() => handleSelect(null)}
              className="gap-2 py-1.5 text-xs text-muted-foreground"
            >
              Clear selection
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {products.map((product) => (
          <DropdownMenuItem
            key={product.id}
            onClick={() => handleSelect(product)}
            className="gap-2 py-2"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{product.name}</p>
              {product.tagline && (
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {product.tagline}
                </p>
              )}
            </div>
            {activeProduct?.id === product.id && (
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
