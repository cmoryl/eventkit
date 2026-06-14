// ShortcutsOverlay — keyboard cheatsheet for the slide editor.
// Opens with `?` (Shift+/) or via the Nav Rail. Ignores input/contenteditable focus.

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Row = { keys: string[]; label: string };
type Group = { title: string; rows: Row[] };

const GROUPS: Group[] = [
  {
    title: "Selection",
    rows: [
      { keys: ["Click"], label: "Select text box / section" },
      { keys: ["Double-click"], label: "Edit text inline" },
      { keys: ["Esc"], label: "Deselect" },
      { keys: ["Delete", "Backspace"], label: "Remove selected text box" },
    ],
  },
  {
    title: "Move & Resize",
    rows: [
      { keys: ["Drag"], label: "Move text box (snaps to thirds / center)" },
      { keys: ["Alt", "+", "Drag"], label: "Move without snapping" },
      { keys: ["←", "→", "↑", "↓"], label: "Nudge 0.5%" },
      { keys: ["Shift", "+", "Arrows"], label: "Nudge 5%" },
      { keys: ["Shift", "+", "Drag handle"], label: "Resize uniformly" },
    ],
  },
  {
    title: "Editing",
    rows: [
      { keys: ["⌘ / Ctrl", "+", "D"], label: "Duplicate selected text box" },
      { keys: ["⌘ / Ctrl", "+", "Z"], label: "Undo" },
      { keys: ["⌘ / Ctrl", "+", "Shift", "+", "Z"], label: "Redo" },
    ],
  },
  {
    title: "Help",
    rows: [
      { keys: ["?"], label: "Toggle this cheatsheet" },
    ],
  },
];

export const useShortcutsOverlay = () => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ae = document.activeElement as HTMLElement | null;
      const inField = ae && (ae.isContentEditable || ae.tagName === "INPUT" || ae.tagName === "TEXTAREA");
      if (inField) return;
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return { open, setOpen };
};

export const ShortcutsOverlay: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[80] bg-background/70 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
          <h2 className="text-sm font-semibold">Keyboard shortcuts</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-2">
                {group.title}
              </h3>
              <div className="space-y-1.5">
                {group.rows.map((row, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-foreground/85">{row.label}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {row.keys.map((k, j) =>
                        k === "+" ? (
                          <span key={j} className="text-muted-foreground/70">+</span>
                        ) : (
                          <kbd
                            key={j}
                            className="px-1.5 py-0.5 rounded border border-border bg-muted/50 text-[10px] font-mono text-foreground/80 min-w-[20px] text-center"
                          >
                            {k}
                          </kbd>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-border/60 text-[10px] text-muted-foreground">
          Press <kbd className="px-1 py-0.5 rounded border border-border bg-muted/50 font-mono">?</kbd> anytime to toggle this panel.
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ShortcutsOverlay;
