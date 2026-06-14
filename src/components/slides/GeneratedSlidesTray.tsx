// GeneratedSlidesTray — a horizontal docked strip that surfaces AI-generated
// slide drafts as draggable thumbnails. Each card is draggable using the
// SLIDE_SECTION_MIME payload already wired into SlideEditor's canvas/thumbnail
// drop handlers, so users can recombine AI output without a destructive
// "Replace deck" action.

import React from "react";
import { Sparkles, X, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SLIDE_SECTION_MIME } from "./SlideSmartLayoutsPanel";
import { SlideRenderer } from "./SlideRenderer";
import type { SlideData } from "./slideTypes";

interface Props {
  slides: SlideData[];
  brandColors?: { primary?: string; secondary?: string; accent?: string };
  brandFonts?: { heading?: string; body?: string };
  onInsert: (payload: Omit<SlideData, "id">) => void;
  onDismiss: () => void;
}

export const GeneratedSlidesTray: React.FC<Props> = ({
  slides,
  brandColors,
  brandFonts,
  onInsert,
  onDismiss,
}) => {
  const [collapsed, setCollapsed] = React.useState(false);

  if (!slides || slides.length === 0) return null;

  const buildPayload = (slide: SlideData): Omit<SlideData, "id"> => {
    const { id: _id, ...rest } = slide;
    return rest;
  };

  return (
    <div className="pointer-events-auto fixed bottom-3 left-1/2 -translate-x-1/2 z-30 w-[min(96vw,1180px)]">
      <div className="rounded-xl border border-border/70 bg-card/95 backdrop-blur-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold">AI draft tray</span>
            <span className="text-[10px] text-muted-foreground">
              {slides.length} slide{slides.length === 1 ? "" : "s"} · drag onto canvas or rail
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setCollapsed((v) => !v)}
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onDismiss}
              title="Dismiss"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Tray */}
        {!collapsed && (
          <div className="flex gap-2 overflow-x-auto p-2 scrollbar-thin">
            {slides.map((slide, i) => {
              const payload = buildPayload(slide);
              return (
                <div
                  key={slide.id ?? i}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      SLIDE_SECTION_MIME,
                      JSON.stringify(payload),
                    );
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  className="group relative shrink-0 w-[170px] rounded-lg overflow-hidden border border-border/60 bg-background cursor-grab active:cursor-grabbing hover:border-primary/60 hover:shadow-md transition-all"
                  title="Drag to insert · or click +"
                >
                  {/* Mini preview at native 1280x720 scaled via wrapper */}
                  <div className="relative w-[170px] h-[96px] overflow-hidden bg-muted">
                    <div
                      className="absolute top-0 left-0"
                      style={{
                        width: 1280,
                        height: 720,
                        transform: "scale(0.1328)",
                        transformOrigin: "top left",
                      }}
                    >
                      <SlideRenderer
                        slide={slide}
                        brandColors={brandColors}
                        brandFonts={brandFonts}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-[10px] truncate text-muted-foreground">
                      {slide.title || `Slide ${i + 1}`}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onInsert(payload)}
                      title="Insert after current"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
