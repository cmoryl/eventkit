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

/**
 * A single placeholder within a slide layout — geometry is normalized to
 * percentages of the slide so it survives any aspect ratio.
 */
export interface PptxLayoutPlaceholder {
  /** Placeholder type as declared on `<p:ph type="...">` (title, body, ctrTitle, subTitle, pic, ftr, sldNum, dt, etc.). */
  type: string;
  /** Optional 0-based index when there are multiple of the same type. */
  idx?: number;
  /** Size hint from `<p:ph sz="...">` (full, half, quarter). */
  sz?: string;
  /** Geometry in % of slide width/height (0-100). Missing if the placeholder inherits from master. */
  xPct?: number;
  yPct?: number;
  wPct?: number;
  hPct?: number;
}

export interface PptxLayoutDecorShape {
  /** Preset geometry name (rect, roundRect, ellipse, line, triangle, etc.). */
  geom?: string;
  xPct: number; yPct: number; wPct: number; hPct: number;
  /** Resolved hex color or `theme:<key>` reference. */
  fill?: string;
  /** Resolved hex color or `theme:<key>` reference. */
  line?: string;
}

export interface PptxLayoutDefinition {
  /** Layout file name (e.g. "slideLayout5.xml"). */
  fileName: string;
  /** Human-readable layout name from `<p:cSld name="...">`. */
  name: string;
  /** Layout class from `<p:sldLayout type="...">` — title, obj, twoObjTx, secHead, blank, etc. */
  type?: string;
  /** Ordered list of placeholders with normalized geometry. */
  placeholders: PptxLayoutPlaceholder[];
  /** Slide-layout index in the deck (1-based, from file name). */
  index: number;
  /** Layout-level background fill (hex or `theme:<key>`), if explicitly set. */
  bgFill?: string;
  /** Decorative non-placeholder shapes drawn on the layout (accent bars, dividers, color blocks). */
  decorShapes: PptxLayoutDecorShape[];
}

export interface PptxLayoutCatalog {
  /** Slide width in EMU from presentation.xml (914400 EMU = 1 inch). */
  slideWidthEmu: number;
  /** Slide height in EMU. */
  slideHeightEmu: number;
  layouts: PptxLayoutDefinition[];
}

/**
 * Parse `ppt/slideLayouts/slideLayout*.xml` into a reusable layout catalog so
 * downstream AI prompts can pick from real layouts that exist in the master
 * deck (with their actual placeholder geometry) instead of inventing layouts.
 */
export async function parsePptxLayoutCatalog(file: File): Promise<PptxLayoutCatalog> {
  const zip = await JSZip.loadAsync(file);

  // Slide dimensions live in presentation.xml: <p:sldSz cx="..." cy="..."/>
  let slideWidthEmu = 9144000; // 10in default
  let slideHeightEmu = 6858000; // 7.5in default
  const presPath = 'ppt/presentation.xml';
  if (zip.files[presPath]) {
    const presXml = await zip.files[presPath].async('text');
    const sldSz = presXml.match(/<p:sldSz\b[^/>]*\scx="(\d+)"[^/>]*\scy="(\d+)"/);
    if (sldSz) {
      slideWidthEmu = parseInt(sldSz[1], 10) || slideWidthEmu;
      slideHeightEmu = parseInt(sldSz[2], 10) || slideHeightEmu;
    }
  }

  const layoutFiles = Object.keys(zip.files)
    .filter((n) => /^ppt\/slideLayouts\/slideLayout\d+\.xml$/.test(n))
    .sort((a, b) => {
      const ia = parseInt(a.match(/slideLayout(\d+)/)?.[1] || '0', 10);
      const ib = parseInt(b.match(/slideLayout(\d+)/)?.[1] || '0', 10);
      return ia - ib;
    });

  const layouts: PptxLayoutDefinition[] = [];
  for (const path of layoutFiles) {
    const xml = await zip.files[path].async('text');
    const fileName = path.split('/').pop()!;
    const index = parseInt(fileName.match(/slideLayout(\d+)/)?.[1] || '0', 10);

    const nameMatch = xml.match(/<p:cSld\b[^>]*\sname="([^"]+)"/);
    const typeMatch = xml.match(/<p:sldLayout\b[^>]*\stype="([^"]+)"/);

    const placeholders: PptxLayoutPlaceholder[] = [];
    const shapeRegex = /<p:sp\b[^>]*>([\s\S]*?)<\/p:sp>/g;
    let shapeMatch: RegExpExecArray | null;
    while ((shapeMatch = shapeRegex.exec(xml)) !== null) {
      const shape = shapeMatch[1];
      const phMatch = shape.match(/<p:ph\b([^/>]*)\/?>/);
      if (!phMatch) continue; // not a placeholder, skip decorative shapes on the layout
      const phAttrs = phMatch[1];
      const type = phAttrs.match(/\stype="([^"]+)"/)?.[1] || 'body';
      const idxRaw = phAttrs.match(/\sidx="(\d+)"/)?.[1];
      const idx = idxRaw ? parseInt(idxRaw, 10) : undefined;
      const sz = phAttrs.match(/\ssz="([^"]+)"/)?.[1];

      // Geometry: <a:xfrm><a:off x=".." y=".."/><a:ext cx=".." cy=".."/></a:xfrm>
      const xfrm = shape.match(/<a:xfrm\b[^>]*>([\s\S]*?)<\/a:xfrm>/);
      let xPct: number | undefined;
      let yPct: number | undefined;
      let wPct: number | undefined;
      let hPct: number | undefined;
      if (xfrm) {
        const off = xfrm[1].match(/<a:off\b[^/>]*\sx="(-?\d+)"[^/>]*\sy="(-?\d+)"/);
        const ext = xfrm[1].match(/<a:ext\b[^/>]*\scx="(\d+)"[^/>]*\scy="(\d+)"/);
        if (off) {
          xPct = +((parseInt(off[1], 10) / slideWidthEmu) * 100).toFixed(2);
          yPct = +((parseInt(off[2], 10) / slideHeightEmu) * 100).toFixed(2);
        }
        if (ext) {
          wPct = +((parseInt(ext[1], 10) / slideWidthEmu) * 100).toFixed(2);
          hPct = +((parseInt(ext[2], 10) / slideHeightEmu) * 100).toFixed(2);
        }
      }

      placeholders.push({ type, idx, sz, xPct, yPct, wPct, hPct });
    }

    layouts.push({
      fileName,
      name: nameMatch?.[1] || `Layout ${index}`,
      type: typeMatch?.[1],
      placeholders,
      index,
    });
  }

  return { slideWidthEmu, slideHeightEmu, layouts };
}

/**
 * A single shape pulled from a real slide (or layout/master) — captured as a
 * geometry + fill "blueprint" so AI prompts can describe how the master deck
 * actually composes pages and so the renderer can recreate decorative bars,
 * dividers, sidebars etc. on generated slides.
 */
export interface PptxShapeBlueprint {
  kind: 'shape' | 'placeholder' | 'picture';
  phType?: string;
  geom?: string;
  xPct?: number; yPct?: number; wPct?: number; hPct?: number;
  fill?: string;
  line?: string;
  sampleText?: string;
  picTarget?: string;
}

export interface PptxSlideBlueprint {
  slideNum: number;
  layoutFile?: string;
  bgFill?: string;
  shapes: PptxShapeBlueprint[];
}

export interface PptxMasterAsset {
  source: 'master' | string;
  fileName: string;
  dataUrl: string;
  xPct?: number; yPct?: number; wPct?: number; hPct?: number;
  role: 'logo' | 'watermark' | 'decoration';
}

const parseShapesFromXml = (
  xml: string,
  slideWidthEmu: number,
  slideHeightEmu: number,
): PptxShapeBlueprint[] => {
  const shapes: PptxShapeBlueprint[] = [];
  const elRegex = /<(p:sp|p:pic)\b[^>]*>([\s\S]*?)<\/\1>/g;
  let m: RegExpExecArray | null;
  while ((m = elRegex.exec(xml)) !== null) {
    const tag = m[1];
    const inner = m[2];
    const xfrm = inner.match(/<a:xfrm\b[^>]*>([\s\S]*?)<\/a:xfrm>/);
    let xPct: number | undefined, yPct: number | undefined, wPct: number | undefined, hPct: number | undefined;
    if (xfrm) {
      const off = xfrm[1].match(/<a:off\b[^/>]*\sx="(-?\d+)"[^/>]*\sy="(-?\d+)"/);
      const ext = xfrm[1].match(/<a:ext\b[^/>]*\scx="(\d+)"[^/>]*\scy="(\d+)"/);
      if (off) {
        xPct = +((parseInt(off[1], 10) / slideWidthEmu) * 100).toFixed(2);
        yPct = +((parseInt(off[2], 10) / slideHeightEmu) * 100).toFixed(2);
      }
      if (ext) {
        wPct = +((parseInt(ext[1], 10) / slideWidthEmu) * 100).toFixed(2);
        hPct = +((parseInt(ext[2], 10) / slideHeightEmu) * 100).toFixed(2);
      }
    }

    if (tag === 'p:pic') {
      const rEmbed = inner.match(/<a:blip\b[^/>]*\sr:embed="([^"]+)"/);
      shapes.push({ kind: 'picture', geom: 'picture', xPct, yPct, wPct, hPct, picTarget: rEmbed?.[1] });
      continue;
    }

    const phMatch = inner.match(/<p:ph\b([^/>]*)\/?>/);
    const phType = phMatch?.[1].match(/\stype="([^"]+)"/)?.[1];
    const geom = inner.match(/<a:prstGeom\b[^>]*\sprst="([^"]+)"/)?.[1];

    const solid = inner.match(/<a:solidFill>([\s\S]*?)<\/a:solidFill>/);
    let fill: string | undefined;
    if (solid) {
      const srgb = solid[1].match(/<a:srgbClr\s+val="([0-9A-Fa-f]{6})"/);
      const scheme = solid[1].match(/<a:schemeClr\s+val="([^"]+)"/);
      if (srgb) fill = `#${srgb[1].toUpperCase()}`;
      else if (scheme) fill = `theme:${scheme[1]}`;
    }

    const ln = inner.match(/<a:ln\b[^>]*>([\s\S]*?)<\/a:ln>/);
    let line: string | undefined;
    if (ln) {
      const lnSrgb = ln[1].match(/<a:srgbClr\s+val="([0-9A-Fa-f]{6})"/);
      const lnScheme = ln[1].match(/<a:schemeClr\s+val="([^"]+)"/);
      if (lnSrgb) line = `#${lnSrgb[1].toUpperCase()}`;
      else if (lnScheme) line = `theme:${lnScheme[1]}`;
    }

    const txt = inner.match(/<a:t>([\s\S]*?)<\/a:t>/)?.[1];
    const sampleText = txt ? txt.replace(/\s+/g, ' ').slice(0, 60).trim() || undefined : undefined;

    shapes.push({
      kind: phMatch ? 'placeholder' : 'shape',
      phType, geom, xPct, yPct, wPct, hPct, fill, line, sampleText,
    });
  }
  return shapes;
};

/** Per-slide shape blueprint for every slide in the deck. */
export async function parsePptxSlideBlueprints(file: File): Promise<{
  slideWidthEmu: number;
  slideHeightEmu: number;
  blueprints: PptxSlideBlueprint[];
}> {
  const zip = await JSZip.loadAsync(file);
  let slideWidthEmu = 9144000, slideHeightEmu = 6858000;
  if (zip.files['ppt/presentation.xml']) {
    const pres = await zip.files['ppt/presentation.xml'].async('text');
    const sz = pres.match(/<p:sldSz\b[^/>]*\scx="(\d+)"[^/>]*\scy="(\d+)"/);
    if (sz) { slideWidthEmu = +sz[1] || slideWidthEmu; slideHeightEmu = +sz[2] || slideHeightEmu; }
  }

  const slideLayout = new Map<number, string>();
  for (const [path, entry] of Object.entries(zip.files)) {
    const mt = path.match(/^ppt\/slides\/_rels\/slide(\d+)\.xml\.rels$/);
    if (!mt) continue;
    const rels = await entry.async('text');
    const target = rels.match(/Target="\.\.\/slideLayouts\/(slideLayout\d+\.xml)"/)?.[1];
    if (target) slideLayout.set(parseInt(mt[1], 10), target);
  }

  const slideFiles = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => (parseInt(a.match(/slide(\d+)/)![1], 10) - parseInt(b.match(/slide(\d+)/)![1], 10)));

  const blueprints: PptxSlideBlueprint[] = [];
  for (const path of slideFiles) {
    const slideNum = parseInt(path.match(/slide(\d+)/)![1], 10);
    const xml = await zip.files[path].async('text');
    const bg = xml.match(/<p:bg\b[\s\S]*?<a:solidFill>([\s\S]*?)<\/a:solidFill>/);
    let bgFill: string | undefined;
    if (bg) {
      const srgb = bg[1].match(/<a:srgbClr\s+val="([0-9A-Fa-f]{6})"/);
      const scheme = bg[1].match(/<a:schemeClr\s+val="([^"]+)"/);
      if (srgb) bgFill = `#${srgb[1].toUpperCase()}`;
      else if (scheme) bgFill = `theme:${scheme[1]}`;
    }
    blueprints.push({
      slideNum,
      layoutFile: slideLayout.get(slideNum),
      bgFill,
      shapes: parseShapesFromXml(xml, slideWidthEmu, slideHeightEmu),
    });
  }

  return { slideWidthEmu, slideHeightEmu, blueprints };
}

/** Recurring decorative imagery from the slide master + slide layouts. */
export async function parsePptxMasterAssets(file: File): Promise<PptxMasterAsset[]> {
  const zip = await JSZip.loadAsync(file);

  const mediaMap = new Map<string, string>();
  for (const [path, entry] of Object.entries(zip.files)) {
    if (!path.startsWith('ppt/media/')) continue;
    const ext = path.split('.').pop()?.toLowerCase() || '';
    if (!IMAGE_EXTENSIONS.includes(ext)) continue;
    if (ext === 'emf' || ext === 'wmf') continue;
    const blob = await entry.async('blob');
    const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'png' ? 'image/png' : 'image/jpeg';
    mediaMap.set(path.split('/').pop()!, await blobToDataUrl(blob, mime));
  }

  let slideWidthEmu = 9144000, slideHeightEmu = 6858000;
  if (zip.files['ppt/presentation.xml']) {
    const pres = await zip.files['ppt/presentation.xml'].async('text');
    const sz = pres.match(/<p:sldSz\b[^/>]*\scx="(\d+)"[^/>]*\scy="(\d+)"/);
    if (sz) { slideWidthEmu = +sz[1] || slideWidthEmu; slideHeightEmu = +sz[2] || slideHeightEmu; }
  }

  const resolveRels = async (relsPath: string): Promise<Map<string, string>> => {
    const out = new Map<string, string>();
    if (!zip.files[relsPath]) return out;
    const xml = await zip.files[relsPath].async('text');
    const re = /<Relationship\b[^>]*\sId="([^"]+)"[^>]*\sTarget="([^"]+)"/g;
    let mm: RegExpExecArray | null;
    while ((mm = re.exec(xml)) !== null) {
      const file = mm[2].replace(/^.*\/media\//, '');
      if (mediaMap.has(file)) out.set(mm[1], file);
    }
    return out;
  };

  const seenFiles = new Set<string>();
  const assets: PptxMasterAsset[] = [];

  const harvest = async (xmlPath: string, source: PptxMasterAsset['source']) => {
    if (!zip.files[xmlPath]) return;
    const xml = await zip.files[xmlPath].async('text');
    const relsPath = xmlPath.replace(/([^/]+)\.xml$/, '_rels/$1.xml.rels');
    const rels = await resolveRels(relsPath);
    const shapes = parseShapesFromXml(xml, slideWidthEmu, slideHeightEmu);
    for (const sh of shapes) {
      if (sh.kind !== 'picture' || !sh.picTarget) continue;
      const file = rels.get(sh.picTarget);
      if (!file || seenFiles.has(file)) continue;
      seenFiles.add(file);
      const small = (sh.wPct ?? 100) < 25 && (sh.hPct ?? 100) < 25;
      const role: PptxMasterAsset['role'] = small ? 'logo' : (sh.wPct ?? 0) > 60 ? 'watermark' : 'decoration';
      assets.push({
        source,
        fileName: file,
        dataUrl: mediaMap.get(file)!,
        xPct: sh.xPct, yPct: sh.yPct, wPct: sh.wPct, hPct: sh.hPct,
        role,
      });
    }
  };

  for (const p of Object.keys(zip.files).filter((n) => /^ppt\/slideMasters\/slideMaster\d+\.xml$/.test(n))) {
    await harvest(p, 'master');
  }
  for (const p of Object.keys(zip.files).filter((n) => /^ppt\/slideLayouts\/slideLayout\d+\.xml$/.test(n))) {
    const name = p.split('/').pop()!.replace('.xml', '');
    await harvest(p, `layout:${name}`);
  }

  return assets;
}


