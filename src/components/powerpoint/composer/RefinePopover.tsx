import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Settings2 } from "lucide-react";

interface Props {
  audience: string;
  setAudience: (v: string) => void;
  tone: string;
  setTone: (v: string) => void;
  slideCount: number;
  setSlideCount: (n: number) => void;
  themeOverride: string;
  setThemeOverride: (v: string) => void;
  disabled?: boolean;
}

// Refine chip + popover. Bundles audience, tone, slide count, and free-form
// theme override. Defaults: audience "", tone "", slides 10, theme "".
export const RefinePopover: React.FC<Props> = ({
  audience,
  setAudience,
  tone,
  setTone,
  slideCount,
  setSlideCount,
  themeOverride,
  setThemeOverride,
  disabled,
}) => {
  const parts: string[] = [`${slideCount} slides`];
  if (tone) parts.push(`${tone} tone`);
  if (audience) parts.push(audience);
  if (themeOverride) parts.push("custom theme");
  const customised =
    slideCount !== 10 || !!tone.trim() || !!audience.trim() || !!themeOverride.trim();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={customised ? "default" : "outline"}
          size="sm"
          disabled={disabled}
          className="h-9 rounded-full gap-2"
        >
          <Settings2 className="h-3.5 w-3.5" />
          <span className="text-xs truncate max-w-[260px]">
            {customised ? parts.join(" · ") : "Refine"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 space-y-3 z-50 bg-popover" align="start">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="refine-slides" className="text-xs">Slide count</Label>
            <span className="text-xs text-muted-foreground">{slideCount}</span>
          </div>
          <Slider
            id="refine-slides"
            value={[slideCount]}
            onValueChange={(v) => setSlideCount(Math.max(3, Math.min(30, v[0])))}
            min={3}
            max={30}
            step={1}
            disabled={disabled}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="refine-audience" className="text-xs">Audience</Label>
          <Input
            id="refine-audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g. Series A investors"
            className="h-9 text-sm"
            disabled={disabled}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="refine-tone" className="text-xs">Tone</Label>
          <Input
            id="refine-tone"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            placeholder="bold, formal, playful…"
            className="h-9 text-sm"
            disabled={disabled}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="refine-theme" className="text-xs">Theme override</Label>
          <Input
            id="refine-theme"
            value={themeOverride}
            onChange={(e) => setThemeOverride(e.target.value)}
            placeholder="dark navy with gold accents…"
            className="h-9 text-sm"
            disabled={disabled}
          />
          <p className="text-[10px] text-muted-foreground">
            Overrides brand colors when set.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
