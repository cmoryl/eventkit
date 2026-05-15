// Renders PDF pages to JPEG data URLs using pdfjs-dist (client-side).
// Supports both eager (all-at-once) and lazy (on-demand) rendering for large PDFs.
import * as pdfjsLib from "pdfjs-dist";
// Vite-compatible worker import
// @ts-ignore
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface PdfThumbnail {
  page: number;
  dataUrl: string;
  width: number;
  height: number;
}

export interface PdfPageMeta {
  page: number;
  width: number;
  height: number;
  aspectRatio: number; // width / height
}

export interface LazyPdfRenderer {
  totalPages: number;
  pages: PdfPageMeta[];
  renderPage: (page: number, opts?: { maxWidth?: number; quality?: number }) => Promise<PdfThumbnail>;
  destroy: () => void;
}

/**
 * Opens the PDF, reads metadata for every page (cheap), but defers raster rendering
 * until renderPage(n) is called. Used by the gallery for lazy/virtualized rendering.
 */
export async function openPdfForLazyThumbnails(
  file: File,
  opts: { maxPages?: number } = {},
): Promise<LazyPdfRenderer> {
  const { maxPages = 200 } = opts;
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const total = Math.min(pdf.numPages, maxPages);

  const pages: PdfPageMeta[] = [];
  for (let p = 1; p <= total; p++) {
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale: 1 });
    pages.push({
      page: p,
      width: viewport.width,
      height: viewport.height,
      aspectRatio: viewport.width / viewport.height,
    });
  }

  const renderPage = async (
    pageNum: number,
    rOpts: { maxWidth?: number; quality?: number } = {},
  ): Promise<PdfThumbnail> => {
    const { maxWidth = 480, quality = 0.7 } = rOpts;
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    const scale = maxWidth / viewport.width;
    const scaled = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(scaled.width);
    canvas.height = Math.ceil(scaled.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");

    await page.render({
      canvas,
      canvasContext: ctx,
      viewport: scaled,
    } as any).promise;

    return {
      page: pageNum,
      dataUrl: canvas.toDataURL("image/jpeg", quality),
      width: canvas.width,
      height: canvas.height,
    };
  };

  const destroy = () => {
    try {
      pdf.destroy();
    } catch {
      // ignore
    }
  };

  return { totalPages: total, pages, renderPage, destroy };
}

/**
 * Eager renderer (kept for backward compatibility / non-gallery use cases).
 */
export async function renderPdfThumbnails(
  file: File,
  opts: { maxWidth?: number; quality?: number; maxPages?: number } = {},
): Promise<PdfThumbnail[]> {
  const { maxWidth = 480, quality = 0.7, maxPages = 50 } = opts;
  const renderer = await openPdfForLazyThumbnails(file, { maxPages });
  const thumbs: PdfThumbnail[] = [];
  for (const meta of renderer.pages) {
    try {
      thumbs.push(await renderer.renderPage(meta.page, { maxWidth, quality }));
    } catch {
      // skip failed page
    }
  }
  renderer.destroy();
  return thumbs;
}
