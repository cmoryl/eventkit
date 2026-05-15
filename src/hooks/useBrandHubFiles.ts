// Fetches downloadable files from the active brand's BrandHub link.
// Returns memoized lists categorized by file type so multiple surfaces
// (Slide editor, Asset library, etc.) can share a single network round-trip.
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type BrandFileCategory = "deck" | "document" | "image" | "video" | "other";

export interface BrandFile {
  url: string;
  name: string;
  category: BrandFileCategory;
  ext: string;
  source: "brand" | "event" | "product";
  sourceName: string;
  sourceId: string;
  sectionLabel: string;
  thumbnailUrl: string | null;
  description: string | null;
}

interface UseBrandHubFilesOptions {
  shareToken?: string | null;
  enabled?: boolean;
}

export function useBrandHubFiles({ shareToken, enabled = true }: UseBrandHubFilesOptions) {
  const [files, setFiles] = useState<BrandFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!shareToken || !enabled) {
      setFiles([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("list-brandhub-files", {
        body: { shareToken, includeChildren: true },
      });
      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error || "Failed to load BrandHub files");
      setFiles((data.files || []) as BrandFile[]);
    } catch (err) {
      console.error("useBrandHubFiles:", err);
      setError(err instanceof Error ? err.message : "Failed to load BrandHub files");
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [shareToken, enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const byCategory = useMemo(() => {
    const map: Record<BrandFileCategory, BrandFile[]> = {
      deck: [],
      document: [],
      image: [],
      video: [],
      other: [],
    };
    for (const f of files) map[f.category].push(f);
    return map;
  }, [files]);

  return { files, byCategory, isLoading, error, refresh };
}
