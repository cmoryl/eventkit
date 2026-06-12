export type PowerPointToolCategory =
  | 'create'
  | 'source'
  | 'brand'
  | 'repair'
  | 'transform'
  | 'content'
  | 'export'
  | 'audit';

export type PowerPointToolId =
  | 'generate_outline'
  | 'build_deck'
  | 'import_source_deck'
  | 'extract_template_dna'
  | 'apply_brand_system'
  | 'enforce_logo_safe_zones'
  | 'repair_slide_hierarchy'
  | 'compress_text_density'
  | 'convert_bullets_to_chart'
  | 'convert_bullets_to_timeline'
  | 'convert_slide_to_kpi_grid'
  | 'add_case_study_section'
  | 'add_appendix'
  | 'expand_speaker_notes'
  | 'adapt_for_audience'
  | 'audit_deck'
  | 'export_editable_pptx'
  | 'prepare_video_storyboard';

export interface PowerPointToolDefinition {
  id: PowerPointToolId;
  label: string;
  category: PowerPointToolCategory;
  description: string;
  agentInstruction: string;
  requiresDeck?: boolean;
  requiresSelection?: boolean;
  requiresBrandBrain?: boolean;
}

export const powerpointToolRegistry: PowerPointToolDefinition[] = [
  {
    id: 'generate_outline',
    label: 'Generate outline',
    category: 'create',
    description: 'Plan a structured deck outline before building the PowerPoint.',
    agentInstruction: 'Create a slide-by-slide outline with narrative arc, layout intent, speaker notes, and source fidelity. Do not build the PPTX until the outline is approved.',
  },
  {
    id: 'build_deck',
    label: 'Build deck',
    category: 'create',
    description: 'Generate an editable PowerPoint from prompt, source, template, and Brand Brain.',
    agentInstruction: 'Build a complete editable PowerPoint deck using the Presentation Deck Brain, selected template, source material, and export profile.',
    requiresBrandBrain: true,
  },
  {
    id: 'import_source_deck',
    label: 'Import source deck',
    category: 'source',
    description: 'Load an existing PPTX as source material or as an editable deck.',
    agentInstruction: 'Parse the PPTX, preserve slide order, extract title/body/notes/layout intent, and identify reusable template DNA when possible.',
    requiresDeck: false,
  },
  {
    id: 'extract_template_dna',
    label: 'Extract template DNA',
    category: 'source',
    description: 'Learn layout, type, colors, motif, footer/header, and slide master patterns from an imported deck.',
    agentInstruction: 'Extract recurring title systems, footer/header zones, type scale, color roles, logo placement, slide families, motifs, charts, and spacing rules. Save as Brand Brain deck style guidance.',
    requiresDeck: true,
  },
  {
    id: 'apply_brand_system',
    label: 'Apply brand system',
    category: 'brand',
    description: 'Apply active Brand Brain colors, fonts, motifs, style systems, and exact-logo zones to a deck.',
    agentInstruction: 'Re-theme the deck using active Brand Brain tokens, style systems, approved overrides, and deterministic logo placement. Keep content and source facts unchanged.',
    requiresDeck: true,
    requiresBrandBrain: true,
  },
  {
    id: 'enforce_logo_safe_zones',
    label: 'Enforce logo-safe zones',
    category: 'brand',
    description: 'Audit and repair logo placement zones so logos are exact source layers only.',
    agentInstruction: 'Remove fake/AI logo descriptions, reserve clean logo-safe zones, and insert exact source logos as deterministic PowerPoint image layers.',
    requiresDeck: true,
    requiresBrandBrain: true,
  },
  {
    id: 'repair_slide_hierarchy',
    label: 'Repair hierarchy',
    category: 'repair',
    description: 'Fix a slide with unclear title, overloaded layout, or weak visual hierarchy.',
    agentInstruction: 'Restructure the selected slide into clear title, supporting idea, visual/diagram region, and takeaway. Preserve facts and source wording.',
    requiresDeck: true,
    requiresSelection: true,
  },
  {
    id: 'compress_text_density',
    label: 'Compress text density',
    category: 'repair',
    description: 'Make a dense slide easier to present without losing source facts.',
    agentInstruction: 'Move detail into speaker notes, keep the slide to the strongest takeaways, and convert lists into KPI/process/timeline structures when appropriate.',
    requiresDeck: true,
    requiresSelection: true,
  },
  {
    id: 'convert_bullets_to_chart',
    label: 'Bullets → chart',
    category: 'transform',
    description: 'Turn numeric bullet content into an editable chart slide.',
    agentInstruction: 'Extract real numeric values from the selected slide and create an editable chart with labels, source notes, and clean brand styling. Never invent chart values.',
    requiresDeck: true,
    requiresSelection: true,
  },
  {
    id: 'convert_bullets_to_timeline',
    label: 'Bullets → timeline',
    category: 'transform',
    description: 'Convert phases, dates, milestones, or roadmap bullets into a timeline slide.',
    agentInstruction: 'Identify chronological or phased content and convert it into a timeline with dates/periods, deliverables, and concise milestone labels.',
    requiresDeck: true,
    requiresSelection: true,
  },
  {
    id: 'convert_slide_to_kpi_grid',
    label: 'Slide → KPI grid',
    category: 'transform',
    description: 'Turn outcomes or metrics into KPI cards.',
    agentInstruction: 'Extract KPIs from the selected slide and create a card/grid layout with values, labels, sublabels, and optional trend notes. Preserve all metrics.',
    requiresDeck: true,
    requiresSelection: true,
  },
  {
    id: 'add_case_study_section',
    label: 'Add case study section',
    category: 'content',
    description: 'Add a structured case study section to the deck.',
    agentInstruction: 'Create challenge, approach, solution, results, and takeaway slides using source facts and Brand Brain style systems.',
    requiresDeck: true,
  },
  {
    id: 'add_appendix',
    label: 'Add appendix',
    category: 'content',
    description: 'Move detailed source material into appendix slides.',
    agentInstruction: 'Create appendix slides for details that are too dense for the main narrative. Preserve source facts and make them easy to reference.',
    requiresDeck: true,
  },
  {
    id: 'expand_speaker_notes',
    label: 'Expand speaker notes',
    category: 'content',
    description: 'Write or improve presenter notes for each slide.',
    agentInstruction: 'Create practical speaker notes that explain the slide, transitions, and talk track without adding unsupported claims.',
    requiresDeck: true,
  },
  {
    id: 'adapt_for_audience',
    label: 'Adapt for audience',
    category: 'content',
    description: 'Reframe a deck for executives, sales, training, technical, or customer audiences.',
    agentInstruction: 'Adjust messaging, slide density, proof points, examples, and notes for the target audience while preserving source facts.',
    requiresDeck: true,
  },
  {
    id: 'audit_deck',
    label: 'Audit deck',
    category: 'audit',
    description: 'Run a deck quality, brand, and export-readiness audit.',
    agentInstruction: 'Score brand consistency, logo correctness, text density, source fidelity, slide hierarchy, repeated layouts, notes, contrast, and export readiness.',
    requiresDeck: true,
  },
  {
    id: 'export_editable_pptx',
    label: 'Export editable PPTX',
    category: 'export',
    description: 'Export the deck as an editable PowerPoint file.',
    agentInstruction: 'Export editable text, charts, tables, images, speaker notes, and deterministic logo layers. Avoid flattened image-only decks unless explicitly requested.',
    requiresDeck: true,
  },
  {
    id: 'prepare_video_storyboard',
    label: 'Prepare video storyboard',
    category: 'export',
    description: 'Convert deck into a video/storyboard-ready sequence.',
    agentInstruction: 'Add scene intent, narration notes, motion layers, parallax cues, and timing guidance for video or animated deck export.',
    requiresDeck: true,
  },
];

export const getPowerPointToolsByCategory = (category: PowerPointToolCategory) =>
  powerpointToolRegistry.filter((tool) => tool.category === category);

export const getPowerPointTool = (id: PowerPointToolId) =>
  powerpointToolRegistry.find((tool) => tool.id === id);

export const buildPowerPointToolPromptBlock = () => `
=== POWERPOINT CREATION TOOLBOX ===
The Presentation Studio agent can reason in terms of these user-facing PowerPoint tools. Use them to decide the next best action, not as hidden magic.
${powerpointToolRegistry.map((tool) => `• ${tool.label} (${tool.id}): ${tool.agentInstruction}`).join('\n')}
=== END POWERPOINT CREATION TOOLBOX ===
`;
