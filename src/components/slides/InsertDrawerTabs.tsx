// InsertDrawerTabs — three-tab content for the NavRail "Insert" drawer:
//   • Slides  — SlideSmartLayoutsPanel (whole-slide templates)
//   • Objects — SmartObjectsPanel (drop-onto-slide objects, snap or float)
//   • Media   — slot for BrandHub media (rendered by parent so it can pass props)

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { LayoutTemplate, Sparkles, Image as ImageIcon } from "lucide-react";
import { SlideSmartLayoutsPanel } from "./SlideSmartLayoutsPanel";
import { SmartObjectsPanel } from "./SmartObjectsPanel";
import type { SlideData } from "./slideTypes";

interface Props {
  onInsertSection: (payload: Omit<SlideData, "id">) => void;
  onInsertObject: (objectId: string) => void;
  /** Caller supplies BrandHub media UI (asset search panel). */
  mediaSlot?: React.ReactNode;
}

type TabId = "slides" | "objects" | "media";

export const InsertDrawerTabs: React.FC<Props> = ({
  onInsertSection,
  onInsertObject,
  mediaSlot,
}) => {
  const [tab, setTab] = useState<TabId>("slides");

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-border/60 shrink-0">
        <TabButton active={tab === "slides"} onClick={() => setTab("slides")} icon={LayoutTemplate} label="Slides" />
        <TabButton active={tab === "objects"} onClick={() => setTab("objects")} icon={Sparkles} label="Objects" />
        <TabButton active={tab === "media"} onClick={() => setTab("media")} icon={ImageIcon} label="Media" />
      </div>

      <div className="flex-1 overflow-hidden">
        {tab === "slides" && (
          <div className="h-full overflow-y-auto p-2">
            <SlideSmartLayoutsPanel onInsertSection={onInsertSection} />
          </div>
        )}
        {tab === "objects" && (
          <div className="h-full">
            <SmartObjectsPanel onInsert={onInsertObject} />
          </div>
        )}
        {tab === "media" && (
          <div className="h-full overflow-y-auto p-2">
            {mediaSlot ?? (
              <p className="text-center text-xs text-muted-foreground py-8">
                Connect a brand to browse BrandHub media.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}> = ({ active, onClick, icon: Icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium transition-colors border-b-2",
      active
        ? "border-primary text-foreground"
        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
    )}
  >
    <Icon className="h-3.5 w-3.5" />
    {label}
  </button>
);

export default InsertDrawerTabs;
