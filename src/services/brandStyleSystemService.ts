import type { BrandProfile } from '@/types/brandProfile';
import type { BrandGuideAsset } from './brandAssetLibraryService';
import type { MasterPromptFamily } from './masterfulPromptTemplateService';

export type BrandStyleSystemId =
  | 'enterprise-precision'
  | 'modular-campaign-system'
  | 'cinematic-editorial'
  | 'liquid-glass-depth'
  | 'human-moments'
  | 'abstract-transformation'
  | 'premium-minimal'
  | 'hospitality-warmth'
  | 'sports-energy'
  | 'luxury-editorial'
  | 'product-tech'
  | 'environmental-immersive';

export interface BrandStyleSystem {
  id: BrandStyleSystemId;
  name: string;
  description: string;
  fullSetBehavior: string;
  visualDNA: string[];
  colorBehavior: string[];
  typographyBehavior: string[];
  layoutBehavior: string[];
  motifBehavior: string[];
  imageryBehavior: string[];
  productionBehavior: string[];
  bestFor: string[];
  avoid: string[];
  assetFamilyUsage: Partial<Record<MasterPromptFamily | string, string>>;
}

const BRAND_STYLE_SYSTEMS_KEY = 'eventkit-brand-style-systems';
const hasStorage = () => typeof localStorage !== 'undefined';

type StoredStyleSystems = Record<string, BrandStyleSystemId[]>;

const safeParse = (raw: string | null): StoredStyleSystems => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const brandStyleSystems: Record<BrandStyleSystemId, BrandStyleSystem> = {
  'enterprise-precision': {
    id: 'enterprise-precision',
    name: 'Enterprise Precision',
    description: 'Polished, exact, high-trust brand system for global/corporate brands.',
    fullSetBehavior: 'Every asset should feel systematic, aligned, clean, confident, and scalable across departments, regions, and event formats.',
    visualDNA: ['crisp geometric alignment', 'clean panels', 'measured spacing', 'high signal-to-noise ratio'],
    colorBehavior: ['dominant core brand color', 'restrained accent use', 'high-contrast information fields', 'minimal random gradients'],
    typographyBehavior: ['large confident headings', 'structured metadata', 'limited type sizes', 'no decorative type drift'],
    layoutBehavior: ['strict grid', 'consistent header/footer zones', 'repeatable card/panel systems', 'precise safe margins'],
    motifBehavior: ['subtle line systems', 'connection fields', 'soft modular geometry', 'controlled pattern use'],
    imageryBehavior: ['premium workplace/human moments or abstract systems', 'no generic stock handshakes', 'no chaotic collage'],
    productionBehavior: ['accessible contrast', 'print-safe margins', 'strong export readiness', 'functional hierarchy first'],
    bestFor: ['enterprise brands', 'B2B events', 'global conferences', 'sales collateral', 'presentations'],
    avoid: ['overly playful layouts', 'random textures', 'decorative clutter', 'consumer gimmicks'],
    assetFamilyUsage: {
      banner: 'Use a large, confident headline field with exact alignment and subtle brand motif depth.',
      signage: 'Prioritize scan speed and accessibility with a disciplined wayfinding band system.',
      presentation: 'Use a repeatable slide-master structure with restrained emphasis moments.',
      badge: 'Use clean credential hierarchy and precise role/access zones.',
      environmental: 'Scale panels and motif systems into space with architectural discipline.',
    },
  },
  'modular-campaign-system': {
    id: 'modular-campaign-system',
    name: 'Modular Campaign System',
    description: 'Campaign kit style built from repeatable modules that adapt across every asset type.',
    fullSetBehavior: 'Every output should look like a sibling in one campaign family: same motif, same modules, same hierarchy logic, different crop and density.',
    visualDNA: ['modular cards', 'repeatable chips', 'branded bands', 'hero-to-detail scaling'],
    colorBehavior: ['one anchor color', 'one support color', 'one accent action color', 'consistent background system'],
    typographyBehavior: ['reusable headline lockup', 'consistent subhead rhythm', 'metadata chip styling'],
    layoutBehavior: ['template grid translated by format', 'consistent corners/radius/spacing', 'repeatable CTA modules'],
    motifBehavior: ['one campaign motif used at multiple scales', 'pattern offset changes only within approved range'],
    imageryBehavior: ['same visual references cropped differently per asset', 'avoid unrelated new image concepts per asset'],
    productionBehavior: ['asset-family density control', 'consistent logo-safe zones', 'same CTA and metadata treatment'],
    bestFor: ['full event kits', 'brand campaigns', 'multi-channel launches', 'conference systems'],
    avoid: ['new art direction per asset', 'different accent colors per format', 'inconsistent logos/footers'],
    assetFamilyUsage: {
      banner: 'Use the fullest expression of the campaign modules and motif.',
      social_post: 'Crop the hero motif into a platform-native hook tile.',
      social_story: 'Translate modules vertically with top/bottom UI-safe zones.',
      signage: 'Simplify modules into high-scan panels.',
      merchandise: 'Distill the motif into one iconic mark.',
    },
  },
  'cinematic-editorial': {
    id: 'cinematic-editorial',
    name: 'Cinematic Editorial',
    description: 'Premium magazine-like pacing with cinematic depth and confident negative space.',
    fullSetBehavior: 'The full set should feel art-directed and spacious, with a strong point of view and refined image/text tension.',
    visualDNA: ['large crops', 'dramatic scale shifts', 'editorial asymmetry', 'controlled atmosphere'],
    colorBehavior: ['deep neutrals', 'selective accent pops', 'tone-rich imagery', 'restrained palettes'],
    typographyBehavior: ['strong display moments', 'editorial subheads', 'generous line spacing', 'fewer text blocks'],
    layoutBehavior: ['asymmetric grids', 'large margins', 'quiet zones', 'premium pacing'],
    motifBehavior: ['minimal motif use', 'large atmospheric fields', 'subtle overlays'],
    imageryBehavior: ['cinematic photo crops', 'depth of field', 'human presence when brand-appropriate'],
    productionBehavior: ['print/editorial polish', 'avoid overlaid text on busy images', 'protect premium spacing'],
    bestFor: ['luxury events', 'keynotes', 'premium editorial campaigns', 'brand storytelling'],
    avoid: ['dense flyer layouts', 'cheap stock imagery', 'too many graphic devices'],
    assetFamilyUsage: {
      banner: 'Use one hero image/field and a confident editorial headline lockup.',
      social_post: 'Use strong crop, short hook, and premium negative space.',
      presentation: 'Use section-divider moments and refined content slides.',
      email_header: 'Keep compact but editorial, not newsletter-generic.',
    },
  },
  'liquid-glass-depth': {
    id: 'liquid-glass-depth',
    name: 'Liquid Glass Depth',
    description: 'Modern translucent surfaces, soft depth, blur, glow, and layered interface-like systems.',
    fullSetBehavior: 'The set should use consistent translucent depth language without becoming unreadable or trendy for its own sake.',
    visualDNA: ['soft glass panels', 'blurred depth', 'luminous edges', 'layered cards'],
    colorBehavior: ['controlled gradients', 'light refraction accents', 'soft neutrals', 'high-contrast type on glass'],
    typographyBehavior: ['clean sans hierarchy', 'minimal type effects', 'strong contrast over translucent fields'],
    layoutBehavior: ['layered panels', 'depth hierarchy', 'floating but aligned components'],
    motifBehavior: ['glow or orb systems', 'subtle noise', 'refraction lines', 'soft motion trails'],
    imageryBehavior: ['abstract light fields or product/tech atmospheres', 'avoid muddy blur behind small text'],
    productionBehavior: ['accessibility-tested glass contrast', 'print-safe gradient handling', 'avoid text on complex blur'],
    bestFor: ['AI products', 'tech events', 'digital brands', 'futuristic campaigns'],
    avoid: ['illegible glass', 'overdone neon', 'random blobs', 'low-contrast type'],
    assetFamilyUsage: {
      presentation: 'Use glass cards only where they improve structure and contrast.',
      social_post: 'Use luminous depth as a hook but keep copy minimal.',
      banner: 'Use one large glass field, not many small translucent elements.',
      environmental: 'Translate glass into light/reflection language on surfaces.',
    },
  },
  'human-moments': {
    id: 'human-moments',
    name: 'Human Moments',
    description: 'People-centered brand expression focused on real, candid, emotionally credible scenes.',
    fullSetBehavior: 'The full set should feel human, lived-in, and authentic while staying systemized and production-ready.',
    visualDNA: ['candid human presence', 'soft environmental context', 'natural gestures', 'warm supporting design system'],
    colorBehavior: ['human-warm neutrals', 'brand accents used as structure', 'avoid oversaturated skin tones'],
    typographyBehavior: ['approachable hierarchy', 'plain-language messaging', 'clear captions/metadata'],
    layoutBehavior: ['human image crop plus clear brand panel', 'not text over faces', 'consistent crop behavior'],
    motifBehavior: ['light motif support', 'do not overpower people imagery'],
    imageryBehavior: ['natural light', 'credible expressions', 'diverse real-world scenarios', 'no staged stock clichés'],
    productionBehavior: ['privacy/sensitivity review for people imagery', 'readability over photos', 'consistent image treatment'],
    bestFor: ['community brands', 'HR/internal events', 'customer stories', 'education', 'nonprofit'],
    avoid: ['fake stock smiles', 'overly posed handshakes', 'text over faces', 'uncanny AI people'],
    assetFamilyUsage: {
      banner: 'Pair a human moment with a clean message field.',
      social_post: 'Use one candid moment and one short hook.',
      presentation: 'Use people imagery as section/story moments, not dense content backgrounds.',
      environmental: 'Use people imagery sparingly and large enough to feel intentional.',
    },
  },
  'abstract-transformation': {
    id: 'abstract-transformation',
    name: 'Abstract Transformation',
    description: 'Brand-owned abstract systems showing motion, connection, continuity, or transformation.',
    fullSetBehavior: 'The brand set should use one abstract visual language that changes scale and crop across assets without changing style.',
    visualDNA: ['flow fields', 'connection paths', 'orbs', 'modular transformation states', 'motion traces'],
    colorBehavior: ['luminous accent gradients', 'deep anchor backgrounds', 'controlled highlight zones'],
    typographyBehavior: ['clean modern type over calm fields', 'minimal decorative type'],
    layoutBehavior: ['abstract field plus structured content zone', 'consistent directionality across set'],
    motifBehavior: ['single abstract system only', 'vary scale/crop/density not concept'],
    imageryBehavior: ['abstract generated visuals and pattern references', 'avoid generic tech globe/circuit clichés'],
    productionBehavior: ['no banding', 'high-res gradients', 'safe contrast for text', 'consistent background extension'],
    bestFor: ['AI/tech brands', 'global systems', 'transformation themes', 'modern enterprise'],
    avoid: ['random particles', 'AI mush', 'unrelated swirls per asset', 'visual noise behind text'],
    assetFamilyUsage: {
      banner: 'Use the abstract system as the main hero visual.',
      social_post: 'Use tight crops of the abstract system as scroll-stopping backgrounds.',
      signage: 'Reduce abstraction to a quiet brand band outside functional text.',
      backdrop: 'Scale the abstract system to photo-friendly environmental rhythm.',
    },
  },
  'premium-minimal': {
    id: 'premium-minimal',
    name: 'Premium Minimal',
    description: 'Quiet, luxury-leaning restraint with elegant spacing and limited graphic moves.',
    fullSetBehavior: 'The full set should feel expensive, restrained, and deliberate, never empty or under-designed.',
    visualDNA: ['large whitespace', 'fine rules', 'subtle material texture', 'single focal move'],
    colorBehavior: ['limited palette', 'soft neutrals', 'single accent', 'low-noise backgrounds'],
    typographyBehavior: ['refined type scale', 'generous spacing', 'precise alignment'],
    layoutBehavior: ['few elements', 'strong margins', 'luxury pacing', 'high restraint'],
    motifBehavior: ['very subtle motif or none', 'use absence as a design tool'],
    imageryBehavior: ['premium close crops', 'material detail', 'clean photography'],
    productionBehavior: ['perfect alignment', 'no filler elements', 'premium print polish'],
    bestFor: ['luxury events', 'executive programs', 'premium brands', 'private gatherings'],
    avoid: ['over-decoration', 'busy gradients', 'many badges/chips', 'cheap minimalism'],
    assetFamilyUsage: {
      banner: 'Use one focal element and exquisite spacing.',
      social_post: 'Use a very short message with large negative space.',
      signage: 'Keep functional clarity with premium restraint.',
      merchandise: 'Use small refined marks and material-aware placement.',
    },
  },
  'hospitality-warmth': {
    id: 'hospitality-warmth',
    name: 'Hospitality Warmth',
    description: 'Inviting, tasteful, service-oriented visual system for hospitality and event experience brands.',
    fullSetBehavior: 'The set should feel welcoming, polished, and operationally clear, with warmth balanced by professionalism.',
    visualDNA: ['warm materials', 'soft lighting', 'approachable spacing', 'guest-experience focus'],
    colorBehavior: ['warm neutrals', 'rich accent tones', 'high readability for menus/signage'],
    typographyBehavior: ['friendly headings', 'clear service information', 'tasteful hierarchy'],
    layoutBehavior: ['welcoming image fields', 'clear service zones', 'menu/signage readability'],
    motifBehavior: ['subtle hospitality cues', 'tasteful patterning', 'avoid themed decoration overload'],
    imageryBehavior: ['real food, venue, detail, and service moments when available'],
    productionBehavior: ['menu readability', 'guest-facing clarity', 'accessible signage'],
    bestFor: ['hospitality', 'weddings', 'food/beverage', 'guest experience', 'venues'],
    avoid: ['overly corporate coldness', 'kitschy decoration', 'illegible script overuse'],
    assetFamilyUsage: {
      signage: 'Warm but extremely clear; guest action stays first.',
      content: 'Readable menu/content structure beats decoration.',
      social_post: 'Use tasteful detail imagery and short welcoming copy.',
      environmental: 'Integrate into venue atmosphere without visual clutter.',
    },
  },
  'sports-energy': {
    id: 'sports-energy',
    name: 'Sports Energy',
    description: 'High-impact, kinetic, celebratory system for teams, tournaments, and fan experiences.',
    fullSetBehavior: 'The full set should feel energetic and unified, with bold scale, movement, and strong event identity.',
    visualDNA: ['kinetic diagonals', 'bold outlines', 'stadium scale', 'action-forward composition'],
    colorBehavior: ['strong team/event colors', 'high contrast', 'limited but intense accent use'],
    typographyBehavior: ['bold condensed or athletic hierarchy when brand-approved', 'large scorecard-like labels'],
    layoutBehavior: ['diagonal movement', 'hero scale', 'badge/emblem zones', 'high-energy crops'],
    motifBehavior: ['motion lines', 'field/court textures', 'scoreboard modules', 'celebration cues'],
    imageryBehavior: ['action, celebration, venue, fan energy, local culture when relevant'],
    productionBehavior: ['distance readability', 'merch-safe marks', 'large-format impact'],
    bestFor: ['sports events', 'fan experiences', 'tournaments', 'team campaigns'],
    avoid: ['corporate blandness', 'tiny type', 'fake grit everywhere', 'unlicensed marks'],
    assetFamilyUsage: {
      banner: 'Use dramatic hero scale and kinetic energy.',
      social_post: 'Use bold short hooks and action framing.',
      merchandise: 'Simplify energy into wearable marks.',
      signage: 'Keep motion styling but protect wayfinding clarity.',
    },
  },
  'luxury-editorial': {
    id: 'luxury-editorial',
    name: 'Luxury Editorial',
    description: 'High-end editorial refinement with premium material cues and controlled drama.',
    fullSetBehavior: 'The full set should feel premium and collected, like a refined brand world rather than a template pack.',
    visualDNA: ['editorial restraint', 'premium materials', 'large type contrast', 'refined monochrome/accent balance'],
    colorBehavior: ['deep neutrals', 'metallic-inspired accents', 'soft contrast', 'limited palette'],
    typographyBehavior: ['elegant hierarchy', 'editorial scale', 'limited weights'],
    layoutBehavior: ['asymmetry with precision', 'spacious fields', 'premium margins'],
    motifBehavior: ['minimal monogram/pattern cues', 'subtle linework'],
    imageryBehavior: ['high-end detail crops, venue/material/atmosphere'],
    productionBehavior: ['print polish', 'fine detail control', 'premium tactile feel'],
    bestFor: ['luxury hospitality', 'executive events', 'private brands', 'premium sponsorship'],
    avoid: ['neon tech effects', 'cheap gold gradients', 'busy sponsor clutter'],
    assetFamilyUsage: {
      banner: 'Use spacious editorial drama and minimal content.',
      badge: 'Use refined credential fields and minimal access color.',
      merchandise: 'Use small premium marks and material-aware placement.',
    },
  },
  'product-tech': {
    id: 'product-tech',
    name: 'Product Tech',
    description: 'Clean, feature-led, productized visual system for software, AI, and digital product brands.',
    fullSetBehavior: 'The set should make the product or platform feel clear, capable, and visually modern without fake UI or unreadable screens.',
    visualDNA: ['product panels', 'interface-inspired cards', 'feature modules', 'clean data/flow cues'],
    colorBehavior: ['brand anchor with bright accent signals', 'clean dark/light modes', 'functional status colors sparingly'],
    typographyBehavior: ['SaaS-like clarity', 'strong labels', 'short feature headlines'],
    layoutBehavior: ['modular feature cards', 'dashboard-like but not fake UI', 'clear content zones'],
    motifBehavior: ['data paths', 'nodes, flows, panels, abstract product states'],
    imageryBehavior: ['product abstractions, UI-safe zones, explainable diagrams'],
    productionBehavior: ['avoid hallucinated UI details', 'keep mock screens symbolic unless real screenshots supplied'],
    bestFor: ['software', 'AI', 'platforms', 'product launches', 'tech conferences'],
    avoid: ['fake detailed UI', 'nonsense charts', 'generic circuits', 'overloaded dashboards'],
    assetFamilyUsage: {
      presentation: 'Use feature-card slide systems and clear product story hierarchy.',
      social_post: 'Use one product benefit and one strong visual module.',
      banner: 'Use product-led modular hero composition.',
    },
  },
  'environmental-immersive': {
    id: 'environmental-immersive',
    name: 'Environmental Immersive',
    description: 'Spatial brand system designed to wrap venues, surfaces, signage, counters, and attendee flow.',
    fullSetBehavior: 'The full set should translate the brand into a physical environment with consistent scale, sightlines, and installation realism.',
    visualDNA: ['architectural scale', 'surface-aware graphics', 'directional rhythm', 'large motif fields'],
    colorBehavior: ['high-impact fields from distance', 'clear contrast in traffic zones', 'light-aware color use'],
    typographyBehavior: ['distance-readable type', 'large labels', 'minimal copy on large surfaces'],
    layoutBehavior: ['sightline logic', 'surface seams', 'installation zones', 'visitor journey consistency'],
    motifBehavior: ['motifs scale across walls, floors, counters, and hanging objects'],
    imageryBehavior: ['venue-realistic context, material integration, physical lighting'],
    productionBehavior: ['bleed, panels, seams, grommets, floor safety, reflections, and perspective accuracy'],
    bestFor: ['large events', 'trade shows', 'venues', 'immersive campaigns', 'sponsor activations'],
    avoid: ['flat poster pasted onto 3D space', 'tiny type in large spaces', 'unrealistic reflections', 'unsafe floor clutter'],
    assetFamilyUsage: {
      environmental: 'Primary system. Scale motif to surfaces and visitor flow.',
      backdrop: 'Make camera-ready, not over-detailed.',
      signage: 'Keep environmental style but functional wayfinding first.',
      banner: 'Treat as part of physical event journey, not standalone ad.',
    },
  },
};

export const getStoredBrandStyleSystemIds = (brandProfileId: string): BrandStyleSystemId[] | null => {
  if (!hasStorage()) return null;
  const stored = safeParse(localStorage.getItem(BRAND_STYLE_SYSTEMS_KEY));
  return stored[brandProfileId] || null;
};

export const setBrandStyleSystemIds = (brandProfileId: string, ids: BrandStyleSystemId[]) => {
  if (!hasStorage()) return ids;
  const stored = safeParse(localStorage.getItem(BRAND_STYLE_SYSTEMS_KEY));
  stored[brandProfileId] = Array.from(new Set(ids)).filter((id) => Boolean(brandStyleSystems[id]));
  localStorage.setItem(BRAND_STYLE_SYSTEMS_KEY, JSON.stringify(stored));
  return stored[brandProfileId];
};

const brandText = (profile?: BrandProfile, assets: BrandGuideAsset[] = []) => [
  profile?.name,
  (profile as any)?.tagline,
  profile?.imageryRules?.styleSummary,
  ...(profile?.imageryRules?.requiredTraits || []),
  ...(profile?.layoutRules?.requiredTraits || []),
  ...assets.flatMap((asset) => [asset.name, asset.notes, ...asset.tags]),
].filter(Boolean).join(' ').toLowerCase();

export const inferBrandStyleSystemIds = (profile?: BrandProfile, assets: BrandGuideAsset[] = []): BrandStyleSystemId[] => {
  const text = brandText(profile, assets);
  const ids: BrandStyleSystemId[] = ['modular-campaign-system'];

  if (/enterprise|global|corporate|b2b|precision|platform|professional|trust/.test(text)) ids.push('enterprise-precision');
  if (/ai|tech|software|platform|product|data|automation|digital/.test(text)) ids.push('product-tech');
  if (/abstract|transformation|orb|motion|gradient|flow|connect|network/.test(text)) ids.push('abstract-transformation');
  if (/glass|liquid|depth|blur|translucent|glow/.test(text)) ids.push('liquid-glass-depth');
  if (/human|people|community|warm|education|care|customer|employee/.test(text)) ids.push('human-moments');
  if (/hospitality|venue|wedding|food|menu|guest|restaurant|catering/.test(text)) ids.push('hospitality-warmth');
  if (/sports|bowl|stadium|team|fan|game|athletic|tournament/.test(text)) ids.push('sports-energy');
  if (/luxury|premium|editorial|private|exclusive|high.?end/.test(text)) ids.push('luxury-editorial');
  if (/minimal|clean|quiet|simple|restraint/.test(text)) ids.push('premium-minimal');
  if (/environment|immersive|booth|trade.?show|venue|activation|counter|kiosk|wall|floor|signage/.test(text)) ids.push('environmental-immersive');
  if (/cinematic|editorial|story|film|photo|campaign/.test(text)) ids.push('cinematic-editorial');

  const unique = Array.from(new Set(ids));
  return unique.slice(0, 4);
};

export const getActiveBrandStyleSystems = (profile?: BrandProfile, assets: BrandGuideAsset[] = []) => {
  const stored = profile ? getStoredBrandStyleSystemIds(profile.id) : null;
  const ids = stored?.length ? stored : inferBrandStyleSystemIds(profile, assets);
  return ids.map((id) => brandStyleSystems[id]).filter(Boolean);
};

const listLines = (items: string[]) => items.map((item) => `  • ${item}`).join('\n');

export const buildBrandStyleSystemPromptBlock = (profile?: BrandProfile, assets: BrandGuideAsset[] = [], family?: MasterPromptFamily) => {
  const systems = getActiveBrandStyleSystems(profile, assets);
  if (!systems.length) return '';

  return `
=== FULL BRAND SET STYLE SYSTEMS ===
These style systems define how the entire brand set should behave across banners, social, signage, badges, lanyards, decks, environmental graphics, merch, apparel, and digital assets. They are not one-off styles; they must translate consistently across the complete asset family.

ACTIVE STYLE SYSTEMS:
${systems.map((system) => `
${system.name} (${system.id})
Purpose: ${system.description}
Full-set behavior: ${system.fullSetBehavior}
Visual DNA:
${listLines(system.visualDNA)}
Color behavior:
${listLines(system.colorBehavior)}
Typography behavior:
${listLines(system.typographyBehavior)}
Layout behavior:
${listLines(system.layoutBehavior)}
Motif behavior:
${listLines(system.motifBehavior)}
Imagery behavior:
${listLines(system.imageryBehavior)}
Production behavior:
${listLines(system.productionBehavior)}
Avoid:
${listLines(system.avoid)}
${family && system.assetFamilyUsage[family] ? `Asset-family translation for ${family}: ${system.assetFamilyUsage[family]}` : ''}
`).join('\n')}

STYLE SYSTEM RULES:
  • Use these systems as the creative direction layer for the full brand set.
  • Do not mix unrelated style languages in the same kit.
  • Vary density, crop, scale, and format-specific layout — not the core art direction.
  • If multiple style systems are active, blend them intentionally: primary system controls structure, secondary system controls atmosphere, tertiary system controls accent/detail behavior.
  • Preserve brand consistency across every generated asset type.
=== END FULL BRAND SET STYLE SYSTEMS ===
`;
};
