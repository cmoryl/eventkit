import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BarChart3, Image as ImageIcon, Loader2, Sparkles, Upload, Trash2, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type {
  ChartType,
  DeckOutline,
  SlideChartSpec,
  SlideReferenceImage,
} from "../DeckPreview";

const CHART_TYPES: ChartType[] = ["bar", "line", "pie", "donut", "area", "scatter"];

export type AssetEditTarget =
  | { kind: "chart"; chart?: SlideChartSpec }
  | { kind: "image"; image: SlideReferenceImage; index: number };

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  target: AssetEditTarget | null;
  /** Stable id for storage path when uploading a replacement image. */
  slideId: string;
  /** Deck palette (hex strings without `#`) — used as default chart colors and AI restyle context. */
  palette?: DeckOutline["palette"];
  /** Fired when chart is saved/cleared. */
  onChartChange?: (chart: SlideChartSpec | undefined) => void;
  /** Fired when image at `index` is updated/replaced. */
  onImageChange?: (index: number, image: SlideReferenceImage) => void;
  /** Fired when image at `index` is removed. */
  onImageRemove?: (index: number) => void;
}

export const AssetEditDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  target,
  slideId,
  palette,
  onChartChange,
  onImageChange,
  onImageRemove,
}) => {
  if (!target) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#0A0838]/95 border-white/10 text-white backdrop-blur-xl">
        {target.kind === "chart" ? (
          <ChartEditor
            chart={target.chart}
            palette={palette}
            onSave={(c) => {
              onChartChange?.(c);
              onOpenChange(false);
            }}
            onClear={() => {
              onChartChange?.(undefined);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        ) : (
          <ImageEditor
            image={target.image}
            index={target.index}
            slideId={slideId}
            palette={palette}
            onSave={(img) => {
              onImageChange?.(target.index, img);
              onOpenChange(false);
            }}
            onRemove={() => {
              onImageRemove?.(target.index);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ============================================================
 * Chart editor — data, type, title, colors, axis labels, legend
 * ============================================================ */

const ChartEditor: React.FC<{
  chart?: SlideChartSpec;
  palette?: DeckOutline["palette"];
  onSave: (c: SlideChartSpec) => void;
  onClear: () => void;
  onCancel: () => void;
}> = ({ chart, palette, onSave, onClear, onCancel }) => {
  const paletteHexes = useMemo(
    () =>
      palette
        ? [palette.primary, palette.accent, palette.secondary, palette.text].filter(Boolean)
        : [],
    [palette],
  );

  const [type, setType] = useState<ChartType>(chart?.type || "bar");
  const [title, setTitle] = useState<string>(chart?.title || "");
  const [csv, setCsv] = useState<string>(() => csvFromChart(chart));
  const [xLabel, setXLabel] = useState<string>(chart?.xLabel || "");
  const [yLabel, setYLabel] = useState<string>(chart?.yLabel || "");
  const [showLegend, setShowLegend] = useState<boolean>(chart?.showLegend ?? true);
  const [colors, setColors] = useState<string[]>(chart?.colors?.length ? chart.colors : paletteHexes);

  const data = useMemo(() => parseCsv(csv), [csv]);
  const supportsAxes = type === "bar" || type === "line" || type === "area" || type === "scatter";

  const updateColor = (i: number, hex: string) => {
    const next = colors.slice();
    next[i] = hex.replace(/^#/, "");
    setColors(next);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-cyan-300" /> Edit chart
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-white/70">Chart type</Label>
            <Select value={type} onValueChange={(v) => setType(v as ChartType)}>
              <SelectTrigger className="h-9 bg-white/5 border-white/15 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHART_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-white/70">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Optional chart title"
              className="h-9 bg-white/5 border-white/15 text-white placeholder:text-white/40"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-white/70">Data (label, value — one per line)</Label>
          <Textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            placeholder={"label, value\nQ1, 12\nQ2, 18\nQ3, 27"}
            rows={6}
            className="font-mono text-xs bg-white/5 border-white/15 text-white placeholder:text-white/40"
          />
          <p className="text-[10px] text-white/50">{data.length} valid row{data.length === 1 ? "" : "s"} parsed.</p>
        </div>

        {supportsAxes && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/70">X axis label</Label>
              <Input
                value={xLabel}
                onChange={(e) => setXLabel(e.target.value)}
                placeholder="e.g. Quarter"
                className="h-9 bg-white/5 border-white/15 text-white placeholder:text-white/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/70">Y axis label</Label>
              <Input
                value={yLabel}
                onChange={(e) => setYLabel(e.target.value)}
                placeholder="e.g. Revenue ($M)"
                className="h-9 bg-white/5 border-white/15 text-white placeholder:text-white/40"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-white/70">Colors</Label>
            {paletteHexes.length > 0 && (
              <button
                type="button"
                onClick={() => setColors(paletteHexes)}
                className="inline-flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-200"
              >
                <RotateCcw className="h-3 w-3" /> Reset to brand palette
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {(colors.length ? colors : ["6366f1", "06b6d4", "f59e0b", "ef4444"]).map((hex, i) => (
              <label key={i} className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-1">
                <input
                  type="color"
                  value={`#${hex.replace(/^#/, "")}`}
                  onChange={(e) => updateColor(i, e.target.value)}
                  className="h-6 w-6 rounded cursor-pointer bg-transparent border-0 p-0"
                />
                <span className="text-[10px] font-mono text-white/70 uppercase">#{hex.replace(/^#/, "")}</span>
              </label>
            ))}
            <button
              type="button"
              onClick={() => setColors([...colors, paletteHexes[0] || "6366f1"])}
              className="rounded-md border border-dashed border-white/15 bg-white/[0.02] px-2 py-1 text-[11px] text-white/60 hover:text-white"
            >
              + Add color
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.04] px-3 py-2">
          <div>
            <Label className="text-xs text-white">Show legend</Label>
            <p className="text-[10px] text-white/55">Render a legend below the chart.</p>
          </div>
          <Switch checked={showLegend} onCheckedChange={setShowLegend} />
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-2">
        <Button variant="ghost" onClick={onClear} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" /> Remove chart
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() =>
            onSave({
              type,
              title: title || undefined,
              data,
              xLabel: xLabel || undefined,
              yLabel: yLabel || undefined,
              colors: colors.length ? colors.map((c) => c.replace(/^#/, "")) : undefined,
              showLegend,
            })
          }
          className="bg-cyan-500 hover:bg-cyan-400 text-[#0A0838]"
        >
          Save chart
        </Button>
      </DialogFooter>
    </>
  );
};

/* ============================================================
 * Image editor — replace, caption, treatment, AI restyle
 * ============================================================ */

const ImageEditor: React.FC<{
  image: SlideReferenceImage;
  index: number;
  slideId: string;
  palette?: DeckOutline["palette"];
  onSave: (img: SlideReferenceImage) => void;
  onRemove: () => void;
  onCancel: () => void;
}> = ({ image, slideId, palette, onSave, onRemove, onCancel }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [url, setUrl] = useState(image.url);
  const [caption, setCaption] = useState(image.caption || "");
  const [treatment, setTreatment] = useState<SlideReferenceImage["treatment"]>(image.treatment || "style-match");
  const [busy, setBusy] = useState<"upload" | "restyle" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrl(image.url);
    setCaption(image.caption || "");
    setTreatment(image.treatment || "style-match");
  }, [image]);

  const replaceFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }
    const file = files[0];
    if (!file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max 8 MB", variant: "destructive" });
      return;
    }
    setBusy("upload");
    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `${user.id}/${slideId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("slide-uploads").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (error) {
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        return;
      }
      const { data: pub } = supabase.storage.from("slide-uploads").getPublicUrl(path);
      setUrl(pub.publicUrl);
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const restyle = async () => {
    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }
    setBusy("restyle");
    try {
      // Fetch current image and convert to base64 for the edit-image edge function
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load image (${res.status})`);
      const blob = await res.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(r.error);
        r.readAsDataURL(blob);
      });

      const paletteHint = palette
        ? `Restyle this image to match a deck with primary #${palette.primary}, accent #${palette.accent}, secondary #${palette.secondary}, background #${palette.background}. Recolor / duotone tastefully, preserve subject and composition.`
        : `Restyle this image so it feels editorial, premium, and cohesive with a polished modern presentation deck. Preserve the subject and composition.`;

      const { data, error } = await supabase.functions.invoke("edit-image", {
        body: { imageBase64: base64, instruction: paletteHint },
      });
      if (error) {
        toast({ title: "Restyle failed", description: error.message, variant: "destructive" });
        return;
      }
      const newUrl: string | undefined = data?.imageUrl;
      if (!newUrl) {
        toast({ title: "Restyle failed", description: "No image returned.", variant: "destructive" });
        return;
      }
      // Persist the restyled (base64) image into storage so it's not lost on refresh
      const m = newUrl.match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
      if (m) {
        const mime = m[1];
        const ext = mime.split("/")[1].replace("+xml", "").split(";")[0] || "png";
        const bytes = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
        const path = `${user.id}/${slideId}/${crypto.randomUUID()}-restyled.${ext}`;
        const { error: upErr } = await supabase.storage.from("slide-uploads").upload(path, bytes, {
          cacheControl: "3600",
          upsert: false,
          contentType: mime,
        });
        if (upErr) {
          // Fall back to using the data URL directly
          setUrl(newUrl);
        } else {
          const { data: pub } = supabase.storage.from("slide-uploads").getPublicUrl(path);
          setUrl(pub.publicUrl);
        }
      } else {
        setUrl(newUrl);
      }
      toast({ title: "Image restyled", description: "Saved a new version. Click Save to apply." });
    } catch (e) {
      toast({ title: "Restyle failed", description: String(e), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-cyan-300" /> Edit reference image
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div className="rounded-lg border border-white/10 bg-black/40 overflow-hidden">
          <img src={url} alt={caption || "reference"} className="w-full max-h-[320px] object-contain bg-black/40" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={busy !== null}
            className="bg-white/10 border-white/15 text-white hover:bg-white/20"
          >
            {busy === "upload" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Replace image
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={restyle}
            disabled={busy !== null}
            className="bg-cyan-500 hover:bg-cyan-400 text-[#0A0838]"
          >
            {busy === "restyle" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            AI restyle to deck
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => replaceFile(e.target.files)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-white/70">Caption / context for AI</Label>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Optional caption"
              className="h-9 bg-white/5 border-white/15 text-white placeholder:text-white/40"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-white/70">Treatment</Label>
            <Select value={treatment} onValueChange={(v) => setTreatment(v as SlideReferenceImage["treatment"])}>
              <SelectTrigger className="h-9 bg-white/5 border-white/15 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="style-match">Style-match to deck</SelectItem>
                <SelectItem value="as-is">Use as-is</SelectItem>
                <SelectItem value="inspiration">Inspiration only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-2">
        <Button variant="ghost" onClick={onRemove} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" /> Remove
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => onSave({ url, caption: caption || undefined, treatment })}
          className="bg-cyan-500 hover:bg-cyan-400 text-[#0A0838]"
        >
          Save
        </Button>
      </DialogFooter>
    </>
  );
};

/* ============================================================
 * Helpers — shared with SlideDetailsPanel
 * ============================================================ */

function parseCsv(text: string): { label: string; value: number }[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^label\s*,\s*value$/i.test(l))
    .map((l) => {
      const [label, value] = l.split(/[,\t]/).map((x) => x.trim());
      return { label: label || "", value: Number(value) || 0 };
    })
    .filter((r) => r.label);
}

function csvFromChart(chart?: SlideChartSpec): string {
  if (!chart || !chart.data?.length) return "";
  return ["label, value", ...chart.data.map((d) => `${d.label}, ${d.value}`)].join("\n");
}
