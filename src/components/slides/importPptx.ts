import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import type { SlideData } from './slideTypes';

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'svg', 'emf', 'wmf'];

// =====================================================================
// PPTX import debug report — tracks skipped/failed embedded images/SVGs
// so a debug panel can surface what didn't make it into the editor.
// =====================================================================
export interface PptxImportIssue {
  scope: 'slide' | 'layout' | 'master' | 'media';
  scopeId?: string; // e.g. "slide 4", "slideLayout7.xml"
  path?: string; // zip path or media filename
  reason: string;
  detail?: string;
}

export interface PptxImportReport {
  fileName: string;
  startedAt: number;
  durationMs: number;
  mediaTotal: number;
  mediaLoaded: number;
  mediaSkipped: number;
  slidesParsed: number;
  picturesResolved: number;
  picturesUnresolved: number;
  issues: PptxImportIssue[];
}

let lastReport: PptxImportReport | null = null;
export const getLastPptxImportReport = (): PptxImportReport | null => lastReport;

const emitReport = (report: PptxImportReport) => {
  lastReport = report;
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent<PptxImportReport>('pptx-import-report', { detail: report }));
    } catch {/* noop */}
  }
};

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
  const startedAt = Date.now();
  const issues: PptxImportIssue[] = [];
  let mediaTotal = 0;
  let mediaLoaded = 0;
  let mediaSkipped = 0;
  let picturesResolved = 0;
  let picturesUnresolved = 0;

  const zip = await JSZip.loadAsync(file);

  // Slide dimensions (EMU) so we can map shape geometry to %.
  let slideWidthEmu = 9144000;
  let slideHeightEmu = 6858000;
  if (zip.files['ppt/presentation.xml']) {
    const presXml = await zip.files['ppt/presentation.xml'].async('text');
    const sz = presXml.match(/<p:sldSz\b[^/>]*\scx="(\d+)"[^/>]*\scy="(\d+)"/);
    if (sz) {
      slideWidthEmu = parseInt(sz[1], 10) || slideWidthEmu;
      slideHeightEmu = parseInt(sz[2], 10) || slideHeightEmu;
    }
  }

  // 1. Build a map of all media files → base64 data URLs
  const mediaMap = new Map<string, string>();
  for (const [path, zipEntry] of Object.entries(zip.files)) {
    if (!path.startsWith('ppt/media/')) continue;
    mediaTotal++;
    const ext = path.split('.').pop()?.toLowerCase() || '';
    const filename = path.split('/').pop()!;
    if (!IMAGE_EXTENSIONS.includes(ext)) {
      mediaSkipped++;
      issues.push({ scope: 'media', path: filename, reason: 'Unsupported file type', detail: `.${ext || 'unknown'}` });
      continue;
    }
    if (ext === 'emf' || ext === 'wmf') {
      mediaSkipped++;
      issues.push({ scope: 'media', path: filename, reason: 'Vector metafile not renderable in browser', detail: `.${ext}` });
      continue;
    }
    try {
      const blob = await zipEntry.async('blob');
      const mimeType = ext === 'svg' ? 'image/svg+xml' : ext === 'png' ? 'image/png' : 'image/jpeg';
      const dataUrl = await blobToDataUrl(blob, mimeType);
      mediaMap.set(filename, dataUrl);
      mediaLoaded++;
    } catch (err) {
      mediaSkipped++;
      issues.push({ scope: 'media', path: filename, reason: 'Failed to decode media blob', detail: String((err as Error)?.message || err) });
    }
  }


  // 2. Per-slide rels — flat list of media filenames AND Map<embedId, filename>
  //    so <a:blip r:embed="rIdX"/> resolves to its actual file at xfrm coords.
  const slideImageMap = new Map<number, string[]>();
  const slideEmbedMap = new Map<number, Map<string, string>>();
  const slideLayoutMap = new Map<number, string>();
  for (const [path, zipEntry] of Object.entries(zip.files)) {
    const match = path.match(/^ppt\/slides\/_rels\/slide(\d+)\.xml\.rels$/);
    if (!match) continue;
    const slideNum = parseInt(match[1]);
    const relsXml = await zipEntry.async('text');
    const images: string[] = [];
    const embeds = new Map<string, string>();
    const relRegex = /<Relationship\b[^>]*\sId="([^"]+)"[^>]*\sTarget="([^"]+)"/g;
    let relMatch: RegExpExecArray | null;
    while ((relMatch = relRegex.exec(relsXml)) !== null) {
      const rId = relMatch[1];
      const target = relMatch[2];
      const mediaName = target.match(/\/media\/([^"/]+)$/)?.[1];
      if (mediaName) {
        if (mediaMap.has(mediaName)) {
          embeds.set(rId, mediaName);
          images.push(mediaName);
        } else {
          issues.push({
            scope: 'slide', scopeId: `slide ${slideNum}`, path: mediaName,
            reason: 'Slide references media not loaded', detail: `rel ${rId} → ${target}`,
          });
        }
      }
      const layoutName = target.match(/\/slideLayouts\/(slideLayout\d+\.xml)$/)?.[1];
      if (layoutName) slideLayoutMap.set(slideNum, layoutName);
    }
    if (images.length > 0) slideImageMap.set(slideNum, images);
    if (embeds.size > 0) slideEmbedMap.set(slideNum, embeds);
  }

  // 2b. Resolve layout → master chrome (bg + decorative shapes + master pictures)
  //     so inherited graphics render on every slide.
  type InheritedChrome = {
    bgFill?: string;
    shapes: NonNullable<NonNullable<SlideData['masterChrome']>['shapes']>;
    assets: NonNullable<NonNullable<SlideData['masterChrome']>['assets']>;
    layoutName?: string;
  };
  const layoutChromeCache = new Map<string, InheritedChrome>();

  const buildXmlChrome = async (xmlPath: string): Promise<InheritedChrome> => {
    const entry = zip.files[xmlPath];
    if (!entry) return { shapes: [], assets: [] };
    const xml = await entry.async('text');
    const relsPath = xmlPath.replace(/([^/]+)\.xml$/, '_rels/$1.xml.rels');
    const embedMap = new Map<string, string>();
    const scope: PptxImportIssue['scope'] = xmlPath.includes('slideMasters') ? 'master' : 'layout';
    const scopeId = xmlPath.split('/').pop();
    if (zip.files[relsPath]) {
      const relsXml = await zip.files[relsPath].async('text');
      const reRel = /<Relationship\b[^>]*\sId="([^"]+)"[^>]*\sTarget="([^"]+)"/g;
      let mr: RegExpExecArray | null;
      while ((mr = reRel.exec(relsXml)) !== null) {
        const mediaName = mr[2].match(/\/media\/([^"/]+)$/)?.[1];
        if (mediaName) {
          if (mediaMap.has(mediaName)) embedMap.set(mr[1], mediaName);
          else issues.push({ scope, scopeId, path: mediaName, reason: 'Chrome references media not loaded', detail: `rel ${mr[1]}` });
        }
      }
    }
    const bgM = xml.match(/<p:bg\b[\s\S]*?<a:solidFill>([\s\S]*?)<\/a:solidFill>/);
    let bgFill: string | undefined;
    if (bgM) {
      const srgb = bgM[1].match(/<a:srgbClr\s+val="([0-9A-Fa-f]{6})"/);
      if (srgb) bgFill = `#${srgb[1].toUpperCase()}`;
    }
    const shapes: InheritedChrome['shapes'] = [];
    const assets: InheritedChrome['assets'] = [];
    const isHex = (v?: string) => !!v && v.startsWith('#');
    for (const sh of parseShapesFromXml(xml, slideWidthEmu, slideHeightEmu)) {
      if (sh.xPct === undefined || sh.yPct === undefined || sh.wPct === undefined || sh.hPct === undefined) {
        if (sh.kind === 'picture') {
          picturesUnresolved++;
          issues.push({ scope, scopeId, reason: 'Picture missing geometry', detail: `embed ${sh.picTarget ?? '?'}` });
        }
        continue;
      }
      if (sh.kind === 'picture') {
        const file = sh.picTarget ? embedMap.get(sh.picTarget) : undefined;
        const dataUrl = file ? mediaMap.get(file) : undefined;
        if (!dataUrl) {
          picturesUnresolved++;
          issues.push({ scope, scopeId, path: file, reason: 'Picture embed could not resolve to media', detail: `embed ${sh.picTarget ?? '?'}` });
          continue;
        }
        picturesResolved++;
        const small = sh.wPct < 25 && sh.hPct < 25;
        assets.push({
          dataUrl,
          xPct: sh.xPct, yPct: sh.yPct, wPct: sh.wPct, hPct: sh.hPct,
          role: small ? 'logo' : sh.wPct > 60 ? 'watermark' : 'decoration',
        });
      } else if (sh.kind === 'shape' && (sh.fill || sh.line)) {
        if (!isHex(sh.fill) && !isHex(sh.line)) continue;
        shapes.push({
          geom: sh.geom,
          xPct: sh.xPct, yPct: sh.yPct, wPct: sh.wPct, hPct: sh.hPct,
          fill: isHex(sh.fill) ? sh.fill : undefined,
          line: isHex(sh.line) ? sh.line : undefined,
        });
      }
    }
    return { bgFill, shapes, assets };
  };

  const getLayoutChrome = async (layoutFile: string): Promise<InheritedChrome> => {
    if (layoutChromeCache.has(layoutFile)) return layoutChromeCache.get(layoutFile)!;
    const layoutPath = `ppt/slideLayouts/${layoutFile}`;
    const layoutChrome = await buildXmlChrome(layoutPath);
    const layoutRels = layoutPath.replace(/([^/]+)\.xml$/, '_rels/$1.xml.rels');
    let masterChrome: InheritedChrome = { shapes: [], assets: [] };
    if (zip.files[layoutRels]) {
      const relsXml = await zip.files[layoutRels].async('text');
      const masterName = relsXml.match(/Target="\.\.\/slideMasters\/(slideMaster\d+\.xml)"/)?.[1];
      if (masterName) masterChrome = await buildXmlChrome(`ppt/slideMasters/${masterName}`);
    }
    const merged: InheritedChrome = {
      bgFill: layoutChrome.bgFill || masterChrome.bgFill,
      shapes: [...masterChrome.shapes, ...layoutChrome.shapes],
      assets: [...masterChrome.assets, ...layoutChrome.assets],
      layoutName: layoutFile,
    };
    layoutChromeCache.set(layoutFile, merged);
    return merged;
  };

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
  const isHex = (v?: string) => !!v && v.startsWith('#');

  for (let i = 0; i < slideFiles.length; i++) {
    const xml = await zip.files[slideFiles[i]].async('text');
    const slideNum = i + 1;

    const textBlocks = extractTextBlocks(xml);
    const slideImages = slideImageMap.get(slideNum) || [];
    const hasImages = slideImages.length > 0;
    const layout = inferLayout(textBlocks, i, slideFiles.length, hasImages);
    const variant = inferVariant(xml, i, slideFiles.length);

    const imageDataUrls = slideImages
      .map(filename => mediaMap.get(filename))
      .filter((url): url is string => !!url);

    const slide: SlideData = {
      id: uuidv4(),
      layout,
      title: textBlocks[0]?.text || `Slide ${slideNum}`,
      variant,
    };

    if (imageDataUrls.length > 0) {
      slide.imageUrl = imageDataUrls[0];
      slide.images = imageDataUrls;
    }

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

    // === Build masterChrome so all graphics (decorative shapes + pictures
    // + inherited layout/master chrome) render at their real positions. ===
    const embedMap = slideEmbedMap.get(slideNum) || new Map<string, string>();
    const slideBgM = xml.match(/<p:bg\b[\s\S]*?<a:solidFill>([\s\S]*?)<\/a:solidFill>/);
    let slideBg: string | undefined;
    if (slideBgM) {
      const srgb = slideBgM[1].match(/<a:srgbClr\s+val="([0-9A-Fa-f]{6})"/);
      if (srgb) slideBg = `#${srgb[1].toUpperCase()}`;
    }

    const chromeShapes: InheritedChrome['shapes'] = [];
    const chromeAssets: InheritedChrome['assets'] = [];

    const slideScopeId = `slide ${slideNum}`;
    for (const sh of parseShapesFromXml(xml, slideWidthEmu, slideHeightEmu)) {
      if (sh.xPct === undefined || sh.yPct === undefined || sh.wPct === undefined || sh.hPct === undefined) {
        if (sh.kind === 'picture') {
          picturesUnresolved++;
          issues.push({ scope: 'slide', scopeId: slideScopeId, reason: 'Picture missing geometry', detail: `embed ${sh.picTarget ?? '?'}` });
        }
        continue;
      }
      if (sh.kind === 'picture') {
        const file = sh.picTarget ? embedMap.get(sh.picTarget) : undefined;
        const dataUrl = file ? mediaMap.get(file) : undefined;
        if (!dataUrl) {
          picturesUnresolved++;
          issues.push({ scope: 'slide', scopeId: slideScopeId, path: file, reason: 'Picture embed could not resolve to media', detail: `embed ${sh.picTarget ?? '?'}` });
          continue;
        }
        picturesResolved++;
        const small = sh.wPct < 25 && sh.hPct < 25;
        chromeAssets.push({
          dataUrl,
          xPct: sh.xPct, yPct: sh.yPct, wPct: sh.wPct, hPct: sh.hPct,
          role: small ? 'logo' : sh.wPct > 60 ? 'watermark' : 'decoration',
        });
      } else if (sh.kind === 'shape' && (sh.fill || sh.line)) {
        if (!isHex(sh.fill) && !isHex(sh.line)) continue;
        chromeShapes.push({
          geom: sh.geom,
          xPct: sh.xPct, yPct: sh.yPct, wPct: sh.wPct, hPct: sh.hPct,
          fill: isHex(sh.fill) ? sh.fill : undefined,
          line: isHex(sh.line) ? sh.line : undefined,
        });
      }
    }


    const layoutFile = slideLayoutMap.get(slideNum);
    let inherited: InheritedChrome = { shapes: [], assets: [] };
    if (layoutFile) inherited = await getLayoutChrome(layoutFile);

    slide.masterChrome = {
      bgFill: slideBg || inherited.bgFill,
      shapes: [...inherited.shapes, ...chromeShapes],
      assets: [...inherited.assets, ...chromeAssets],
      layoutName: inherited.layoutName,
    };

    slides.push(slide);
  }

  emitReport({
    fileName: file.name,
    startedAt,
    durationMs: Date.now() - startedAt,
    mediaTotal,
    mediaLoaded,
    mediaSkipped,
    slidesParsed: slides.length,
    picturesResolved,
    picturesUnresolved,
    issues,
  });

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

  // Parse slide masters once — layouts inherit their background fill and
  // decorative shapes (accent bars, sidebars, logo blocks) from the master
  // they reference. Without this, layouts that don't redeclare bg/decor (the
  // common case in real corporate decks like TransPerfect) come back empty
  // and the rendered chrome looks like a blank white slide.
  const masterCache = new Map<string, { bgFill?: string; decorShapes: PptxLayoutDecorShape[] }>();
  const parseMasterChrome = async (masterPath: string) => {
    if (masterCache.has(masterPath)) return masterCache.get(masterPath)!;
    const entry = zip.files[masterPath];
    if (!entry) {
      const empty = { decorShapes: [] as PptxLayoutDecorShape[] };
      masterCache.set(masterPath, empty);
      return empty;
    }
    const mXml = await entry.async('text');
    const bgM = mXml.match(/<p:bg\b[\s\S]*?<a:solidFill>([\s\S]*?)<\/a:solidFill>/);
    let mBg: string | undefined;
    if (bgM) {
      const srgb = bgM[1].match(/<a:srgbClr\s+val="([0-9A-Fa-f]{6})"/);
      const scheme = bgM[1].match(/<a:schemeClr\s+val="([^"]+)"/);
      if (srgb) mBg = `#${srgb[1].toUpperCase()}`;
      else if (scheme) mBg = `theme:${scheme[1]}`;
    }
    const decor: PptxLayoutDecorShape[] = [];
    for (const sh of parseShapesFromXml(mXml, slideWidthEmu, slideHeightEmu)) {
      if (sh.kind !== 'shape') continue;
      if (sh.xPct === undefined || sh.yPct === undefined || sh.wPct === undefined || sh.hPct === undefined) continue;
      if (!sh.fill && !sh.line) continue;
      decor.push({ geom: sh.geom, xPct: sh.xPct, yPct: sh.yPct, wPct: sh.wPct, hPct: sh.hPct, fill: sh.fill, line: sh.line });
    }
    const out = { bgFill: mBg, decorShapes: decor };
    masterCache.set(masterPath, out);
    return out;
  };

  const layouts: PptxLayoutDefinition[] = [];
  for (const path of layoutFiles) {
    const xml = await zip.files[path].async('text');
    const fileName = path.split('/').pop()!;
    const index = parseInt(fileName.match(/slideLayout(\d+)/)?.[1] || '0', 10);

    const nameMatch = xml.match(/<p:cSld\b[^>]*\sname="([^"]+)"/);
    const typeMatch = xml.match(/<p:sldLayout\b[^>]*\stype="([^"]+)"/);

    // Follow the layout's .rels file to find the slideMaster it inherits from.
    const relsPath = `ppt/slideLayouts/_rels/${fileName}.rels`;
    let masterChrome: { bgFill?: string; decorShapes: PptxLayoutDecorShape[] } = { decorShapes: [] };
    if (zip.files[relsPath]) {
      const relsXml = await zip.files[relsPath].async('text');
      const masterTarget = relsXml.match(/Target="\.\.\/slideMasters\/(slideMaster\d+\.xml)"/)?.[1];
      if (masterTarget) {
        masterChrome = await parseMasterChrome(`ppt/slideMasters/${masterTarget}`);
      }
    }

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

    // Decorative non-placeholder shapes on THIS layout — accent bars, dividers, color blocks.
    const layoutDecor: PptxLayoutDecorShape[] = [];
    const allShapes = parseShapesFromXml(xml, slideWidthEmu, slideHeightEmu);
    for (const sh of allShapes) {
      if (sh.kind !== 'shape') continue;
      if (sh.xPct === undefined || sh.yPct === undefined || sh.wPct === undefined || sh.hPct === undefined) continue;
      if (!sh.fill && !sh.line) continue; // skip invisible markers
      layoutDecor.push({
        geom: sh.geom, xPct: sh.xPct, yPct: sh.yPct, wPct: sh.wPct, hPct: sh.hPct,
        fill: sh.fill, line: sh.line,
      });
    }

    // Layout-level background fill, if explicitly declared.
    const bgMatch = xml.match(/<p:bg\b[\s\S]*?<a:solidFill>([\s\S]*?)<\/a:solidFill>/);
    let layoutBgFill: string | undefined;
    if (bgMatch) {
      const srgb = bgMatch[1].match(/<a:srgbClr\s+val="([0-9A-Fa-f]{6})"/);
      const scheme = bgMatch[1].match(/<a:schemeClr\s+val="([^"]+)"/);
      if (srgb) layoutBgFill = `#${srgb[1].toUpperCase()}`;
      else if (scheme) layoutBgFill = `theme:${scheme[1]}`;
    }

    // Merge: master paints first (background + base decor), then layout-specific
    // decor stacks on top. Background prefers the layout's own declaration and
    // falls back to the master so inheriting layouts still render correctly.
    const bgFill = layoutBgFill || masterChrome.bgFill;
    const decorShapes = [...masterChrome.decorShapes, ...layoutDecor];

    layouts.push({
      fileName,
      name: nameMatch?.[1] || `Layout ${index}`,
      type: typeMatch?.[1],
      placeholders,
      index,
      bgFill,
      decorShapes,
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


