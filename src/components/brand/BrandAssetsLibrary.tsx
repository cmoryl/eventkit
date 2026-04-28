// Browser for files attached to the active brand's BrandHub identity.
// Lists decks, documents, images, and videos pulled from the brand and any
// of its child events/products. Two interaction modes:
//   1. Click a deck row → onLoadDeck(url, file) — used by Slide editor to
//      import an existing .pptx as the working slides.
//   2. Toggle the "Reference" checkbox on items → onSelectionChange(files[])
//      — used to feed style anchors into AI generation.
import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Library,
  Presentation,
  FileText,
  Image as ImageIcon,
  Video,
  File as FileIcon,
  ExternalLink,
  Download,
  Upload,
  Globe,
  Calendar,
  Package,
} from "lucide-react";
import { useBrandHubFiles, type BrandFile, type BrandFileCategory } from "@/hooks/useBrandHubFiles";

const CATEGORY_META: Record<BrandFileCategory, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  deck: { label: "Decks", icon: Presentation },
  document: { label: "Docs", icon: FileText },
  image: { label: "Images", icon: ImageIcon },
  video: { label: "Videos", icon: Video },
  other: { label: "Other", icon: FileIcon },
};

const SOURCE_ICONS: Record<BrandFile["source"], React.ComponentType<{ className?: string }>> = {
  brand: Globe,
  event: Calendar,
  product: Package,
};

interface BrandAssetsLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  shareToken: string | null;
  /** Called when the user picks a deck file to import into the editor. */
  onLoadDeck?: (file: BrandFile) => void;
  /** Called whenever the reference selection changes. */
  onReferenceSelectionChange?: (files: BrandFile[]) => void;
  /** Initial set of references (so reopening preserves user choices). */
  initialReferences?: BrandFile[];
  /** Hide reference checkboxes (e.g. when used purely as a browser). */
  showReferenceMode?: boolean;
}

export const BrandAssetsLibrary: React.FC<BrandAssetsLibraryProps> = ({
  isOpen,
  onClose,
  brandName,
  shareToken,
  onLoadDeck,
  onReferenceSelectionChange,
  initialReferences = [],
  showReferenceMode = true,
}) => {
  const { files, byCategory, isLoading, error } = useBrandHubFiles({
    shareToken,
    enabled: isOpen,
  });
  const [tab, setTab] = useState<BrandFileCategory>("deck");
  const [search, setSearch] = useState("");
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(
    () => new Set(initialReferences.map((f) => f.url)),
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = byCategory[tab] || [];
    if (!term) return list;
    return list.filter(
      (f) =>
        f.name.toLowerCase().includes(term) ||
        f.sectionLabel.toLowerCase().includes(term) ||
        f.sourceName.toLowerCase().includes(term),
    );
  }, [byCategory, tab, search]);

  const toggleReference = (file: BrandFile) => {
    const next = new Set(selectedUrls);
    if (next.has(file.url)) next.delete(file.url);
    else next.add(file.url);
    setSelectedUrls(next);
    onReferenceSelectionChange?.(files.filter((f) => next.has(f.url)));
  };

  const tabs: BrandFileCategory[] = ["deck", "document", "image", "video", "other"];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Library className="h-4 w-4 text-primary" />
            {brandName} — Brand Assets
          </DialogTitle>
          <DialogDescription>
            Files discovered in this brand's BrandHub identity, including any linked events and products.
            {showReferenceMode &&
              " Tick items to use them as style references for AI generations."}
          </DialogDescription>
        </DialogHeader>

        {!shareToken ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            This brand isn't linked to BrandHub, so there are no remote assets to browse.
          </div>
        ) : (
          <Tabs value={tab} onValueChange={(v) => setTab(v as BrandFileCategory)} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid grid-cols-5 h-9">
              {tabs.map((t) => {
                const Icon = CATEGORY_META[t].icon;
                const count = byCategory[t]?.length || 0;
                return (
                  <TabsTrigger key={t} value={t} className="text-xs gap-1.5">
                    <Icon className="h-3 w-3" />
                    {CATEGORY_META[t].label}
                    {count > 0 && (
                      <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                        {count}
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files…"
              className="h-8 text-xs mt-3"
            />

            {tabs.map((t) => (
              <TabsContent key={t} value={t} className="flex-1 mt-2 overflow-hidden">
                <ScrollArea className="h-[420px] pr-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : error ? (
                    <div className="py-8 text-center text-xs text-destructive">{error}</div>
                  ) : filtered.length === 0 ? (
                    <div className="py-12 text-center text-xs text-muted-foreground">
                      {search
                        ? "No matches"
                        : t === "deck"
                          ? "No PowerPoint or Keynote decks attached to this brand yet."
                          : `No ${CATEGORY_META[t].label.toLowerCase()} found.`}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {filtered.map((file) => {
                        const SourceIcon = SOURCE_ICONS[file.source];
                        const isSelected = selectedUrls.has(file.url);
                        const isDeck = file.category === "deck";
                        return (
                          <div
                            key={file.url}
                            className="flex items-center gap-2 p-2 rounded-md border border-border/60 hover:border-primary/40 hover:bg-accent/30 transition-colors"
                          >
                            {showReferenceMode && (
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleReference(file)}
                                aria-label="Use as style reference"
                              />
                            )}
                            <div className="h-9 w-9 rounded bg-muted overflow-hidden flex items-center justify-center shrink-0">
                              {file.thumbnailUrl ? (
                                <img
                                  src={file.thumbnailUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : file.category === "image" ? (
                                <img
                                  src={file.url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                React.createElement(CATEGORY_META[file.category].icon, {
                                  className: "h-4 w-4 text-muted-foreground/60",
                                })
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium truncate">{file.name}</div>
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <SourceIcon className="h-2.5 w-2.5" />
                                <span className="truncate">{file.sourceName}</span>
                                <span>·</span>
                                <span className="truncate">{file.sectionLabel}</span>
                                {file.ext && (
                                  <>
                                    <span>·</span>
                                    <span className="uppercase">{file.ext}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {isDeck && onLoadDeck && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-7 text-xs gap-1"
                                  onClick={() => onLoadDeck(file)}
                                >
                                  <Upload className="h-3 w-3" /> Load
                                </Button>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                asChild
                                title="Open in new tab"
                              >
                                <a href={file.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                asChild
                                title="Download"
                              >
                                <a href={file.url} download>
                                  <Download className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            ))}

            {showReferenceMode && selectedUrls.size > 0 && (
              <div className="border-t pt-2 mt-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {selectedUrls.size} reference{selectedUrls.size === 1 ? "" : "s"} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setSelectedUrls(new Set());
                    onReferenceSelectionChange?.([]);
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
