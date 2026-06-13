export type PresentationEditorActionGroupId =
  | 'create_insert'
  | 'edit_canvas'
  | 'view_present'
  | 'brand_assets'
  | 'review_export'
  | 'reuse_system';

export interface PresentationEditorActionInventoryItem {
  id: string;
  label: string;
  currentLocations: string[];
  group: PresentationEditorActionGroupId;
  keepAsPrimary?: boolean;
  combineWith?: string[];
  recommendation: string;
}

export interface PresentationEditorActionGroup {
  id: PresentationEditorActionGroupId;
  label: string;
  purpose: string;
  primaryButton: string;
  secondaryActions: string[];
}

export interface PresentationEditorActionAudit {
  groups: PresentationEditorActionGroup[];
  inventory: PresentationEditorActionInventoryItem[];
  consolidationRules: string[];
  repeatedAreas: Array<{
    area: string;
    problem: string;
    combinedPattern: string;
  }>;
}

export const editorActionGroups: PresentationEditorActionGroup[] = [
  {
    id: 'create_insert',
    label: 'Create / Insert',
    purpose: 'Everything that adds new content to the deck.',
    primaryButton: 'Create',
    secondaryActions: ['AI Generate', 'Templates', 'Import PPTX', 'Add Slide', 'Insert Smart Block'],
  },
  {
    id: 'edit_canvas',
    label: 'Edit Canvas',
    purpose: 'Direct manipulation and slide-level editing.',
    primaryButton: 'Edit',
    secondaryActions: ['Text', 'Layout', 'Image', 'Align', 'Style', 'Duplicate', 'Delete'],
  },
  {
    id: 'view_present',
    label: 'View / Present',
    purpose: 'View mode, zoom, grid, transitions, animation, and presentation preview.',
    primaryButton: 'View',
    secondaryActions: ['Zoom', 'Grid', 'Animated Backgrounds', 'Transitions', 'Present'],
  },
  {
    id: 'brand_assets',
    label: 'Brand / Assets',
    purpose: 'BrandHub, logo-safe rules, source assets, and brand repairs.',
    primaryButton: 'Brand',
    secondaryActions: ['Brand Assets', 'Brand Repair', 'Logo Check', 'Apply Brand Theme'],
  },
  {
    id: 'review_export',
    label: 'Review / Export',
    purpose: 'QA, export readiness, PPTX/PDF handoff, and final confidence.',
    primaryButton: 'Review & Export',
    secondaryActions: ['Run QA', 'Fix Issues', 'Check Export', 'Export PPTX'],
  },
  {
    id: 'reuse_system',
    label: 'Reuse System',
    purpose: 'Template saving, snapshots, event history, and reusable deck systems.',
    primaryButton: 'Save System',
    secondaryActions: ['Save as Template', 'Save Snapshot', 'Reuse Deck Recipe', 'Version History'],
  },
];

export const editorActionInventory: PresentationEditorActionInventoryItem[] = [
  {
    id: 'templates_gallery',
    label: 'Templates / Gallery',
    currentLocations: ['SlideEditor top toolbar: Templates', 'SlideEditor top toolbar: Gallery', 'Mission Control: Smart Blocks', 'Mission Control: Deck Recipe'],
    group: 'create_insert',
    keepAsPrimary: true,
    combineWith: ['gallery', 'smart_blocks', 'deck_recipe'],
    recommendation: 'Combine Templates and Gallery into one Create menu with tabs: Templates, Smart Blocks, Recipes, Brand Decks.',
  },
  {
    id: 'ai_generate_autopilot',
    label: 'AI Generate / Autopilot',
    currentLocations: ['SlideEditor top toolbar: AI Generate', 'Mission Control: Autopilot', 'Command Palette examples'],
    group: 'create_insert',
    keepAsPrimary: true,
    combineWith: ['autopilot', 'command_palette'],
    recommendation: 'Use one primary Create button; AI Generate becomes one mode inside Autopilot, not a separate competing action.',
  },
  {
    id: 'import_sources',
    label: 'Import / Source Attach',
    currentLocations: ['SlideEditor top toolbar: Import', 'Canvas drag/drop', 'Slide rail drag/drop', 'Source Intake flow'],
    group: 'create_insert',
    combineWith: ['canvas_drop', 'source_intake'],
    recommendation: 'Keep drag/drop as direct manipulation, but route toolbar Import through the same Source Intake path.',
  },
  {
    id: 'brand_assets_repair',
    label: 'Brand Assets / Brand Repair',
    currentLocations: ['SlideEditor top toolbar: Brand Assets', 'Floating toolbar: Brand', 'QA Fix Plan: brand fixes', 'Brand Brain status'],
    group: 'brand_assets',
    keepAsPrimary: true,
    combineWith: ['logo_check', 'brand_repair'],
    recommendation: 'Create one Brand button with menu items: Assets, Apply Theme, Logo Check, Repair Slide, Repair Deck.',
  },
  {
    id: 'export_readiness',
    label: 'Export / Readiness',
    currentLocations: ['SlideEditor top toolbar: Export to .pptx', 'Mission Control: Export Readiness', 'Status bar: Export ready', 'Runbook: Export phase'],
    group: 'review_export',
    keepAsPrimary: true,
    combineWith: ['qa', 'export_fidelity'],
    recommendation: 'Replace standalone Export with Review & Export so users see readiness warnings before downloading.',
  },
  {
    id: 'grid_view_present',
    label: 'Grid / Present / View',
    currentLocations: ['SlideEditor top toolbar: Grid', 'SlideEditor top toolbar: Present', 'Zoom controls', 'Transitions', 'Animated BG'],
    group: 'view_present',
    combineWith: ['zoom', 'transition', 'animated_backgrounds'],
    recommendation: 'Consolidate view-only controls into a View menu and keep Present as the primary visible action.',
  },
  {
    id: 'save_template_reuse',
    label: 'Save Template / Reuse System',
    currentLocations: ['SlideEditor top toolbar: Save as Template', 'Mission Control: Reuse phase', 'Event History', 'Snapshots'],
    group: 'reuse_system',
    combineWith: ['snapshot', 'event_history'],
    recommendation: 'Rename Save as Template to Save System and include template, recipe, snapshot, and event history options.',
  },
  {
    id: 'duplicate_delete_reorder',
    label: 'Duplicate / Delete / Reorder',
    currentLocations: ['Slide rail hover actions', 'Grid card hover actions', 'Floating toolbar potential edit controls'],
    group: 'edit_canvas',
    combineWith: ['slide_rail_actions', 'grid_actions'],
    recommendation: 'Keep duplicate/delete/reorder in both slide rail and grid because context differs, but use identical icon treatment and confirmation behavior.',
  },
];

export const buildPresentationEditorActionAudit = (): PresentationEditorActionAudit => ({
  groups: editorActionGroups,
  inventory: editorActionInventory,
  consolidationRules: [
    'One visible primary button per job: Create, Edit, View, Brand, Review & Export, Save System.',
    'Toolbar actions must not duplicate Mission Control cards unless they launch the same underlying flow.',
    'Direct manipulation stays on canvas; detailed settings live in the inspector.',
    'Export always runs readiness checks before download.',
    'Template, Smart Block, Recipe, and Brand Deck selection should live in one Create surface.',
  ],
  repeatedAreas: [
    {
      area: 'Templates vs Gallery vs Smart Blocks vs Deck Recipe',
      problem: 'Multiple entry points all mean start from structure.',
      combinedPattern: 'Create menu with structure tabs.',
    },
    {
      area: 'AI Generate vs Autopilot vs Command Palette',
      problem: 'Multiple AI entry points compete for attention.',
      combinedPattern: 'Autopilot is the main AI path; command palette routes quick instructions.',
    },
    {
      area: 'Export button vs Export Readiness panels',
      problem: 'Users can export before seeing quality warnings.',
      combinedPattern: 'Review & Export combined action with readiness preflight.',
    },
    {
      area: 'Brand Assets vs Brand Repair vs Logo Check',
      problem: 'Brand actions are split between source, correction, and QA.',
      combinedPattern: 'Single Brand menu with assets, apply, logo check, and repair.',
    },
  ],
});
