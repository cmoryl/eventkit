// ShortcutsOverlay — surfaced via "?" key in the deck editor. Lists every
// keyboard + voice shortcut so users can discover the new Beat-Gamma actions
// (Brand Lock, Insert, draft tray) without hunting through menus.

import React from "react";
import { X, Keyboard, Sparkles, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface Row {
  keys: string[];
  label: string;
}

const KEYBOARD: Row[] = [
  { keys: ["?"], label: "Show this cheatsheet" },
  { keys: ["Esc"], label: "Close overlays" },
  { keys: ["⌘", "Z"], label: "Undo" },
  { keys: ["⌘", "⇧", "Z"], label: "Redo" },
  { keys: ["⌘", "F"], label: "Find & Replace across deck" },
  { keys: ["⌘", "L"], label: "Toggle Brand Lock" },
  { keys: ["⌘", "D"], label: "Duplicate active slide" },
  { keys: ["Shift", "Del"], label: "Delete active slide" },
  { keys: ["Alt", "↑/↓"], label: "Previous / next slide" },
  { keys: ["Alt", "Shift", "↑/↓"], label: "Move active slide up / down" },
  { keys: ["⌘", "I"], label: "Open Insert (smart layouts)" },
  { keys: ["⌘", "K"], label: "Command palette" },
];

const DRAG: Row[] = [
  { keys: ["Drag"], label: "Smart layout → canvas or rail to insert" },
  { keys: ["Drag"], label: "BrandHub image → canvas to add as body image" },
  { keys: ["Alt", "Drag"], label: "BrandHub image → canvas as accent overlay" },
  { keys: ["Drag"], label: "AI draft tray slide → canvas to insert" },
];

const VOICE: Row[] = [
  { keys: ["Voice"], label: "“Insert a KPI trio with 3 stats…”" },
  { keys: ["Voice"], label: "“Set the accent image to background with frosted overlay”" },
  { keys: ["Voice"], label: "“Turn brand lock on” / “Apply brand to all slides”" },
  { keys: ["Voice"], label: "“Change the title to …” (uses setSlideField)" },
  { keys: ["Voice"], label: "“Insert draft slide 2” / “Dismiss draft tray”" },
];

const Kbd: React.FC<{ k: string }> = ({ k }) => (
  <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded border border-border bg-muted text-[10px] font-mono font-semibold">
    {k}
  </span>
);

const Section: React.FC<{ title: string; icon: React.ReactNode; rows: Row[] }> = ({
  title,
  icon,
  rows,
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {icon}
      {title}
    </div>
    <div className="space-y-1.5">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <span className="text-xs text-foreground">{r.label}</span>
          <span className="flex items-center gap-1">
            {r.keys.map((k, j) => (
              <React.Fragment key={j}>
                {j > 0 && <span className="text-[10px] text-muted-foreground">+</span>}
                <Kbd k={k} />
              </React.Fragment>
            ))}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export const ShortcutsOverlay: React.FC<Props> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="w-[min(720px,96vw)] max-h-[86vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Editor shortcuts</h2>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Section title="Keyboard" icon={<Keyboard className="h-3.5 w-3.5" />} rows={KEYBOARD} />
          <Section title="Drag & drop" icon={<Sparkles className="h-3.5 w-3.5" />} rows={DRAG} />
          <Section title="Voice agent" icon={<Mic className="h-3.5 w-3.5" />} rows={VOICE} />
        </div>
        <div className="px-5 py-3 border-t text-[10px] text-muted-foreground">
          Tip — Voice tools only fire when the editor tab is open. Brand Lock
          enforces brand colors on every new slide.
        </div>
      </div>
    </div>
  );
};
