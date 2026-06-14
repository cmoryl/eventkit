// EditorNavRail — persistent vertical icon rail on the left of the editor.
// Mirrors the industry-standard pattern (Canva, Figma, Pitch): one always-visible
// icon column that controls a single contextual drawer.
//
// Two rail widths:
//   • collapsed (44px) — icon-only, tooltips on hover
//   • expanded  (160px) — icon + label row (Figma-style)
//
// Expanded state is persisted to localStorage under `editor:navrail:expanded`.
//
// Click an active icon to collapse the drawer; click a different icon to switch
// tabs. The rail itself is purely presentational — SlideEditor passes in tabs.

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export interface NavRailTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Drawer body content. Omit for action-only icons that just call onClick. */
  content?: React.ReactNode;
  /** When provided, clicking the icon fires this instead of opening the drawer. */
  onClick?: () => void;
  /** Optional badge count to surface (unread comments, drafts, etc.). */
  badge?: number;
  /** Optional secondary highlight ring color (e.g. "primary" when active). */
  highlight?: boolean;
}

interface Props {
  tabs: NavRailTab[];
  /** Currently selected tab id, or null when the drawer is collapsed. */
  activeId: string | null;
  onChange: (id: string | null) => void;
  /** Drawer width in px — defaults to 280. */
  drawerWidth?: number;
}

const EXPANDED_KEY = "editor:navrail:expanded";

export const EditorNavRail: React.FC<Props> = ({
  tabs,
  activeId,
  onChange,
  drawerWidth = 280,
}) => {
  const [expanded, setExpanded] = useState<boolean>(() => {
    try {
      return localStorage.getItem(EXPANDED_KEY) === "1";
    } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(EXPANDED_KEY, expanded ? "1" : "0"); } catch { /* ignore */ }
  }, [expanded]);

  const active = tabs.find((t) => t.id === activeId) ?? null;
  const drawerOpen = !!active?.content;
  const railWidth = expanded ? 160 : 44;

  return (
    <div className="flex h-full shrink-0">
      {/* Icon rail */}
      <TooltipProvider delayDuration={200}>
        <div
          className="h-full border-r border-border bg-card flex flex-col py-2 gap-0.5 shrink-0 transition-[width] duration-150"
          style={{ width: railWidth }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeId === tab.id;
            const inner = (
              <button
                type="button"
                onClick={() => {
                  if (tab.onClick) {
                    tab.onClick();
                    return;
                  }
                  if (isActive) onChange(null);
                  else onChange(tab.id);
                }}
                className={cn(
                  "relative mx-1 h-9 rounded-lg flex items-center transition-colors",
                  expanded ? "px-2 gap-2 justify-start" : "w-9 justify-center",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {expanded && (
                  <span className="text-[11px] font-medium truncate flex-1 text-left">{tab.label}</span>
                )}
                {typeof tab.badge === "number" && tab.badge > 0 && (
                  <span className={cn(
                    "min-w-3.5 h-3.5 px-1 rounded-full bg-primary text-[8px] font-bold text-primary-foreground flex items-center justify-center",
                    !expanded && "absolute -top-0.5 -right-0.5",
                  )}>
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </span>
                )}
              </button>
            );

            if (expanded) return <div key={tab.id}>{inner}</div>;

            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>{inner}</TooltipTrigger>
                <TooltipContent side="right" className="text-xs">{tab.label}</TooltipContent>
              </Tooltip>
            );
          })}

          <div className="flex-1" />

          {/* Expand/collapse rail toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("mx-auto h-8 w-8", expanded && "ml-auto mr-1")}
                onClick={() => setExpanded((v) => !v)}
                title={expanded ? "Collapse rail" : "Expand rail"}
              >
                {expanded ? <PanelLeftClose className="h-3.5 w-3.5" /> : <PanelLeftOpen className="h-3.5 w-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {expanded ? "Collapse rail" : "Expand rail"}
            </TooltipContent>
          </Tooltip>

          {/* Drawer chevron */}
          {drawerOpen ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="mx-auto h-8 w-8" onClick={() => onChange(null)} title="Hide panel">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">Hide panel</TooltipContent>
            </Tooltip>
          ) : tabs[0] && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="mx-auto h-8 w-8" onClick={() => onChange(tabs[0].id)} title="Show panel">
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">Show panel</TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>

      {/* Drawer */}
      {drawerOpen && (
        <div
          className="h-full border-r border-border bg-card flex flex-col shrink-0 overflow-hidden"
          style={{ width: drawerWidth }}
        >
          <div className="px-3 py-2 border-b border-border flex items-center justify-between shrink-0">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {active!.label}
            </h3>
          </div>
          <div className="flex-1 overflow-hidden">{active!.content}</div>
        </div>
      )}
    </div>
  );
};

export default EditorNavRail;
