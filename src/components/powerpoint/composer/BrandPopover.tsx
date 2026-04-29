import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Library, Plus, Palette } from "lucide-react";

export interface BrandOption {
  id: string;
  name: string;
  logo_url?: string | null;
  isFromBrandHub: boolean;
  styles?: {
    primary_color?: string | null;
    secondary_color?: string | null;
    accent_color?: string | null;
    heading_font?: string | null;
    body_font?: string | null;
  } | null;
}

interface Props {
  brands: BrandOption[];
  selectedBrandId: string;
  setSelectedBrandId: (id: string) => void;
  useBrand: boolean;
  setUseBrand: (v: boolean) => void;
  disabled?: boolean;
  onOpenImport: () => void;
}

// Brand chip + popover. Pure presentational wrapper used by PowerPointAgent.
export const BrandPopover: React.FC<Props> = ({
  brands,
  selectedBrandId,
  setSelectedBrandId,
  useBrand,
  setUseBrand,
  disabled,
  onOpenImport,
}) => {
  const selected = brands.find((b) => b.id === selectedBrandId);
  const active = !!selected && useBrand;
  const swatch = selected?.styles?.primary_color;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className={
            active
              ? "h-9 rounded-full gap-2 bg-cyan-400/20 border-cyan-300/40 text-white hover:bg-cyan-400/25 hover:text-white"
              : "h-9 rounded-full gap-2 bg-white/10 border-white/20 text-white hover:bg-white/15 hover:text-white"
          }
        >
          {active && swatch ? (
            <span className="h-3 w-3 rounded-full border border-white/40" style={{ background: swatch }} />
          ) : (
            <Palette className="h-3.5 w-3.5 text-white/90" />
          )}
          <span className="text-xs text-white">{active ? selected!.name : "Add brand"}</span>
          {active && selected!.isFromBrandHub && (
            <span className="text-[10px] text-white/70">· BrandHub</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 space-y-3 z-50 bg-popover" align="start">
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1.5">
            <Library className="h-3 w-3" /> Brand guide
          </Label>
          <Select
            value={selectedBrandId || "none"}
            onValueChange={(v) => {
              if (v === "none") {
                setSelectedBrandId("");
                setUseBrand(false);
              } else {
                setSelectedBrandId(v);
                setUseBrand(true);
              }
            }}
            disabled={disabled}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="No brand styling" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="none">No brand — neutral styling</SelectItem>
              {brands.length > 0 && (
                <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  Your imported brands
                </div>
              )}
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  <div className="flex items-center gap-2">
                    {b.styles?.primary_color && (
                      <span className="h-3 w-3 rounded-full border border-border/50" style={{ background: b.styles.primary_color }} />
                    )}
                    <span>{b.name}</span>
                    {b.isFromBrandHub && (
                      <span className="text-[10px] text-muted-foreground">· BrandHub</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selected && (
          <div className="flex items-center justify-between rounded-md border bg-background/40 px-3 py-2">
            <Label htmlFor="brand-apply" className="text-xs cursor-pointer">
              Apply brand styling
            </Label>
            <Switch
              id="brand-apply"
              checked={useBrand}
              onCheckedChange={setUseBrand}
              disabled={disabled}
            />
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full h-9"
          onClick={onOpenImport}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" /> Import from BrandHub
        </Button>
      </PopoverContent>
    </Popover>
  );
};
