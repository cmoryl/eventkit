// Level-5 Prompt Compiler — stitches a Level5Template into the final prompt string
import type { Level5Template } from "../../types/eventTemplateSystem";
import { logoPlacementPresets } from "../../config/level5/logoPlacementPresets";

/**
 * Compile a Level5Template into a complete prompt string.
 * Merges DNA, anchors, layout, logo rules, design spec, scene, and guards.
 *
 * Upgrades:
 * - #2: Quality Gate block with explicit self-check preflight
 * - #3: Graphic-only assets skip photoreal scene entirely
 */
export function compileLevel5Prompt(t: Level5Template): string {
  const preset = logoPlacementPresets[t.assetType];

  const logoBlock = [
    "LOGO RULES (NON-NEGOTIABLE):",
    t.logoRules.reproduction,
    `Placement: ${preset?.placement ?? t.logoRules.placement}`,
    `Size: ${preset?.size ?? t.logoRules.size}`,
    `Clear Space: ${t.logoRules.clearSpace}`,
    `Contrast Protection: ${t.logoRules.contrastProtection}`,
    "FAIL IF ANY OCCUR:",
    ...t.logoRules.failureConditions.map(x => `  ✗ ${x}`),
  ];

  const dimBlock = t.dimensions
    ? `DIMENSIONS: ${t.dimensions.size} | ${t.dimensions.dpi} DPI | ${t.dimensions.colorMode}${t.dimensions.bleed ? ` | Bleed: ${t.dimensions.bleed}` : ""}${t.dimensions.safeMargin ? ` | Safe: ${t.dimensions.safeMargin}` : ""}`
    : "";

  const isGraphicOnly = t.scene.environment.startsWith("N/A");

  const lines = [
    "[MASTER_WRAPPER]",
    "ROLE: You are a production design system that outputs print-ready, brand-consistent layouts.",
    "OUTPUT: A single design concept with precise layout, hierarchy, styles, and spacing.",
    "",
    "HARD REQUIREMENTS:",
    "- Brand fidelity: use provided brand colors/typography; if missing, choose safe defaults",
    "- Legibility: pass the 3-second scan test",
    "- No invented trademarks or fake sponsors",
    "- Accessibility: WCAG AA contrast, readable type for viewing distance",
    "",
    "═══════════════════════════════════════",
    `TEMPLATE: ${t.variantName} (${t.assetType})`,
    `Tags: ${t.tags.join(", ")}`,
    "═══════════════════════════════════════",
    "",
    dimBlock,
    "",
    "TEMPLATE DNA:",
    `  Influence: ${t.dna.influence}`,
    `  Composition: ${t.dna.composition}`,
    `  Material: ${t.dna.materialStory}`,
    `  Finishes: ${t.dna.finishes}`,
    `  Typography: ${t.dna.typeBehavior}`,
    `  Motif: ${t.dna.graphicMotif}`,
    ...(isGraphicOnly ? [] : [
      `  Lighting: ${t.dna.lightingIntent}`,
      `  Camera: ${t.dna.cameraLanguage}`,
    ]),
    "",
    "ANCHORS (KEEP CONSISTENT):",
    ...t.anchors.map(a => `  • ${a}`),
    "",
    "LAYOUT RULES:",
    ...t.layout.map(l => `  • ${l}`),
    "",
    ...logoBlock,
    "",
    "DESIGN SPECIFICATION:",
    ...t.prompt.designSpec.map(l => `  ${l}`),
    "",
  ];

  // Photoreal scene: only for physical assets
  if (!isGraphicOnly) {
    lines.push(
      "PHOTOREAL SCENE DIRECTION:",
      ...t.prompt.photorealScene.map(l => `  ${l}`),
      "",
      "SCENE CONTEXT:",
      `  Environment: ${t.scene.environment}`,
      `  Mounting: ${t.scene.mounting}`,
      `  People: ${t.scene.people}`,
      `  Lighting: ${t.scene.lighting}`,
      "  Realism Constraints:",
      ...t.scene.realismConstraints.map(c => `    - ${c}`),
      "",
    );
  } else {
    lines.push(
      "OUTPUT MODE: PURE GRAPHIC DESIGN",
      "  Do NOT render as a photograph of a printed item, mockup, or physical object.",
      "  Output a clean, high-resolution design file — vector-sharp edges, flat or gradient fills, no camera simulation.",
      "",
    );
  }

  lines.push(
    "VARIATION CONTROLS:",
    "  Allowed:",
    ...t.variationControls.allowed.map(a => `    ✓ ${a}`),
    "  Disallowed:",
    ...t.variationControls.disallowed.map(d => `    ✗ ${d}`),
    "",
    "ROBUSTNESS GUARDS:",
    ...t.robustnessGuards.map(g => `  ⚑ ${g}`),
    "",

    // ── Quality Gate (Upgrade #2) ──
    "═══════════════════════════════════════",
    "QUALITY GATE — PREFLIGHT CHECKLIST (MANDATORY):",
    "Before finalizing the output, verify ALL of the following:",
    "  ✓ Logo is present, sharp, correctly placed per placement rules, not distorted",
    "  ✓ Visual hierarchy is instantly readable (3-second scan test passes)",
    "  ✓ No warped, melted, or AI-smudged text anywhere",
    ...(isGraphicOnly ? [] : [
      "  ✓ Physical mounting is correct and realistic (no floating mockups)",
    ]),
    "  ✓ No visual clutter, fake sponsors, or invented marks",
    "  ✓ Color palette applied cohesively; contrast meets WCAG AA",
    "  ✓ Typography clean, sharp, and readable at intended viewing distance",
    `  ✓ ${t.dimensions?.colorMode === "CMYK" ? "Bleed extends to edges; content within safe zone" : "Digital dimensions and resolution correct"}`,
    "",
    "If ANY check fails, regenerate internally and output ONLY a passing result.",
    "═══════════════════════════════════════",
  );

  return lines.filter(l => l !== undefined).join("\n");
}

/**
 * Merge compiled prompt with event variables.
 * Replaces {{variableName}} patterns with actual values.
 */
export function mergeLevel5Variables(
  compiledPrompt: string,
  variables: Record<string, string>
): string {
  let merged = compiledPrompt;

  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, "gi");
    merged = merged.replace(pattern, value || "");
  }

  // Clean remaining placeholders
  merged = merged.replace(/\{\{[^}]+\}\}/g, "");
  return merged;
}
