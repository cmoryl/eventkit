# PowerPoint Agent + Presentation Studio Audit

## Executive summary

The PowerPoint area is already one of the strongest parts of EventKit. It has a unified AI Agent + editor workspace, supports outline-first generation, can import source material from PDFs and PPTX files, includes template gallery flows, and exports editable PowerPoint decks.

The biggest gap is that the presentation system still uses an older brand payload and deck prompt path. It does not yet fully consume the new Brand Brain layers: brand guide assets, exact logo policy, full brand set style systems, approved brand prompt overrides, style-system selections, and deck-specific governance.

The next upgrade should make Presentation Studio a true PowerPoint creation environment, not just a deck generator.

---

## Current architecture

### Unified agent/editor page

`/slides` redirects into `/agent/powerpoint?tab=editor`, so the app has already consolidated the old slides page into the PowerPoint Agent / Presentation Studio area.

`PowerPointAgent.tsx` imports and coordinates:

- `SlideEditor`
- `outlineToThemedSlides`
- `parsePptxFile`
- template gallery/demo conversion
- BrandHub import modal
- voice agent panel
- brand, source, refine, template, mode, quick control, and outline review composer components
- `DeckPreview`

This is a strong foundation for a unified presentation workspace.

### Generation flow

The current flow is:

1. User selects/enters prompt, source, template, brand, tone, slide count.
2. Optional plan-only request creates an editable outline.
3. Approved outline or direct prompt is sent to the `generate-deck` edge function.
4. Edge function plans a rich deck outline with tool calling.
5. Edge function builds an editable `.pptx` with `pptxgenjs`.
6. Result is pushed into the chat history and the user is moved into the editor tab.
7. Outline is archived to `deck_outlines` when available.

### Source ingestion

The agent supports:

- PDF source extraction through `extract-pdf-source`
- PPTX source extraction through `extractPptxAsSource`
- selected PDF page thumbnails as image references
- BrandHub source picks
- direct `.pptx` import into the editor

### Editor capabilities

The editor already includes:

- editable slide canvas
- thumbnails
- drag-and-drop slide reorder
- slide add/duplicate/delete
- multiple slide layouts
- AI slide generator
- presentation mode
- parallax layer editor
- BrandHub file/library panel
- BrandAssetsLibrary panel
- save-as-template dialog
- demo slide property editor
- inline edit overlay
- PPTX import
- PPTX export
- image drag/drop into current slide or new slides
- BrandHub deck import with proxy fallback

### Edge deck generator

The edge function is stronger than a simple deck generator. It uses:

- `pptxgenjs`
- rich slide layout schema
- outline planning with function/tool calling
- content fidelity rules for source documents and pre-structured slide content
- speaker notes requirement
- template palette/font locking
- selected source page images as model inputs
- generated slide imagery when needed
- editable PPTX generation

---

## Critical gaps

### 1. Brand Brain is not fully connected

The current client brand payload only passes basic colors and fonts from the selected brand. It does not yet pass the new Brand Brain layers:

- primary exact logo source
- uploaded brand assets
- visual references
- pattern references
- do/don't examples
- full brand set style systems
- approved brand prompt overrides
- logo visibility policy
- exact-logo overlay rules
- brand health / compliance rules
- deck-specific brand governance

### 2. PowerPoint prompt architecture is separate from the new master prompt system

The image/asset generation stack now has masterful prompt templates, style systems, overrides, and Brand Brain hydration. The deck generator has its own `SYSTEM` prompt, which is good, but isolated.

The deck generator should receive a compiled `presentationIntelligence` block that includes the same creative direction layers used elsewhere.

### 3. Default topics/templates are not yet brand-scaled

The current default topic map includes a TransPerfect 2026 default. This should become a dynamic Brand Brain-driven recommendation engine:

- pitch deck
- sales deck
- executive summary
- event recap
- sponsorship deck
- training deck
- workshop deck
- case study deck
- product overview
- board update
- keynote
- localization / AI / campaign-specific decks

### 4. Export engine is only partially brand-aware

The editor-side `exportPptx.ts` has hardcoded variants, hardcoded accent colors, and `Arial` in many places. It should evolve into a proper PowerPoint export engine with:

- brand theme colors
- brand fonts
- slide master logic
- exact source logo placement
- footer/header systems
- speaker notes preservation
- accessibility metadata
- alt text strategy
- editable charts/tables
- export profiles
- template metadata

### 5. Logo accuracy is not guaranteed inside decks

The broader EventKit logo system now forbids AI logo rendering and uses deterministic overlay. PowerPoint needs the same model:

- AI plans blank logo-safe zones.
- Source logo is inserted as an actual PowerPoint image layer.
- Master/footer/logo layout is deterministic.
- Imported decks should be audited for fake or drifted logos.

### 6. No deck QA loop yet

There is no formal deck-level QA score for:

- brand consistency
- slide density
- title hierarchy
- type scale
- color contrast
- logo consistency
- source fidelity
- repeated layout overuse
- slide order/story arc
- image usage
- speaker notes completeness
- export readiness

### 7. User creation tools need a PowerPoint tool registry

The UI has many tools, but the agent does not yet expose them as a coherent set of user-action tools. The agent should be able to say and do things like:

- create a deck from prompt
- create a deck from source
- import a deck and extract template DNA
- apply brand system to current deck
- repair slide hierarchy
- reduce text density
- add speaker notes
- generate a new section
- turn selected slides into a different audience version
- create executive summary slides
- create appendix slides
- convert bullets to charts/KPIs/timeline/process
- replace imagery with Brand Brain references
- enforce logo-safe zones
- export as PPTX/PDF/video-ready storyboard

---

## Recommended advanced architecture

### A. Presentation Deck Brain

Add a new service that builds a deck-specific Brand Brain payload:

`src/services/presentationDeckBrainService.ts`

Payload should include:

- brand profile summary
- selected style systems
- approved prompt overrides scoped to presentation/global
- uploaded brand assets
- logo policy and exact-logo requirements
- typography rules
- color behavior
- imagery/motif rules
- deck narrative rules
- source fidelity rules
- PowerPoint production constraints
- export profile
- QA assertions

This payload should be sent to `generate-deck` as `presentationIntelligence` and also appended to `themeOverride` until the edge function formally consumes the new field.

### B. PowerPoint Tool Registry

Add:

`src/services/powerpointToolRegistry.ts`

Tools should include:

- `generate_outline`
- `build_deck`
- `apply_brand_system`
- `extract_template_dna`
- `restructure_deck`
- `repair_slide`
- `convert_layout`
- `compress_text_density`
- `expand_speaker_notes`
- `add_chart_slide`
- `add_timeline_slide`
- `add_case_study_section`
- `add_appendix`
- `audit_deck`
- `export_pptx`
- `export_pdf`
- `prepare_video_storyboard`

The agent UI should surface these as command chips and contextual actions.

### C. Deck QA service

Add:

`src/services/presentationDeckQualityService.ts`

Checks:

- brand readiness
- logo source available
- logo placement path is deterministic
- slide count vs requested
- speaker notes completeness
- text density per slide
- repeated layout usage
- title length
- bullet overload
- contrast risk
- source fidelity risk
- presentation/export readiness

### D. Export profile system

Extend PowerPoint export to support:

- `editable_working_deck`
- `executive_presentation`
- `sales_pitch`
- `training_workshop`
- `event_keynote`
- `print_handout`
- `video_storyboard`

Each profile should affect slide density, notes, footer/metadata, image compression, motion/parallax intent, and layout style.

### E. Template DNA extraction

For imported PPTX files, add an extraction layer that identifies:

- title system
- footer/header system
- type scale
- color roles
- logo placement
- slide masters/layout families
- recurring motifs
- chart/table styling
- transition/motion cues
- spacing and safe zones

This should be stored as a reusable Brand Brain deck style or template override.

---

## Implementation plan

### Phase 1 — Deck Brain wiring

1. Add `presentationDeckBrainService.ts`.
2. Update `PowerPointAgent.tsx` to include `presentationIntelligence` in `buildInvokePayload`.
3. Add deck-specific prompt block to `themeOverride` as backwards-compatible fallback.
4. Hydrate Brand Brain before deck generation.

### Phase 2 — Edge function integration

1. Extend `DeckRequest` with `presentationIntelligence`.
2. Inject it into `userPrompt` and the system instruction.
3. Extend schema with optional `brandCompliance`, `layoutIntent`, `logoZone`, and `qaNotes` fields.
4. Ensure deck planning never asks AI to render logos.

### Phase 3 — Editor integration

1. Add Presentation Studio command bar.
2. Add Apply Brand System action.
3. Add Deck Audit panel.
4. Add slide repair tools.
5. Add one-click transform actions: bullets → chart, bullets → timeline, slide → executive version, section → case study.

### Phase 4 — Export upgrade

1. Extend `exportSlidesToPptx` options with brand and export profile.
2. Use brand colors/fonts instead of hardcoded default colors/fonts.
3. Add deterministic logo insertion.
4. Preserve speaker notes and structured charts.
5. Add export quality report.

### Phase 5 — Template learning

1. Extract template DNA from imported PPTX.
2. Save learned template behavior into Brand Brain.
3. Allow approved deck templates per brand.
4. Version templates and deck prompt overrides in Supabase.

---

## Highest-impact next build move

Start with `presentationDeckBrainService.ts` and wire it into `PowerPointAgent.tsx` + `generate-deck`.

This immediately makes deck generation use the same Brand Brain intelligence as the rest of EventKit, while keeping the existing agent/editor/export features intact.
