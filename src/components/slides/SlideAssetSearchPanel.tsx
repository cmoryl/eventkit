// Inline asset rail for the Slide Editor inspector.
// Lets users search BrandHub images for the active brand and add one to the
// active slide with a single click — no dialog needed.
import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, Plus, Search, Loader2 } from "lucide-react";
import type { BrandFile } from "@/hooks/useBrandHubFiles";

interface SlideAssetSearchPanelProps {
  images: BrandFile[];
  isLoading?: boolean;
  brandName?: string;
  onUseImage: (file: BrandFile) => void;
  onOpenLibrary?: () => void;
}

export const SlideAssetSearchPanel: React.FC<SlideAssetSearchPanelProps> = ({
  images,
  isLoading,
  brandName,
  onUseImage,
  onOpenLibrary,
}) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return images.slice(0, 24);
    return images
      .filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.sectionLabel.toLowerCase().includes(q) ||
          f.sourceName.toLowerCase().includes(q),
      )
      .slice(0, 24);
  }, [images, query]);

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <ImageIcon className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-xs font-medium truncate">
            Brand assets{brandName ? ` · ${brandName}` : ""}
          </span>
          {images.length > 0 && (
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
              {images.length}
            </Badge>
          )}
        </div>
        {onOpenLibrary && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[11px]"
            onClick={onOpenLibrary}
          >
            Browse all
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search brand images…"
          aria-label="Search brand images"
          className="h-7 pl-7 text-xs"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6 text-xs text-muted-foreground gap-2">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading assets…
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-6 text-center text-[11px] text-muted-foreground">
          {images.length === 0
            ? "No BrandHub images found for this brand."
            : "No matches. Try a different search."}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 max-h-[220px] overflow-y-auto pr-0.5">
          {filtered.map((file) => (
            <button
              key={file.url}
              type="button"
              onClick={() => onUseImage(file)}
              aria-label={`Use ${file.name} in active slide`}
              title={`Use “${file.name}” — ${file.sectionLabel}`}
              className="group relative aspect-square rounded-md overflow-hidden border bg-background hover:ring-2 hover:ring-primary transition"
            >
              <img
                src={file.url}
                alt={file.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SlideAssetSearchPanel;
