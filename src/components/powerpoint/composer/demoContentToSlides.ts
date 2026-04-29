/**
 * Convert a TemplatePreview DemoContent (the exact content rendered in the
 * preview dialog) into SlideData[] for the SlideEditor — so "Open in Editor"
 * loads the same slides the user just previewed, pixel-for-pixel.
 *
 * Strategy: emit one slide per preview SlideKind using the special
 * `demo-mock` layout, which the SlideRenderer dispatches directly to the
 * shared <SlideMock /> component used by TemplatePreviewDialog. This
 * guarantees the editor matches the gallery preview exactly.
 */
import type { DemoContent } from "./TemplateDemoCard";
import type { DeckTemplate } from "./TemplateGallery";
import { PREVIEW_SLIDE_KINDS } from "./TemplatePreviewDialog";
import type { SlideData } from "@/components/slides/slideTypes";

/** Lite copy of the template — only the fields SlideMock reads (palette, id, name, accent, etc.). */
function liteTemplate(t: DeckTemplate): any {
  return {
    id: t.id,
    name: t.name,
    palette: { ...t.palette },
    // Keep any extra fields SlideMock may rely on; spread is safe because
    // SlideMock only reads palette + id and we already cloned palette.
    ...(t as any),
  };
}

export function demoContentToSlides(
  template: DeckTemplate,
  demo: DemoContent,
): SlideData[] {
  const tplLite = liteTemplate(template);
  return PREVIEW_SLIDE_KINDS.map((kind) => ({
    id: crypto.randomUUID(),
    layout: "demo-mock" as const,
    title: typeof demo.title === "string" ? demo.title : "Slide",
    variant: "default" as const,
    bgColor: template.palette.bg,
    demoKind: kind,
    demoContent: demo,
    demoTemplate: tplLite,
  }));
}
