import { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import { createRoot, type Root } from "react-dom/client";
import React from "react";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import type { SlideData } from "@/components/slides/slideTypes";

// Cache thumbnails by cacheKey (e.g. templateId) so we only render once per session.
const thumbnailCache: Map<string, string[]> = new Map();

/**
 * Render each slide off-screen at 1920x1080, snapshot with html2canvas at a
 * small scale, return JPEG data URLs suitable for fast <img> previews.
 *
 * Generates serially to keep the main thread responsive.
 */
export function useSlideThumbnails(
  cacheKey: string | null,
  slides: SlideData[] | null,
  opts: { width?: number; quality?: number } = {},
): { thumbs: string[]; ready: boolean; progress: number } {
  const width = opts.width ?? 480; // 480x270 keeps 16:9
  const quality = opts.quality ?? 0.72;

  const [thumbs, setThumbs] = useState<string[]>(() => {
    if (!cacheKey) return [];
    return thumbnailCache.get(cacheKey) ?? [];
  });
  const [ready, setReady] = useState<boolean>(() => {
    if (!cacheKey || !slides) return false;
    const cached = thumbnailCache.get(cacheKey);
    return !!cached && cached.length === slides.length;
  });
  const [progress, setProgress] = useState<number>(() => {
    if (!cacheKey || !slides) return 0;
    const cached = thumbnailCache.get(cacheKey);
    return cached ? cached.length / Math.max(slides.length, 1) : 0;
  });

  useEffect(() => {
    if (!cacheKey || !slides || slides.length === 0) {
      setThumbs([]);
      setReady(false);
      setProgress(0);
      return;
    }
    const cached = thumbnailCache.get(cacheKey);
    if (cached && cached.length === slides.length) {
      setThumbs(cached);
      setReady(true);
      setProgress(1);
      return;
    }

    let cancelled = false;
    setReady(false);
    setProgress(0);
    const out: string[] = [];

    // Hidden offscreen host. Pinned far off-screen but kept visible enough
    // for html2canvas to measure layout properly.
    const host = document.createElement("div");
    host.style.position = "fixed";
    host.style.left = "-100000px";
    host.style.top = "0";
    host.style.width = "1920px";
    host.style.height = "1080px";
    host.style.pointerEvents = "none";
    host.style.zIndex = "-1";
    document.body.appendChild(host);

    const stage = document.createElement("div");
    stage.style.width = "1920px";
    stage.style.height = "1080px";
    stage.style.background = "#000";
    host.appendChild(stage);

    let root: Root | null = createRoot(stage);

    const cleanup = () => {
      try {
        root?.unmount();
      } catch {
        /* ignore */
      }
      root = null;
      if (host.parentNode) host.parentNode.removeChild(host);
    };

    (async () => {
      try {
        for (let i = 0; i < slides.length; i++) {
          if (cancelled) break;
          const slide = slides[i];
          root!.render(React.createElement(SlideRenderer, { slide }));
          // Wait two frames for layout/fonts.
          await new Promise<void>((r) =>
            requestAnimationFrame(() => requestAnimationFrame(() => r())),
          );
          if (cancelled) break;
          const scale = width / 1920;
          const canvas = await html2canvas(stage, {
            backgroundColor: "#000000",
            scale,
            logging: false,
            useCORS: true,
            allowTaint: true,
            width: 1920,
            height: 1080,
            windowWidth: 1920,
            windowHeight: 1080,
          });
          if (cancelled) break;
          const url = canvas.toDataURL("image/jpeg", quality);
          out.push(url);
          setThumbs([...out]);
          setProgress(out.length / slides.length);
        }
        if (!cancelled && out.length === slides.length) {
          thumbnailCache.set(cacheKey, out);
          setReady(true);
        }
      } catch (err) {
        console.error("Slide thumbnail generation failed:", err);
      } finally {
        cleanup();
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [cacheKey, slides, width, quality]);

  return { thumbs, ready, progress };
}
