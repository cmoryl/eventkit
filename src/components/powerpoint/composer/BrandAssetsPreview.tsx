import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Image as ImageIcon, Upload, X, Info } from "lucide-react";
import { toast } from "sonner";

export type LogoCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface Props {
  logoUrl: string | null | undefined;
  brandName?: string | null;
  coverImageUrl: string | null;
  onCoverImageChange: (file: File | null) => void;
  logoCorner: LogoCorner;
  setLogoCorner: (c: LogoCorner) => void;
  disabled?: boolean;
}

const CORNER_CLASS: Record<LogoCorner, string> = {
  "top-left": "top-1 left-1",
  "top-right": "top-1 right-1",
  "bottom-left": "bottom-1 left-1",
  "bottom-right": "bottom-1 right-1",
};

/**
 * Side-by-side miniature mockup of the title slide (with cover image) and a
 * content slide (with logo stamp), so the user can confirm placement before
 * triggering generation. Pure presentational — owns no global state.
 */
export const BrandAssetsPreview: React.FC<Props> = ({
  logoUrl,
  brandName,
  coverImageUrl,
  onCoverImageChange,
  logoCorner,
  setLogoCorner,
  disabled,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\/(png|jpe?g|gif|webp|bmp|tiff)$/i.test(f.type)) {
      toast.error(`"${f.name}" isn't a supported image type. Use PNG, JPEG, GIF, WebP, BMP, or TIFF.`);
      e.target.value = "";
      return;
    }
    if (f.size > 15 * 1024 * 1024) {
      toast.error(`"${f.name}" is over the 15 MB limit. Compress or resize first.`);
      e.target.value = "";
      return;
    }
    onCoverImageChange(f);
    e.target.value = "";
  };

  const noAssets = !logoUrl && !coverImageUrl;

  return (
    <div className="rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-white/90">
          <ImageIcon className="h-3.5 w-3.5" />
          Brand assets preview
        </div>
        <div className="text-[10px] text-white/60">
          Confirm placement before generating
        </div>
      </div>

      {/* Mockups */}
      <div className="grid grid-cols-2 gap-2">
        {/* Title slide with cover image */}
        <figure className="space-y-1">
          <div className="relative aspect-video w-full overflow-hidden rounded-md border border-white/15 bg-slate-900">
            {coverImageUrl ? (
              <>
                <img
                  src={coverImageUrl}
                  alt="Cover image preview"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {/* Dark legibility scrim — matches script behavior */}
                <div className="absolute inset-x-0 top-[28%] h-[44%] bg-black/55" />
                <div className="absolute inset-0 flex items-center justify-center px-3">
                  <div className="text-center">
                    <div className="h-2 w-24 mx-auto bg-white/95 rounded" />
                    <div className="mt-1.5 h-1.5 w-16 mx-auto bg-white/60 rounded" />
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                <div className="h-2 w-20 bg-white/40 rounded" />
                <div className="mt-1.5 h-1.5 w-14 bg-white/25 rounded" />
                <div className="mt-2 text-[9px] text-white/50">
                  No cover image
                </div>
              </div>
            )}
            {/* Accent bar */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-400/80" />
          </div>
          <figcaption className="text-[10px] text-white/55 text-center">
            Title slide
          </figcaption>
        </figure>

        {/* Content slide with logo stamp */}
        <figure className="space-y-1">
          <div className="relative aspect-video w-full overflow-hidden rounded-md border border-white/15 bg-white">
            {/* Faux content */}
            <div className="absolute left-2 right-2 top-2 space-y-1">
              <div className="h-1.5 w-2/3 bg-slate-300 rounded" />
              <div className="h-1 w-1/2 bg-slate-200 rounded" />
            </div>
            <div className="absolute left-2 right-2 bottom-3 space-y-0.5">
              <div className="h-1 w-full bg-slate-200 rounded" />
              <div className="h-1 w-5/6 bg-slate-200 rounded" />
              <div className="h-1 w-4/6 bg-slate-200 rounded" />
            </div>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo placement preview"
                className={`absolute ${CORNER_CLASS[logoCorner]} h-5 w-auto max-w-[40%] object-contain rounded bg-white/60 px-0.5`}
              />
            ) : (
              <div
                className={`absolute ${CORNER_CLASS[logoCorner]} h-5 w-10 rounded border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center`}
              >
                <span className="text-[7px] text-slate-400">logo</span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-400/80" />
          </div>
          <figcaption className="text-[10px] text-white/55 text-center">
            Content slide
          </figcaption>
        </figure>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp,image/bmp,image/tiff"
          className="hidden"
          onChange={handlePick}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 rounded-full gap-1.5 bg-white/10 border-white/20 text-white hover:bg-white/15 hover:text-white"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
        >
          <Upload className="h-3.5 w-3.5" />
          {coverImageUrl ? "Change cover" : "Upload cover image"}
        </Button>

        {coverImageUrl && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 rounded-full gap-1 text-white/80 hover:text-white"
            onClick={() => onCoverImageChange(null)}
            disabled={disabled}
          >
            <X className="h-3.5 w-3.5" /> Remove
          </Button>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          <Label className="text-[11px] text-white/70">Logo</Label>
          <Select
            value={logoCorner}
            onValueChange={(v) => setLogoCorner(v as LogoCorner)}
            disabled={disabled}
          >
            <SelectTrigger className="h-8 w-[130px] bg-white/10 border-white/20 text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="top-left">Top left</SelectItem>
              <SelectItem value="top-right">Top right</SelectItem>
              <SelectItem value="bottom-left">Bottom left</SelectItem>
              <SelectItem value="bottom-right">Bottom right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {noAssets && (
        <div className="flex items-start gap-1.5 text-[10px] text-white/55">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          <span>
            {brandName
              ? `${brandName} has no logo on file. Upload a cover image, or import a brand with a logo from BrandHub.`
              : "Pick a brand to surface its logo, or upload a cover image to brand the title slide."}
          </span>
        </div>
      )}
    </div>
  );
};
