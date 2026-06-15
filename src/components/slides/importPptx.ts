import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import type { SlideData } from './slideTypes';

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'svg', 'emf', 'wmf'];

/**
 * Brand tokens extracted from a PPTX `ppt/theme/theme1.xml` (the authoritative
 * color + font palette baked into the master deck). All values are best-effort
 * and may be missing if the theme file is unconventional.
 */
export interface PptxThemeTokens {
  /** Theme name (e.g. "Office Theme" or "TransPerfect 2026"). */
  name?: string;
  /** Color scheme — keys are theme slot names (dk1, lt1, dk2, lt2, accent1-6, hlink, folHlink). */
  colors: Record<string, string>;
  /** Major (heading) + minor (body) latin typefaces from `<a:fontScheme>`. */
  fonts: { major?: string; minor?: string };
}

/**
 * Parse a PPTX file and extract slides as SlideData[], including embedded images.
 */
export async function parsePptxFile(file: File): Promise<SlideData[]> {
  const zip = await JSZip.loadAsync(file);

  // 1. Build a map of all media files → base64 data URLs
  const mediaMap = new Map<string, string>();
  for (const [path, zipEntry] of Object.entries(zip.files)) {
    if (!path.startsWith('ppt/media/')) continue;
    const ext = path.split('.').pop()?.toLowerCase() || '';
    if (!IMAGE_EXTENSIONS.includes(ext)) continue;
    // Skip unsupported vector formats for display
    if (ext === 'emf' || ext === 'wmf') continue;
    const blob = await zipEntry.async('blob');
    const mimeType = ext === 'svg' ? 'image/svg+xml' : ext === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = await blobToDataUrl(blob, mimeType);
    // Store with just the filename (e.g. "image1.png")
    const filename = path.split('/').pop()!;
    mediaMap.set(filename, dataUrl);
  }

  // 2. Build a map of relationship files: slideN → list of image filenames
  const slideImageMap = new Map<number, string[]>();
  for (const [path, zipEntry] of Object.entries(zip.files)) {
    const match = path.match(/^ppt\/slides\/_rels\/slide(\d+)\.xml\.rels$/);
    if (!match) continue;
    const slideNum = parseInt(match[1]);
    const relsXml = await zipEntry.async('text');
    const images: string[] = [];
    // Find relationships pointing to ../media/imageX.ext
    const relRegex = /Target="\.\.\/media\/([^"]+)"/g;
    let relMatch;
    while ((relMatch = relRegex.exec(relsXml)) !== null) {
      const mediaFilename = relMatch[1];
      if (mediaMap.has(mediaFilename)) {
        images.push(mediaFilename);
      }
    }
    if (images.length > 0) {
      slideImageMap.set(slideNum, images);
    }
  }

  // 3. Find all slide XML files and sort numerically
  const slideFiles = Object.keys(zip.files)
    .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0');
      return numA - numB;
    });

  if (slideFiles.length === 0) {
    throw new Error('No slides found in the PPTX file');
  }

  // 4. Load notes
  const notesMap = new Map<number, string>();
  for (const name of Object.keys(zip.files)) {
    const match = name.match(/^ppt\/notesSlides\/notesSlide(\d+)\.xml$/);
    if (match) {
      const idx = parseInt(match[1]);
      const xml = await zip.files[name].async('text');
      const notes = extractTextFromXml(xml);
      if (notes.trim()) notesMap.set(idx, notes.trim());
    }
  }

  // 5. Build SlideData[]
  const slides: SlideData[] = [];

  for (let i = 0; i < slideFiles.length; i++) {
    const xml = await zip.files[slideFiles[i]].async('text');
    const slideNum = i + 1;

    const textBlocks = extractTextBlocks(xml);
    const slideImages = slideImageMap.get(slideNum) || [];
    const hasImages = slideImages.length > 0;
    const layout = inferLayout(textBlocks, i, slideFiles.length, hasImages);
    const variant = inferVariant(xml, i, slideFiles.length);

    // Resolve image data URLs
    const imageDataUrls = slideImages
      .map(filename => mediaMap.get(filename))
      .filter((url): url is string => !!url);

    const slide: SlideData = {
      id: uuidv4(),
      layout,
      title: textBlocks[0]?.text || `Slide ${slideNum}`,
      variant,
    };

    // Assign images
    if (imageDataUrls.length > 0) {
      slide.imageUrl = imageDataUrls[0]; // Primary image for image-left/right layouts
      slide.images = imageDataUrls;
    }

    // Text content
    if (textBlocks.length > 1) {
      if (layout === 'title' || layout === 'section') {
        slide.subtitle = textBlocks[1].text;
        if (textBlocks.length > 2) {
          slide.body = textBlocks.slice(2).map(b => b.text).join('\n');
        }
      } else {
        slide.body = textBlocks.slice(1).map(b => b.text).join('\n');
      }
    }

    if (notesMap.has(slideNum)) {
      slide.notes = notesMap.get(slideNum);
    }

    slides.push(slide);
  }

  return slides;
}

function blobToDataUrl(blob: Blob, mimeType: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Replace the auto-detected mime with the correct one
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(`data:${mimeType};base64,${base64}`);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

interface TextBlock {
  text: string;
  fontSize: number;
  isBold: boolean;
}

function extractTextBlocks(xml: string): TextBlock[] {
  const blocks: TextBlock[] = [];
  const shapeRegex = /<p:sp\b[^>]*>([\s\S]*?)<\/p:sp>/g;
  let shapeMatch;

  while ((shapeMatch = shapeRegex.exec(xml)) !== null) {
    const shapeContent = shapeMatch[1];
    const texts: string[] = [];
    let maxFontSize = 0;
    let hasBold = false;

    const paraRegex = /<a:p\b[^>]*>([\s\S]*?)<\/a:p>/g;
    let paraMatch;

    while ((paraMatch = paraRegex.exec(shapeContent)) !== null) {
      const paraContent = paraMatch[1];
      const lineTexts: string[] = [];
      const hasBullet = /<a:buChar/.test(paraContent) || /<a:buAutoNum/.test(paraContent);

      const runRegex = /<a:r>([\s\S]*?)<\/a:r>/g;
      let runMatch;

      while ((runMatch = runRegex.exec(paraContent)) !== null) {
        const runContent = runMatch[1];
        const szMatch = runContent.match(/sz="(\d+)"/);
        if (szMatch) {
          const sz = parseInt(szMatch[1]) / 100;
          if (sz > maxFontSize) maxFontSize = sz;
        }
        if (/\bb="1"/.test(runContent)) hasBold = true;
        const textMatch = runContent.match(/<a:t>([\s\S]*?)<\/a:t>/);
        if (textMatch) lineTexts.push(textMatch[1]);
      }

      const lineText = lineTexts.join('').trim();
      if (lineText) {
        texts.push(hasBullet ? `• ${lineText}` : lineText);
      }
    }

    const fullText = texts.join('\n').trim();
    if (fullText) {
      blocks.push({ text: fullText, fontSize: maxFontSize, isBold: hasBold });
    }
  }

  blocks.sort((a, b) => b.fontSize - a.fontSize || (b.isBold ? 1 : 0) - (a.isBold ? 1 : 0));
  return blocks;
}

function extractTextFromXml(xml: string): string {
  const texts: string[] = [];
  const regex = /<a:t>([\s\S]*?)<\/a:t>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    texts.push(match[1]);
  }
  return texts.join(' ').replace(/\s+/g, ' ').trim();
}

function inferLayout(blocks: TextBlock[], index: number, total: number, hasImages: boolean): SlideData['layout'] {
  if (index === 0 && !hasImages) return 'title';
  if (hasImages) return index % 2 === 0 ? 'image-left' : 'image-right';
  if (index === total - 1 && blocks.length <= 2) return 'section';

  const bodyText = blocks.slice(1).map(b => b.text).join('\n');
  if (bodyText.includes('•') || bodyText.includes('\n')) return 'content';
  if (blocks.length <= 2 && bodyText.length < 60) return 'section';
  return 'content';
}

function inferVariant(xml: string, index: number, total: number): SlideData['variant'] {
  const hasDarkBg = /srgbClr val="[0-3][0-9a-fA-F]{5}"/.test(xml);
  if (index === 0) return 'gradient';
  if (index === total - 1) return 'dark';
  if (hasDarkBg) return 'dark';
  return 'default';
}

/**
 * Read `ppt/theme/theme1.xml` (or the first available theme) from a PPTX and
 * pull out the authoritative color scheme + font scheme. Falls back to an
 * empty palette if the theme file is missing or malformed.
 */
export async function parsePptxThemeTokens(file: File): Promise<PptxThemeTokens> {
  const zip = await JSZip.loadAsync(file);
  const themePath = Object.keys(zip.files)
    .filter((n) => /^ppt\/theme\/theme\d+\.xml$/.test(n))
    .sort()[0];

  const empty: PptxThemeTokens = { colors: {}, fonts: {} };
  if (!themePath) return empty;

  const xml = await zip.files[themePath].async('text');

  const nameMatch = xml.match(/<a:theme\b[^>]*\sname="([^"]+)"/);
  const name = nameMatch?.[1];

  // Color scheme: <a:clrScheme>...</a:clrScheme>
  const colors: Record<string, string> = {};
  const schemeMatch = xml.match(/<a:clrScheme\b[^>]*>([\s\S]*?)<\/a:clrScheme>/);
  if (schemeMatch) {
    const scheme = schemeMatch[1];
    // Each slot is e.g. <a:accent1><a:srgbClr val="03002C"/></a:accent1>
    // or <a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>
    const slotRegex = /<a:(dk1|lt1|dk2|lt2|accent[1-6]|hlink|folHlink)\b[^>]*>([\s\S]*?)<\/a:\1>/g;
    let m: RegExpExecArray | null;
    while ((m = slotRegex.exec(scheme)) !== null) {
      const slot = m[1];
      const body = m[2];
      const srgb = body.match(/<a:srgbClr\s+val="([0-9A-Fa-f]{6})"/);
      const sysLast = body.match(/<a:sysClr\b[^>]*\slastClr="([0-9A-Fa-f]{6})"/);
      const hex = srgb?.[1] || sysLast?.[1];
      if (hex) colors[slot] = `#${hex.toUpperCase()}`;
    }
  }

  // Font scheme: major (headings) + minor (body), latin typeface
  const fonts: { major?: string; minor?: string } = {};
  const majorMatch = xml.match(/<a:majorFont>([\s\S]*?)<\/a:majorFont>/);
  if (majorMatch) {
    const latin = majorMatch[1].match(/<a:latin\b[^>]*\stypeface="([^"]+)"/);
    if (latin) fonts.major = latin[1];
  }
  const minorMatch = xml.match(/<a:minorFont>([\s\S]*?)<\/a:minorFont>/);
  if (minorMatch) {
    const latin = minorMatch[1].match(/<a:latin\b[^>]*\stypeface="([^"]+)"/);
    if (latin) fonts.minor = latin[1];
  }

  return { name, colors, fonts };
}

