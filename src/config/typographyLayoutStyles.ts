// Typography Layout Styles Reference
// Based on professional hand-lettering and typographic composition techniques
// Used by the AI Brain to guide typography-heavy asset generation

export interface TypographyLayoutStyle {
  id: string;
  name: string;
  description: string;
  steps: string[];
  bestFor: string[];
  promptGuidance: string;
}

export const TYPOGRAPHY_LAYOUT_STYLES: TypographyLayoutStyle[] = [
  {
    id: 'parallel_slant',
    name: 'Parallel Slant Layout',
    description: 'Words are arranged along diagonal parallel lines that slope upward, creating dynamic energy. Key words are emphasized with larger, bolder type while connecting words stay small.',
    steps: [
      'Pick key words to emphasize',
      'Sketch parallel diagonal slope guide lines',
      'Draw words along the slope with varied sizes',
      'Shade and finish with consistent slant angle',
    ],
    bestFor: ['slogans', 'motivational_quotes', 'event_taglines', 'banner_headlines'],
    promptGuidance: 'Arrange the typography along diagonal parallel lines sloping upward. Emphasize key words with bold, large uppercase lettering. Use a flowing script for connecting words. All text lines should follow the same slant angle, creating rhythmic energy. Mix serif/display type for emphasis words with elegant script for secondary words.',
  },
  {
    id: 'arc_sandwich',
    name: 'Arc Sandwich Layout',
    description: 'Text is arranged within curved arc guides — a convex arc on top and a concave arc on bottom, creating a badge-like or emblem shape. Key words fill the center while supporting text follows the curves.',
    steps: [
      'Pick key words to emphasize',
      'Sketch layout guides with a top arc and bottom arc',
      'Draw words within the arc guides, fitting text to curves',
      'Shape lettering and add simple decorations like stars or dots',
    ],
    bestFor: ['logos', 'badges', 'emblems', 'event_crests', 'merchandise_graphics'],
    promptGuidance: 'Create a badge/emblem-style typography composition. Top text follows a convex arc curving upward, center text is large and dominant, bottom text follows a concave arc. The overall shape resembles a rounded crest or badge. Add small decorative elements like stars, dots, or dashes between words. Mix bold uppercase for key words with flowing script for emphasis words.',
  },
  {
    id: 'main_wave',
    name: 'Main Wave Layout',
    description: 'Typography flows in organic wave-like shapes emanating from a central dominant word. Inner guide shapes create flowing curves that text follows, with the key word being the largest central element.',
    steps: [
      'Pick one word to highlight as the centerpiece',
      'Sketch layout guides with inner wave/ribbon shapes',
      'Sketch letters and borders following the wave flow',
      'Shade and decorate with cross-hatching or textures',
    ],
    bestFor: ['vintage_designs', 'certificate_headers', 'formal_event_branding', 'award_graphics'],
    promptGuidance: 'Create a vintage wave-style typography composition. The key word should be the largest element in the center, set in a bold display or serif font. Supporting text flows in ribbon/wave shapes around it, curving organically. Add decorative elements like cross-hatching, dots between words, and ornamental borders. The overall feel should be classic and hand-crafted, reminiscent of vintage sign painting.',
  },
  {
    id: 'out_of_frame',
    name: 'Out-of-Frame Layout',
    description: 'Text is arranged within a structured frame/border, but key words break out beyond the frame edges, creating visual tension and hierarchy. Inner and outer width guides define the boundary.',
    steps: [
      'Pick key words to emphasize',
      'Sketch layout guides with inner and outer width guides forming a frame',
      'Sketch letters within the layout guides, letting key words extend beyond',
      'Shade lettering, draw a decorative border, and add sparkle/star decorations',
    ],
    bestFor: ['poster_headlines', 'event_titles', 'stage_graphics', 'social_media_graphics'],
    promptGuidance: 'Create a framed typography composition where key words BREAK OUTSIDE the border/frame for dramatic effect. Use a structured rectangular or arch-topped frame. Bold, oversized key words should extend past the frame edges while supporting text stays inside. Add decorative corner elements, stars, or sparkles around the composition. Mix bold slab-serif for emphasis with small caps or condensed type for secondary text.',
  },
  {
    id: 'flourished_frame',
    name: 'Flourished Frame Layout',
    description: 'Centered, hierarchical typography surrounded by an asymmetric flourished border made of swirls, curls, and ornamental curves. Text uses varied sizes with the key word being the most decorative.',
    steps: [
      'Pick key words to emphasize',
      'Sketch centered layout guides with size hierarchy',
      'Sketch letters and add oval guides for the decorative frame',
      'Draw an asymmetrical, flourished border around the lettering',
    ],
    bestFor: ['wedding_designs', 'formal_invitations', 'gala_events', 'certificate_designs', 'elegant_branding'],
    promptGuidance: 'Create an elegant flourished typography composition. Center-align all text with clear size hierarchy — key words in decorative script, supporting words in small caps or serif. Surround the entire composition with an ornamental flourished border of swirls, curls, and flowing curves. The border should feel asymmetric and organic, not rigid. The key word should be in an elegant calligraphic script font. Overall aesthetic is refined, luxurious, and hand-crafted.',
  },
  {
    id: 'type_contrast',
    name: 'Type Contrast Layout',
    description: 'Uses exactly two contrasting lettering styles — typically bold block letters for emphasis words and light script for de-emphasized words. Arranged in horizontal rows with strong visual hierarchy.',
    steps: [
      'Divide quote into lines and pick words to de-emphasize',
      'Sketch horizontal layout guides',
      'Draw words using only two contrasting lettering styles',
      'Shade letters and add light decorations like botanical flourishes',
    ],
    bestFor: ['quote_graphics', 'social_media_posts', 'inspirational_signage', 'merchandise_typography'],
    promptGuidance: 'Create a type-contrast composition using EXACTLY TWO contrasting lettering styles. Bold, heavy block/slab-serif for emphasis words and a light, thin script or italic for connecting/secondary words. Arrange in horizontal rows with strong left or center alignment. The contrast between thick and thin, bold and delicate creates the visual interest. Add subtle botanical or geometric decorations. No border — the typography IS the design.',
  },
  {
    id: 'silhouette_fill',
    name: 'Silhouette Fill Layout',
    description: 'All text is arranged to fill a recognizable silhouette shape (cloud, heart, shield, etc.). The shape is filled with inverted/negative lettering — dark fill with light text knocked out.',
    steps: [
      'Divide quote into lines and pick words to emphasize',
      'Draw a silhouette shape with inner outline and divide space for each word',
      'Draw words following the guide shapes, filling the entire silhouette',
      'Ink the silhouette solid, leaving letter shapes unfilled (knocked out)',
    ],
    bestFor: ['sticker_designs', 'logo_marks', 'merch_graphics', 'die_cut_designs', 'creative_signage'],
    promptGuidance: 'Create a silhouette-fill typography composition. Choose a recognizable silhouette shape that fits the message (cloud, shield, heart, star, etc.). Fill the ENTIRE shape with hand-lettered typography in varied sizes and styles. The final result should be a solid dark silhouette with the text knocked out in white/negative space. Different words use different lettering styles and sizes to create visual texture. The silhouette shape should be instantly recognizable even filled with text.',
  },
  {
    id: 'loose_baseline',
    name: 'Loose Baseline Layout',
    description: 'Text is arranged along wavy, loose horizontal baselines instead of straight lines. Creates a casual, energetic, hand-drawn feel. Words bounce along the guides with varied styles.',
    steps: [
      'Divide quote into lines and pick words to highlight',
      'Draw loose, wavy horizontal guides',
      'Sketch letters along the wavy guides with varied weights',
      'Ink letters and add light decorations like sparkles and stars',
    ],
    bestFor: ['casual_events', 'festival_graphics', 'youth_events', 'playful_branding', 'social_media'],
    promptGuidance: 'Create a loose-baseline typography composition with a playful, hand-drawn energy. Text sits on wavy, bouncing baselines — NOT straight lines. Mix bold block letters with hand-drawn lettering styles. Key words are larger and bolder. Add small decorative elements like four-pointed stars, sparkles, dots between words. The overall feel should be energetic, spontaneous, and fun — like hand-lettered festival art. Strong visual weight with thick strokes.',
  },
  {
    id: 'full_page_fill',
    name: 'Full Page Fill Layout',
    description: 'Every word in a long quote is drawn in a DIFFERENT lettering style, filling the entire canvas row by row. Creates a visually rich, maximalist composition where variety is the design.',
    steps: [
      'Divide a long quote into lines with several words each',
      'Divide the canvas into rows based on the number of lines',
      'Draw each word in a different lettering style, filling each row completely',
      'Ink the layout and add final decorations',
    ],
    bestFor: ['poster_designs', 'wall_art', 'large_format_signage', 'program_covers', 'statement_pieces'],
    promptGuidance: 'Create a full-page-fill typography composition. EVERY word should be in a DIFFERENT lettering style — mix serif, sans-serif, script, slab, decorative, inline, shadow, 3D, and hand-drawn styles. Fill the ENTIRE canvas edge-to-edge with text arranged in horizontal rows. Each row fills its full width. No empty space — this is a maximalist, typographic collage. Each word becomes its own mini-design. The variety of styles creates a rich, visually dense, poster-like composition.',
  },
];

/**
 * Get layout style by ID
 */
export const getTypographyLayout = (id: string): TypographyLayoutStyle | undefined =>
  TYPOGRAPHY_LAYOUT_STYLES.find(s => s.id === id);

/**
 * Get layout styles best suited for a given asset type
 */
export const getLayoutsForAssetType = (assetType: string): TypographyLayoutStyle[] => {
  const type = assetType.toLowerCase();
  return TYPOGRAPHY_LAYOUT_STYLES.filter(s =>
    s.bestFor.some(b => type.includes(b.replace(/_/g, '')) || b.replace(/_/g, '_') === type)
  );
};

/**
 * Get a random recommended layout for typography-heavy assets
 */
export const getRecommendedLayout = (assetType: string): TypographyLayoutStyle => {
  const suitable = getLayoutsForAssetType(assetType);
  if (suitable.length > 0) {
    return suitable[Math.floor(Math.random() * suitable.length)];
  }
  // Default to type contrast — the most versatile
  return TYPOGRAPHY_LAYOUT_STYLES.find(s => s.id === 'type_contrast')!;
};

/**
 * Build typography layout prompt section for AI generation
 */
export const buildTypographyLayoutPrompt = (layoutId?: string, assetType?: string): string => {
  const layout = layoutId
    ? getTypographyLayout(layoutId)
    : assetType
      ? getRecommendedLayout(assetType)
      : null;

  if (!layout) return '';

  return `
TYPOGRAPHY LAYOUT STYLE — "${layout.name.toUpperCase()}":
${layout.description}

COMPOSITION INSTRUCTIONS:
${layout.promptGuidance}

DESIGN PROCESS REFERENCE:
${layout.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}
`;
};
