// EditorNavRail — persistent 44px vertical icon rail on the left of the editor.
// Mirrors the industry-standard pattern (Canva, Figma, Pitch): one always-visible
// icon column that controls a single 280px drawer. Click an active icon to
// collapse the drawer; click a different icon to switch tabs.
//
// SlideEditor passes in tab definitions — the rail itself is purely presentational.

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

export const EditorNavRail: React.FC<Props> = ({
  tabs,
  activeId,
  onChange,
  drawerWidth = 280,
}) => {
  const active = tabs.find((t) => t.id === activeId) ?? null;
  const drawerOpen = !!active?.content;

  return (
    <div className="flex h-full shrink-0">
      {/* Icon rail */}
      <TooltipProvider delayDuration={200}>
        <div className="w-11 h-full border-r border-border bg-card flex flex-col items-center py-2 gap-1 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeId === tab.id;
            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
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
                      "relative h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {typeof tab.badge === "number" && tab.badge > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-3.5 px-1 rounded-full bg-primary text-[8px] font-bold text-primary-foreground flex items-center justify-center">
                        {tab.badge > 9 ? "9+" : tab.badge}
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {tab.label}
                </TooltipContent>
              </Tooltip>
            );
          })}

          <div className="flex-1" />

          {/* Collapse/expand toggle for the currently-open drawer */}
          {drawerOpen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => onChange(null)}
                  title="Hide panel"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">Hide panel</TooltipContent>
            </Tooltip>
          )}
          {!drawerOpen && active === null && tabs[0] && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => onChange(tabs[0].id)}
                  title="Show panel"
                >
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
