import type { BrandProfile } from '@/types/brandProfile';

const commonAccessibility = {
  minimumContrastRatio: 4.5,
  largeTextContrastRatio: 3,
  notes: ['Run contrast checks before export.', 'Avoid placing text over busy imagery without an accessible overlay.']
};

export const modernSaaS: BrandProfile = {
  id: 'modern-saas',
  name: 'Modern SaaS',
  description: 'Clean product-led technology brand preset for dashboards, launch campaigns, and software marketing.',
  defaultMode: 'guided',
  colors: [
    { name: 'Ink', hex: '#111827', role: 'primary' },
    { name: 'Blue', hex: '#2563EB', role: 'primary' },
    { name: 'Cyan', hex: '#06B6D4', role: 'accent' },
    { name: 'Soft Gray', hex: '#F3F4F6', role: 'neutral' }
  ],
  gradients: [{ name: 'Product Glow', stops: ['#111827', '#2563EB', '#06B6D4'], usage: 'Hero and feature emphasis.' }],
  typography: [
    { role: 'headline', fontFamily: 'Inter', weight: '700' },
    { role: 'body', fontFamily: 'Inter', weight: '400' },
    { role: 'fallback', fontFamily: 'system-ui', weight: '400' }
  ],
  logoRules: [{ name: 'Preserve logo proportions', description: 'Do not stretch, recolor, or apply effects.', required: true }],
  imageryRules: { styleSummary: 'Clean product UI, calm humans, simple gradients.', requiredTraits: ['clear UI', 'premium simplicity', 'focused composition'], avoid: ['random neon', 'busy stock imagery'] },
  layoutRules: { styleSummary: 'Whitespace-led modular layouts.', requiredTraits: ['clear hierarchy', 'cards', 'product focus'], avoid: ['visual clutter', 'too many gradients'] },
  accessibilityRules: commonAccessibility,
  exportRules: { socialDimensions: { socialPost: '1200x628', square: '1080x1080', story: '1080x1920' } },
  restrictedUses: ['Avoid generic AI stock imagery.', 'Do not overuse gradient backgrounds.']
};

export const enterpriseCorporate: BrandProfile = {
  id: 'enterprise-corporate',
  name: 'Enterprise Corporate',
  description: 'Structured, trustworthy corporate preset for professional services, B2B, consulting, and client communications.',
  defaultMode: 'guided',
  colors: [
    { name: 'Navy', hex: '#0F2742', role: 'primary' },
    { name: 'Blue', hex: '#1D4ED8', role: 'secondary' },
    { name: 'Slate', hex: '#64748B', role: 'neutral' },
    { name: 'Mist', hex: '#F8FAFC', role: 'background' }
  ],
  gradients: [{ name: 'Executive Blue', stops: ['#0F2742', '#1D4ED8'], usage: 'Executive headers and section dividers.' }],
  typography: [
    { role: 'headline', fontFamily: 'Inter', weight: '700' },
    { role: 'body', fontFamily: 'Inter', weight: '400' },
    { role: 'fallback', fontFamily: 'Arial', weight: '400' }
  ],
  logoRules: [{ name: 'Respect corporate mark', description: 'Use clear space and approved colorways only.', required: true }],
  imageryRules: { styleSummary: 'Authentic professional environments with calm confidence.', requiredTraits: ['human', 'trustworthy', 'clear space'], avoid: ['handshake clichés', 'forced smiles'] },
  layoutRules: { styleSummary: 'Formal grid, strong hierarchy, restrained effects.', requiredTraits: ['grid alignment', 'readability', 'executive polish'], avoid: ['playful UI', 'over-decoration'] },
  accessibilityRules: commonAccessibility,
  exportRules: { deckRules: ['Use clear title slides.', 'Keep dense data on light slides.'] },
  restrictedUses: ['Avoid cartoon styling.', 'Avoid low-contrast text.']
};

export const hospitality: BrandProfile = {
  id: 'hospitality',
  name: 'Hospitality',
  description: 'Warm, refined preset for venues, restaurants, hotels, catering, and event hospitality.',
  defaultMode: 'guided',
  colors: [
    { name: 'Espresso', hex: '#2A1E1A', role: 'primary' },
    { name: 'Cream', hex: '#F4EFE6', role: 'background' },
    { name: 'Gold', hex: '#C7A76C', role: 'accent' },
    { name: 'Sage', hex: '#8FA58A', role: 'secondary' }
  ],
  gradients: [{ name: 'Warm Service', stops: ['#2A1E1A', '#C7A76C', '#F4EFE6'], usage: 'Premium invitations and venue visuals.' }],
  typography: [
    { role: 'headline', fontFamily: 'Georgia', weight: '700' },
    { role: 'body', fontFamily: 'Inter', weight: '400' },
    { role: 'fallback', fontFamily: 'serif', weight: '400' }
  ],
  logoRules: [{ name: 'Keep mark refined', description: 'Avoid heavy effects and preserve elegance.', required: true }],
  imageryRules: { styleSummary: 'Warm environments, real details, premium service moments.', requiredTraits: ['warmth', 'texture', 'atmosphere'], avoid: ['cold corporate lighting', 'generic banquet stock'] },
  layoutRules: { styleSummary: 'Editorial, warm, refined spacing.', requiredTraits: ['texture', 'generous margins', 'premium detail'], avoid: ['overly tech UI'] },
  accessibilityRules: commonAccessibility,
  exportRules: { printRules: ['Check trim and bleed for menus, signage, and invitations.'] },
  restrictedUses: ['Avoid cheap gold effects.', 'Avoid over-busy backgrounds behind text.']
};

export const sportsEvent: BrandProfile = {
  id: 'sports-event',
  name: 'Sports Event',
  description: 'High-energy preset for tournaments, fan activations, championship moments, watch parties, and athletic event systems.',
  defaultMode: 'guided',
  colors: [
    { name: 'Stadium Navy', hex: '#07111F', role: 'primary' },
    { name: 'Victory Blue', hex: '#0066FF', role: 'secondary' },
    { name: 'Energy Red', hex: '#F43F5E', role: 'accent' },
    { name: 'Field Green', hex: '#16A34A', role: 'semantic' },
    { name: 'Bright White', hex: '#F8FAFC', role: 'neutral' }
  ],
  gradients: [{ name: 'Stadium Lights', stops: ['#07111F', '#0066FF', '#F43F5E'], usage: 'Hero energy, social hype, and event signage.' }],
  typography: [
    { role: 'headline', fontFamily: 'Inter', weight: '800' },
    { role: 'body', fontFamily: 'Inter', weight: '500' },
    { role: 'fallback', fontFamily: 'Arial', weight: '700' }
  ],
  logoRules: [{ name: 'Protect event/team marks', description: 'Do not distort crests, trophies, sponsor marks, or team/event lockups.', required: true }],
  imageryRules: { styleSummary: 'Cinematic action, crowd atmosphere, bold lighting, local venue energy.', requiredTraits: ['motion', 'celebration', 'high contrast', 'crowd energy'], avoid: ['generic gym stock', 'muddy low-light images', 'fake sponsor logos'] },
  layoutRules: { styleSummary: 'Bold type, large numerals, strong contrast, sponsor-safe zones.', requiredTraits: ['big hero moments', 'clear score/event hierarchy', 'social-safe crop zones'], avoid: ['thin typography', 'overcrowded sponsor placement'] },
  accessibilityRules: commonAccessibility,
  exportRules: { socialDimensions: { square: '1080x1080', story: '1080x1920', horizontal: '1200x675' }, printRules: ['Check sponsor logo safe zones.', 'Maintain legibility at stadium/signage distance.'] },
  restrictedUses: ['Do not create unlicensed team logos.', 'Do not crowd sponsor marks into unsafe areas.']
};

export const luxuryEvent: BrandProfile = {
  id: 'luxury-event',
  name: 'Luxury Event',
  description: 'Premium editorial preset for galas, fundraisers, launches, destination events, and high-touch experiences.',
  defaultMode: 'guided',
  colors: [
    { name: 'Obsidian', hex: '#11100E', role: 'primary' },
    { name: 'Champagne', hex: '#E8D8B8', role: 'accent' },
    { name: 'Ivory', hex: '#F7F2E8', role: 'background' },
    { name: 'Warm Taupe', hex: '#8A7968', role: 'neutral' }
  ],
  gradients: [{ name: 'Champagne Light', stops: ['#11100E', '#8A7968', '#E8D8B8'], usage: 'Invitations, hero imagery, gala visuals.' }],
  typography: [
    { role: 'headline', fontFamily: 'Georgia', weight: '700' },
    { role: 'body', fontFamily: 'Inter', weight: '400' },
    { role: 'fallback', fontFamily: 'serif', weight: '400' }
  ],
  logoRules: [{ name: 'Keep marks minimal and elegant', description: 'Avoid shadows, bevels, heavy strokes, or novelty effects.', required: true }],
  imageryRules: { styleSummary: 'Editorial lighting, refined details, premium materials, elegant negative space.', requiredTraits: ['warm light', 'texture', 'premium detail', 'quiet confidence'], avoid: ['cheap gold effects', 'overly busy glamour', 'stock luxury clichés'] },
  layoutRules: { styleSummary: 'Editorial spacing, refined contrast, restrained ornament.', requiredTraits: ['large margins', 'quiet hierarchy', 'premium pacing'], avoid: ['overcrowded copy', 'loud gradients', 'generic templates'] },
  accessibilityRules: commonAccessibility,
  exportRules: { printRules: ['Check metallic color substitutes for digital/print.', 'Protect invitation bleed and trim.'] },
  restrictedUses: ['Avoid fake foil effects unless clearly marked as a mockup.', 'Avoid low contrast champagne-on-ivory text.']
};

export const nonprofit: BrandProfile = {
  id: 'nonprofit',
  name: 'Nonprofit',
  description: 'Human-centered preset for cause campaigns, donor communications, impact reports, and community events.',
  defaultMode: 'guided',
  colors: [
    { name: 'Trust Navy', hex: '#12355B', role: 'primary' },
    { name: 'Hope Teal', hex: '#2AA198', role: 'secondary' },
    { name: 'Warm Sun', hex: '#F2B84B', role: 'accent' },
    { name: 'Paper', hex: '#FAF7F0', role: 'background' }
  ],
  gradients: [{ name: 'Impact Warmth', stops: ['#12355B', '#2AA198', '#F2B84B'], usage: 'Impact modules, campaign headers, donation CTAs.' }],
  typography: [
    { role: 'headline', fontFamily: 'Inter', weight: '700' },
    { role: 'body', fontFamily: 'Inter', weight: '400' },
    { role: 'fallback', fontFamily: 'Arial', weight: '400' }
  ],
  logoRules: [{ name: 'Protect trust cues', description: 'Do not distort partner, sponsor, or grant marks.', required: true }],
  imageryRules: { styleSummary: 'Authentic people, community settings, respectful storytelling, documentary warmth.', requiredTraits: ['human dignity', 'community', 'authenticity', 'warmth'], avoid: ['poverty clichés', 'exploitative imagery', 'forced emotion'] },
  layoutRules: { styleSummary: 'Clear impact hierarchy with stats, story, CTA, and donor recognition.', requiredTraits: ['readable stats', 'clear CTA', 'human story'], avoid: ['cluttered donor walls', 'low-contrast calls to action'] },
  accessibilityRules: commonAccessibility,
  exportRules: { socialDimensions: { square: '1080x1080', donationAd: '1200x628' }, deckRules: ['Keep impact stats large and readable.'] },
  restrictedUses: ['Avoid manipulative visual language.', 'Do not fabricate beneficiaries or impact claims.']
};

export const creatorBrand: BrandProfile = {
  id: 'creator-brand',
  name: 'Creator Brand',
  description: 'Flexible preset for independent creators, studios, personal brands, podcasts, social series, and content engines.',
  defaultMode: 'inspired',
  colors: [
    { name: 'Charcoal', hex: '#18181B', role: 'primary' },
    { name: 'Electric Violet', hex: '#8B5CF6', role: 'accent' },
    { name: 'Hot Coral', hex: '#FB7185', role: 'accent' },
    { name: 'Cloud', hex: '#F4F4F5', role: 'neutral' }
  ],
  gradients: [{ name: 'Creator Pulse', stops: ['#18181B', '#8B5CF6', '#FB7185'], usage: 'Social content, podcast covers, launch graphics.' }],
  typography: [
    { role: 'headline', fontFamily: 'Inter', weight: '800' },
    { role: 'body', fontFamily: 'Inter', weight: '400' },
    { role: 'fallback', fontFamily: 'system-ui', weight: '400' }
  ],
  logoRules: [{ name: 'Keep personal marks recognizable', description: 'Do not over-style or obscure the creator mark/avatar.', required: true }],
  imageryRules: { styleSummary: 'Personality-forward, cinematic, platform-native, high recognition at small sizes.', requiredTraits: ['strong thumbnail read', 'personality', 'distinctive crop'], avoid: ['generic influencer stock', 'too much text', 'low-recognition thumbnails'] },
  layoutRules: { styleSummary: 'Bold hooks, platform-native crops, repeatable series structure.', requiredTraits: ['strong hook', 'series consistency', 'mobile-first'], avoid: ['tiny type', 'too many CTAs'] },
  accessibilityRules: commonAccessibility,
  exportRules: { socialDimensions: { square: '1080x1080', story: '1080x1920', thumbnail: '1280x720' } },
  restrictedUses: ['Do not create misleading fake endorsements.', 'Do not use illegible thumbnail typography.']
};

export const blankCustomBrand: BrandProfile = {
  id: 'blank-custom-brand',
  name: 'Blank Custom Brand',
  description: 'Neutral starting point for uploaded logos, brand guides, screenshots, and manually entered brand rules.',
  defaultMode: 'guided',
  colors: [],
  gradients: [],
  typography: [
    { role: 'headline', fontFamily: 'Inter', weight: '700' },
    { role: 'body', fontFamily: 'Inter', weight: '400' },
    { role: 'fallback', fontFamily: 'system-ui', weight: '400' }
  ],
  logoRules: [{ name: 'Preserve uploaded logo', description: 'Do not distort, recolor, crop, or add effects unless approved.', required: true }],
  imageryRules: { styleSummary: 'Derived from uploaded brand references.', requiredTraits: ['brand-specific', 'consistent', 'high quality'], avoid: ['unvalidated styles', 'generic AI filler'] },
  layoutRules: { styleSummary: 'Derived from uploaded brand references.', requiredTraits: ['consistent hierarchy', 'responsive layouts'], avoid: ['template drift'] },
  accessibilityRules: commonAccessibility,
  exportRules: {},
  restrictedUses: ['Do not export final assets until the brand profile has enough validated rules.']
};

export const genericBrandPresets = [modernSaaS, enterpriseCorporate, sportsEvent, hospitality, luxuryEvent, nonprofit, creatorBrand, blankCustomBrand];
