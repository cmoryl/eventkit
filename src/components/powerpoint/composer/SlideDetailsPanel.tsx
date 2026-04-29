import React, { useCallback, useRef, useState } from "react";
import { Image as ImageIcon, BarChart3, FileText, Sparkles, Upload, X, Loader2, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type {
  SlideOutline,
  SlideChartSpec,
  SlideReferenceImage,
  VisualIntent,
  ChartType,
  DeckOutline,
} from "../DeckPreview";
import { AssetEditDialog, type AssetEditTarget } from "./AssetEditDialog";

interface Props {
  slide: SlideOutline;
  slideId: string;            // stable id for storage path; pass a generated key
  onChange: (patch: Partial<SlideOutline>) => void;
  /** Deck palette for chart color defaults + AI image restyling. */
  palette?: DeckOutline["palette"];
}

const VISUAL_INTENTS: { value: VisualIntent; label: string; hint: string }[] = [
  { value: "auto", label: "Auto",        hint: "Let the AI decide based on content" },
  { value: "photo", label: "Photo",      hint: "Use a real-world photograph" },
  { value: "infographic", label: "Infographic", hint: "Iconography + numbers + flow" },
  { value: "chart", label: "Chart",      hint: "Render the data below as a chart" },
  { value: "icon-grid", label: "Icon grid", hint: "3-6 themed icons in a grid" },
  { value: "screenshot", label: "Screenshot", hint: "Treat as product screenshot" },
  { value: "none", label: "Text only",   hint: "No visual element" },
];

const CHART_TYPES: ChartType[] = ["bar", "line", "pie", "donut", "area", "scatter"];

/** Compact, dark-glass per-slide details editor: notes, visual intent, chart data, image refs. */
export const SlideDetailsPanel: React.FC<Props> = ({ slide, slideId, onChange, palette }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [chartCsv, setChartCsv] = useState<string>(() => csvFromChart(slide.chart));
  const fileRef = useRef<HTMLInputElement>(null);
  const [editTarget, setEditTarget] = useState<AssetEditTarget | null>(null);

  const setIntent = (v: VisualIntent) => onChange({ visualIntent: v });

  const setChartType = (t: ChartType) => {
    const next: SlideChartSpec = {
      type: t,
      title: slide.chart?.title,
      data: slide.chart?.data || [],
      notes: slide.chart?.notes,
    };
    onChange({ chart: next });
  };

  const commitChartData = useCallback(() => {
    const data = parseCsv(chartCsv);
    const next: SlideChartSpec = {
      type: slide.chart?.type || "bar",
      title: slide.chart?.title,
      data,
      notes: slide.chart?.notes,
    };
    onChange({ chart: next });
  }, [chartCsv, slide.chart, onChange]);

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to upload slide images.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const next: SlideReferenceImage[] = [...(slide.references || [])];
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 8 * 1024 * 1024) {
          toast({ title: "Image too large", description: `${file.name} exceeds 8 MB`, variant: "destructive" });
          continue;
        }
        const ext = (file.name.split(".").pop() || "png").toLowerCase();
        const path = `${user.id}/${slideId}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("slide-uploads").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });
        if (error) {
          toast({ title: "Upload failed", description: error.message, variant: "destructive" });
          continue;
        }
        const { data: pub } = supabase.storage.from("slide-uploads").getPublicUrl(path);
        next.push({ url: pub.publicUrl, treatment: "style-match" });
      }
      onChange({ references: next });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [user, slide.references, slideId, onChange, toast]);

  const removeRef = (idx: number) => {
    const next = (slide.references || []).filter((_, i) => i !== idx);
    onChange({ references: next });
  };

  const setRefTreatment = (idx: number, treatment: SlideReferenceImage["treatment"]) => {
    const next = (slide.references || []).map((r, i) => (i === idx ? { ...r, treatment } : r));
    onChange({ references: next });
  };

  const setRefCaption = (idx: number, caption: string) => {
    const next = (slide.references || []).map((r, i) => (i === idx ? { ...r, caption } : r));
    onChange({ references: next });
  };

  return (
    <div className="mt-2 space-y-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm">
      {/* Notes */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/70">
          <FileText className="h-3 w-3" /> Notes for AI
        </Label>
        <Textarea
          value={slide.designNotes || ""}
          onChange={(e) => onChange({ designNotes: e.target.value })}
          placeholder="Tone, must-haves, what this slide should communicate, references…"
          rows={2}
          className="text-sm bg-white/5 border-white/10 text-white placeholder:text-white/40"
        />
      </div>

      {/* Visual intent */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/70">
          <Sparkles className="h-3 w-3" /> Visual intent
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {VISUAL_INTENTS.map((v) => {
            const active = (slide.visualIntent || "auto") === v.value;
            return (
              <button
                key={v.value}
                type="button"
                onClick={() => setIntent(v.value)}
                title={v.hint}
                className={`rounded-full px-2.5 py-1 text-[11px] border transition-colors ${
                  active
                    ? "bg-cyan-300/20 border-cyan-300/60 text-white"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart data — show when intent is chart, or always allow opting in */}
      {(slide.visualIntent === "chart" || slide.chart) && (
        <div className="space-y-1.5 rounded-md border border-white/10 bg-white/[0.04] p-2.5">
          <div className="flex items-center justify-between gap-2">
            <Label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/70">
              <BarChart3 className="h-3 w-3" /> Chart data
            </Label>
            <Select value={slide.chart?.type || "bar"} onValueChange={(v) => setChartType(v as ChartType)}>
              <SelectTrigger className="h-7 w-28 text-xs bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHART_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            value={slide.chart?.title || ""}
            onChange={(e) => onChange({
              chart: { ...(slide.chart || { type: "bar", data: [] }), title: e.target.value },
            })}
            placeholder="Chart title (optional)"
            className="h-8 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
          <Textarea
            value={chartCsv}
            onChange={(e) => setChartCsv(e.target.value)}
            onBlur={commitChartData}
            placeholder={"label, value\nQ1, 12\nQ2, 18\nQ3, 27"}
            rows={4}
            className="text-xs font-mono bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
          <p className="text-[10px] text-white/45">One row per data point. The AI will style this to match the deck.</p>
        </div>
      )}

      {/* Reference images */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/70">
            <ImageIcon className="h-3 w-3" /> Reference images
          </Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="h-7 text-xs gap-1 bg-white/10 border-white/15 text-white hover:bg-white/20"
          >
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            Add
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>
        {(slide.references && slide.references.length > 0) ? (
          <div className="grid grid-cols-3 gap-2">
            {slide.references.map((r, i) => (
              <div key={r.url + i} className="relative rounded-md overflow-hidden border border-white/10 bg-white/5">
                <img src={r.url} alt={r.caption || `ref ${i + 1}`} className="w-full h-20 object-cover" />
                <button
                  type="button"
                  onClick={() => removeRef(i)}
                  className="absolute top-1 right-1 rounded-full bg-black/60 hover:bg-black/80 text-white p-0.5"
                  title="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="p-1.5 space-y-1">
                  <Input
                    value={r.caption || ""}
                    onChange={(e) => setRefCaption(i, e.target.value)}
                    placeholder="Caption / context"
                    className="h-6 text-[10px] bg-white/5 border-white/10 text-white placeholder:text-white/40 px-1.5"
                  />
                  <Select
                    value={r.treatment || "style-match"}
                    onValueChange={(v) => setRefTreatment(i, v as SlideReferenceImage["treatment"])}
                  >
                    <SelectTrigger className="h-6 text-[10px] bg-white/5 border-white/10 text-white px-1.5">
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
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-md border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.05] text-white/50 hover:text-white/80 text-xs py-3 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="h-3 w-3" /> Drop or click to add reference images
          </button>
        )}
      </div>
    </div>
  );
};

// ---------- helpers ----------
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
