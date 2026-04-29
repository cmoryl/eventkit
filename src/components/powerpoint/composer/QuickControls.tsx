import React from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Layers } from "lucide-react";

interface Props {
  slideCount: number;
  setSlideCount: (n: number) => void;
  tone: string;
  setTone: (t: string) => void;
  audience: string;
  setAudience: (a: string) => void;
  parallaxMode?: boolean;
  setParallaxMode?: (v: boolean) => void;
  disabled?: boolean;
}

const TONES = ["Professional", "Casual", "Bold", "Friendly", "Executive", "Storytelling"];
const AUDIENCES = ["Executives", "Clients", "Internal team", "Investors", "Students", "General"];

/**
 * Always-visible controls customers expect (Gamma / Beautiful.ai style):
 * slide count slider + tone chips + audience chips + 3D parallax / MP4 export toggle.
 */
export const QuickControls: React.FC<Props> = ({
  slideCount, setSlideCount, tone, setTone, audience, setAudience,
  parallaxMode, setParallaxMode, disabled,
}) => (
  <div className="rounded-2xl border bg-card/60 backdrop-blur-sm p-4 space-y-4 max-w-3xl mx-auto">
    {/* Slide count */}
    <div className="flex items-center gap-4">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground w-20 shrink-0">Slides</div>
      <Slider
        value={[slideCount]}
        onValueChange={(v) => setSlideCount(v[0])}
        min={3}
        max={20}
        step={1}
        disabled={disabled}
        className="flex-1"
      />
      <div className="text-sm font-semibold w-8 text-right tabular-nums">{slideCount}</div>
    </div>

    {/* Tone */}
    <div className="flex items-start gap-4">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground w-20 shrink-0 pt-1.5">Tone</div>
      <div className="flex flex-wrap gap-1.5 flex-1">
        {TONES.map((t) => (
          <button
            key={t}
            type="button"
            disabled={disabled}
            onClick={() => setTone(tone === t ? "" : t)}
            className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
              tone === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:border-primary/50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>

    {/* Audience */}
    <div className="flex items-start gap-4">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground w-20 shrink-0 pt-1.5">Audience</div>
      <div className="flex flex-wrap gap-1.5 flex-1">
        {AUDIENCES.map((a) => (
          <button
            key={a}
            type="button"
            disabled={disabled}
            onClick={() => setAudience(audience === a ? "" : a)}
            className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
              audience === a
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:border-primary/50"
            }`}
          >
            {a}
          </button>
        ))}
      </div>
    </div>
  </div>
);
