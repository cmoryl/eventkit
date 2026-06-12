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

export const genericBrandPresets = [modernSaaS, enterpriseCorporate, hospitality, blankCustomBrand];
