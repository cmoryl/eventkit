// Inspector panel for the optional Gamma-style accent image on a slide.
// Lets the user pick position, overlay style, intensity, and focal point.
import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Image as ImageIcon,
  Square,
  PanelTop,
  PanelLeft,
  PanelRight,
  Maximize2,
  X,
} from "lucide-react";
import type { SlideData } from "./slideTypes";

type Position = NonNullable<SlideData["accentImage"]>["position"];
type Overlay = NonNullable<SlideData["accentImage"]>["overlay"];

interface Props {
  slide: SlideData;
  onChange: (next: SlideData["accentImage"] | undefined) => void;
}

const POSITIONS: { id: Position; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "none", label: "None", icon: Square },
  { id: "top", label: "Top", icon: PanelTop },
  { id: "left", label: "Left", icon: PanelLeft },
  { id: "right", label: "Right", icon: PanelRight },
  { id: "background", label: "Background", icon: Maximize2 },
];

const OVERLAYS: { id: Overlay; label: string }[] = [
  { id: "none", label: "None" },
  { id: "frosted", label: "Frosted" },
  { id: "faded", label: "Faded" },
  { id: "clear", label: "Clear" },
];

export const AccentImagePanel: React.FC<Props> = ({ slide, onChange }) => {
  const accent = slide.accentImage;
  const url = accent?.url ?? "";
  const position: Position = accent?.position ?? "none";
  const overlay: Overlay = accent?.overlay ?? "none";
  const intensity = typeof accent?.intensity === "number" ? accent.intensity : 1;
  const focalX = typeof accent?.focalX === "number" ? accent.focalX : 50;
  const focalY = typeof accent?.focalY === "number" ? accent.focalY : 50;

  const update = (patch: Partial<NonNullable<SlideData["accentImage"]>>) => {
    onChange({
      url: accent?.url ?? "",
      position: accent?.position ?? "none",
      overlay: accent?.overlay ?? "none",
      intensity: accent?.intensity ?? 1,
      focalX: accent?.focalX ?? 50,
      focalY: accent?.focalY ?? 50,
      ...patch,
    });
  };

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <ImageIcon className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-xs font-medium truncate">Accent image</span>
        </div>
        {accent && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px]"
            onClick={() => onChange(undefined)}
            aria-label="Clear accent image"
          >
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        )}
      </div>

      <div>
        <label className="text-[10px] text-muted-foreground">Image URL</label>
        <Input
          value={url}
          onChange={(e) => update({ url: e.target.value })}
          placeholder="https://… or drop a brand asset here"
          className="h-7 text-xs"
          aria-label="Accent image URL"
        />
        <p className="mt-1 text-[10px] text-muted-foreground">
          Tip: hold <kbd className="px-1 rounded bg-muted text-[9px]">Alt</kbd> while dragging a brand image onto the canvas to set it as the accent.
        </p>
      </div>

      <div>
        <label className="text-[10px] text-muted-foreground mb-1 block">Position</label>
        <div className="grid grid-cols-5 gap-1">
          {POSITIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => update({ position: id })}
              aria-label={`Accent position: ${label}`}
              aria-pressed={position === id}
              title={label}
              className={`flex flex-col items-center gap-0.5 rounded-md border p-1.5 text-[9px] transition ${
                position === id ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-background hover:border-primary/40"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {position !== "none" && (
        <>
          <div>
            <label className="text-[10px] text-muted-foreground mb-1 block">Overlay</label>
            <div className="grid grid-cols-4 gap-1">
              {OVERLAYS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => update({ overlay: id })}
                  aria-pressed={overlay === id}
                  className={`rounded-md border px-1.5 py-1 text-[10px] transition ${
                    overlay === id ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-background hover:border-primary/40"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground mb-1 flex items-center justify-between">
              <span>Intensity</span>
              <span className="tabular-nums">{Math.round(intensity * 100)}%</span>
            </label>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={[intensity]}
              onValueChange={(v) => update({ intensity: v[0] ?? 1 })}
              aria-label="Overlay intensity"
            />
          </div>

          {position !== "background" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground mb-0.5 block">Focal X · {Math.round(focalX)}%</label>
                <Slider min={0} max={100} step={1} value={[focalX]} onValueChange={(v) => update({ focalX: v[0] ?? 50 })} />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-0.5 block">Focal Y · {Math.round(focalY)}%</label>
                <Slider min={0} max={100} step={1} value={[focalY]} onValueChange={(v) => update({ focalY: v[0] ?? 50 })} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AccentImagePanel;
