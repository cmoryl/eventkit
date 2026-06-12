import type { BrandProfile } from '@/types/brandProfile';

export const transperfect2026: BrandProfile = {
  id: 'transperfect-2026',
  name: 'TransPerfect 2026',
  description: 'Locked TransPerfect 2026 marketing brand preset for compliant enterprise campaign, event, web, social, deck, and case study assets.',
  defaultMode: 'locked',
  colors: [
    { name: 'Deep Navy / Blue 800', hex: '#03002C', role: 'primary', locked: true, usage: 'Primary dark field, hero emphasis, dark slides.' },
    { name: 'Classic Dark Blue', hex: '#003B71', role: 'primary', locked: true, usage: 'Brand blue, logo system support, dark typography.' },
    { name: 'Digital Blue 500', hex: '#003FC7', role: 'primary', locked: true, usage: 'Digital emphasis and active UI states.' },
    { name: 'Primary Light Blue', hex: '#139DD8', role: 'primary', locked: true, usage: 'Core light blue, brand highlights.' },
    { name: 'Teal', hex: '#3BBFB5', role: 'accent', locked: true, usage: 'Controlled accent, CTA, icon, highlight.' },
    { name: 'Purple', hex: '#7356C0', role: 'accent', locked: true, usage: 'Controlled accent and gradient support.' },
    { name: 'Pink', hex: '#EC388A', role: 'accent', locked: true, usage: 'Small color pop only.' },
    { name: 'Orange', hex: '#FF6600', role: 'accent', locked: true, usage: 'Small CTA, icon, or highlight usage only.' },
    { name: 'Green', hex: '#7BCD3A', role: 'semantic', locked: true, usage: 'Success or restrained semantic use.' },
    { name: 'Blue White', hex: '#E0E8F5', role: 'neutral', locked: true, usage: 'Soft background field.' },
    { name: 'Light Gray', hex: '#F2F2F2', role: 'neutral', locked: true, usage: 'Neutral surface.' },
    { name: 'Dark Gray', hex: '#666666', role: 'neutral', locked: true, usage: 'Secondary text.' },
    { name: 'Alabaster', hex: '#E7E3DA', role: 'neutral', locked: true, usage: 'Warm editorial background.' }
  ],
  gradients: [
    {
      name: 'Aqua Lavender Transformation',
      stops: ['#03002C', '#003FC7', '#7356C0', '#8E63FF', '#70EAE6', '#BCEFFF'],
      locked: true,
      usage: 'Abstract transformation fields, hero compositions, brand visual cards.'
    },
    {
      name: 'Deep Navy to Aqua Field',
      stops: ['#03002C', '#071B5D', '#003FC7', '#3BBFB5', '#BCEFFF'],
      locked: true,
      usage: 'High contrast hero modules and abstract visual emphasis.'
    }
  ],
  typography: [
    { role: 'headline', fontFamily: 'Geist Sans', weight: '700', locked: true, usage: 'Primary headlines.' },
    { role: 'subhead', fontFamily: 'Geist Sans', weight: '500', locked: true, usage: 'Secondary hierarchy.' },
    { role: 'body', fontFamily: 'Geist Sans', weight: '400', locked: true, usage: 'Primary copy.' },
    { role: 'fallback', fontFamily: 'Verdana', weight: '400', locked: true, usage: 'Web-safe fallback and email signature contexts.' }
  ],
  logoRules: [
    { name: 'Use approved wordmark only', description: 'Do not redraw, distort, recolor outside approved single-color usage, outline, rotate, or add effects.', required: true },
    { name: 'White on dark, black/navy on light', description: 'Use single-color wordmark in most digital contexts.', required: true },
    { name: 'Protect clear space', description: 'Maintain generous safe zone around the wordmark and symbol.', required: true },
    { name: 'Symbol for small contexts', description: 'Use the symbol for favicon, social icons, and compact digital environments.', required: true }
  ],
  imageryRules: {
    styleSummary: 'Human editorial photography plus abstract transformation fields using light, depth, blur, rhythm, and luminous connection forms.',
    requiredTraits: ['human', 'intelligent', 'soft depth', 'foreground blur', 'luminous abstract forms', 'clear negative space', 'enterprise confidence'],
    avoid: ['generic SaaS gradients', 'cold stock photography', 'staged handshakes', 'hard neon sci-fi', 'wireframe globes', 'busy layouts', 'fake AI gloss'],
    promptGuidance: 'Use candid professional subjects, soft side light, shallow depth of field, atmospheric aqua/teal/violet diffusion, and natural skin tones. Abstract visuals should use Connect, Collaborate, and Continue expression states.'
  },
  layoutRules: {
    styleSummary: 'Spacious, modular, precise layouts with light content pages and intentional dark emphasis moments.',
    requiredTraits: ['clear hierarchy', 'large visual fields', 'disciplined typography', 'controlled accents', 'light/dark pacing'],
    avoid: ['dense text on dark layouts', 'random theme switching', 'overcrowding', 'unapproved fonts', 'uncontrolled accent color dominance']
  },
  accessibilityRules: {
    minimumContrastRatio: 4.5,
    largeTextContrastRatio: 3,
    notes: ['Avoid low-contrast blue-on-blue combinations.', 'Prefer white text over core brand colors when contrast passes.']
  },
  exportRules: {
    socialDimensions: {
      facebookPost: '1200x628',
      instagramSquare: '1080x1080',
      instagramStory: '1080x1920',
      linkedinPost: '1200x628',
      xPost: '1200x675'
    },
    deckRules: ['Use 16:9 widescreen.', 'Light slides carry detail.', 'Dark slides create emphasis and pacing.'],
    printRules: ['Maintain aspect ratio.', 'Do not stretch or warp artwork.']
  },
  restrictedUses: [
    'Do not use off-brand colors in locked mode.',
    'Do not use full-color logos on photography when single-color marks are required.',
    'Do not use dense content on dark emphasis slides.',
    'Do not use random icon libraries outside the approved rounded line style.'
  ],
  approvedExamples: ['Website heroes', 'case studies', 'social posts', 'PowerPoint light/dark pacing', 'abstract Connect/Collaborate/Continue visuals'],
  promptKeywords: ['Transforming Global Performance', 'human intelligence', 'clarity emerging from complexity', 'luminous transformation', 'global connection']
};
