import type { GammaArtifactKind, GammaCardSizeMode } from './gammaPresentationResearchService';

export type PresentationBlockType =
  | 'text'
  | 'image'
  | 'accent_image'
  | 'chart'
  | 'smart_layout'
  | 'toggle'
  | 'nested_card'
  | 'footnote'
  | 'embed'
  | 'infographic';

export interface PresentationBlockNode {
  id: string;
  type: PresentationBlockType;
  props: Record<string, unknown>;
  children?: PresentationBlockNode[];
}

export interface PresentationCardNode {
  id: string;
  title?: string;
  cardType: 'slide' | 'doc_section' | 'web_section' | 'social_panel';
  sizeMode: GammaCardSizeMode;
  sortOrder: number;
  blocks: PresentationBlockNode[];
  exportFrame?: {
    width: number;
    height: number;
    unit: 'px' | 'in';
  };
}

export interface PresentationPageNode {
  id: string;
  title?: string;
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  cards: PresentationCardNode[];
}

export interface PresentationArtifactGraph {
  id: string;
  title: string;
  kind: GammaArtifactKind;
  pages: PresentationPageNode[];
  themeId?: string;
  templateId?: string;
  generationJobId?: string;
}

export const createPresentationArtifactGraph = (input: {
  id: string;
  title: string;
  kind?: GammaArtifactKind;
  cards?: PresentationCardNode[];
}): PresentationArtifactGraph => ({
  id: input.id,
  title: input.title,
  kind: input.kind ?? 'presentation',
  pages: [
    {
      id: `${input.id}-page-1`,
      title: input.title,
      cards: input.cards ?? [],
    },
  ],
});

export const createSlideCard = (input: {
  id: string;
  title?: string;
  sortOrder: number;
  blocks?: PresentationBlockNode[];
  fixedExportFrame?: boolean;
}): PresentationCardNode => ({
  id: input.id,
  title: input.title,
  cardType: 'slide',
  sizeMode: input.fixedExportFrame ? 'fixed_export_frame' : 'fluid_card',
  sortOrder: input.sortOrder,
  blocks: input.blocks ?? [],
  exportFrame: input.fixedExportFrame ? { width: 16, height: 9, unit: 'in' } : undefined,
});

export const createTextBlock = (id: string, text: string, role: 'title' | 'subtitle' | 'body' | 'caption' = 'body'): PresentationBlockNode => ({
  id,
  type: 'text',
  props: { text, role },
});

export const createAccentImageBlock = (input: {
  id: string;
  src?: string;
  position?: 'none' | 'top' | 'right' | 'left' | 'background';
  overlay?: 'none' | 'frosted' | 'faded' | 'clear';
  intensity?: number;
}): PresentationBlockNode => ({
  id: input.id,
  type: 'accent_image',
  props: {
    src: input.src,
    position: input.position ?? 'background',
    overlay: input.overlay ?? 'frosted',
    intensity: input.intensity ?? 0.45,
  },
});

export const summarizeArtifactGraph = (graph: PresentationArtifactGraph) => {
  const cards = graph.pages.flatMap((page) => page.cards);
  const blocks = cards.flatMap((card) => card.blocks);
  return {
    pages: graph.pages.length,
    cards: cards.length,
    blocks: blocks.length,
    fixedExportFrames: cards.filter((card) => card.sizeMode === 'fixed_export_frame').length,
    fluidCards: cards.filter((card) => card.sizeMode === 'fluid_card').length,
    blockTypes: Array.from(new Set(blocks.map((block) => block.type))),
  };
};
