// config/level5/variantDNA.ts
// Curated variant DNA profiles + keyword-based fallback inference

export type VariantDNAProfile = {
  variantName: string;
  dna: {
    influence: string;
    composition: string;
    materialStory: string;
    finishes: string;
    typeBehavior: string;
    graphicMotif: string;
    lightingIntent: string;
    cameraLanguage: string;
  };
  anchors: string[];
  layoutHints: string[];
  sceneOverrides?: Partial<{
    environment: string;
    mounting: string;
    people: string;
    lighting: string;
    realismConstraints: string[];
  }>;
  variationControls?: {
    allowed: string[];
    disallowed: string[];
  };
  robustnessAdditions?: string[];
};

// ─── Keyword-based fallback (never breaks on new variant names) ───
function inferProfile(variantName: string): VariantDNAProfile {
  const v = variantName.toLowerCase();
  const isDark = v.includes("dark");
  const isNeon = v.includes("neon");
  const isElegant = v.includes("elegant") || v.includes("gala") || v.includes("lux");
  const isMinimal = v.includes("minimal") || v.includes("clean");
  const isTech = v.includes("tech") || v.includes("modular");
  const isFestival = v.includes("festival") || v.includes("bold") || v.includes("pop");

  return {
    variantName,
    dna: {
      influence: isElegant ? "Editorial Luxury"
        : isTech ? "Modern Tech / Modular UI"
        : isFestival ? "Festival Bold / High Energy"
        : isMinimal ? "Swiss Modern Minimal"
        : "Contemporary Corporate",
      composition: isMinimal ? "Strict grid, generous whitespace, calm hierarchy"
        : isTech ? "Modular blocks, rails, data-friendly zones"
        : isFestival ? "High-contrast hero block + kinetic diagonals"
        : "Balanced hierarchy with clear rails",
      materialStory: isElegant ? "Premium substrates: soft-touch laminate, thick stocks, SEG fabric, acrylic standoffs"
        : isTech ? "Modern fabrication: SEG fabric, satin vinyl, backlit options, precise mounting"
        : isFestival ? "Bold print materials: durable vinyl, textured overlays, punchy large-format"
        : "Professional event-grade print and install materials",
      finishes: isElegant ? "Spot UV on logo/headers, subtle foil accents only when appropriate"
        : isTech ? "Clean satin finish, subtle gradient mesh, no heavy texture"
        : isFestival ? "Textured accents allowed but controlled; avoid clutter behind type"
        : "Matte finish preferred; glare controlled",
      typeBehavior: isElegant ? "High-contrast serif + clean sans pairing; refined spacing"
        : isTech ? "Geometric sans, condensed headline, numeric hierarchy"
        : isFestival ? "Bold condensed headline + supporting sans; energetic scale"
        : "Neutral sans with strong hierarchy",
      graphicMotif: isTech ? "Mesh gradients, micro grids, linework rails"
        : isFestival ? "Bold blocks, dynamic shapes, light texture"
        : isElegant ? "Thin frames, subtle monograms, restrained patterns"
        : "Minimal bars, soft shapes",
      lightingIntent: isDark ? "Dark-mode friendly lighting; controlled highlights"
        : isElegant ? "Warm tungsten + soft bounce (ballroom realism)"
        : isTech ? "Cool neutral venue light + LED wash accents"
        : "Neutral overhead venue lighting",
      cameraLanguage: isNeon ? "35–50mm lens, cinematic contrast, controlled bloom, sharp text"
        : isElegant ? "50mm lens, shallow DOF, premium reflections, clean focus"
        : "35mm lens, eye-level documentary realism",
    },
    anchors: [
      "One signature motif repeated subtly (do not over-texture)",
      "Clear rail-based hierarchy (headline → info → CTA)",
      "Consistent spacing system",
    ],
    layoutHints: [
      "Keep logo in a reserved zone; never competing with headline.",
      "Maintain a clear safe margin; avoid edge-clipped text.",
    ],
  };
}

// ─── Curated named profiles ──────────────────────────
const PROFILES: Record<string, VariantDNAProfile> = {
  "Modern Minimal": {
    variantName: "Modern Minimal",
    dna: {
      influence: "Swiss Modern + Contemporary Corporate",
      composition: "Strict grid, strong alignment, generous whitespace",
      materialStory: "Matte premium print substrate; clean mounting hardware visible but minimal",
      finishes: "No heavy texture; optional subtle emboss/spot UV only on logo",
      typeBehavior: "Neutral grotesk sans; crisp hierarchy; restrained weights",
      graphicMotif: "Thin rules, minimal blocks, subtle corner radius logic",
      lightingIntent: "Neutral overhead venue light with soft shadows",
      cameraLanguage: "35mm lens, eye-level, straight-on, crisp focus",
    },
    anchors: ["Hard grid alignment", "Whitespace perimeter", "One accent color rail"],
    layoutHints: ["Headline zone top third", "CTA isolated; avoid clutter"],
    robustnessAdditions: ["Never add decorative graphics that reduce legibility."],
  },

  "Gala Elegant": {
    variantName: "Gala Elegant",
    dna: {
      influence: "Editorial Luxury + Black Tie",
      composition: "Centered hero lockup + refined supporting grid",
      materialStory: "Soft-touch stock / matte SEG fabric; brushed metal standoffs for signage",
      finishes: "Spot UV on logo or header band; optional foil micro-accent (very restrained)",
      typeBehavior: "High-contrast serif headline + clean sans body; comfortable tracking",
      graphicMotif: "Thin frame border + subtle monogram/pattern at 4–6% opacity",
      lightingIntent: "Warm tungsten (2800–3200K), soft bounce, premium reflections",
      cameraLanguage: "50mm lens, shallow DOF, cinematic but clean",
    },
    anchors: ["Refined frame motif", "Premium header band", "Low-opacity monogram texture"],
    layoutHints: ["Keep faces/photo zones clean", "No glossy glare; matte surfaces preferred"],
    sceneOverrides: {
      environment: "Luxury hotel ballroom with warm ambient lighting and premium décor",
      lighting: "Warm tungsten with soft falloff; no harsh hotspots",
    },
    robustnessAdditions: ["Avoid metallic gradients that look fake—keep finishes believable."],
  },

  "Corporate Executive": {
    variantName: "Corporate Executive",
    dna: {
      influence: "Enterprise Corporate + Swiss Discipline",
      composition: "Header rail + clear content blocks, maximum clarity",
      materialStory: "Professional event-grade prints; crisp edges; practical mounting",
      finishes: "Matte laminate; security micro-pattern optional for credentials",
      typeBehavior: "Condensed sans for headers; neutral sans for body; strong numerals",
      graphicMotif: "Subtle micro-grid or rails; no decorative clutter",
      lightingIntent: "Neutral venue light; accurate color reproduction",
      cameraLanguage: "35–50mm lens, documentary realism, sharp text",
    },
    anchors: ["Header rail system", "Data-friendly spacing", "Clear CTA box"],
    layoutHints: ["Prioritize readability over style flourishes"],
  },

  "Neon Night": {
    variantName: "Neon Night",
    dna: {
      influence: "Tech Nightlife + Cinematic Event Lighting",
      composition: "Bold hero block + glowing accent rails (controlled)",
      materialStory: "Satin vinyl / LED environment realism, but printed assets remain matte/satin",
      finishes: "Controlled neon edge accents; no over-bloom on text",
      typeBehavior: "Condensed headline + high-contrast supporting sans",
      graphicMotif: "Neon rails, gradient mesh, subtle light streaks (minimal)",
      lightingIntent: "Low-light venue with LED wash; keep text readable",
      cameraLanguage: "35mm lens, cinematic contrast, controlled bloom",
    },
    anchors: ["Neon rail motif", "High contrast type", "Dark base field"],
    layoutHints: ["Keep logo on a backing plate if needed to preserve contrast"],
    robustnessAdditions: ["Text must remain razor sharp — no glow bleeding into letters."],
  },

  "Dark Premium": {
    variantName: "Dark Premium",
    dna: {
      influence: "Luxury Minimal Dark Mode",
      composition: "Quiet hierarchy; premium negative space; single accent",
      materialStory: "Matte black soft-touch laminate, brushed aluminum frames",
      finishes: "Spot UV on logo/header only; subtle grain allowed at 2–3%",
      typeBehavior: "Elegant sans or serif/sans pairing with restrained weights",
      graphicMotif: "Thin frame + micro texture; no heavy gradients",
      lightingIntent: "Controlled highlights; no glare; warm-to-neutral balance",
      cameraLanguage: "50mm lens, shallow DOF, premium realism",
    },
    anchors: ["Soft-touch black field", "Spot UV header strip", "Thin frame border"],
    layoutHints: ["Use contrast protection behind logo when background is textured"],
    robustnessAdditions: ["No muddy blacks: preserve separation between elements."],
  },

  "Bold Color": {
    variantName: "Bold Color",
    dna: {
      influence: "Bold Corporate + Wayfinding Clarity",
      composition: "Chunky color blocks + large type + strong directional logic",
      materialStory: "Foamcore / gatorboard / coroplast realism; clean edges",
      finishes: "Flat color blocks; avoid gradients unless tech-themed",
      typeBehavior: "Bold condensed headline; simple supporting sans",
      graphicMotif: "Directional arrows and block bars",
      lightingIntent: "Neutral venue lighting, high visibility",
      cameraLanguage: "24–35mm lens, slightly wider context shot",
    },
    anchors: ["Color block zones", "Oversized arrows", "High-contrast rails"],
    layoutHints: ["Wayfinding first; brand second; keep it instantly scannable"],
  },

  "Speaker Announce": {
    variantName: "Speaker Announce",
    dna: {
      influence: "Editorial Social + Platform Native",
      composition: "Portrait/face zone + bold name + supporting details rail",
      materialStory: "Digital-only; crisp UI-like spacing",
      finishes: "Subtle gradient or clean color field; minimal texture",
      typeBehavior: "Name large; title/role secondary; event details tertiary",
      graphicMotif: "Clean dividers + icon chips",
      lightingIntent: "If photo used: natural portrait lighting, not over-processed",
      cameraLanguage: "Digital composition; no fake studio renders",
    },
    anchors: ["Face/portrait priority", "Name dominant", "Event chip row"],
    layoutHints: ["Logo stays small; never competes with speaker name"],
  },

  "Festival Bold": {
    variantName: "Festival Bold",
    dna: {
      influence: "Music Festival Poster Art + Pop Culture Graphics",
      composition: "Dynamic diagonals, overlapping layers, controlled chaos",
      materialStory: "Bright coated stock or screen-printed on textured surfaces",
      finishes: "Neon/fluorescent inks; holographic; thick ink layering",
      typeBehavior: "Bold display faces (Knockout / Bebas Neue); variable weight experiments",
      graphicMotif: "Bold geometric shapes, halftone dots, noise textures, vibrant gradients",
      lightingIntent: "Dramatic colored lighting, stage wash, high energy",
      cameraLanguage: "Ultra-wide or fish-eye distortion, dynamic angles, crowd energy",
    },
    anchors: ["Energetic composition", "Bold color blocks", "Dynamic type scaling"],
    layoutHints: ["Headline must still be instantly readable despite energy"],
    robustnessAdditions: ["Energy ≠ unreadable. Keep hierarchy clear even with bold layouts."],
  },

  "Tech Gradient": {
    variantName: "Tech Gradient",
    dna: {
      influence: "Silicon Valley Product Launch + Abstract Tech",
      composition: "Flowing gradients as primary visual element, type floating on color fields",
      materialStory: "Screen-optimized or gradient-print capable stock",
      finishes: "Gradient varnish; iridescent coating; smooth transitions",
      typeBehavior: "Clean geometric sans; white or knockout text on gradients",
      graphicMotif: "Smooth gradients, mesh blurs, aurora effects, color transitions",
      lightingIntent: "Ambient glow from gradient colors, no harsh shadows",
      cameraLanguage: "Standard lens, focus on color field, typography floating",
    },
    anchors: ["Gradient as hero visual", "Clean typography floating", "Minimal structural elements"],
    layoutHints: ["Ensure text contrast against gradient bands"],
    robustnessAdditions: ["Gradients must be smooth — no banding artifacts."],
  },

  "Corporate Clean": {
    variantName: "Corporate Clean",
    dna: {
      influence: "International Corporate + Swiss Grid",
      composition: "Grid-aligned, structured hierarchy, generous whitespace",
      materialStory: "Premium coated stock; matte or soft-touch lamination",
      finishes: "Spot UV on logo; clean matte finish overall",
      typeBehavior: "Neo-grotesque sans; tight tracking headers, comfortable body",
      graphicMotif: "Subtle grid lines, halftone accents, geometric dividers",
      lightingIntent: "Neutral overhead, soft shadows, professional studio quality",
      cameraLanguage: "35mm, level angle, shallow depth of field on focal element",
    },
    anchors: ["Grid discipline", "Whitespace balance", "Professional restraint"],
    layoutHints: ["Structure over decoration; clarity wins"],
  },

  "High-Impact Bold": {
    variantName: "High-Impact Bold",
    dna: {
      influence: "Bauhaus + Contemporary Poster Design",
      composition: "Maximum impact, oversized type, stark contrast, edge-to-edge color",
      materialStory: "Thick coated stock; vibrant ink coverage",
      finishes: "Full bleed color; possible die-cut; thick ink layering",
      typeBehavior: "Ultra-bold sans (Impact / Anton / Black weight families); all-caps power",
      graphicMotif: "Bold geometric blocks, hard edges, stark negative space",
      lightingIntent: "Hard directional light, dramatic shadows, high contrast",
      cameraLanguage: "Wide angle, dramatic low angle, stark contrast",
    },
    anchors: ["Oversized type", "Stark contrast", "Edge-to-edge impact"],
    layoutHints: ["One message, maximum impact"],
  },

  "Gala Premium": {
    variantName: "Gala Premium",
    dna: {
      influence: "Art Deco + Contemporary Luxury",
      composition: "Centered symmetry, ornamental borders, dramatic scale contrast",
      materialStory: "Heavy uncoated or textured stock; velvet-touch lamination",
      finishes: "Gold/silver foil stamping; edge painting; letterpress impression",
      typeBehavior: "High-contrast serif (Playfair Display / Cormorant); elegant script accents",
      graphicMotif: "Art deco geometric patterns, laurel wreaths, thin rule ornaments",
      lightingIntent: "Warm evening glow, candlelight ambiance, dramatic shadows",
      cameraLanguage: "85mm portrait lens, slight low angle for grandeur, bokeh backgrounds",
    },
    anchors: ["Symmetrical composition", "Ornamental restraint", "Premium material feel"],
    layoutHints: ["Elegance through restraint, not excess"],
    sceneOverrides: {
      environment: "Grand ballroom with chandeliers and premium table settings",
      lighting: "Warm tungsten, candlelight mix, soft bounce",
    },
  },
};

// ─── Public API ───────────────────────────────────────
export function getVariantProfile(variantName: string): VariantDNAProfile {
  return PROFILES[variantName] ?? inferProfile(variantName);
}

/** Get all curated profile names */
export function getCuratedProfileNames(): string[] {
  return Object.keys(PROFILES);
}

export { PROFILES as curatedProfiles };
