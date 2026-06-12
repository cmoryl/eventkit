import type { PowerPointToolId } from './powerpointToolRegistry';
import { getPowerPointTool } from './powerpointToolRegistry';
import type { PresentationDeckBrainPayload } from './presentationDeckBrainService';

export interface PresentationDeckActionPlan {
  toolId: PowerPointToolId;
  label: string;
  objective: string;
  prerequisites: string[];
  steps: string[];
  brandBrainInstructions: string[];
  expectedOutput: string;
  promptBlock: string;
}

const baseSteps: Record<PowerPointToolId, string[]> = {
  generate_outline: ['Identify audience and deck goal', 'Choose narrative arc', 'Plan slide-by-slide structure', 'Assign layout intent and speaker notes'],
  build_deck: ['Hydrate Presentation Deck Brain', 'Lock deck theme and export profile', 'Generate/editable slide plan', 'Build editable PPTX structure'],
  import_source_deck: ['Parse uploaded PPTX', 'Preserve slide order', 'Extract editable content', 'Prepare imported slides for editing'],
  extract_template_dna: ['Analyze imported slides', 'Detect layout families', 'Detect type and media behavior', 'Generate reusable template rules'],
  apply_brand_system: ['Read active Brand Brain', 'Apply theme tokens', 'Apply style systems', 'Reserve exact-logo zones', 'Preserve source content'],
  enforce_logo_safe_zones: ['Find logo placement needs', 'Reserve clean zones', 'Use exact source logo layer', 'Flag missing logo source'],
  repair_slide_hierarchy: ['Identify main takeaway', 'Separate title/body/supporting content', 'Reduce competing elements', 'Preserve source facts'],
  compress_text_density: ['Find dense content', 'Keep top-level points', 'Move detail into notes', 'Suggest richer layouts when useful'],
  convert_bullets_to_chart: ['Detect numeric content', 'Keep real values only', 'Create editable chart structure', 'Add source notes'],
  convert_bullets_to_timeline: ['Detect sequence or phases', 'Create milestone structure', 'Preserve dates/order', 'Add speaker context'],
  convert_slide_to_kpi_grid: ['Detect outcomes or metrics', 'Create KPI cards', 'Keep labels concise', 'Preserve all metric values'],
  add_case_study_section: ['Create challenge slide', 'Create approach slide', 'Create solution slide', 'Create results/takeaway slide'],
  add_appendix: ['Find detail-heavy content', 'Move detail to appendix', 'Add references/navigation', 'Keep main deck concise'],
  expand_speaker_notes: ['Read slide intent', 'Write talk track', 'Add transitions', 'Avoid unsupported claims'],
  adapt_for_audience: ['Identify target audience', 'Adjust detail level', 'Reframe proof points', 'Preserve source facts'],
  audit_deck: ['Score content quality', 'Score brand consistency', 'Score logo readiness', 'Score export readiness'],
  export_editable_pptx: ['Preserve editable text', 'Preserve notes', 'Insert exact logo layers', 'Generate export report'],
  prepare_video_storyboard: ['Create scene beats', 'Add narration notes', 'Mark motion-ready layers', 'Define timing guidance'],
};

const outputByTool: Record<PowerPointToolId, string> = {
  generate_outline: 'Approved-ready deck outline with layout intent and notes.',
  build_deck: 'Editable PowerPoint deck using Brand Brain and selected export profile.',
  import_source_deck: 'Imported editable deck or source summary.',
  extract_template_dna: 'Reusable template DNA prompt block and style recommendations.',
  apply_brand_system: 'Re-themed brand-compliant deck.',
  enforce_logo_safe_zones: 'Deck with exact logo zones and logo-readiness report.',
  repair_slide_hierarchy: 'Cleaner selected slide with stronger hierarchy.',
  compress_text_density: 'Lower-density slide with details moved into notes.',
  convert_bullets_to_chart: 'Editable chart slide using real values only.',
  convert_bullets_to_timeline: 'Editable timeline slide preserving sequence.',
  convert_slide_to_kpi_grid: 'Editable KPI/stat grid slide.',
  add_case_study_section: 'New case study section with proof-based structure.',
  add_appendix: 'Appendix section with detailed support material.',
  expand_speaker_notes: 'Improved presenter notes across selected slides or deck.',
  adapt_for_audience: 'Audience-specific deck version.',
  audit_deck: 'Deck QA report with score, issues, and recommendations.',
  export_editable_pptx: 'Editable PPTX export and export-readiness notes.',
  prepare_video_storyboard: 'Video/storyboard-ready slide sequence and narration notes.',
};

export const buildPresentationDeckActionPlan = (toolId: PowerPointToolId, deckBrain?: PresentationDeckBrainPayload | null): PresentationDeckActionPlan => {
  const tool = getPowerPointTool(toolId);
  const label = tool?.label || toolId;
  const prerequisites = [
    tool?.requiresDeck ? 'Current deck or selected slides are required.' : 'Can run before a deck exists.',
    tool?.requiresSelection ? 'A slide selection should be active.' : 'No slide selection required.',
    tool?.requiresBrandBrain ? 'Presentation Deck Brain should be hydrated.' : 'Brand Brain is optional but recommended.',
  ];
  const brandBrainInstructions = [
    deckBrain ? `Use brand profile: ${deckBrain.brandName}.` : 'Use active brand profile when available.',
    deckBrain?.hasExactLogoSource ? 'Exact source logo is available for deterministic placement.' : 'If logo is needed, flag missing exact source logo.',
    deckBrain?.styleSystems.length ? `Preserve style systems: ${deckBrain.styleSystems.map((system) => system.name).join(', ')}.` : 'Infer a conservative deck style if no style systems are active.',
    'Never invent sponsors, metrics, contact details, source facts, or logo artwork.',
  ];
  const steps = baseSteps[toolId];
  const expectedOutput = outputByTool[toolId];

  const promptBlock = `
=== PRESENTATION STUDIO ACTION PLAN ===
Tool: ${label} (${toolId})
Objective: ${tool?.description || 'Run a presentation studio action.'}
Prerequisites:
${prerequisites.map((item) => `  • ${item}`).join('\n')}
Steps:
${steps.map((item) => `  • ${item}`).join('\n')}
Brand Brain instructions:
${brandBrainInstructions.map((item) => `  • ${item}`).join('\n')}
Expected output: ${expectedOutput}
=== END PRESENTATION STUDIO ACTION PLAN ===
`;

  return {
    toolId,
    label,
    objective: tool?.description || 'Run a presentation studio action.',
    prerequisites,
    steps,
    brandBrainInstructions,
    expectedOutput,
    promptBlock,
  };
};
