export interface GalleryImageryDirective {
  templateId: string;
  visualSystem: string;
  imageStyle: string;
  recommendedImagery: string[];
  assetSlots: string[];
  avoid: string[];
  generationPrompt: string;
}

export const GALLERY_IMAGERY_DIRECTIVES: GalleryImageryDirective[] = [
  {
    templateId: 'enterprise-ai-nexus',
    visualSystem: 'dark AI command center',
    imageStyle: 'abstract enterprise AI, glass UI panels, glowing data network, deep navy environment',
    recommendedImagery: ['abstract AI orb', 'workflow network map', 'floating SaaS UI card', 'security/governance signal icon set'],
    assetSlots: ['hero background', 'command card visual', 'KPI/data panel', 'governance icon'],
    avoid: ['robot clichés', 'human-like androids', 'busy unreadable dashboards', 'fake logos'],
    generationPrompt: 'Create a dark enterprise AI command-center visual: deep navy background, glass UI panels, soft cyan/violet glow, subtle network lines, premium consulting aesthetic, no fake logos, no robot clichés, no unreadable text.',
  },
  {
    templateId: 'global-launch-keynote',
    visualSystem: 'cinematic global event launch',
    imageStyle: 'venue/city photography, stage lighting, premium conference atmosphere, deep blue overlays',
    recommendedImagery: ['wide venue hero', 'city-at-night background', 'speaker stage photo', 'sponsor rail placeholder'],
    assetSlots: ['venue image', 'speaker image', 'sponsor logos', 'closing CTA image'],
    avoid: ['generic stock conference rooms', 'overcrowded compositions', 'logos baked into photos'],
    generationPrompt: 'Create a cinematic global event hero image: premium venue or city night scene, dramatic blue lighting, clean negative space for title, realistic photography, no readable signage, no fake sponsor logos.',
  },
  {
    templateId: 'data-observatory-pro',
    visualSystem: 'analytics observatory',
    imageStyle: 'dark data visualization, dashboard exports, world map heatmaps, metric constellations',
    recommendedImagery: ['clean dashboard screenshot', 'abstract heatmap', 'KPI card stack', 'signal icon set'],
    assetSlots: ['chart drop zone', 'map panel', 'signal card icons', 'data proof visual'],
    avoid: ['tiny unreadable labels', 'rainbow charts', 'spreadsheet screenshots', 'chartjunk'],
    generationPrompt: 'Create a premium data observatory visual: dark UI dashboard, clean chart shapes, world map heat accents, emerald/cyan highlights, legible large forms only, no tiny labels, no fake company logos.',
  },
  {
    templateId: 'cinematic-case-study-system',
    visualSystem: 'proof story editorial',
    imageStyle: 'cinematic split photography, before/after panels, outcome metric overlays, premium documentary tone',
    recommendedImagery: ['hero proof image', 'before panel', 'after panel', 'results texture'],
    assetSlots: ['case hero', 'before image', 'after image', 'metric backdrop'],
    avoid: ['cheesy handshake photos', 'overly staged corporate smiles', 'watermarked stock imagery'],
    generationPrompt: 'Create a cinematic business case-study visual: authentic documentary lighting, split before/after framing, deep navy overlay, room for metrics and narrative text, no stock handshake clichés.',
  },
  {
    templateId: 'product-os-launch',
    visualSystem: 'premium product launch',
    imageStyle: 'transparent product renders, device mockups, floating UI panels, polished product marketing light',
    recommendedImagery: ['transparent product render', 'laptop UI mockup', 'feature detail card', 'mobile CTA mockup'],
    assetSlots: ['product hero render', 'device mockup', 'feature detail image', 'QR resource visual'],
    avoid: ['screens with unreadable text', 'incorrect brand marks', 'clipart devices', 'overly playful SaaS blobs'],
    generationPrompt: 'Create a premium product launch visual: transparent device/product render, clean glass UI cards, soft studio lighting, modern enterprise SaaS style, no readable fake brand names, no incorrect logos.',
  },
  {
    templateId: 'brand-governance-kit',
    visualSystem: 'brand standards and QA',
    imageStyle: 'logo safe-zone guides, exact asset placeholders, approval states, accessibility checker aesthetic',
    recommendedImagery: ['logo safe-zone diagram', 'approved/rejected example panels', 'color contrast card', 'typography scale sample'],
    assetSlots: ['primary logo', 'reverse logo', 'safe-zone overlay', 'approval icons'],
    avoid: ['redrawn logos', 'distorted marks', 'decorative logo effects', 'low-contrast examples'],
    generationPrompt: 'Create a clean brand-governance visual system: logo safe-zone guides, approval badges, accessibility cards, white/navy backgrounds, exact-logo placeholders only, no modified or invented logos.',
  },
  {
    templateId: 'event-experience-system',
    visualSystem: 'experiential event system',
    imageStyle: 'venue activations, signage mockups, attendee journey visuals, energy with control',
    recommendedImagery: ['activation zone render', 'event signage mockup', 'attendee journey map', 'sponsor moment image'],
    assetSlots: ['activation hero', 'signage panel', 'journey map', 'sponsor logos'],
    avoid: ['messy crowds', 'random festival imagery', 'uncontrolled logo placement'],
    generationPrompt: 'Create a premium experiential event visual: branded activation environment, elegant signage mockups, attendee journey cues, polished venue lighting, no fake sponsor logos, no messy crowd clutter.',
  },
  {
    templateId: 'thought-leadership-editorial',
    visualSystem: 'editorial keynote',
    imageStyle: 'magazine photography, quiet negative space, essay-like image crops, premium paper texture',
    recommendedImagery: ['editorial portrait crop', 'abstract paper texture', 'quote image', 'wide essay opener visual'],
    assetSlots: ['editorial hero', 'quote background', 'section image', 'texture layer'],
    avoid: ['generic business stock', 'overdesigned gradients', 'busy collage'],
    generationPrompt: 'Create an editorial keynote visual: premium magazine-style image crop, warm paper texture, quiet negative space, sophisticated lighting, minimal composition, no generic corporate stock feeling.',
  },
];

export const getGalleryImageryDirective = (templateId: string) => {
  return GALLERY_IMAGERY_DIRECTIVES.find((directive) => directive.templateId === templateId);
};

export const buildGalleryImageryPromptBlock = (templateId: string) => {
  const directive = getGalleryImageryDirective(templateId);
  if (!directive) return '';
  return [
    'GALLERY IMAGERY DIRECTION',
    `Template: ${directive.templateId}`,
    `Visual system: ${directive.visualSystem}`,
    `Image style: ${directive.imageStyle}`,
    `Recommended imagery: ${directive.recommendedImagery.join(', ')}`,
    `Asset slots: ${directive.assetSlots.join(', ')}`,
    `Avoid: ${directive.avoid.join(', ')}`,
    `Generation prompt: ${directive.generationPrompt}`,
  ].join('\n');
};
