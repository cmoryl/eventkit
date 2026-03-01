import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import type { SlideData } from './slideTypes';

/**
 * Parse a PPTX file and extract slides as SlideData[].
 * PPTX is a ZIP archive with XML slide files inside.
 */
export async function parsePptxFile(file: File): Promise<SlideData[]> {
  const zip = await JSZip.loadAsync(file);

  // Find all slide XML files and sort numerically
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

  // Try to load notes
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

  const slides: SlideData[] = [];

  for (let i = 0; i < slideFiles.length; i++) {
    const xml = await zip.files[slideFiles[i]].async('text');
    const slideNum = i + 1;

    const textBlocks = extractTextBlocks(xml);
    const layout = inferLayout(textBlocks, i, slideFiles.length);
    const variant = inferVariant(xml, i, slideFiles.length);

    const slide: SlideData = {
      id: uuidv4(),
      layout,
      title: textBlocks[0]?.text || `Slide ${slideNum}`,
      variant,
    };

    // Second block as subtitle for title/section layouts, or body for content
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

interface TextBlock {
  text: string;
  fontSize: number;
  isBold: boolean;
}

/** Extract all text runs from slide XML grouped by text frame (sp/shape) */
function extractTextBlocks(xml: string): TextBlock[] {
  const blocks: TextBlock[] = [];

  // Match each shape (sp) element
  const shapeRegex = /<p:sp\b[^>]*>([\s\S]*?)<\/p:sp>/g;
  let shapeMatch;

  while ((shapeMatch = shapeRegex.exec(xml)) !== null) {
    const shapeContent = shapeMatch[1];
    const texts: string[] = [];
    let maxFontSize = 0;
    let hasBold = false;

    // Extract paragraphs
    const paraRegex = /<a:p\b[^>]*>([\s\S]*?)<\/a:p>/g;
    let paraMatch;

    while ((paraMatch = paraRegex.exec(shapeContent)) !== null) {
      const paraContent = paraMatch[1];
      const lineTexts: string[] = [];

      // Check for bullet list markers
      const hasBullet = /<a:buChar/.test(paraContent) || /<a:buAutoNum/.test(paraContent);

      // Extract text runs
      const runRegex = /<a:r>([\s\S]*?)<\/a:r>/g;
      let runMatch;

      while ((runMatch = runRegex.exec(paraContent)) !== null) {
        const runContent = runMatch[1];

        // Get font size
        const szMatch = runContent.match(/sz="(\d+)"/);
        if (szMatch) {
          const sz = parseInt(szMatch[1]) / 100; // convert hundredths of a point
          if (sz > maxFontSize) maxFontSize = sz;
        }

        // Check bold
        if (/\bb="1"/.test(runContent)) hasBold = true;

        // Get text
        const textMatch = runContent.match(/<a:t>([\s\S]*?)<\/a:t>/);
        if (textMatch) {
          lineTexts.push(textMatch[1]);
        }
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

  // Sort by font size descending so the title (largest text) comes first
  blocks.sort((a, b) => b.fontSize - a.fontSize || (b.isBold ? 1 : 0) - (a.isBold ? 1 : 0));

  return blocks;
}

/** Simple text extraction for notes */
function extractTextFromXml(xml: string): string {
  const texts: string[] = [];
  const regex = /<a:t>([\s\S]*?)<\/a:t>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    texts.push(match[1]);
  }
  return texts.join(' ').replace(/\s+/g, ' ').trim();
}

function inferLayout(blocks: TextBlock[], index: number, total: number): SlideData['layout'] {
  if (index === 0) return 'title';
  if (index === total - 1 && blocks.length <= 2) return 'section';

  // If there's body text with bullets, it's a content slide
  const bodyText = blocks.slice(1).map(b => b.text).join('\n');
  if (bodyText.includes('•') || bodyText.includes('\n')) return 'content';

  // Short text only → section
  if (blocks.length <= 2 && bodyText.length < 60) return 'section';

  return 'content';
}

function inferVariant(xml: string, index: number, total: number): SlideData['variant'] {
  // Check for dark background fills
  const hasDarkBg = /srgbClr val="[0-3][0-9a-fA-F]{5}"/.test(xml);

  if (index === 0) return 'gradient';
  if (index === total - 1) return 'dark';
  if (hasDarkBg) return 'dark';
  return 'default';
}
