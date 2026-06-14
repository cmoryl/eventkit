import { AssetType } from '@/types';
import type { ColorInfo, EventDetails } from '@/types';
import type { BrandProfile } from '@/types/brandProfile';
import type { BrandContext } from '@/types/brand.types';
import { getAssetConfig } from '@/config/assetConfig';
import { getLogoVisibilityDecision } from './logoVisibilityService';

export type MasterPromptFamily =
  | 'banner'
  | 'social_post'
  | 'social_story'
  | 'presentation'
  | 'signage'
  | 'badge'
  | 'lanyard'
  | 'merchandise'
  | 'apparel'
  | 'backdrop'
  | 'qr_wifi_functional'
  | 'email_header'
  | 'environmental'
  | 'abstract_pattern'
  | 'content'
  | 'generic';

export type RenderMode = 'ai-first' | 'hybrid' | 'deterministic';
export type BrandExpressionMode = 'corporate' | 'editorial' | 'expressive' | 'utility' | 'community';

type FamilyTemplate = {
  family: MasterPromptFamily;
  renderMode: RenderMode;
  intent: string;
  hierarchy: string[];
  layout: string[];
  imagery: string[];
  motif: string[];
  logo: string[];
  production: string[];
  avoid: string[];
};

export interface MasterfulPromptInput {
  assetType: AssetType | string;
  eventDetails: EventDetails;
  brandProfile?: BrandProfile | null;
  brandContext?: BrandContext | null;
  colorPalette?: ColorInfo[] | string[];
  styleDescription?: string;
  hasExactLogoSource?: boolean;
  hasVisualReferences?: boolean;
  hasPatternReferences?: boolean;
}

const getAssetTypeString = (assetType: AssetType | string) => String(assetType);

export const getMasterPromptFamily = (assetType: AssetType | string): MasterPromptFamily => {
  const t = getAssetTypeString(assetType);

  if ([AssetType.Banner, AssetType.EmailHeader].includes(t as AssetType)) return t === AssetType.EmailHeader ? 'email_header' : 'banner';
  if ([AssetType.SocialPost, AssetType.LinkedInBanner, AssetType.TwitterHeader, AssetType.YouTubeThumbnail, AssetType.PodcastCover].includes(t as AssetType)) return 'social_post';
  if ([AssetType.SocialStory, AssetType.EventAppSplash].includes(t as AssetType)) return 'social_story';
  if ([AssetType.PresentationSlide, AssetType.Presentation, AssetType.WebinarSlide, AssetType.SpeakerIntroCard].includes(t as AssetType)) return 'presentation';
  if ([
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
    AssetType.ShuttleSignage,
    AssetType.AccessibilitySignage,
    AssetType.VIPLoungeSignage,
    AssetType.GreenRoomSignage,
    AssetType.LoadingDockSignage,
    AssetType.AFrameSign,
    AssetType.BreakoutSessionSign,
  ].includes(t as AssetType)) return 'signage';
  if ([
    AssetType.NameTag,
    AssetType.NameTagBack,
    AssetType.VIPBadge,
    AssetType.MediaCredential,
    AssetType.SecurityBadge,
    AssetType.BackstagePass,
    AssetType.ParkingPass,
    AssetType.TicketDesign,
    AssetType.WristbandDesign,
  ].includes(t as AssetType)) return 'badge';
  if (t === AssetType.Lanyard) return 'lanyard';
  if ([AssetType.Tshirt, AssetType.TshirtBack, AssetType.TshirtSleeve, AssetType.VolunteerVest].includes(t as AssetType)) return 'apparel';
  if ([AssetType.SwagBag, AssetType.StickerSheet, AssetType.Hat, AssetType.WaterBottle, AssetType.MatchbookDesign, AssetType.GiftBoxPackaging, AssetType.CoasterDesign, AssetType.NapkinDesign, AssetType.CocktailNapkin].includes(t as AssetType)) return 'merchandise';
  if ([AssetType.BackWall, AssetType.MainStageBackdrop, AssetType.RegistrationBackWall, AssetType.StepAndRepeat].includes(t as AssetType)) return 'backdrop';
  if ([AssetType.QRCode, AssetType.WifiSign, AssetType.FeedbackKiosk].includes(t as AssetType)) return 'qr_wifi_functional';
  if ([AssetType.RegistrationCounter, AssetType.WelcomeCounter, AssetType.TechnologyCounter, AssetType.Kiosk, AssetType.GlassDoor, AssetType.GlassRotatingDoor, AssetType.GlassDoubleDoor, AssetType.WindowCling, AssetType.FloorDecal, AssetType.ElevatorWrap, AssetType.EscalatorGraphics, AssetType.ColumnWrap, AssetType.CeilingHanger].includes(t as AssetType)) return 'environmental';
  if ([AssetType.SeamlessPattern, AssetType.AnimatedLogo, AssetType.DigitalSignageLoop, AssetType.CountdownTimer].includes(t as AssetType)) return 'abstract_pattern';
  if ([AssetType.MarketingCopy, AssetType.StyleGuide, AssetType.RunOfShow, AssetType.AgendaHighlights, AssetType.ProgramBooklet, AssetType.MediaKit, AssetType.SponsorPackage, AssetType.PressRelease].includes(t as AssetType)) return 'content';

  return 'generic';
};

const familyTemplates: Record<MasterPromptFamily, FamilyTemplate> = {
  banner: {
    family: 'banner',
    renderMode: 'hybrid',
    intent: 'High-visibility campaign or event banner that reads instantly from distance while feeling like part of a premium brand system.',
    hierarchy: ['Primary headline first', 'Supporting proof/date/location second', 'CTA or event metadata third', 'Logo remains secondary and never competes with message'],
    layout: ['One dominant focal zone', 'Large protected negative space field', 'Broad safe margins and bleed awareness', 'No dense paragraph blocks or equal-weight elements'],
    imagery: ['Use a hero-scale brand visual, atmospheric photography, or hybrid human/abstract field', 'Avoid literal clip-art event symbols'],
    motif: ['Repeat the same campaign motif used across the kit', 'Use background rhythm and crop variations, not unrelated decorations'],
    logo: ['Reserve a blank logo-safe zone for deterministic overlay', 'Keep logo modest and inside live area'],
    production: ['Respect trim, bleed, grommet/seam awareness, and long-distance readability', 'High contrast behind copy zones'],
    avoid: ['Poster clutter', 'tiny sponsor-like text', 'fake logo marks', 'busy texture behind headline'],
  },
  social_post: {
    family: 'social_post',
    renderMode: 'ai-first',
    intent: 'Scroll-stopping platform-native creative that communicates one idea in under two seconds.',
    hierarchy: ['Hook first', 'Support line second', 'CTA or proof point optional', 'Logo small or omitted depending on policy'],
    layout: ['One visual subject or compositional gesture', 'Thumbnail-readable crop', 'Strong center-safe zone', 'Do not make all layers equal weight'],
    imagery: ['Use expressive campaign imagery or approved human/abstract reference style', 'Make it feel native to social, not a mini flyer'],
    motif: ['Use light motif repetition to connect to other assets', 'Prefer one bold gesture over many small icons'],
    logo: ['If visible, reserve a small clean corner zone', 'Never watermark Instagram-style assets unless platform/brand policy requires it'],
    production: ['Square/feed crop tolerance', 'Avoid tiny text', 'Maintain central readability'],
    avoid: ['Ad collage look', 'stock-photo clichés', 'over-watermarking', 'illegible microcopy'],
  },
  social_story: {
    family: 'social_story',
    renderMode: 'ai-first',
    intent: 'Vertical story/reel frame with motion-ready rhythm, clear hook, and protected UI-safe zones.',
    hierarchy: ['Hook first', 'Support/action second', 'CTA third', 'Logo optional and small'],
    layout: ['Reserve top and bottom UI-safe bands', 'Central visual action stays clean', 'Vertical rhythm should feel intentional'],
    imagery: ['Use vertical crops, soft depth, and strong negative space', 'Allow motion-like blur only when controlled'],
    motif: ['Use vertical bands, arcs, repeated forms, or atmospheric depth to imply motion'],
    logo: ['If visible, place inside platform-safe margin away from hook/CTA'],
    production: ['1080x1920 story logic', 'No critical content near UI chrome', 'Readable on phone preview'],
    avoid: ['Crowded top/bottom zones', 'tiny CTA', 'fake UI buttons', 'busy full-frame text'],
  },
  presentation: {
    family: 'presentation',
    renderMode: 'hybrid',
    intent: 'Presentation slide composition built for one idea only, with deterministic text/logo layers when possible.',
    hierarchy: ['Title first', 'One key takeaway second', 'Supporting bullets/data third', 'Media or visual field supports the idea'],
    layout: ['Use a clear 16:9 grid', 'Create clean title/body/media zones', 'Slides should not behave like posters', 'Light slides carry detail; dark slides carry emphasis'],
    imagery: ['Use abstract backgrounds, controlled photo crops, or data-friendly visual zones', 'Keep content areas quiet'],
    motif: ['Use consistent deck motif and section pacing', 'Dark emphasis slides should be intentional, not alternating decoration'],
    logo: ['Use small consistent footer/corner logo-safe zone for overlay'],
    production: ['Room-display legibility', 'No dense text on dark slides', 'Do not stretch slide aspect ratio'],
    avoid: ['Poster density', 'random dark/light switching', 'decorative clutter behind bullets', 'tiny chart labels'],
  },
  signage: {
    family: 'signage',
    renderMode: 'hybrid',
    intent: 'Functional wayfinding or event sign that prioritizes fast scan, accessibility, and production clarity.',
    hierarchy: ['Action/room/direction first', 'Secondary details second', 'Event brand/logo third'],
    layout: ['Large type zones', 'High contrast', 'Strong arrow/icon placement', 'Minimal ornament around functional information'],
    imagery: ['Use background brand fields sparingly', 'Avoid photography behind critical information'],
    motif: ['Use a consistent wayfinding band or corner motif across all signs'],
    logo: ['Use footer/header logo-safe zone, subordinate to directional message'],
    production: ['Safe area, bleed, distance readability, and high-contrast information zones', 'Functional text zones should stay clean for deterministic overlays'],
    avoid: ['Decorative arrows', 'logo near directional arrow', 'busy backgrounds', 'low contrast text'],
  },
  badge: {
    family: 'badge',
    renderMode: 'hybrid',
    intent: 'Credential/badge structure with dominant attendee identity and deterministic data/QR areas.',
    hierarchy: ['Attendee name first', 'Role/company/access second', 'Event identity third', 'QR/barcode field isolated'],
    layout: ['Top identity band', 'Large central name axis', 'Lower metadata and scan zone', 'Hardware/slot clearance protected'],
    imagery: ['Prefer abstract or minimal brand field over busy imagery'],
    motif: ['Use role/access color bands and repeatable credential system language'],
    logo: ['Logo in top or bottom brand zone only, never crowding attendee name'],
    production: ['Keep all data zones deterministic and legible', 'Protect lanyard slot/hole-punch clearance', 'Keep QR field clean'],
    avoid: ['Tiny names', 'dense background under data', 'decorative code field', 'crowded logo/name area'],
  },
  lanyard: {
    family: 'lanyard',
    renderMode: 'deterministic',
    intent: 'Wearable repeat system with clean repeat rhythm and strap-safe spacing.',
    hierarchy: ['Repeated mark/wordmark first', 'Event tag or year optional', 'No detailed information'],
    layout: ['Horizontal repeat cadence', 'Hardware and clip zones protected', 'Consistent rotation/orientation unless template calls for alternating repeat'],
    imagery: ['Avoid photo imagery; use flat motif, repeat pattern, or exact marks'],
    motif: ['Use controlled repeat rhythm and color banding'],
    logo: ['Exact logo only; repeated at controlled intervals and scale'],
    production: ['Readable at strap width', 'No small details that fill in during print'],
    avoid: ['Dense text', 'random pattern seams', 'thin hairline detail', 'fake recreated logo'],
  },
  merchandise: {
    family: 'merchandise',
    renderMode: 'hybrid',
    intent: 'Product-aware merchandise graphic that respects substrate, print area, and brand expression.',
    hierarchy: ['One main mark/message', 'One supporting motif', 'Logo optional unless product is explicitly logo-led'],
    layout: ['Design for the physical product area', 'Leave breathing room around print field', 'Use simplified shapes for production'],
    imagery: ['Use product-realistic art direction only if scene/mockup is requested'],
    motif: ['Adapt campaign motif into a simplified merch system'],
    logo: ['Use exact logo overlay only where visible and product-appropriate'],
    production: ['Avoid tiny type and low-resolution detail', 'Respect product-safe print boundaries'],
    avoid: ['All-over clutter on non-AOP products', 'illegible tiny lines', 'unprintable gradients if production method is unknown'],
  },
  apparel: {
    family: 'apparel',
    renderMode: 'hybrid',
    intent: 'Wearable apparel design with believable placement, product-safe print zones, and simplified production-ready artwork.',
    hierarchy: ['Main artwork or message first', 'Support logo second', 'Sleeve/back details only when requested'],
    layout: ['Use accepted chest/back/sleeve placement logic', 'Do not float artwork without garment relationship', 'Keep design inside print-safe area'],
    imagery: ['Use simplified graphic systems or product-realistic mockup when requested'],
    motif: ['Translate campaign motif into a wearable mark, not a poster pasted on a shirt'],
    logo: ['Prefer left chest, sleeve, inside/outside label, or small support placement when visible'],
    production: ['Respect garment seams, folds, and decoration method limits', 'Avoid ultra-fine detail and tiny type'],
    avoid: ['Poster-on-shirt look', 'warped print area', 'art crossing seams by accident', 'fake embroidered gradients'],
  },
  backdrop: {
    family: 'backdrop',
    renderMode: 'hybrid',
    intent: 'Large environmental/stage backdrop with strong rhythm, distance readability, and photo-friendly brand recognition.',
    hierarchy: ['Lead event/brand field first', 'Sponsor/repeat logic second when applicable', 'Decorative atmosphere third'],
    layout: ['Scale for stage/camera distance', 'Avoid small details', 'Use repeat cadence or hero field intentionally'],
    imagery: ['Use abstract hero systems, large light forms, or step-and-repeat structure'],
    motif: ['Use repeated vertical rhythm, large forms, or sponsor tile system consistently'],
    logo: ['Use exact logos only; never approximate repeat marks'],
    production: ['Large-format safe margins, bleed, panel seams, and camera/photo readability'],
    avoid: ['Tiny sponsor logos', 'uneven repeat cadence', 'busy wall texture', 'distorted marks'],
  },
  qr_wifi_functional: {
    family: 'qr_wifi_functional',
    renderMode: 'deterministic',
    intent: 'Functional QR/WiFi/sign-in asset where scanability and exact information beat decorative design.',
    hierarchy: ['Action label first', 'QR or credential field second', 'Fallback/help line third', 'Brand mark small and outside code zone'],
    layout: ['Large clean code field', 'No pattern in quiet zone', 'Simple high-contrast information hierarchy'],
    imagery: ['Use plain brand fields only; no photography behind functional data'],
    motif: ['Motif can sit outside the QR/credential field only'],
    logo: ['Logo never overlaps QR code unless scan-tested by deterministic QR renderer'],
    production: ['Preserve four-module quiet zone around QR', 'Maximize contrast', 'Keep credentials as real text when possible'],
    avoid: ['Decorative QR field', 'patterns under code', 'fake QR codes', 'low contrast credentials'],
  },
  email_header: {
    family: 'email_header',
    renderMode: 'hybrid',
    intent: 'Email header that is compact, mobile-safe, and structured around a clear campaign message.',
    hierarchy: ['Campaign label or brand cue first', 'Headline second', 'CTA optional and tertiary'],
    layout: ['600px container discipline', 'Avoid edge crowding', 'Create a quiet transition into email body content'],
    imagery: ['Use compact abstract field or controlled photo crop', 'Do not rely on tiny type baked into image'],
    motif: ['Use subtle brand motif to tie email to campaign system'],
    logo: ['Logo in header-safe zone with generous clear space'],
    production: ['Mobile-friendly crop and image weight awareness', 'Legible at reduced email preview size'],
    avoid: ['Overly tall hero', 'tiny text', 'busy photo behind CTA', 'hard-to-crop composition'],
  },
  environmental: {
    family: 'environmental',
    renderMode: 'hybrid',
    intent: 'Environmental graphic that integrates with real space, surface, lighting, and visitor flow.',
    hierarchy: ['Brand experience first', 'Wayfinding/action second when relevant', 'Decorative atmosphere third'],
    layout: ['Respect surface shape, seams, sightlines, and installation context', 'Leave functional zones clear'],
    imagery: ['Use spatially believable lighting, reflections, and material behavior when venue reference exists'],
    motif: ['Scale motif to architecture rather than placing a flat poster on space'],
    logo: ['Logo must be exact and placed on a clean physical-safe zone'],
    production: ['Perspective, substrate, wrap seams, safety edges, and viewing distance matter'],
    avoid: ['Floating graphics', 'incorrect perspective', 'overcrowded surfaces', 'fake logo distortion'],
  },
  abstract_pattern: {
    family: 'abstract_pattern',
    renderMode: 'ai-first',
    intent: 'Reusable abstract brand visual or pattern that extends the campaign system without becoming random decoration.',
    hierarchy: ['Visual rhythm first', 'Brand color behavior second', 'No functional copy unless requested'],
    layout: ['Balanced repeat or hero-scale crop', 'Avoid seam artifacts if pattern/tile is requested'],
    imagery: ['Use approved abstract form language, gradient behavior, depth, rhythm, and motion cues'],
    motif: ['One repeatable motif family only; avoid mixing unrelated visual languages'],
    logo: ['Do not place logos unless explicitly required; patterns should carry brand through motif/color'],
    production: ['Tile/repeat continuity, no banding, scalable visual texture'],
    avoid: ['Generic SaaS gradient', 'random particles', 'wireframe globes', 'cheap neon streaks'],
  },
  content: {
    family: 'content',
    renderMode: 'deterministic',
    intent: 'Content-first asset where clarity, structure, and brand voice matter more than rasterized art.',
    hierarchy: ['Message accuracy first', 'Scannable structure second', 'Brand tone third'],
    layout: ['Use sections, headings, and concise copy blocks', 'Avoid inventing operational facts'],
    imagery: ['Visuals should support content, not carry it'],
    motif: ['Use light motif references for section rhythm'],
    logo: ['Logo rules apply only in rendered/exported layout'],
    production: ['Human review recommended for schedules, contracts, budgets, legal, safety, and vendor data'],
    avoid: ['Invented claims', 'fake contact details', 'unverified schedules', 'overly promotional filler'],
  },
  generic: {
    family: 'generic',
    renderMode: 'hybrid',
    intent: 'Production-ready branded asset that follows the active brand system and campaign visual language.',
    hierarchy: ['One primary message', 'One secondary support message', 'Tertiary details only if needed'],
    layout: ['Clear grid', 'Protected safe areas', 'Strong negative space', 'No equal-weight clutter'],
    imagery: ['Use approved brand references and current campaign motif'],
    motif: ['Carry forward the cross-asset motif system'],
    logo: ['Reserve logo-safe zone if logo is visible'],
    production: ['Respect asset dimensions, safe area, and readability'],
    avoid: ['Generic template look', 'random decorative elements', 'fake logos', 'unreadable text'],
  },
};

const brandModeGuidance: Record<BrandExpressionMode, string[]> = {
  corporate: ['Precise, trusted, enterprise-ready', 'Restrained density and strong alignment', 'Polished but not sterile'],
  editorial: ['Premium, spacious, thought-leadership tone', 'Asymmetric composition with large margins', 'Cinematic but controlled'],
  expressive: ['Bold, energetic, campaign-forward', 'Larger scale shifts and stronger focal contrast', 'Higher motif/pattern presence while staying controlled'],
  utility: ['Plain, direct, unambiguous', 'Maximum clarity with the least decoration', 'Functional information must beat atmosphere'],
  community: ['Warm, human, inclusive', 'Softer grids and approachable pacing', 'People-forward imagery when appropriate'],
};

export const inferBrandExpressionMode = (assetType: AssetType | string, brandContext?: BrandContext | null): BrandExpressionMode => {
  const family = getMasterPromptFamily(assetType);
  const contextTone = [brandContext?.imageryStyle, brandContext?.writingStyle, ...(brandContext?.toneKeywords || [])].filter(Boolean).join(' ').toLowerCase();

  if (family === 'signage' || family === 'badge' || family === 'qr_wifi_functional' || family === 'content') return 'utility';
  if (family === 'social_post' || family === 'social_story' || family === 'abstract_pattern') return 'expressive';
  if (family === 'presentation' || family === 'email_header') return 'corporate';
  if (contextTone.includes('warm') || contextTone.includes('human') || contextTone.includes('community')) return 'community';
  if (contextTone.includes('editorial') || contextTone.includes('premium')) return 'editorial';
  return 'corporate';
};

const formatColorTokenBlock = (colorPalette?: ColorInfo[] | string[]) => {
  const colors = (colorPalette || []).map((color) => typeof color === 'string' ? color : color.hex).filter(Boolean);
  if (!colors.length) return 'Use the active brand color tokens. Assign colors by role: background, foreground, accent, CTA, support, and neutral.';
  return [
    'Use colors by role, not randomly.',
    `Primary/available tokens: ${colors.slice(0, 8).join(', ')}`,
    'Establish one dominant brand color, one supporting color, one accent, and neutral breathing room.',
    'Use white or high-contrast text over saturated brand fields; avoid low-contrast color-on-color combinations.',
  ].join(' ');
};

const formatBrandIdentityBlock = (profile?: BrandProfile | null, brandContext?: BrandContext | null) => {
  const name = profile?.name || brandContext?.brandName || 'the active brand';
  const font = (profile?.typography as any)?.primaryFont || (brandContext as any)?.typography?.primary || 'the approved brand font';
  const tagline = (profile as any)?.tagline || brandContext?.tagline;
  return [
    `Brand: ${name}.`,
    tagline ? `Brand/tagline cue: ${tagline}.` : '',
    `Typography must use ${font} behavior: clear hierarchy, confident headings, readable body zones, and no decorative font substitution.`,
    'Design must feel brand-owned, not a generic stock template or generic SaaS layout.',
  ].filter(Boolean).join(' ');
};

const formatCanvasSpec = (assetType: AssetType | string) => {
  const config = getAssetConfig(assetType as AssetType);
  if (!config) return 'Use the requested canvas/aspect ratio and protect live/safe areas.';
  if (config.printSpec) {
    const s = config.printSpec;
    return `${config.title}: ${s.widthInches}" × ${s.heightInches}" @ ${s.dpi}dpi, ${s.colorMode}, ${s.bleedInches}" bleed, ${s.fileFormat} target. ${s.notes || ''}`.trim();
  }
  if (config.pixelWidth && config.pixelHeight) return `${config.title}: ${config.pixelWidth} × ${config.pixelHeight}px, ${config.aspectRatio || 'fixed canvas'}.`;
  return `${config.title}: ${config.aspectRatio || 'requested canvas'}; ${config.description}`;
};

export const buildMasterfulPromptTemplate = (input: MasterfulPromptInput) => {
  const family = getMasterPromptFamily(input.assetType);
  const template = familyTemplates[family];
  const brandMode = inferBrandExpressionMode(input.assetType, input.brandContext);
  const brandModeLines = brandModeGuidance[brandMode];
  const logoDecision = getLogoVisibilityDecision(input.assetType as AssetType, 'auto', Boolean(input.hasExactLogoSource));

  return {
    family,
    renderMode: template.renderMode,
    brandMode,
    promptBlock: [
      '<master_template_system version="1.0" quality="agency-grade">',
      `  <objective>Create one finished, production-ready ${family} asset for ${input.eventDetails.name || 'the event'}. Deliver a resolved design, not a moodboard, rough concept, or generic placeholder.</objective>`,
      `  <render_mode>${template.renderMode}</render_mode>`,
      `  <brand_identity>${formatBrandIdentityBlock(input.brandProfile, input.brandContext)}</brand_identity>`,
      `  <brand_expression mode="${brandMode}">${brandModeLines.join(' ')}</brand_expression>`,
      `  <design_tokens>${formatColorTokenBlock(input.colorPalette)}</design_tokens>`,
      `  <canvas>${formatCanvasSpec(input.assetType)}</canvas>`,
      `  <asset_intent>${template.intent}</asset_intent>`,
      `  <hierarchy>${template.hierarchy.map((x) => `• ${x}`).join(' ')}</hierarchy>`,
      `  <layout_intelligence>${template.layout.map((x) => `• ${x}`).join(' ')}</layout_intelligence>`,
      `  <imagery_direction>${template.imagery.map((x) => `• ${x}`).join(' ')} ${input.hasVisualReferences ? 'Use attached visual references as style/source guidance, not as random collage elements.' : ''}</imagery_direction>`,
      `  <motif_system>${template.motif.map((x) => `• ${x}`).join(' ')} ${input.hasPatternReferences ? 'Use attached pattern references as the recurring campaign motif system.' : ''}</motif_system>`,
      `  <logo_policy visibility="${logoDecision.requirement}">${template.logo.map((x) => `• ${x}`).join(' ')} Never redraw, trace, recolor, approximate, crop, distort, or invent the logo. If visible, leave an empty logo-safe zone for deterministic overlay.</logo_policy>`,
      `  <production_checks>${template.production.map((x) => `• ${x}`).join(' ')}</production_checks>`,
      `  <negative_prompt>${template.avoid.map((x) => `• ${x}`).join(' ')} • malformed text • melted typography • fake UI • fake logos • low-resolution artifacts • unrelated stock imagery • cluttered equal-weight layout</negative_prompt>`,
      '  <qa_assertions>Clear primary/secondary/tertiary hierarchy. Brand-owned color behavior. Safe zones protected. Text areas readable. Logo area blank if overlay is required. No invented claims or extra sponsors. Output must look like a senior creative director approved it.</qa_assertions>',
      '</master_template_system>',
    ].join('\n'),
  };
};

export const buildMasterfulPromptTemplateBlock = (input: MasterfulPromptInput): string => buildMasterfulPromptTemplate(input).promptBlock;
