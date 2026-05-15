import React, { useState } from "react";
import { GripVertical, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import type { PdfThumbnail } from "@/lib/pdfThumbnails";

interface Props {
  orderedPages: number[];
  thumbnails: Map<number, PdfThumbnail>;
  onReorder: (fromIdx: number, toIdx: number) => void;
  onRemove: (page: number) => void;
  disabled?: boolean;
}

/**
 * Horizontal strip showing the user's selected pages in order.
 * Drag tiles by their grip handle to reorder; this order is preserved
 * when the deck is generated so it acts as a visual storyboard.
 */
export const SelectedPagesOrder: React.FC<Props> = ({
  orderedPages,
  thumbnails,
  onReorder,
  onRemove,
  disabled = false,
}) => {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  if (orderedPages.length === 0) return null;

  const handleDragStart = (idx: number) => (e: React.DragEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    // Firefox requires data to be set for drag to start
    try {
      e.dataTransfer.setData("text/plain", String(idx));
    } catch {
      // ignore
    }
  };

  const handleDragOver = (idx: number) => (e: React.DragEvent) => {
    if (dragIdx === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overIdx !== idx) setOverIdx(idx);
  };

  const handleDrop = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      onReorder(dragIdx, idx);
    }
    setDragIdx(null);
    setOverIdx(null);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setOverIdx(null);
  };

  return (
    <div className="space-y-2 pt-2 border-t border-border/40">
      <div className="flex items-center justify-between">
        <Label className="text-xs flex items-center gap-1.5">
          <GripVertical className="h-3 w-3" />
          Selected order
          <span className="text-muted-foreground font-normal">
            · {orderedPages.length} page{orderedPages.length === 1 ? "" : "s"}
          </span>
        </Label>
        <span className="text-[10px] text-muted-foreground">Drag to reorder</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 pr-1">
        {orderedPages.map((page, idx) => {
          const thumb = thumbnails.get(page);
          const isDragging = dragIdx === idx;
          const isOver = overIdx === idx && dragIdx !== null && dragIdx !== idx;
          return (
            <div
              key={page}
              draggable={!disabled}
              onDragStart={handleDragStart(idx)}
              onDragOver={handleDragOver(idx)}
              onDrop={handleDrop(idx)}
              onDragEnd={handleDragEnd}
              className={`group relative shrink-0 w-20 rounded-md border-2 overflow-hidden bg-background transition-all ${
                isDragging ? "opacity-40 scale-95" : "opacity-100"
              } ${
                isOver ? "border-primary ring-2 ring-primary/40" : "border-border/60"
              } ${disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"}`}
              title={`Position ${idx + 1} — page ${page}`}
            >
              <div className="aspect-[3/4] bg-muted/40">
                {thumb ? (
                  <img
                    src={thumb.dataUrl}
                    alt={`Page ${page}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                    p.{page}
                  </div>
                )}
              </div>
              {/* Order badge */}
              <div className="absolute top-1 left-1 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold flex items-center justify-center">
                {idx + 1}
              </div>
              {/* Page number badge */}
              <div className="absolute bottom-1 left-1 bg-background/80 backdrop-blur-sm text-[9px] font-medium px-1 py-0.5 rounded">
                p.{page}
              </div>
              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(page);
                }}
                disabled={disabled}
                className="absolute top-1 right-1 h-4 w-4 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground text-foreground/80 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                title="Remove from selection"
              >
                <X className="h-2.5 w-2.5" strokeWidth={3} />
              </button>
              {/* Grip overlay */}
              <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-background/60 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <GripVertical className="h-2.5 w-2.5 text-foreground/70" />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground">
        Pages are sent to the AI in this order — use it as a visual storyboard.
      </p>
    </div>
  );
};
