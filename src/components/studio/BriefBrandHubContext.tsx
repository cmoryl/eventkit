import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Package, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface ActiveProduct {
  id: string;
  name: string;
  slug?: string | null;
  shareToken?: string | null;
  tagline?: string | null;
  logoUrl?: string | null;
  colors?: string[];
}

interface ActiveEvent {
  knowledgeId: string;
  key: string;
  name: string;
  date?: string;
  location?: string;
  venue?: string;
  expectedAttendees?: number;
}

export interface BrandHubContextSelection {
  product: ActiveProduct | null;
  event: ActiveEvent | null;
  includeProduct: boolean;
  includeEvent: boolean;
}

interface Props {
  brandId?: string | null;
  onChange: (selection: BrandHubContextSelection) => void;
}

/**
 * Compact banner inside the Asset Brief modal that surfaces the active
 * BrandHub Product and Event linked to the current brand. Users can opt
 * either source in/out as additional generation context.
 */
export const BriefBrandHubContext: React.FC<Props> = ({ brandId, onChange }) => {
  const { user } = useAuth();
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [product, setProduct] = useState<ActiveProduct | null>(null);
  const [event, setEvent] = useState<ActiveEvent | null>(null);
  const [includeProduct, setIncludeProduct] = useState(true);
  const [includeEvent, setIncludeEvent] = useState(true);

  // Resolve the brand's BrandHub share token (used to key product session)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!brandId) {
        setShareToken(null);
        return;
      }
      const { data } = await supabase
        .from('brands')
        .select('brandhub_share_token')
        .eq('id', brandId)
        .maybeSingle();
      if (!cancelled) setShareToken(data?.brandhub_share_token || null);
    };
    run();
    return () => { cancelled = true; };
  }, [brandId]);

  // Active product (sessionStorage written by BrandHubProductSelector)
  useEffect(() => {
    if (!shareToken) {
      setProduct(null);
      return;
    }
    try {
      const raw = sessionStorage.getItem(`brandhub-active-product-${shareToken}`);
      setProduct(raw ? (JSON.parse(raw) as ActiveProduct) : null);
    } catch {
      setProduct(null);
    }
  }, [shareToken]);

  // Active event (first BrandHub event for this brand from ai_knowledge)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user || !brandId) {
        setEvent(null);
        return;
      }
      const { data } = await supabase
        .from('ai_knowledge')
        .select('id, key, value, category')
        .eq('user_id', user.id)
        .eq('knowledge_type', 'brand_preference')
        .like('key', `brandhub_event_${brandId}%`)
        .limit(1);

      if (cancelled) return;
      const row = data?.[0];
      if (!row) {
        setEvent(null);
        return;
      }
      const val = (row.value || {}) as Record<string, unknown>;
      setEvent({
        knowledgeId: row.id,
        key: row.key,
        name: (val.name as string) || (row.category as string) || 'Untitled Event',
        date: val.date as string | undefined,
        location: (val.location as string) || (val.venue as string) || undefined,
        venue: val.venue as string | undefined,
        expectedAttendees: val.expectedAttendees as number | undefined,
      });
    };
    run();
    return () => { cancelled = true; };
  }, [user, brandId]);

  const selection = useMemo<BrandHubContextSelection>(() => ({
    product,
    event,
    includeProduct,
    includeEvent,
  }), [product, event, includeProduct, includeEvent]);

  useEffect(() => {
    onChange(selection);
  }, [selection, onChange]);

  if (!product && !event) return null;

  return (
    <div className="mt-3 p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          BrandHub Context
        </p>
        <span className="text-[10px] text-muted-foreground">Adds extra brief context</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {event && (
          <button
            type="button"
            onClick={() => setIncludeEvent((v) => !v)}
            className={cn(
              'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all',
              includeEvent
                ? 'bg-primary/15 border-primary/40 text-foreground'
                : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted/60',
            )}
            title={includeEvent ? 'Click to exclude event' : 'Click to include event'}
          >
            <Calendar className="w-3 h-3" />
            <span className="max-w-[180px] truncate">{event.name}</span>
            {includeEvent && <Check className="w-3 h-3 text-primary" />}
          </button>
        )}

        {product && (
          <button
            type="button"
            onClick={() => setIncludeProduct((v) => !v)}
            className={cn(
              'flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all',
              includeProduct
                ? 'bg-primary/15 border-primary/40 text-foreground'
                : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted/60',
            )}
            title={includeProduct ? 'Click to exclude product' : 'Click to include product'}
          >
            <Package className="w-3 h-3" />
            <span className="max-w-[180px] truncate">{product.name}</span>
            {includeProduct && <Check className="w-3 h-3 text-primary" />}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Compose a short, prompt-friendly addendum from the active BrandHub
 * product/event so it can be merged into the brief's additionalNotes.
 */
export const composeBrandHubBriefAddendum = (
  selection: BrandHubContextSelection | null,
): string => {
  if (!selection) return '';
  const parts: string[] = [];

  if (selection.includeEvent && selection.event) {
    const e = selection.event;
    const meta = [
      e.date ? `on ${e.date}` : null,
      e.venue || e.location ? `at ${e.venue || e.location}` : null,
      e.expectedAttendees ? `~${e.expectedAttendees} attendees` : null,
    ].filter(Boolean).join(', ');
    parts.push(`BrandHub event context: "${e.name}"${meta ? ` (${meta})` : ''}.`);
  }

  if (selection.includeProduct && selection.product) {
    const p = selection.product;
    const meta = p.tagline ? ` — ${p.tagline}` : '';
    parts.push(`BrandHub product focus: "${p.name}"${meta}.`);
  }

  return parts.join(' ');
};
