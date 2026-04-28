import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  FileUp,
  Loader2,
  RefreshCw,
  X,
  Upload,
  FileText,
  Paperclip,
  Library,
} from "lucide-react";
import { LazyPdfGallery } from "@/components/powerpoint/LazyPdfGallery";
import { SelectedPagesOrder } from "@/components/powerpoint/SelectedPagesOrder";
import { BrandHubSourcePicker, type BrandHubSourcePick } from "@/components/powerpoint/BrandHubSourcePicker";
import type { PdfThumbnail } from "@/lib/pdfThumbnails";

interface Props {
  // PDF state
  pdfFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  extracting: boolean;
  extractedSource: any | null;
  includeText: boolean;
  setIncludeText: (v: boolean) => void;
  includeImagery: boolean;
  setIncludeImagery: (v: boolean) => void;
  includeLookAndFeel: boolean;
  setIncludeLookAndFeel: (v: boolean) => void;
  influence: number;
  setInfluence: (n: number) => void;
  thumbnails: Map<number, PdfThumbnail>;
  selectedPages: number[];
  selectedPagesSet: Set<number>;
  selectedSections: Set<number>;
  togglePage: (page: number) => void;
  reorderSelectedPages: (from: number, to: number) => void;
  setSelectedPages: React.Dispatch<React.SetStateAction<number[]>>;
  clearPageSelection: () => void;
  toggleSection: (idx: number) => void;
  selectAllSections: () => void;
  clearSectionSelection: () => void;
  setThumbnails: React.Dispatch<React.SetStateAction<Map<number, PdfThumbnail>>>;
  handlePdfSelect: (file: File | null) => void;
  rerunExtraction: () => void;
  clearPdf: () => void;

  // BrandHub source
  brandHubSource: BrandHubSourcePick | null;
  setBrandHubSource: (s: BrandHubSourcePick | null) => void;

  disabled?: boolean;
}

// Source chip + slide-out sheet. Tabs for "PDF" and "BrandHub". Chip label
// summarises which source (if any) is currently active.
export const SourceSheet: React.FC<Props> = (props) => {
  const {
    pdfFile,
    fileInputRef,
    extracting,
    extractedSource,
    includeText,
    setIncludeText,
    includeImagery,
    setIncludeImagery,
    includeLookAndFeel,
    setIncludeLookAndFeel,
    influence,
    setInfluence,
    thumbnails,
    selectedPages,
    selectedPagesSet,
    selectedSections,
    togglePage,
    reorderSelectedPages,
    setSelectedPages,
    clearPageSelection,
    toggleSection,
    selectAllSections,
    clearSectionSelection,
    setThumbnails,
    handlePdfSelect,
    rerunExtraction,
    clearPdf,
    brandHubSource,
    setBrandHubSource,
    disabled,
  } = props;

  // Default tab: whichever source is active, falling back to PDF.
  const initialTab = brandHubSource ? "brandhub" : "pdf";
  const [tab, setTab] = React.useState<string>(initialTab);
  React.useEffect(() => {
    setTab(brandHubSource && !pdfFile ? "brandhub" : "pdf");
    // Only when entering a new "active source" state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!brandHubSource, !!pdfFile]);

  const hasPdf = !!pdfFile;
  const hasBrandHub = !!brandHubSource;
  const active = hasPdf || hasBrandHub;

  let chipLabel = "Add source";
  if (hasPdf) {
    const pages = extractedSource?.extracted?.pageCount;
    chipLabel = `${pdfFile!.name}${pages ? ` · ${pages}p` : ""}${selectedPages.length ? ` · ${selectedPages.length} picked` : ""}`;
  } else if (hasBrandHub) {
    chipLabel = `${brandHubSource!.name}${brandHubSource!.type !== "brand" ? ` · ${brandHubSource!.type}` : ""}`;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant={active ? "default" : "outline"}
          size="sm"
          disabled={disabled}
          className="h-9 rounded-full gap-2"
        >
          <Paperclip className="h-3.5 w-3.5" />
          <span className="text-xs truncate max-w-[260px]">{chipLabel}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Reference source</SheetTitle>
          <SheetDescription>
            Optionally feed a PDF or a BrandHub item so the deck mirrors its content,
            imagery, and look & feel.
          </SheetDescription>
        </SheetHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-4">
          <TabsList className="grid grid-cols-2 h-9">
            <TabsTrigger value="pdf" className="text-xs gap-1.5">
              <FileText className="h-3 w-3" /> PDF
              {hasPdf && <span className="text-[10px] opacity-70">·active</span>}
            </TabsTrigger>
            <TabsTrigger value="brandhub" className="text-xs gap-1.5">
              <Library className="h-3 w-3" /> BrandHub
              {hasBrandHub && <span className="text-[10px] opacity-70">·active</span>}
            </TabsTrigger>
          </TabsList>

          {/* PDF TAB */}
          <TabsContent value="pdf" className="mt-3 space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handlePdfSelect(e.target.files?.[0] || null)}
            />

            {!pdfFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="w-full flex items-center justify-center gap-2 py-6 rounded-md border border-dashed border-border hover:border-primary/50 hover:bg-accent/30 transition-colors text-sm text-muted-foreground"
              >
                <Upload className="h-4 w-4" />
                Upload a PDF — extract content, imagery & look-and-feel
              </button>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <FileUp className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate flex-1">{pdfFile.name}</span>
                  {extracting && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {extractedSource && !extracting && (
                    <span className="text-xs text-muted-foreground">
                      {extractedSource.extracted?.pageCount || "?"} pages
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={rerunExtraction}
                    disabled={disabled || extracting}
                    title="Re-run extraction with current toggles & influence"
                  >
                    {extracting ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    Re-run
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={clearPdf}
                    disabled={disabled || extracting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Switch checked={includeText} onCheckedChange={setIncludeText} disabled={disabled} />
                    Text & info
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Switch checked={includeImagery} onCheckedChange={setIncludeImagery} disabled={disabled} />
                    Imagery
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Switch checked={includeLookAndFeel} onCheckedChange={setIncludeLookAndFeel} disabled={disabled} />
                    Look & feel
                  </label>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <Label className="text-xs">How much to use from PDF</Label>
                    <span className="text-muted-foreground">{influence}%</span>
                  </div>
                  <Slider
                    value={[influence]}
                    onValueChange={(v) => setInfluence(v[0])}
                    min={10}
                    max={100}
                    step={10}
                    disabled={disabled}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {influence >= 70
                      ? "Stay close to source structure & tone"
                      : influence >= 40
                        ? "Use as primary inspiration"
                        : "Light reference only"}
                  </p>
                </div>

                {extractedSource?.extracted?.outline?.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs flex items-center gap-1.5">
                        <FileText className="h-3 w-3" />
                        Extracted sections
                        <span className="text-muted-foreground font-normal">
                          · {selectedSections.size}/{extractedSource.extracted.outline.length} included
                        </span>
                      </Label>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={selectAllSections}
                          disabled={disabled}
                          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          All
                        </button>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <button
                          type="button"
                          onClick={clearSectionSelection}
                          disabled={disabled}
                          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          None
                        </button>
                      </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto rounded-md border bg-background/50 divide-y divide-border/50">
                      {extractedSource.extracted.outline.map(
                        (section: { heading: string; bullets: string[] }, i: number) => {
                          const checked = selectedSections.has(i);
                          return (
                            <label
                              key={i}
                              className={`flex items-start gap-2.5 p-2.5 cursor-pointer hover:bg-accent/30 transition-colors ${checked ? "" : "opacity-60"}`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSection(i)}
                                disabled={disabled}
                                className="mt-1 h-3.5 w-3.5 rounded border-border accent-primary cursor-pointer shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium truncate">{section.heading}</div>
                                {section.bullets?.length > 0 && (
                                  <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                                    {section.bullets.slice(0, 3).join(" · ")}
                                    {section.bullets.length > 3 && ` · +${section.bullets.length - 3} more`}
                                  </div>
                                )}
                              </div>
                            </label>
                          );
                        },
                      )}
                    </div>
                    {selectedSections.size === 0 && (
                      <p className="text-[10px] text-amber-500">
                        No sections selected — the deck will rely on summary, look & feel, and your topic only.
                      </p>
                    )}
                  </div>
                )}

                <LazyPdfGallery
                  file={pdfFile}
                  selectedPages={selectedPagesSet}
                  onTogglePage={togglePage}
                  onSelectAll={(all) => {
                    setSelectedPages((prev) => {
                      const existing = prev.filter((p) => all.includes(p));
                      const additions = all.filter((p) => !prev.includes(p));
                      return [...existing, ...additions];
                    });
                  }}
                  onClearSelection={clearPageSelection}
                  onThumbnailRendered={(thumb) =>
                    setThumbnails((prev) => {
                      if (prev.has(thumb.page)) return prev;
                      const next = new Map(prev);
                      next.set(thumb.page, thumb);
                      return next;
                    })
                  }
                  disabled={disabled}
                  maxPages={200}
                  defaultPickFirstN={3}
                />

                <SelectedPagesOrder
                  orderedPages={selectedPages}
                  thumbnails={thumbnails}
                  onReorder={reorderSelectedPages}
                  onRemove={togglePage}
                  disabled={disabled}
                />
              </>
            )}
          </TabsContent>

          {/* BRANDHUB TAB */}
          <TabsContent value="brandhub" className="mt-3 space-y-3">
            <BrandHubSourcePicker
              picked={brandHubSource}
              onPick={setBrandHubSource}
              disabled={disabled}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
