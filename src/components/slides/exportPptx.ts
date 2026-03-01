import pptxgen from 'pptxgenjs';
import type { SlideData } from './slideTypes';

const VARIANT_BG: Record<SlideData['variant'], string> = {
  default: 'FFFFFF',
  dark: '0F172A',
  gradient: '1E293B',
};

const VARIANT_TEXT: Record<SlideData['variant'], string> = {
  default: '0F172A',
  dark: 'FFFFFF',
  gradient: 'FFFFFF',
};

const VARIANT_MUTED: Record<SlideData['variant'], string> = {
  default: '64748B',
  dark: '94A3B8',
  gradient: 'CBD5E1',
};

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
      s.background = {
        fill: { type: 'solid', color: '1E293B' },
      } as any;
    } else {
      s.background = { color: bg };
    }

    // Accent bar at bottom
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 5.35, w: '100%', h: 0.08,
      fill: { color: '6366F1' },
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
          fontSize: 28, bold: true, color: fg,
          fontFace: 'Arial',
        });
        if (slide.body) {
          const lines = slide.body.split('\n').filter(Boolean);
          const bulletText = lines.map(line => ({
            text: line.replace(/^[•\-]\s*/, ''),
            options: { bullet: { type: 'bullet' as const }, fontSize: 16, color: fg, fontFace: 'Arial' },
          }));
          s.addText(bulletText, {
            x: 0.8, y: 1.4, w: 8.4, h: 3.5,
          });
        }
        break;

      case 'image-left':
      case 'image-right': {
        const textX = slide.layout === 'image-left' ? 5.2 : 0.5;
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
          const imgX = slide.layout === 'image-left' ? 0.3 : 5.2;
          s.addImage({ path: slide.imageUrl, x: imgX, y: 0.3, w: 4.5, h: 4.8 });
        } else {
          const imgX = slide.layout === 'image-left' ? 0.3 : 5.2;
          s.addShape(pptx.ShapeType.rect, {
            x: imgX, y: 0.3, w: 4.5, h: 4.8,
            fill: { color: slide.variant === 'default' ? 'E2E8F0' : '334155' },
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
