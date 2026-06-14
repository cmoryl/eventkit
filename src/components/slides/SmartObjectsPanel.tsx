// SmartObjectsPanel — drawer tab listing draggable smart objects.
// Drag MIME: application/x-eventkit-object  payload: { id, mode? }
// Click-to-insert applies to active slide using the object's defaultMode.
// Hold Alt while dragging from the panel → forces float mode on drop.

import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, BarChart3, Quote, Hash, Type, MousePointerClick,
  Minus, BadgeCheck, ImageIcon, Tag, Megaphone, Sparkles,
} from "lucide-react";
import {
  SMART_OBJECTS,
  SLIDE_OBJECT_MIME,
  type SmartObjectTemplate,
  type SmartObjectCategory,
} from "./smartObjectRegistry";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "stat-kpi": Hash,
  "stat-trio": BarChart3,
  "stat-big-number": Sparkles,
  "text-callout": Megaphone,
  "text-pull-quote": Quote,
  "text-caption": Type,
  "text-cta-button": MousePointerClick,
  "text-kicker": Tag,
  "shape-divider": Minus,
  "shape-badge": BadgeCheck,
  "chart-bar": BarChart3,
  "media-image-frame": ImageIcon,
};

const CATEGORY_LABELS: Record<SmartObjectCategory, string> = {
  stat: "Stats",
  text: "Text",
  shape: "Shapes",
  chart: "Charts",
  media: "Media",
};

interface Props {
  onInsert: (objectId: string) => void;
}

export const SmartObjectsPanel: React.FC<Props> = ({ onInsert }) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SMART_OBJECTS;
    return SMART_OBJECTS.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.category.includes(q),
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<SmartObjectCategory, SmartObjectTemplate[]>();
    for (const o of filtered) {
      if (!map.has(o.category)) map.set(o.category, []);
      map.get(o.category)!.push(o);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const onDragStart = (id: string) => (e: React.DragEvent) => {
    const payload = JSON.stringify({ id, mode: e.altKey ? "float" : undefined });
    e.dataTransfer.setData(SLIDE_OBJECT_MIME, payload);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border/60">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search objects…"
            className="h-8 pl-7 text-xs"
          />
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground leading-tight">
          Drag onto the slide. Hold <kbd className="px-1 rounded bg-muted">Alt</kbd> to drop as a free-floating layer.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {grouped.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-8">No objects match.</p>
        )}
        {grouped.map(([cat, items]) => (
          <div key={cat} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                {CATEGORY_LABELS[cat]}
              </h4>
              <Badge variant="outline" className="h-4 text-[9px] px-1 py-0">
                {items.length}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {items.map((o) => {
                const Icon = ICONS[o.id] ?? Sparkles;
                return (
                  <button
                    key={o.id}
                    type="button"
                    draggable
                    onDragStart={onDragStart(o.id)}
                    onClick={() => onInsert(o.id)}
                    className="group flex flex-col items-start gap-1 rounded-md border border-border/60 bg-background hover:bg-muted hover:border-primary/60 transition-all p-2 text-left"
                    title={`${o.label} — ${o.description}`}
                  >
                    <div className="flex items-center gap-1.5 w-full">
                      <div className="h-6 w-6 rounded bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/15">
                        <Icon className="h-3 w-3 text-foreground/80" />
                      </div>
                      <span className="text-[11px] font-medium truncate">{o.label}</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground line-clamp-2 leading-tight">
                      {o.description}
                    </span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {o.supports.includes("snap") && (
                        <span className="text-[8px] px-1 rounded bg-muted text-muted-foreground">snap</span>
                      )}
                      {o.supports.includes("float") && (
                        <span className="text-[8px] px-1 rounded bg-muted text-muted-foreground">float</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartObjectsPanel;
