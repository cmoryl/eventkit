import pptxgen from 'pptxgenjs';
import type { SlideData } from './slideTypes';

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

export async function exportSlidesToPptx(slides: SlideData[], deckTitle: string) {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = deckTitle;

  for (const slide of slides) {
    const s = pptx.addSlide();
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
