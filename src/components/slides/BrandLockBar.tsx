// BrandLockBar — toggleable "Pixel-perfect brand fidelity" lock.
// When enabled, the editor will normalize newly inserted slides (manual,
// section, AI, template) so their bg/text/accent colors match the active
// brand. This is a soft lock: existing slides are left alone unless the
// user clicks "Apply to all" from the popover.

import React from "react";
import { Lock, LockOpen, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export interface BrandLockState {
  locked: boolean;
  primary?: string;
  secondary?: string;
  accent?: string;
}

interface Props {
  brandName?: string;
  brandColors?: { primary?: string; secondary?: string; accent?: string };
  locked: boolean;
  onToggle: (locked: boolean) => void;
  onApplyAll: () => void;
}

const Swatch: React.FC<{ color?: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <span
      className="h-3 w-3 rounded-sm border border-border/60"
      style={{ background: color || "transparent" }}
    />
    <span className="text-[10px] text-muted-foreground">{label}</span>
  </div>
);

export const BrandLockBar: React.FC<Props> = ({
  brandName,
  brandColors,
  locked,
  onToggle,
  onApplyAll,
}) => {
  const hasBrand = Boolean(
    brandColors?.primary || brandColors?.secondary || brandColors?.accent,
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant={locked ? "default" : "outline"}
          className="h-8 gap-1.5"
          disabled={!hasBrand}
          title={hasBrand ? "Brand lock" : "Connect a brand to enable lock"}
        >
          {locked ? (
            <Lock className="h-3.5 w-3.5" />
          ) : (
            <LockOpen className="h-3.5 w-3.5" />
          )}
          <span className="text-xs">Brand Lock</span>
          {locked && (
            <Badge variant="secondary" className="h-4 px-1 text-[9px]">
              ON
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold">Pixel-perfect brand</p>
              <p className="text-[10px] text-muted-foreground">
                {brandName || "Active brand"} colors enforced on new slides
              </p>
            </div>
            <Switch checked={locked} onCheckedChange={onToggle} />
          </div>

          {hasBrand && (
            <div className="flex items-center gap-3 pt-1 border-t">
              <Swatch color={brandColors?.primary} label="Primary" />
              <Swatch color={brandColors?.secondary} label="Secondary" />
              <Swatch color={brandColors?.accent} label="Accent" />
            </div>
          )}

          <Button
            size="sm"
            variant="outline"
            className="w-full h-7 text-xs gap-1.5"
            onClick={onApplyAll}
            disabled={!hasBrand}
          >
            <Wand2 className="h-3 w-3" />
            Apply to all existing slides
          </Button>

          {!hasBrand && (
            <p className="text-[10px] text-muted-foreground">
              No brand is selected. Choose a brand from the brand selector to
              unlock pixel-perfect mode.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Helper used by SlideEditor to enforce brand colors when locked.
export function applyBrandLockToSlide<T extends { bgColor?: string; textColor?: string; accentColor?: string }>(
  slide: T,
  colors: { primary?: string; secondary?: string; accent?: string },
): T {
  if (!colors.primary && !colors.accent) return slide;
  return {
    ...slide,
    bgColor: colors.primary ?? slide.bgColor,
    accentColor: colors.accent ?? slide.accentColor,
  };
}
