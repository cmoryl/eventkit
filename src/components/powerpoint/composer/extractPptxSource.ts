/**
 * Client-side PPTX → extractedSource adapter.
 *
 * Reuses the existing `parsePptxFile` importer (which already pulls slide text,
 * notes, and embedded images out of a .pptx) and packages the result into the
 * same shape `extract-pdf-source` produces, so all downstream prompt-building,
 * influence sliders, and section pickers work unchanged.
 */
import { parsePptxFile } from "@/components/slides/importPptx";

export interface PptxExtractedSource {
  fileName: string;
  fileType: "pptx";
  extracted: {
    summary: string;
    outline: { heading: string; bullets: string[] }[];
    keyFacts: string[];
    quotes: { text: string; attribution?: string }[];
    lookAndFeel?: {
      palette: string[];
      mood?: string;
      description?: string;
    };
    imageUrls: string[];
    pageCount: number;
    influence: number;
    scope: { text: boolean; imagery: boolean; lookAndFeel: boolean };
  };
  imageDescriptions: { page: number; description: string }[];
  _imageDescriptions: { page: number; description: string }[];
}

function splitToBullets(body: string | undefined): string[] {
  if (!body) return [];
  return body
    .split(/\n+/)
    .map((s) => s.replace(/^[\-•·*]\s*/, "").trim())
    .filter((s) => s.length > 0)
    .slice(0, 8);
}

export async function extractPptxAsSource(
  file: File,
  opts: {
    includeText: boolean;
    includeImagery: boolean;
    includeLookAndFeel: boolean;
    influence: number;
  },
): Promise<PptxExtractedSource> {
  const slides = await parsePptxFile(file);

  // Build outline: one section per slide (heading = slide title, bullets = body).
  const outline = slides.map((s, i) => ({
    heading: (s.title || `Slide ${i + 1}`).trim(),
    bullets: opts.includeText ? splitToBullets(s.body) : [],
  }));

  // Collect imagery (deduped data URLs) + per-image "descriptions" anchored to slide #.
  const imageUrls: string[] = [];
  const imageDescriptions: { page: number; description: string }[] = [];
  if (opts.includeImagery) {
    const seen = new Set<string>();
    slides.forEach((s, i) => {
      const imgs = s.images || (s.imageUrl ? [s.imageUrl] : []);
      imgs.forEach((url) => {
        if (seen.has(url)) return;
        seen.add(url);
        imageUrls.push(url);
        imageDescriptions.push({
          page: i + 1,
          description: `Imagery from slide ${i + 1}: "${(s.title || "").slice(0, 80)}"`,
        });
      });
    });
  }

  // Summary: stitch top of every slide so the AI can ground itself.
  const summary = slides
    .map((s, i) => {
      const head = (s.title || `Slide ${i + 1}`).trim();
      const body = (s.body || "").trim().slice(0, 200);
      return body ? `${head}: ${body}` : head;
    })
    .slice(0, 12)
    .join(" • ");

  // Best-effort look & feel: surface variants we already inferred from XML.
  const moods = new Set<string>();
  slides.forEach((s) => {
    if (s.variant === "dark" || s.variant === "gradient") moods.add("bold/dark");
    if (s.variant === "minimal" || s.variant === "default") moods.add("clean/minimal");
    if (s.variant === "brand") moods.add("brand-forward");
  });

  return {
    fileName: file.name,
    fileType: "pptx",
    extracted: {
      summary,
      outline,
      keyFacts: [],
      quotes: [],
      lookAndFeel: opts.includeLookAndFeel
        ? {
            palette: [],
            mood: Array.from(moods).join(", ") || undefined,
            description: `Inherited tone from ${slides.length}-slide source deck.`,
          }
        : undefined,
      imageUrls,
      pageCount: slides.length,
      influence: opts.influence,
      scope: {
        text: opts.includeText,
        imagery: opts.includeImagery,
        lookAndFeel: opts.includeLookAndFeel,
      },
    },
    imageDescriptions,
    _imageDescriptions: imageDescriptions,
  };
}
