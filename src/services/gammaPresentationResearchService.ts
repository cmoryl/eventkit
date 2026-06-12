export type GammaCreationMode = 'generate' | 'paste' | 'import' | 'template' | 'agent';
export type GammaDeckStyle = 'minimal' | 'visual' | 'classic' | 'consultant';
export type GammaArtifactKind = 'presentation' | 'document' | 'webpage' | 'social' | 'graphic';
export type GammaCardSizeMode = 'fluid_card' | 'fixed_export_frame';
export type GammaIntegrationPriority = 'ship_now' | 'next' | 'later' | 'research';

export interface GammaInspiredCapability {
  id: string;
  label: string;
  area:
    | 'creation'
    | 'content_model'
    | 'theme'
    | 'layout'
    | 'media'
    | 'interaction'
    | 'presentation_runtime'
    | 'publishing'
    | 'analytics'
    | 'enterprise'
    | 'integration'
    | 'export';
  summary: string;
  priority: GammaIntegrationPriority;
  productImplication: string;
}

export interface GammaInspiredCreationPreset {
  mode: GammaCreationMode;
  label: string;
  description: string;
  defaultDeckStyle?: GammaDeckStyle;
  acceptsSources: boolean;
  mapsToPresentationStudio: string;
}

export interface GammaInspiredThemeModel {
  themeId?: string;
  name: string;
  typography: {
    headingFont?: string;
    bodyFont?: string;
    baseSize?: number;
    lineHeight?: number;
    letterSpacing?: number;
    uppercaseHeadings?: boolean;
  };
  colorTokens: {
    background?: string;
    text?: string;
    accent?: string;
    secondary?: string;
    link?: string;
    button?: string;
    fill?: string;
    outline?: string;
  };
  shapeTokens: {
    roundedness?: number;
    stroke?: 'none' | 'subtle' | 'strong';
    shadow?: 'none' | 'soft' | 'strong';
  };
  accentImageDefaults: {
    position: 'none' | 'top' | 'right' | 'left' | 'background';
    overlay: 'none' | 'frosted' | 'faded' | 'clear';
    intensity: number;
  };
}

export interface GammaInspiredCardBlock {
  id: string;
  type:
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
  label: string;
  editorBehavior: string;
}

export const gammaCreationPresets: GammaInspiredCreationPreset[] = [
  {
    mode: 'generate',
    label: 'Generate',
    description: 'Prompt-first deck/doc/site/social generation with theme and visuals selected up front.',
    defaultDeckStyle: 'visual',
    acceptsSources: false,
    mapsToPresentationStudio: 'Existing AI Generate flow plus Presentation Deck Brain prompt payload.',
  },
  {
    mode: 'paste',
    label: 'Paste in text',
    description: 'Transform raw pasted text into cards, sections, and visual layouts.',
    defaultDeckStyle: 'classic',
    acceptsSources: true,
    mapsToPresentationStudio: 'Add paste/import mode before outline generation and preserve source hierarchy.',
  },
  {
    mode: 'import',
    label: 'Import file or URL',
    description: 'Import PPTX, docs, URLs, and existing brand artifacts into editable cards/slides.',
    defaultDeckStyle: 'classic',
    acceptsSources: true,
    mapsToPresentationStudio: 'Extend current PPTX/BrandHub import into a source normalization layer.',
  },
  {
    mode: 'template',
    label: 'Create from template',
    description: 'Use a layout-preserving template and slot-fill it from a prompt or source material.',
    defaultDeckStyle: 'consultant',
    acceptsSources: true,
    mapsToPresentationStudio: 'Upgrade saved templates into named slot templates with deterministic substitution.',
  },
  {
    mode: 'agent',
    label: 'Create with Agent',
    description: 'Multi-source assistant workflow that shapes outline, content, visuals, and citations before generation.',
    defaultDeckStyle: 'consultant',
    acceptsSources: true,
    mapsToPresentationStudio: 'Add guided agent mode to PowerPoint Agent with sources, outline shaping, deck style, and QA checkpoints.',
  },
];

export const gammaInspiredCapabilities: GammaInspiredCapability[] = [
  {
    id: 'card-content-model',
    label: 'Card-based content graph',
    area: 'content_model',
    summary: 'Treat presentation, document, site, and social outputs as artifacts made of pages, cards, and blocks.',
    priority: 'ship_now',
    productImplication: 'Add a card/block abstraction above slide layouts so the editor can support deck, doc, and web outputs from one model.',
  },
  {
    id: 'fluid-card-fixed-frame',
    label: 'Fluid cards + fixed export frames',
    area: 'layout',
    summary: 'Support variable-height authoring cards while preserving fixed-size export frames for PPTX/PDF/PNG.',
    priority: 'next',
    productImplication: 'Separate editing layout from export rendering; avoid treating every object as a fixed slide only.',
  },
  {
    id: 'creation-mode-layer',
    label: 'Creation mode layer',
    area: 'creation',
    summary: 'Separate Generate, Paste, Import, Template, and Agent workflows from the underlying content schema.',
    priority: 'ship_now',
    productImplication: 'Let users choose how content enters the system before the same editor/render pipeline takes over.',
  },
  {
    id: 'deck-style-presets',
    label: 'Deck style presets',
    area: 'creation',
    summary: 'Offer Minimal, Visual, Classic, and Consultant generation styles independent from theme colors and fonts.',
    priority: 'ship_now',
    productImplication: 'Add structural/writing-style presets to Presentation Deck Brain separate from brand theme tokens.',
  },
  {
    id: 'theme-token-system',
    label: 'Deep theme token system',
    area: 'theme',
    summary: 'Model typography, colors, links/buttons, fills/outlines, gradients, logos, roundedness, stroke, and shadow as tokens.',
    priority: 'ship_now',
    productImplication: 'Expand the current brand theme payload beyond colors/fonts into a real Gamma-like theme system.',
  },
  {
    id: 'right-insert-rail',
    label: 'Right-side insert rail',
    area: 'interaction',
    summary: 'Use an insert rail for text, images, media, embeds, smart layouts, charts, and related blocks.',
    priority: 'next',
    productImplication: 'Add a persistent insertion surface in Presentation Studio instead of hiding all creation inside property panels.',
  },
  {
    id: 'smart-layout-blocks',
    label: 'Smart layout blocks',
    area: 'layout',
    summary: 'Build timelines, columns, galleries, stats, process flows, agenda cards, comparisons, and bento layouts as reusable block graphs.',
    priority: 'ship_now',
    productImplication: 'Move layout logic into reusable typed blocks, not one-off slide variants.',
  },
  {
    id: 'accent-image-system',
    label: 'Accent image system',
    area: 'media',
    summary: 'Differentiate normal image blocks from layout-bound accent images with top/right/left/background positions and overlays.',
    priority: 'next',
    productImplication: 'Add accent media controls with fit/fill/focal point and frosted/faded/clear overlays.',
  },
  {
    id: 'progressive-disclosure',
    label: 'Toggles, nested cards, footnotes',
    area: 'interaction',
    summary: 'Support collapsible toggles, nested cards, and footnotes as first-class semantic blocks.',
    priority: 'later',
    productImplication: 'Let presentations become richer docs/web artifacts without flattening everything into plain text.',
  },
  {
    id: 'editable-data-blocks',
    label: 'Editable chart/data blocks',
    area: 'layout',
    summary: 'Treat charts, stats, and infographics as data-bound editable blocks rather than static images.',
    priority: 'ship_now',
    productImplication: 'Tie live controls to structured data editors for charts, stats, timeline, and process slides.',
  },
  {
    id: 'presentation-runtime',
    label: 'Advanced presentation runtime',
    area: 'presentation_runtime',
    summary: 'Add presenter view, speaker notes, spotlight mode, quick edit, progress, follow links, and keyboard navigation.',
    priority: 'next',
    productImplication: 'Treat present mode as its own runtime, not just fullscreen rendering.',
  },
  {
    id: 'site-publishing',
    label: 'Site publishing layer',
    area: 'publishing',
    summary: 'Support page tree, custom domains, SEO, nav, favicon/site name, GTM/Meta tags, and publish/unpublish states.',
    priority: 'later',
    productImplication: 'Reuse the card/page model to publish decks as responsive microsites.',
  },
  {
    id: 'card-analytics',
    label: 'Card-level analytics',
    area: 'analytics',
    summary: 'Track relative time spent, card views, viewer depth, and unique viewers at the card level.',
    priority: 'later',
    productImplication: 'Add event telemetry around card/page impressions, not just artifact downloads.',
  },
  {
    id: 'generation-api-adapter',
    label: 'Generation API adapter',
    area: 'integration',
    summary: 'Treat external Gamma-style APIs as generation and handoff providers, not editing backends.',
    priority: 'research',
    productImplication: 'Keep EventKit as source of truth; use adapters for outbound generation, import experiments, or handoff workflows.',
  },
  {
    id: 'deterministic-template-slots',
    label: 'Deterministic template slots',
    area: 'layout',
    summary: 'Use named slots and variable validation instead of relying only on prompt-guided template substitution.',
    priority: 'ship_now',
    productImplication: 'Upgrade saved templates into enterprise-safe slot templates with required/fallback slot rules.',
  },
  {
    id: 'export-fidelity-snapshots',
    label: 'Export fidelity checks',
    area: 'export',
    summary: 'Compare editor, present, and exported outputs to catch gradient/font/layout drift.',
    priority: 'next',
    productImplication: 'Add snapshot QA and export-readiness checks before PPTX/PDF output.',
  },
  {
    id: 'enterprise-governance',
    label: 'Enterprise governance model',
    area: 'enterprise',
    summary: 'Support workspace roles, share policies, SSO-ready boundaries, audit events, and retention/deletion concepts.',
    priority: 'later',
    productImplication: 'Model governance internally even where external generation providers do not expose audit/edit APIs.',
  },
];

export const gammaCardBlocks: GammaInspiredCardBlock[] = [
  { id: 'text-block', type: 'text', label: 'Text block', editorBehavior: 'Inline rich text with links, emphasis, alignment, and footnote hooks.' },
  { id: 'image-block', type: 'image', label: 'Image block', editorBehavior: 'Replace, crop, mask, opacity, fit/fill, and BrandHub selection.' },
  { id: 'accent-image-block', type: 'accent_image', label: 'Accent image', editorBehavior: 'Layout-bound decorative image with side/background positions and overlay intensity.' },
  { id: 'chart-block', type: 'chart', label: 'Smart chart', editorBehavior: 'Table-backed data editor with chart type switching.' },
  { id: 'smart-layout-block', type: 'smart_layout', label: 'Smart layout', editorBehavior: 'Reusable typed layout graph such as timeline, agenda, cards, gallery, comparison, or bento.' },
  { id: 'toggle-block', type: 'toggle', label: 'Toggle', editorBehavior: 'Collapsible content with present/web state.' },
  { id: 'nested-card-block', type: 'nested_card', label: 'Nested card', editorBehavior: 'Card inside a card with drag-in/drop-out controls.' },
  { id: 'footnote-block', type: 'footnote', label: 'Footnote', editorBehavior: 'Referenced notes rendered at card/slide bottom.' },
  { id: 'embed-block', type: 'embed', label: 'Embed', editorBehavior: 'External or internal embed with export fallback.' },
  { id: 'infographic-block', type: 'infographic', label: 'AI infographic', editorBehavior: 'Prompt-generated visual block with aspect ratio, style, and regeneration controls.' },
];

export const defaultGammaInspiredTheme: GammaInspiredThemeModel = {
  name: 'Gamma-inspired presentation theme',
  typography: {
    headingFont: 'Geist',
    bodyFont: 'Geist',
    baseSize: 18,
    lineHeight: 1.25,
    letterSpacing: -0.02,
    uppercaseHeadings: false,
  },
  colorTokens: {
    background: '#FFFFFF',
    text: '#111827',
    accent: '#3B82F6',
    secondary: '#64748B',
    link: '#2563EB',
    button: '#111827',
    fill: '#F8FAFC',
    outline: '#E5E7EB',
  },
  shapeTokens: {
    roundedness: 18,
    stroke: 'subtle',
    shadow: 'soft',
  },
  accentImageDefaults: {
    position: 'background',
    overlay: 'frosted',
    intensity: 0.45,
  },
};

export const getGammaCapabilitiesByPriority = (priority: GammaIntegrationPriority) =>
  gammaInspiredCapabilities.filter((capability) => capability.priority === priority);

export const buildGammaDeckBrainPromptBlock = () => {
  const creationModes = gammaCreationPresets.map((preset) => `${preset.label}: ${preset.description}`).join('\n');
  const capabilities = gammaInspiredCapabilities
    .filter((capability) => capability.priority === 'ship_now' || capability.priority === 'next')
    .map((capability) => `- ${capability.label}: ${capability.productImplication}`)
    .join('\n');

  return [
    'GAMMA-INSPIRED PRESENTATION STUDIO INTELLIGENCE',
    'Use a card-based, AI-native authoring model while keeping EventKit as the source of truth.',
    'Separate theme tokens, structural templates, generation style presets, and export/runtime behavior.',
    '',
    'Creation modes:',
    creationModes,
    '',
    'Priority capabilities:',
    capabilities,
  ].join('\n');
};
