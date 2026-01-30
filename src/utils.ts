import { AssetType } from './types';
import type { PresentationData, IconElement, PdfExportOptions } from './types';
import React from 'react';
import pptxgen from "pptxgenjs";
import { jsPDF } from 'jspdf';

export const sanitizeFileName = (name: string): string => {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

export const ASSET_CATEGORIES: Record<string, AssetType[]> = {
  'Branding & Core': [
    AssetType.Palette,
    AssetType.SeamlessPattern,
    AssetType.AppIcon,
    AssetType.Favicon,
    AssetType.SocialProfile,
    AssetType.LogoMonochrome,
    AssetType.LogoReversed,
    AssetType.Slogans,
    AssetType.StyleGuide
  ],
  'Digital Assets': [
    AssetType.SocialPost,
    AssetType.EmailHeader,
    AssetType.SocialStory,
    AssetType.PresentationSlide,
    AssetType.Presentation,
    AssetType.VideoTeaser,
    AssetType.MarketingCopy,
    AssetType.RunOfShow,
    AssetType.Soundtrack
  ],
  'Print & Signage': [
    AssetType.NameTag,
    AssetType.Banner,
    AssetType.EventSignage,
    AssetType.HangingSignage,
    AssetType.OutdoorSignage,
    AssetType.DoorSignage,
    AssetType.EaselSignage,
    AssetType.LocationSignage,
    AssetType.RoomSignage,
    AssetType.StandUpPillarBanner,
    AssetType.FeatherFlag,
    AssetType.TeardropFlag,
    AssetType.ThankYouNote,
    AssetType.AgendaHighlights,
    AssetType.Folder,
    AssetType.Menu,
    AssetType.WifiSign,
    AssetType.FloorPlan,
    AssetType.GlassDoor,
    AssetType.GlassDoubleDoor,
    AssetType.GlassRotatingDoor
  ],
  'Merchandise': [
    AssetType.Tshirt,
    AssetType.TshirtBack,
    AssetType.TshirtSleeve,
    AssetType.Lanyard,
    AssetType.SwagBag,
    AssetType.StickerSheet,
    AssetType.Hat,
    AssetType.WaterBottle
  ],
  'Event Experience': [
    AssetType.LocationIntel,
    AssetType.BackWall,
    AssetType.MainStageBackdrop,
    AssetType.Stairs,
    AssetType.RegistrationCounter,
    AssetType.WelcomeCounter,
    AssetType.RegistrationBackWall,
    AssetType.TechnologyCounter,
    AssetType.Kiosk
  ],
  'Utilities': [AssetType.QRCode],
};

export const compressImage = (file: File, maxWidth = 1920, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Compression failed'));
        }, file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const fileToBase64 = (file: File): Promise<{ data: string, type: string, name: string }> => {
  return new Promise(async (resolve, reject) => {
    try {
      const compressedBlob = await compressImage(file);

      const reader = new FileReader();
      reader.readAsDataURL(compressedBlob);
      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          return reject(new Error('FileReader result is not a string.'));
        }
        resolve({
          data: reader.result.split(',')[1],
          type: file.type,
          name: file.name
        });
      };
      reader.onerror = error => reject(error);
    } catch (error) {
      reject(error);
    }
  });
};

export const base64ToFile = (base64Data: { data: string, type: string, name: string }): File => {
  const byteCharacters = atob(base64Data.data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: base64Data.type });
  return new File([blob], base64Data.name, { type: base64Data.type });
};

export const convertSvgToPng = (svgFile: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const svgDataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512 * (img.height / img.width);
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) resolve(new File([blob], svgFile.name.replace('.svg', '.png'), { type: 'image/png' }));
          else reject(new Error('Canvas blob failed'));
        }, 'image/png');
      };
      img.src = svgDataUrl;
    };
    reader.readAsDataURL(svgFile);
  });
};

export const getAspectRatioStyle = (type: AssetType): React.CSSProperties => {
  switch (type) {
    case AssetType.Presentation:
    case AssetType.Banner:
    case AssetType.EventSignage:
    case AssetType.HangingSignage:
    case AssetType.OutdoorSignage:
    case AssetType.LocationSignage:
    case AssetType.EmailHeader:
    case AssetType.PresentationSlide:
    case AssetType.BackWall:
    case AssetType.RegistrationCounter:
    case AssetType.RegistrationBackWall:
    case AssetType.TechnologyCounter:
    case AssetType.ThankYouNote:
    case AssetType.MainStageBackdrop:
    case AssetType.WelcomeCounter:
    case AssetType.VideoTeaser:
      return { aspectRatio: '16 / 9' };
    case AssetType.DoorSignage:
    case AssetType.EaselSignage:
    case AssetType.Lanyard:
    case AssetType.SocialStory:
    case AssetType.Kiosk:
    case AssetType.Menu:
    case AssetType.GlassDoor:
      return { aspectRatio: '9 / 16' };
    case AssetType.NameTag:
    case AssetType.NameTagBack:
      return { aspectRatio: '3 / 4' };
    case AssetType.StandUpPillarBanner:
      return { aspectRatio: '33.5 / 83' };
    case AssetType.FeatherFlag:
      return { aspectRatio: '1 / 4' };
    case AssetType.TeardropFlag:
      return { aspectRatio: '1 / 3' };
    default:
      return { aspectRatio: '1 / 1' };
  }
};

export const getAspectRatioString = (type: AssetType): string => {
  const style = getAspectRatioStyle(type);
  return (style.aspectRatio as string).replace(' / ', ':');
};

export const printDimensionsMap: Partial<Record<AssetType, { w: number; h: number }>> = {
  [AssetType.NameTag]: { w: 3, h: 4 },
  [AssetType.NameTagBack]: { w: 3, h: 4 },
  [AssetType.Menu]: { w: 5, h: 11 },
  [AssetType.ThankYouNote]: { w: 7, h: 5 },
  [AssetType.StickerSheet]: { w: 8.5, h: 11 },
  [AssetType.Folder]: { w: 9, h: 12 },
  [AssetType.Banner]: { w: 72, h: 36 },
  [AssetType.EventSignage]: { w: 24, h: 18 },
  [AssetType.DoorSignage]: { w: 8.5, h: 11 },
  [AssetType.EaselSignage]: { w: 24, h: 36 },
  [AssetType.RoomSignage]: { w: 8.5, h: 11 },
  [AssetType.WifiSign]: { w: 8, h: 10 },
  [AssetType.BackWall]: { w: 120, h: 96 },
  [AssetType.GlassDoor]: { w: 36, h: 84 },
  [AssetType.GlassDoubleDoor]: { w: 72, h: 84 },
  [AssetType.GlassRotatingDoor]: { w: 48, h: 84 },
  [AssetType.Tshirt]: { w: 12, h: 12 },
  [AssetType.TshirtBack]: { w: 12, h: 12 },
  [AssetType.TshirtSleeve]: { w: 4, h: 4 },
  [AssetType.Hat]: { w: 5, h: 3 },
  [AssetType.WaterBottle]: { w: 3, h: 6 },
  [AssetType.MainStageBackdrop]: { w: 240, h: 120 },
  [AssetType.WelcomeCounter]: { w: 96, h: 42 },
  [AssetType.RegistrationCounter]: { w: 96, h: 42 },
  [AssetType.EmailHeader]: { w: 16.66, h: 5.55 },
  [AssetType.PresentationSlide]: { w: 13.33, h: 7.5 },
  [AssetType.StandUpPillarBanner]: { w: 33.5, h: 83 },
  [AssetType.FeatherFlag]: { w: 25, h: 100 },
  [AssetType.TeardropFlag]: { w: 30, h: 90 },
};

export const isPrintable = (assetType: AssetType): boolean => {
  return assetType in printDimensionsMap;
};

export const paperSizes: Record<string, { w: number; h: number }> = {
  'letter': { w: 8.5, h: 11 },
  'legal': { w: 8.5, h: 14 },
  'tabloid': { w: 11, h: 17 },
  'a4': { w: 8.27, h: 11.69 },
  'a3': { w: 11.69, h: 16.54 },
};

const iconToDataUrl = (iconName: string, color: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(50, 50, 40, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(iconName.charAt(0), 50, 50);
    }
    resolve(canvas.toDataURL());
  });
};

export const generatePptx = async (presentation: PresentationData) => {
  if (!presentation.slides || presentation.slides.length === 0) return;

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = presentation.title;
  pptx.company = 'Event Kit Generator';

  pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: presentation.theme.backgroundColor },
    objects: []
  });

  for (const slide of presentation.slides) {
    const pSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });

    const bgConfig = slide.backgroundConfig;
    if (bgConfig) {
      if (bgConfig.type === 'solid' && bgConfig.value) {
        pSlide.background = { color: bgConfig.value.replace('#', '') };
      } else if (bgConfig.type === 'image' && bgConfig.value && bgConfig.value.startsWith('data:image')) {
        pSlide.background = { data: bgConfig.value };

        if (bgConfig.overlayOpacity && bgConfig.overlayOpacity > 0) {
          pSlide.addShape(pptx.ShapeType.rect, {
            x: 0, y: 0, w: '100%', h: '100%',
            fill: { color: '000000', transparency: (1 - bgConfig.overlayOpacity) * 100 }
          });
        }
      }
    } else if (slide.background) {
      if (slide.background.startsWith('#')) pSlide.background = { color: slide.background.replace('#', '') };
      else if (slide.background.startsWith('data:')) pSlide.background = { data: slide.background };
    }

    if (slide.speakerNotes) pSlide.addNotes(slide.speakerNotes);

    for (const el of slide.elements) {
      const W_IN = 10;
      const H_IN = 5.625;
      const x = (el.x / 100) * W_IN;
      const y = (el.y / 100) * H_IN;
      const w = (el.w / 100) * W_IN;
      const h = (el.h / 100) * H_IN;

      if (el.type === 'text') {
        const textEl = el as any;
        pSlide.addText(textEl.content, {
          x, y, w, h,
          fontSize: textEl.fontSize ? textEl.fontSize * 0.75 : 18,
          color: textEl.color.replace('#', ''),
          bold: textEl.fontWeight === 'bold',
          italic: textEl.fontStyle === 'italic',
          underline: textEl.textDecoration === 'underline' ? { style: 'sng' } : undefined,
          align: textEl.align,
          fontFace: textEl.fontFamily || presentation.theme.bodyFont
        });
      } else if (el.type === 'image') {
        const imgEl = el as any;
        if (imgEl.src.startsWith('data:image')) {
          pSlide.addImage({ data: imgEl.src, x, y, w, h });
        }
      } else if (el.type === 'icon') {
        const iconEl = el as IconElement;
        if (iconEl.svgContent && iconEl.svgContent.startsWith('data:image')) {
          pSlide.addImage({ data: iconEl.svgContent, x, y, w, h });
        } else {
          const placeholder = await iconToDataUrl(iconEl.iconName || 'Icon', iconEl.color);
          pSlide.addImage({ data: placeholder, x, y, w, h });
        }
      } else if (el.type === 'shape') {
        const shapeEl = el as any;
        const type = shapeEl.shapeType === 'circle' ? pptx.ShapeType.ellipse : pptx.ShapeType.rect;
        pSlide.addShape(type, {
          x, y, w, h,
          fill: { color: shapeEl.backgroundColor.replace('#', '') }
        });
      } else if (el.type === 'chart') {
        const chartEl = el as any;
        const chartData = chartEl.data.datasets.map((ds: any) => ({
          name: ds.label,
          labels: chartEl.data.labels,
          values: ds.data
        }));
        let type = pptx.ChartType.bar;
        if (chartEl.chartType === 'line') type = pptx.ChartType.line;
        if (chartEl.chartType === 'pie') type = pptx.ChartType.pie;
        pSlide.addChart(type, chartData, { x, y, w, h });
      }
    }
  }

  await pptx.writeFile({ fileName: `${sanitizeFileName(presentation.title)}.pptx` });
};

export const generatePrintReadyPdf = async (
  imageBase64: string,
  assetType: AssetType,
  assetTitle: string,
  eventName: string,
  options: PdfExportOptions & { colorMode?: 'CMYK' | 'RGB'; showSafeZone?: boolean; safeZone?: number; dpi?: number }
) => {
  // Import the professional print service
  const { downloadProfessionalPdf } = await import('./services/printService');
  
  await downloadProfessionalPdf(imageBase64, assetType, assetTitle, eventName, {
    ...options,
    colorMode: options.colorMode || 'CMYK',
    showSafeZone: options.showSafeZone ?? true,
    safeZone: options.safeZone ?? 0.125,
    dpi: options.dpi ?? 300,
    includeJobTicket: true,
    showBleedArea: true
  });
};

export const downloadAllAssets = async (assets: { id: string; type: AssetType; title: string; content: string | string[] | any }[], eventName: string) => {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  const folder = zip.folder(sanitizeFileName(eventName) || 'event-assets');

  if (!folder) throw new Error('Could not create zip folder');

  for (const asset of assets) {
    if (typeof asset.content === 'string' && asset.content.startsWith('data:image')) {
      const base64Data = asset.content.split(',')[1];
      const ext = asset.content.includes('image/png') ? 'png' : 'jpg';
      folder.file(`${sanitizeFileName(asset.title)}.${ext}`, base64Data, { base64: true });
    } else if (Array.isArray(asset.content)) {
      const text = asset.content.map((item, i) => 
        typeof item === 'string' ? `${i + 1}. ${item}` : JSON.stringify(item, null, 2)
      ).join('\n\n');
      folder.file(`${sanitizeFileName(asset.title)}.txt`, text);
    } else if (typeof asset.content === 'string') {
      folder.file(`${sanitizeFileName(asset.title)}.txt`, asset.content);
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFileName(eventName) || 'event-assets'}.zip`;
  a.click();
  URL.revokeObjectURL(url);
};
