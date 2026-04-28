// Renders each page of a PDF to a JPEG data URL using pdfjs-dist (client-side).
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

export async function renderPdfThumbnails(
  file: File,
  opts: { maxWidth?: number; quality?: number; maxPages?: number } = {},
): Promise<PdfThumbnail[]> {
  const { maxWidth = 480, quality = 0.7, maxPages = 50 } = opts;

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const total = Math.min(pdf.numPages, maxPages);
  const thumbs: PdfThumbnail[] = [];

  for (let p = 1; p <= total; p++) {
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale: 1 });
    const scale = maxWidth / viewport.width;
    const scaled = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(scaled.width);
    canvas.height = Math.ceil(scaled.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    await page.render({
      canvas,
      canvasContext: ctx,
      viewport: scaled,
    } as any).promise;

    thumbs.push({
      page: p,
      dataUrl: canvas.toDataURL("image/jpeg", quality),
      width: canvas.width,
      height: canvas.height,
    });
  }

  return thumbs;
}
