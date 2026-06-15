import pptxgen from 'pptxgenjs';
import type { SlideData } from './slideTypes';

export type ExportTransition =
  | 'none' | 'fade' | 'slide' | 'zoom' | 'flip' | 'cube' | 'dissolve' | 'push' | 'cover';

/** Map our internal transition names to pptxgenjs/PowerPoint native transition types. */
const PPTX_TRANSITION_MAP: Record<ExportTransition, string | null> = {
  none: null,
  fade: 'fade',
  dissolve: 'fade',
  slide: 'push',
  push: 'push',
  cover: 'cover',
  zoom: 'zoom',
  flip: 'cube',
  cube: 'cube',
};

const VARIANT_BG: Record<SlideData['variant'], string> = {
  default: 'FFFFFF',
  dark: '0F172A',
  gradient: '1E293B',
  minimal: 'F8FAFC',
  brand: '6366F1',
  bold: '000000',
};

const VARIANT_TEXT: Record<SlideData['variant'], string> = {
  default: '0F172A',
  dark: 'FFFFFF',
  gradient: 'FFFFFF',
  minimal: '1E293B',
  brand: 'FFFFFF',
  bold: 'FFFFFF',
};

const VARIANT_MUTED: Record<SlideData['variant'], string> = {
  default: '64748B',
  dark: '94A3B8',
  gradient: 'CBD5E1',
  minimal: '94A3B8',
  brand: 'E0E7FF',
  bold: 'A3A3A3',
};

const ACCENT = '6366F1';
const CHART_COLORS = ['6366F1', '8B5CF6', 'A78BFA', '4F46E5', 'C4B5FD', 'DDD6FE'];

/** Resolve path vs data depending on whether the URL is a base64 data URI. */
function imgSrc(url: string): { path: string } | { data: string } {
  return url.startsWith('data:') ? { data: url } : { path: url };
}

function cleanHex(hex?: string, fallback = '0F172A') {
  const raw = (hex || fallback).replace('#', '').slice(0, 6);
  return /^[0-9a-f]{6}$/i.test(raw) ? raw.toUpperCase() : fallback;
}

function exportHash(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}

function addDemoGraphic(
  s: pptxgen.Slide,
  pptx: pptxgen,
  x: number,
  y: number,
  w: number,
  h: number,
  palette: { bg: string; text: string; accent: string; secondary: string },
  series: Array<{ label: string; value: number }>,
  channel: string,
) {
  const seed = exportHash(`${palette.bg}::${palette.accent}::${channel}`);
  const data = series.length ? series : [{ label: 'Q1', value: 32 }, { label: 'Q2', value: 58 }, { label: 'Q3', value: 44 }, { label: 'Q4', value: 76 }];
  const max = Math.max(...data.map((d) => d.value), 1);
  const accent = cleanHex(palette.accent, ACCENT);
  const secondary = cleanHex(palette.secondary, '94A3B8');
  const text = cleanHex(palette.text, 'FFFFFF');
  const bg = cleanHex(palette.bg, '0F172A');
  const system = seed % 8;

  s.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: bg, transparency: 12 }, line: { color: text, transparency: 78, width: 1 } });

  if (system === 0) {
    const barW = w / (data.length * 1.7);
    data.forEach((d, i) => {
      const bh = Math.max(0.15, (d.value / max) * (h * 0.68));
      const bx = x + 0.25 + i * ((w - 0.5) / data.length);
      s.addShape(pptx.ShapeType.rect, { x: bx, y: y + h - 0.35 - bh, w: barW, h: bh, fill: { color: i % 2 ? secondary : accent }, line: { color: i % 2 ? secondary : accent, transparency: 100 } });
      s.addText(d.label.slice(0, 5), { x: bx - 0.04, y: y + h - 0.27, w: barW + 0.08, h: 0.12, fontSize: 5, color: text, align: 'center', fontFace: 'Arial' });
    });
    return;
  }

  if (system === 1) {
    data.forEach((d, i) => {
      if (i === 0) return;
      const prev = data[i - 1];
      const x1 = x + 0.25 + ((i - 1) / Math.max(data.length - 1, 1)) * (w - 0.5);
      const x2 = x + 0.25 + (i / Math.max(data.length - 1, 1)) * (w - 0.5);
      const y1 = y + h - 0.35 - (prev.value / max) * (h - 0.7);
      const y2 = y + h - 0.35 - (d.value / max) * (h - 0.7);
      s.addShape(pptx.ShapeType.line, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color: accent, width: 2 } });
      s.addShape(pptx.ShapeType.ellipse, { x: x2 - 0.04, y: y2 - 0.04, w: 0.08, h: 0.08, fill: { color: secondary }, line: { color: secondary } });
    });
    return;
  }

  if (system === 2) {
    data.slice(0, 5).forEach((d, i) => {
      const r = Math.min(w, h) * (0.16 + i * 0.055);
      s.addShape(pptx.ShapeType.arc, { x: x + w / 2 - r, y: y + h / 2 - r, w: r * 2, h: r * 2, line: { color: i % 2 ? secondary : accent, width: 3, transparency: 10 + i * 8 } } as any);
    });
    s.addText(`${Math.round((data[0].value / max) * 100)}%`, { x: x + w * 0.34, y: y + h * 0.42, w: w * 0.32, h: 0.32, fontSize: 18, bold: true, color: text, align: 'center', fontFace: 'Arial' });
    return;
  }

  if (system === 3) {
    const cells = 24;
    for (let i = 0; i < cells; i++) {
      const cx = x + 0.18 + (i % 6) * ((w - 0.36) / 6);
      const cy = y + 0.18 + Math.floor(i / 6) * ((h - 0.36) / 4);
      const a = 20 + ((seed + i * 17) % 72);
      s.addShape(pptx.ShapeType.rect, { x: cx, y: cy, w: (w - 0.5) / 6, h: (h - 0.48) / 4, fill: { color: i % 3 ? accent : secondary, transparency: 100 - a }, line: { color: bg, transparency: 100 } });
    }
    return;
  }

  if (system === 4) {
    data.slice(0, 5).forEach((d, i) => {
      const ww = Math.max(0.3, (d.value / max) * (w - 0.6));
      s.addShape(pptx.ShapeType.chevron, { x: x + (w - ww) / 2, y: y + 0.18 + i * ((h - 0.36) / 5), w: ww, h: (h - 0.48) / 5, fill: { color: i === 0 ? accent : i === 2 ? secondary : text, transparency: i > 2 ? 45 : 0 }, line: { color: bg, transparency: 100 } } as any);
    });
    return;
  }

  if (system === 5) {
    data.slice(0, 6).forEach((d, i) => {
      const bx = x + 0.25 + ((seed + i * 41) % 80) / 100 * (w - 0.5);
      const by = y + 0.25 + ((seed + i * 67) % 78) / 100 * (h - 0.5);
      const size = 0.12 + (d.value / max) * 0.22;
      s.addShape(pptx.ShapeType.ellipse, { x: bx - size / 2, y: by - size / 2, w: size, h: size, fill: { color: i % 2 ? secondary : accent, transparency: 25 }, line: { color: i % 2 ? secondary : accent, width: 1 } });
    });
    return;
  }

  if (system === 6) {
    const layouts = [[55, 45, 30, 25, 20, 18], [38, 34, 28, 25, 22, 18], [70, 18, 16, 24, 22, 20]][seed % 3];
    let cursorX = x + 0.16;
    let cursorY = y + 0.16;
    layouts.forEach((pct, i) => {
      const tw = (w - 0.38) * (pct / 100);
      const th = i === 0 ? h * 0.48 : h * 0.22;
      if (cursorX + tw > x + w - 0.1) { cursorX = x + 0.16; cursorY += th + 0.08; }
      s.addShape(pptx.ShapeType.rect, { x: cursorX, y: cursorY, w: tw, h: th, fill: { color: i % 2 ? secondary : accent, transparency: i > 2 ? 20 : 0 }, line: { color: bg, width: 1 } });
      cursorX += tw + 0.08;
    });
    return;
  }

  data.slice(0, 4).forEach((d, i) => {
    const yy = y + 0.28 + i * ((h - 0.56) / 4);
    const ww = Math.max(0.35, (d.value / max) * (w - 1.2));
    s.addText(d.label.slice(0, 6), { x: x + 0.2, y: yy, w: 0.6, h: 0.18, fontSize: 6, bold: true, color: text, fontFace: 'Arial' });
    s.addShape(pptx.ShapeType.rect, { x: x + 0.9, y: yy + 0.02, w: ww, h: 0.12, fill: { color: i % 2 ? secondary : accent }, line: { color: i % 2 ? secondary : accent } });
  });
}

export async function exportSlidesToPptx(
  slides: SlideData[],
  deckTitle: string,
  options?: { transition?: ExportTransition },
) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = deckTitle;

  const pptxTransition = options?.transition && options.transition !== 'none'
    ? PPTX_TRANSITION_MAP[options.transition]
    : null;

  for (const slide of slides) {
    const s = pptx.addSlide();
    if (pptxTransition) {
      // pptxgenjs writes the slide-level transition when this property is set.
      (s as unknown as { transition: { type: string; dur: number } }).transition = {
        type: pptxTransition,
        dur: 800,
      };
    }
    const bg = VARIANT_BG[slide.variant];
    const fg = VARIANT_TEXT[slide.variant];
    const muted = VARIANT_MUTED[slide.variant];

    if (slide.variant === 'gradient') {
      s.background = { fill: { type: 'solid', color: '1E293B' } } as any;
    } else {
      s.background = { color: bg };
    }

    // Accent bar at bottom
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 5.35, w: '100%', h: 0.08,
      fill: { color: ACCENT },
    });

    switch (slide.layout) {
      case 'demo-mock': {
        const demo = slide.demoContent || {};
        const tpl = slide.demoTemplate || {};
        const palette = {
          bg: cleanHex(tpl.palette?.bg || slide.bgColor || bg, bg),
          text: cleanHex(tpl.palette?.text || fg, fg),
          accent: cleanHex(tpl.palette?.accent || ACCENT, ACCENT),
          secondary: cleanHex(tpl.palette?.secondary || muted, muted),
        };
        const demoKind = String(slide.demoKind || 'template');
        const channel = `${tpl.id || slide.id}::${demoKind}`;
        const kSeed = exportHash(channel);
        const series = Array.isArray(demo.chart?.series) ? demo.chart.series : [];
        s.background = { color: palette.bg };

        const pattern = kSeed % 4;
        if (pattern === 0) {
          s.addShape(pptx.ShapeType.rect, { x: 0.12, y: 0.12, w: 0.08, h: 5.15, fill: { color: palette.accent }, line: { color: palette.accent } });
          s.addShape(pptx.ShapeType.arc, { x: 6.7, y: -0.25, w: 2.7, h: 2.7, line: { color: palette.secondary, width: 2, transparency: 35 } } as any);
        } else if (pattern === 1) {
          for (let gx = 0.5; gx < 9.2; gx += 0.55) s.addShape(pptx.ShapeType.line, { x: gx, y: 0.35, w: 0, h: 4.65, line: { color: palette.text, transparency: 92, width: 0.5 } });
          for (let gy = 0.55; gy < 5.0; gy += 0.42) s.addShape(pptx.ShapeType.line, { x: 0.4, y: gy, w: 8.8, h: 0, line: { color: palette.text, transparency: 94, width: 0.5 } });
        } else if (pattern === 2) {
          s.addShape(pptx.ShapeType.rect, { x: 6.4, y: 0, w: 3.6, h: 5.63, fill: { color: palette.secondary, transparency: 78 }, line: { color: palette.secondary, transparency: 100 } });
          s.addShape(pptx.ShapeType.rect, { x: 0.55, y: 4.7, w: 2.4, h: 0.12, fill: { color: palette.accent }, line: { color: palette.accent } });
        } else {
          s.addShape(pptx.ShapeType.rect, { x: 0.35, y: 0.3, w: 8.95, h: 4.85, fill: { color: palette.bg, transparency: 100 }, line: { color: palette.text, transparency: 70, width: 1 } });
          s.addShape(pptx.ShapeType.rect, { x: 0.35, y: 0.3, w: 8.95, h: 0.12, fill: { color: palette.accent }, line: { color: palette.accent } });
        }

        const heading = demo.slideHeadings?.[demoKind] || demo.chart?.title || demo.kpi?.headline || demo.title || slide.title;
        s.addText(String(heading || 'Template slide'), { x: 0.6, y: 0.45, w: 4.6, h: 0.9, fontSize: demoKind === 'title' ? 34 : 24, bold: true, color: palette.text, fontFace: 'Arial', breakLine: false, fit: 'shrink' } as any);
        s.addText(`${tpl.name || 'Preset'} · ${demoKind.replace(/-/g, ' ')}`, { x: 0.62, y: 0.18, w: 5.5, h: 0.25, fontSize: 8, bold: true, color: palette.accent, fontFace: 'Arial' });

        const graphicLayouts = [
          { x: 5.45, y: 0.85, w: 3.85, h: 3.55 },
          { x: 0.75, y: 2.55, w: 4.1, h: 2.25 },
          { x: 4.85, y: 1.45, w: 4.25, h: 2.75 },
          { x: 5.7, y: 2.1, w: 3.25, h: 2.45 },
        ];
        const gl = graphicLayouts[kSeed % graphicLayouts.length];
        addDemoGraphic(s, pptx, gl.x, gl.y, gl.w, gl.h, palette, series, channel);

        const metrics = Array.isArray(demo.metrics) ? demo.metrics.slice(0, 4) : [];
        metrics.forEach((m: any, i: number) => {
          const xPos = 0.62 + i * 1.12;
          const yPos = demoKind === 'title' ? 3.9 : 4.55;
          s.addShape(pptx.ShapeType.rect, { x: xPos, y: yPos, w: 0.96, h: 0.48, fill: { color: i % 2 ? palette.secondary : palette.accent, transparency: i === 0 ? 0 : 35 }, line: { color: palette.text, transparency: 82 } });
          s.addText(String(m.value || ''), { x: xPos + 0.06, y: yPos + 0.05, w: 0.84, h: 0.18, fontSize: 9, bold: true, color: i === 0 ? palette.bg : palette.text, fontFace: 'Arial', fit: 'shrink' } as any);
          s.addText(String(m.label || '').slice(0, 14), { x: xPos + 0.06, y: yPos + 0.26, w: 0.84, h: 0.15, fontSize: 5.5, color: i === 0 ? palette.bg : palette.text, fontFace: 'Arial', fit: 'shrink' } as any);
        });

        if (demo.subtitle && demoKind === 'title') {
          s.addText(String(demo.subtitle), { x: 0.65, y: 1.55, w: 4.25, h: 0.85, fontSize: 16, color: palette.text, transparency: 18, fontFace: 'Arial', fit: 'shrink' } as any);
        }
        break;
      }

      case 'title':
        s.addText(slide.title, {
          x: 1, y: 1.5, w: 8, h: 1.5,
          fontSize: 44, bold: true, color: fg,
          align: 'center', fontFace: 'Arial',
        });
        if (slide.subtitle) {
          s.addText(slide.subtitle, {
            x: 1.5, y: 3.2, w: 7, h: 0.8,
            fontSize: 22, color: muted,
            align: 'center', fontFace: 'Arial',
          });
        }
        break;

      case 'section':
        s.addText(slide.title, {
          x: 1, y: 2, w: 8, h: 1.2,
          fontSize: 36, bold: true, color: fg,
          align: 'center', fontFace: 'Arial',
        });
        if (slide.subtitle) {
          s.addText(slide.subtitle, {
            x: 2, y: 3.3, w: 6, h: 0.7,
            fontSize: 20, color: muted,
            align: 'center', fontFace: 'Arial',
          });
        }
        break;

      case 'content':
      case 'two-column':
        s.addText(slide.title, {
          x: 0.8, y: 0.4, w: 8.4, h: 0.8,
          fontSize: 28, bold: true, color: fg, fontFace: 'Arial',
        });
        if (slide.body) {
          const lines = slide.body.split('\n').filter(Boolean);
          const bulletText = lines.map(line => ({
            text: line.replace(/^[•\-]\s*/, ''),
            options: { bullet: { type: 'bullet' as const }, fontSize: 16, color: fg, fontFace: 'Arial' },
          }));
          s.addText(bulletText, { x: 0.8, y: 1.4, w: 8.4, h: 3.5 });
        }
        break;

      case 'comparison': {
        s.addText(slide.title, {
          x: 0.8, y: 0.3, w: 8.4, h: 0.7,
          fontSize: 24, bold: true, color: fg, fontFace: 'Arial', align: 'center',
        });
        const [leftRaw = '', rightRaw = ''] = (slide.body || '').split('---');
        const colBg = (slide.variant === 'dark' || slide.variant === 'gradient') ? '1E293B' : 'F1F5F9';
        s.addShape(pptx.ShapeType.rect, {
          x: 0.3, y: 1.2, w: 4.2, h: 3.8,
          fill: { color: colBg }, line: { color: ACCENT, width: 1 },
        });
        s.addShape(pptx.ShapeType.rect, {
          x: 5.0, y: 1.2, w: 4.2, h: 3.8,
          fill: { color: colBg }, line: { color: ACCENT, width: 1 },
        });
        s.addShape(pptx.ShapeType.ellipse, {
          x: 4.55, y: 2.45, w: 0.5, h: 0.5,
          fill: { color: ACCENT },
        });
        s.addText('VS', {
          x: 4.55, y: 2.45, w: 0.5, h: 0.5,
          fontSize: 10, bold: true, color: 'FFFFFF',
          align: 'center', valign: 'middle', fontFace: 'Arial',
        });
        const makeBullets = (raw: string) =>
          raw.trim().split('\n').filter(Boolean).map(line => ({
            text: line.replace(/^[•✓✗\-]\s*/, ''),
            options: { bullet: { type: 'bullet' as const }, fontSize: 13, color: fg, fontFace: 'Arial' },
          }));
        if (leftRaw.trim()) s.addText(makeBullets(leftRaw), { x: 0.5, y: 1.4, w: 3.8, h: 3.4 });
        if (rightRaw.trim()) s.addText(makeBullets(rightRaw), { x: 5.2, y: 1.4, w: 3.8, h: 3.4 });
        break;
      }

      case 'image-left':
      case 'image-right': {
        const textX = slide.layout === 'image-left' ? 5.2 : 0.5;
        const imgX = slide.layout === 'image-left' ? 0.3 : 5.2;
        s.addText(slide.title, {
          x: textX, y: 0.5, w: 4.3, h: 0.8,
          fontSize: 24, bold: true, color: fg, fontFace: 'Arial',
        });
        if (slide.body) {
          const lines = slide.body.split('\n').filter(Boolean);
          const bulletText = lines.map(line => ({
            text: line.replace(/^[•\-]\s*/, ''),
            options: { bullet: { type: 'bullet' as const }, fontSize: 14, color: fg, fontFace: 'Arial' },
          }));
          s.addText(bulletText, { x: textX, y: 1.5, w: 4.3, h: 3.5 });
        }
        if (slide.imageUrl) {
          s.addImage({ ...imgSrc(slide.imageUrl), x: imgX, y: 0.3, w: 4.5, h: 4.8 } as any);
        } else {
          s.addShape(pptx.ShapeType.rect, {
            x: imgX, y: 0.3, w: 4.5, h: 4.8,
            fill: { color: slide.variant === 'default' ? 'E2E8F0' : '334155' },
          });
        }
        break;
      }

      case 'quote':
        s.addText('“', {
          x: 0.4, y: 0.1, w: 2, h: 1.6,
          fontSize: 120, bold: true, color: ACCENT,
          align: 'left', fontFace: 'Arial',
        });
        s.addText(slide.title, {
          x: 1, y: 1.1, w: 8, h: 2.8,
          fontSize: 26, italic: true, color: fg,
          align: 'center', valign: 'middle', fontFace: 'Arial',
        });
        if (slide.quoteAuthor) {
          s.addText(`— ${slide.quoteAuthor}`, {
            x: 1, y: 4.1, w: 8, h: 0.6,
            fontSize: 18, color: muted,
            align: 'center', fontFace: 'Arial',
          });
        }
        break;

      case 'stats': {
        s.addText(slide.title, {
          x: 0.8, y: 0.3, w: 8.4, h: 0.7,
          fontSize: 24, bold: true, color: fg, fontFace: 'Arial', align: 'center',
        });
        const stats = slide.stats || [];
        const colW = 9.2 / Math.max(stats.length, 1);
        stats.forEach((stat, si) => {
          const xPos = 0.3 + si * colW;
          s.addText(stat.value, {
            x: xPos, y: 1.5, w: colW - 0.2, h: 1.8,
            fontSize: Math.min(52, Math.floor(200 / Math.max(stats.length, 1))),
            bold: true, color: ACCENT,
            align: 'center', valign: 'middle', fontFace: 'Arial',
          });
          s.addText(stat.label, {
            x: xPos, y: 3.4, w: colW - 0.2, h: 0.6,
            fontSize: 15, color: muted,
            align: 'center', fontFace: 'Arial',
          });
        });
        break;
      }

      case 'chart': {
        s.addText(slide.title, {
          x: 0.8, y: 0.2, w: 8.4, h: 0.7,
          fontSize: 22, bold: true, color: fg, fontFace: 'Arial',
        });
        if (slide.chart) {
          const { type, data, series2, series1Name, series2Name } = slide.chart;
          const labels = data.map(d => d.label);
          const chartDataSeries: pptxgen.OptsChartData[] = [
            { name: series1Name || 'Value', labels, values: data.map(d => d.value) },
          ];
          if (series2?.length) {
            chartDataSeries.push({
              name: series2Name || 'Series 2',
              labels: series2.map(d => d.label),
              values: series2.map(d => d.value),
            });
          }
          const chartOpts: pptxgen.IChartOpts = {
            x: 0.5, y: 1.1, w: 9, h: 4.1,
            chartColors: CHART_COLORS,
            showLegend: chartDataSeries.length > 1 || type === 'pie' || type === 'doughnut',
            legendPos: 'b',
          };
          if (type === 'bar') (chartOpts as any).barDir = 'col';
          s.addChart(type as pptxgen.CHART_NAME, chartDataSeries, chartOpts);
        }
        break;
      }

      case 'timeline': {
        s.addText(slide.title, {
          x: 0.8, y: 0.3, w: 8.4, h: 0.7,
          fontSize: 24, bold: true, color: fg, fontFace: 'Arial',
        });
        const steps = slide.timeline || [];
        const colW = 9.2 / Math.max(steps.length, 1);
        // Horizontal axis line (thin rect)
        s.addShape(pptx.ShapeType.rect, {
          x: 0.5, y: 2.59, w: 9, h: 0.04,
          fill: { color: ACCENT }, line: { color: ACCENT, width: 0 },
        });
        steps.forEach((step, si) => {
          const cx = 0.3 + si * colW + (colW - 0.1) / 2;
          s.addShape(pptx.ShapeType.ellipse, {
            x: cx - 0.15, y: 2.46, w: 0.3, h: 0.3,
            fill: { color: ACCENT },
          });
          if (step.date) {
            s.addText(step.date, {
              x: 0.3 + si * colW, y: 1.9, w: colW - 0.1, h: 0.4,
              fontSize: 12, bold: true, color: ACCENT,
              align: 'center', fontFace: 'Arial',
            });
          }
          s.addText(step.title, {
            x: 0.3 + si * colW, y: 2.9, w: colW - 0.1, h: 0.5,
            fontSize: 13, bold: true, color: fg,
            align: 'center', fontFace: 'Arial',
          });
          if (step.description) {
            s.addText(step.description, {
              x: 0.3 + si * colW, y: 3.45, w: colW - 0.1, h: 0.65,
              fontSize: 11, color: muted,
              align: 'center', fontFace: 'Arial',
            });
          }
        });
        break;
      }

      case 'process': {
        s.addText(slide.title, {
          x: 0.8, y: 0.3, w: 8.4, h: 0.7,
          fontSize: 24, bold: true, color: fg, fontFace: 'Arial',
        });
        const steps = slide.process || [];
        const colW = 9.2 / Math.max(steps.length, 1);
        steps.forEach((step, si) => {
          const cx = 0.3 + si * colW + (colW - 0.1) / 2 - 0.3;
          s.addShape(pptx.ShapeType.ellipse, {
            x: cx, y: 1.3, w: 0.6, h: 0.6,
            fill: { color: ACCENT },
          });
          s.addText(String(si + 1), {
            x: cx, y: 1.3, w: 0.6, h: 0.6,
            fontSize: 16, bold: true, color: 'FFFFFF',
            align: 'center', valign: 'middle', fontFace: 'Arial',
          });
          s.addText(step.title, {
            x: 0.3 + si * colW, y: 2.1, w: colW - 0.1, h: 0.5,
            fontSize: 14, bold: true, color: fg,
            align: 'center', fontFace: 'Arial',
          });
          if (step.description) {
            s.addText(step.description, {
              x: 0.3 + si * colW, y: 2.65, w: colW - 0.1, h: 0.65,
              fontSize: 11, color: muted,
              align: 'center', fontFace: 'Arial',
            });
          }
        });
        break;
      }

      case 'full-image':
        if (slide.imageUrl) {
          s.addImage({ ...imgSrc(slide.imageUrl), x: 0, y: 0, w: '100%', h: '100%' } as any);
        }
        s.addText(slide.title, {
          x: 0.5, y: 3.8, w: 9, h: 1.3,
          fontSize: 36, bold: true, color: 'FFFFFF',
          align: 'center', fontFace: 'Arial',
        });
        break;

      case 'agenda': {
        s.addText(slide.title, {
          x: 0.6, y: 0.8, w: 3.5, h: 2.0,
          fontSize: 32, bold: true, color: fg, fontFace: 'Arial', valign: 'middle',
        });
        s.addShape(pptx.ShapeType.rect, {
          x: 0.6, y: 2.9, w: 0.7, h: 0.06,
          fill: { color: ACCENT },
        });
        const items = (slide.body || '').split('\n').filter(Boolean);
        items.forEach((item, ii) => {
          const rowY = 1.0 + ii * 0.65;
          s.addShape(pptx.ShapeType.ellipse, {
            x: 4.4, y: rowY + 0.05, w: 0.4, h: 0.4,
            fill: { color: ACCENT },
          });
          s.addText(String(ii + 1), {
            x: 4.4, y: rowY + 0.05, w: 0.4, h: 0.4,
            fontSize: 11, bold: true, color: 'FFFFFF',
            align: 'center', valign: 'middle', fontFace: 'Arial',
          });
          s.addText(item, {
            x: 4.9, y: rowY, w: 4.5, h: 0.5,
            fontSize: 16, color: fg, fontFace: 'Arial', valign: 'middle',
          });
        });
        break;
      }

      case 'big-number': {
        if (slide.title) {
          s.addText(slide.title, {
            x: 1, y: 0.3, w: 8, h: 0.6,
            fontSize: 18, bold: false, color: muted,
            align: 'center', fontFace: 'Arial',
          });
        }
        const heroStat = slide.stats?.[0];
        if (heroStat) {
          s.addText(heroStat.value, {
            x: 0.5, y: 1.0, w: 9, h: 2.8,
            fontSize: 96, bold: true, color: ACCENT,
            align: 'center', valign: 'middle', fontFace: 'Arial',
          });
          s.addText(heroStat.label, {
            x: 1, y: 3.8, w: 8, h: 0.7,
            fontSize: 22, color: fg,
            align: 'center', fontFace: 'Arial',
          });
        }
        if (slide.subtitle) {
          s.addText(slide.subtitle, {
            x: 1.5, y: 4.6, w: 7, h: 0.5,
            fontSize: 14, color: muted,
            align: 'center', fontFace: 'Arial',
          });
        }
        break;
      }

      case 'blank':
      default:
        if (slide.title) {
          s.addText(slide.title, {
            x: 0.8, y: 0.4, w: 8.4, h: 0.8,
            fontSize: 28, bold: true, color: fg, fontFace: 'Arial',
          });
        }
        break;
    }

    if (slide.notes) {
      s.addNotes(slide.notes);
    }
  }

  const fileName = deckTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'presentation';
  await pptx.writeFile({ fileName: `${fileName}.pptx` });
}
