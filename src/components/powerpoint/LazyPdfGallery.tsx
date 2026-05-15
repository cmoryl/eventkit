import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ImageIcon, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { openPdfForLazyThumbnails, type LazyPdfRenderer, type PdfThumbnail } from "@/lib/pdfThumbnails";
import { useToast } from "@/hooks/use-toast";

interface Props {
  file: File | null;
  selectedPages: Set<number>;
  onTogglePage: (page: number) => void;
  onSelectAll: (allPages: number[]) => void;
  onClearSelection: () => void;
  onThumbnailRendered: (thumb: PdfThumbnail) => void; // bubble up rendered thumbs for cache
  disabled?: boolean;
  maxPages?: number;
  defaultPickFirstN?: number;
  onReady?: (totalPages: number, allPages: number[]) => void;
}

const PLACEHOLDER_ASPECT = 3 / 4; // fallback aspect ratio while metadata loads

export const LazyPdfGallery: React.FC<Props> = ({
  file,
  selectedPages,
  onTogglePage,
  onSelectAll,
  onClearSelection,
  onThumbnailRendered,
  disabled = false,
  maxPages = 200,
  defaultPickFirstN = 3,
  onReady,
}) => {
  const { toast } = useToast();
  const [renderer, setRenderer] = useState<LazyPdfRenderer | null>(null);
  const [opening, setOpening] = useState(false);
  const [renderedMap, setRenderedMap] = useState<Map<number, PdfThumbnail>>(new Map());
  const renderingRef = useRef<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Open the PDF (cheap metadata pass) when the file changes
  useEffect(() => {
    let cancelled = false;
    let activeRenderer: LazyPdfRenderer | null = null;

    if (!file) {
      setRenderer(null);
      setRenderedMap(new Map());
      renderingRef.current.clear();
      return;
    }

    setOpening(true);
    setRenderedMap(new Map());
    renderingRef.current.clear();

    openPdfForLazyThumbnails(file, { maxPages })
      .then((r) => {
        if (cancelled) {
          r.destroy();
          return;
        }
        activeRenderer = r;
        setRenderer(r);
        const all = r.pages.map((p) => p.page);
        onReady?.(r.totalPages, all);
        // Default-pick the first N pages
        if (defaultPickFirstN > 0) {
          onSelectAll(all.slice(0, defaultPickFirstN));
        }
      })
      .catch((e) => {
        console.error("Open PDF failed:", e);
        toast({ title: "Thumbnails unavailable", description: "Couldn't open PDF preview.", variant: "destructive" });
      })
      .finally(() => {
        if (!cancelled) setOpening(false);
      });

    return () => {
      cancelled = true;
      if (activeRenderer) activeRenderer.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // Lazy-render visible pages via IntersectionObserver
  useEffect(() => {
    if (!renderer) return;
    const root = containerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const pageStr = (entry.target as HTMLElement).dataset.page;
          if (!pageStr) continue;
          const page = Number(pageStr);
          if (renderedMap.has(page) || renderingRef.current.has(page)) continue;
          renderingRef.current.add(page);
          renderer
            .renderPage(page, { maxWidth: 480, quality: 0.7 })
            .then((thumb) => {
              setRenderedMap((prev) => {
                if (prev.has(page)) return prev;
                const next = new Map(prev);
                next.set(page, thumb);
                return next;
              });
              onThumbnailRendered(thumb);
            })
            .catch((e) => {
              console.warn(`Render failed for page ${page}:`, e);
            })
            .finally(() => {
              renderingRef.current.delete(page);
            });
        }
      },
      { root, rootMargin: "200px 0px", threshold: 0.01 },
    );

    itemRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [renderer, renderedMap, onThumbnailRendered]);

  const totalPages = renderer?.totalPages ?? 0;
  const pages = renderer?.pages ?? [];

  const handleSelectAll = () => onSelectAll(pages.map((p) => p.page));

  if (!file) return null;

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between">
        <Label className="text-xs flex items-center gap-1.5">
          <ImageIcon className="h-3 w-3" />
          Page previews
          {totalPages > 0 && (
            <span className="text-muted-foreground font-normal">
              · {selectedPages.size}/{totalPages} picked
            </span>
          )}
        </Label>
        {totalPages > 0 && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={disabled}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              All
            </button>
            <span className="text-[10px] text-muted-foreground">·</span>
            <button
              type="button"
              onClick={onClearSelection}
              disabled={disabled}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              None
            </button>
          </div>
        )}
      </div>

      {opening && totalPages === 0 ? (
        <div className="flex items-center justify-center py-6 text-xs text-muted-foreground gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Opening PDF…
        </div>
      ) : (
        <div
          ref={containerRef}
          className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto pr-1"
        >
          {pages.map((meta) => {
            const picked = selectedPages.has(meta.page);
            const thumb = renderedMap.get(meta.page);
            const aspect = meta.aspectRatio || PLACEHOLDER_ASPECT;
            return (
              <div
                key={meta.page}
                data-page={meta.page}
                ref={(el) => {
                  if (el) itemRefs.current.set(meta.page, el);
                  else itemRefs.current.delete(meta.page);
                }}
                style={{ aspectRatio: String(aspect) }}
              >
                <button
                  type="button"
                  onClick={() => onTogglePage(meta.page)}
                  disabled={disabled}
                  className={`group relative w-full h-full rounded-md overflow-hidden border-2 transition-all ${
                    picked
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border/50 hover:border-primary/50 opacity-70 hover:opacity-100"
                  }`}
                  title={`Page ${meta.page}${picked ? " — selected" : ""}`}
                >
                  {thumb ? (
                    <img
                      src={thumb.dataUrl}
                      alt={`Page ${meta.page}`}
                      loading="lazy"
                      className="w-full h-full object-cover bg-white"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted/40 flex items-center justify-center">
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground/60" />
                    </div>
                  )}
                  <div className="absolute top-1 left-1 bg-background/80 backdrop-blur-sm text-[9px] font-medium px-1 py-0.5 rounded">
                    {meta.page}
                  </div>
                  {picked && (
                    <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
      {totalPages > 0 && (
        <p className="text-[10px] text-muted-foreground">
          Click pages to include them as visual references in your deck. Previews render as you scroll.
        </p>
      )}
    </div>
  );
};
