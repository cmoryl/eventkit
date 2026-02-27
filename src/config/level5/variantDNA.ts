// Variant DNA presets — maps variant style names to DNA/anchor/scene tweaks
// These archetypes are combined with asset defaults at runtime
import type { VariantDNAPreset } from "../../types/eventTemplateSystem";

/**
 * DNA archetypes keyed by normalized variant name.
 * The generator fuzzy-matches variant names to these archetypes.
 */
const archetypes: Record<string, VariantDNAPreset> = {
  // ─── STYLE FAMILIES ───────────────────────────────
  "corporate": {
    influence: "Swiss Corporate + International Style",
    composition: "Grid-aligned, structured hierarchy, generous whitespace",
    materialHint: "Premium coated stock; matte or soft-touch lamination",
    finishes: "Spot UV on logo; blind deboss on cover",
    typeBehavior: "Neo-grotesque sans (Helvetica Now / Aktiv Grotesk); tight tracking headers, comfortable body",
    motif: "Subtle grid lines, halftone accents, geometric dividers",
    lightingIntent: "Neutral overhead, soft shadows, professional studio quality",
    cameraLanguage: "35mm, level angle, shallow depth of field on focal element",
    tags: ["Corporate", "Professional", "Clean"],
  },
  "minimal": {
    influence: "Japanese Minimalism + Scandinavian Design",
    composition: "Maximum whitespace, single focal point, asymmetric balance",
    materialHint: "Uncoated stock with natural texture; cotton paper feel",
    finishes: "None or subtle blind emboss; paper texture is the finish",
    typeBehavior: "Light-weight sans or refined serif; generous letter-spacing, airy",
    motif: "Single line, dot, or geometric accent — restraint is key",
    lightingIntent: "Soft natural daylight, barely visible shadows",
    cameraLanguage: "50mm, eye-level, lots of breathing room around subject",
    tags: ["Minimal", "Clean", "Refined"],
  },
  "tech": {
    influence: "Silicon Valley Product Design + Cyberpunk lite",
    composition: "Modular grid, card-based layouts, data-forward hierarchy",
    materialHint: "Smooth matte or semi-gloss; dark substrates welcome",
    finishes: "Holographic foil accents; gradient varnish strips",
    typeBehavior: "Geometric sans (Inter / DM Sans / Space Grotesk); monospace for data",
    motif: "Circuit traces, dot grids, data visualization abstractions, subtle scanlines",
    lightingIntent: "Cool-tone ambient with colored accent rim lights",
    cameraLanguage: "Wide angle 24mm for environmental shots; macro for detail",
    tags: ["Tech", "Modern", "Digital"],
  },
  "gala": {
    influence: "Art Deco + Contemporary Luxury",
    composition: "Centered symmetry, ornamental borders, dramatic scale contrast",
    materialHint: "Heavy uncoated or textured stock; velvet-touch lamination",
    finishes: "Gold/silver foil stamping; edge painting; letterpress impression",
    typeBehavior: "High-contrast serif (Playfair Display / Cormorant); elegant script accents",
    motif: "Art deco geometric patterns, laurel wreaths, thin rule ornaments",
    lightingIntent: "Warm evening glow, candlelight ambiance, dramatic shadows",
    cameraLanguage: "85mm portrait lens, slight low angle for grandeur, bokeh backgrounds",
    tags: ["Gala", "Luxury", "Premium", "Elegant"],
  },
  "festival": {
    influence: "Music Festival Poster Art + Pop Culture Graphics",
    composition: "Dynamic diagonals, overlapping layers, controlled chaos",
    materialHint: "Bright coated stock or screen-printed on textured surfaces",
    finishes: "Neon/fluorescent inks; holographic; thick ink layering",
    typeBehavior: "Bold display faces (Knockout / Bebas Neue); variable weight experiments",
    motif: "Bold geometric shapes, halftone dots, noise textures, vibrant gradients",
    lightingIntent: "Dramatic colored lighting, stage wash, high energy",
    cameraLanguage: "Ultra-wide or fish-eye distortion, dynamic angles, crowd energy",
    tags: ["Festival", "Bold", "Energy", "Fun"],
  },
  "neon": {
    influence: "Cyberpunk + Synthwave + Night Culture",
    composition: "Dark backgrounds with luminous elements, high contrast",
    materialHint: "Dark stock with fluorescent ink; possible blacklight reactive",
    finishes: "Neon edge effects; glow varnish; metallic inks on black",
    typeBehavior: "Geometric sans with glow effects; outlined display type",
    motif: "Neon tube lines, glow halos, dark gradients, light leak effects",
    lightingIntent: "Neon accent lighting on dark, high contrast, color spill",
    cameraLanguage: "35mm with lens flare, moody noir angle, shallow DOF with glow bokeh",
    tags: ["Neon", "Night", "Dark", "Glowing"],
  },
  "editorial": {
    influence: "Magazine Editorial Design + Swiss Typography",
    composition: "Strong baseline grid, pull quotes, asymmetric column layouts",
    materialHint: "Premium matte or silk stock; newsprint accent pages",
    finishes: "Embossed masthead; debossed section headers",
    typeBehavior: "Transitional serif for body (Georgia / Charter); bold sans for headers",
    motif: "Pull quote marks, thin rules, column indicators, page numbers",
    lightingIntent: "Clean studio lighting for photography; flat for typography",
    cameraLanguage: "Medium format look, shallow DOF portraits, precise framing",
    tags: ["Editorial", "Publication", "Typographic"],
  },
  "retro": {
    influence: "Mid-Century Modern + Vintage Americana",
    composition: "Centered layouts, badge/emblem compositions, stacked type",
    materialHint: "Kraft or cream stock; screen-print aesthetic",
    finishes: "Distressed textures; worn edges; vintage ink effects",
    typeBehavior: "Slab serif or rounded sans; hand-lettering feel; stacked lockups",
    motif: "Sunbursts, badges, ribbon banners, halftone dots, worn textures",
    lightingIntent: "Warm vintage tones, aged paper warmth, golden hour feel",
    cameraLanguage: "Standard lens, straight-on, aged film grain, warm color cast",
    tags: ["Retro", "Vintage", "Classic"],
  },
  "bold": {
    influence: "Bauhaus + Contemporary Poster Design",
    composition: "Maximum impact, oversized type, stark contrast, edge-to-edge color",
    materialHint: "Thick coated stock; vibrant ink coverage",
    finishes: "Full bleed color; possible die-cut; thick ink layering",
    typeBehavior: "Ultra-bold sans (Impact / Anton / Black weight families); all-caps power",
    motif: "Bold geometric blocks, hard edges, stark negative space",
    lightingIntent: "Hard directional light, dramatic shadows, high contrast",
    cameraLanguage: "Wide angle, dramatic low angle, stark contrast, minimal depth blur",
    tags: ["Bold", "Impact", "Strong"],
  },
  "premium": {
    influence: "Luxury Brand Identity + High-End Packaging",
    composition: "Balanced symmetry, ample margins, restrained elegance",
    materialHint: "Thick cotton stock or soft-touch laminate; weighted feel",
    finishes: "Foil stamping (gold/silver/copper); edge painting; blind deboss",
    typeBehavior: "Elegant serif (Didot / Bodoni); ultra-light sans companion; wide tracking",
    motif: "Thin rule lines, minimal ornaments, subtle watermark, embossed texture",
    lightingIntent: "Warm accent lighting, soft shadows, rich material rendering",
    cameraLanguage: "Macro detail shots, 85mm, soft shallow DOF, luxury product photography",
    tags: ["Premium", "Luxury", "Upscale"],
  },
  "dark": {
    influence: "Dark UI Design + Cinematic Grade",
    composition: "Dark-ground design, luminous type, glowing accents",
    materialHint: "Dark stock or digital dark mode; light elements pop",
    finishes: "Metallic ink on dark; silver foil; holographic accents",
    typeBehavior: "Light-weight sans on dark; generous spacing; glow-safe sizing",
    motif: "Subtle gradients, dark textures, light leaks, volumetric accents",
    lightingIntent: "Low-key lighting, rim lights, subtle color grading",
    cameraLanguage: "Cinematic wide, dramatic side-lighting, moody atmosphere",
    tags: ["Dark", "Moody", "Cinematic"],
  },
  "playful": {
    influence: "Children's Book Illustration + Friendly Brand Design",
    composition: "Organic curves, rounded corners, bouncy layout rhythm",
    materialHint: "Bright coated stock; soft-touch areas for tactile interest",
    finishes: "Rounded die-cuts; soft-touch coating; bright spot colors",
    typeBehavior: "Rounded sans (Nunito / Varela Round); bouncy baseline, generous size",
    motif: "Organic shapes, confetti, emoji-like icons, hand-drawn elements",
    lightingIntent: "Bright, cheerful, even lighting with soft colored accents",
    cameraLanguage: "Overhead flat-lay or slight angle, bright and airy, lifestyle feel",
    tags: ["Playful", "Fun", "Friendly"],
  },
  "gradient": {
    influence: "Contemporary Digital Design + Abstract Art",
    composition: "Flowing gradients as primary visual element, type floating on color fields",
    materialHint: "Screen-optimized or gradient-print capable stock",
    finishes: "Gradient varnish; iridescent coating; smooth transitions",
    typeBehavior: "Clean geometric sans; white or knockout text on gradients",
    motif: "Smooth gradients, mesh blurs, aurora effects, color transitions",
    lightingIntent: "Ambient glow from gradient colors, no harsh shadows",
    cameraLanguage: "Standard lens, focus on color field, typography floating",
    tags: ["Gradient", "Modern", "Colorful"],
  },
  "tactical": {
    influence: "Military / Law Enforcement ID Systems",
    composition: "Strict grid, bold designation headers, high-security layout",
    materialHint: "Rigid PVC with holographic overlay; tamper-evident",
    finishes: "Holographic security stripe; micro-text; UV-reactive ink",
    typeBehavior: "Condensed sans (Barlow Condensed); all-caps designations; monospace numbers",
    motif: "Security patterns, guilloche, micro-text lines, holographic elements",
    lightingIntent: "Harsh fluorescent, security checkpoint reality",
    cameraLanguage: "Flat documentary angle, harsh even lighting, no glamour",
    tags: ["Tactical", "Security", "Official"],
  },
  "eco": {
    influence: "Sustainable Design + Natural Materials",
    composition: "Organic layouts, earth-tone palette, hand-crafted feel",
    materialHint: "Recycled kraft or seed paper; soy-based inks",
    finishes: "Letterpress on recycled stock; no plastic lamination",
    typeBehavior: "Humanist sans or organic serif; warm, approachable",
    motif: "Leaf/nature icons, organic shapes, hand-drawn lines, recycled badges",
    lightingIntent: "Natural daylight, outdoor warmth, green tones",
    cameraLanguage: "Natural light, outdoor setting, honest documentary style",
    tags: ["Eco", "Sustainable", "Natural"],
  },
  "cinematic": {
    influence: "Film Title Design + Movie Poster Art",
    composition: "Dramatic scale, cinematic letterboxing, hero imagery",
    materialHint: "High-gloss or metallic stock; large format print",
    finishes: "Metallic inks; embossed title treatment; full-bleed imagery",
    typeBehavior: "Cinematic serif or custom display; dramatic weight contrast",
    motif: "Lens flares, volumetric light, atmospheric haze, dramatic compositions",
    lightingIntent: "Dramatic three-point lighting, volumetric atmosphere, movie-poster drama",
    cameraLanguage: "Anamorphic wide or telephoto compression, dramatic angles, cinematic color grade",
    tags: ["Cinematic", "Dramatic", "Film"],
  },
};

// ─── Fuzzy match variant name to archetype ────────────
const keywordMap: [RegExp, string][] = [
  [/corporate|executive|authority|conference|professional|ap clean/i, "corporate"],
  [/minimal|clean|simple|essentials|ultra simple|utility/i, "minimal"],
  [/tech|modular|digital|silicon|kiosk|rfid|interactive/i, "tech"],
  [/gala|luxe|luxury|elegant|formal|foil|emboss|classic formal|edge paint/i, "gala"],
  [/festival|pop|energy|bold festival|neon night|music/i, "festival"],
  [/neon|night|glow|cyberpunk|synthwave|night shift|reflective/i, "neon"],
  [/editorial|magazine|publication|typographic/i, "editorial"],
  [/retro|vintage|heritage|classic|woven|stamp/i, "retro"],
  [/bold|impact|big|high.impact|high.contrast|hero|knockout/i, "bold"],
  [/premium|prestige|spot uv|matte|upscale|glossless|velvet/i, "premium"],
  [/dark|moody|cinematic|low.light/i, "dark"],
  [/playful|fun|friendly|social|bingo|trivia|polaroid|instagram/i, "playful"],
  [/gradient|abstract|aurora|soft gradient|mesh/i, "gradient"],
  [/tactical|security|military|official|safety|emergency|ada/i, "tactical"],
  [/eco|sustainable|natural|organic|recycled/i, "eco"],
  [/cinematic|film|movie|dramatic|wide|3d/i, "cinematic"],
];

/** Resolve a variant name to the best-matching DNA archetype */
export function resolveVariantDNA(variantName: string): VariantDNAPreset {
  const lower = variantName.toLowerCase();

  // Direct key match first
  if (archetypes[lower]) return archetypes[lower];

  // Fuzzy keyword match
  for (const [pattern, key] of keywordMap) {
    if (pattern.test(lower)) return archetypes[key];
  }

  // Fallback to corporate (safest default)
  return archetypes["corporate"];
}

export { archetypes as dnaArchetypes };
