# Presentation Studio Test Plan

## Test scripts

The repository exposes these test and verification scripts in `package.json`:

- `npm run test`
- `npm run lint`
- `npm run build`

## Focus areas for the current Presentation Studio work

### 1. Template gallery
Verify:

- The prebuilt PowerPoint template gallery loads.
- Featured templates render high-design poster previews.
- Saved templates render with saved/shared states.
- Search filters by name, description, and template id.
- Filters work for All, Featured, My Templates, Library, Dark, and Light.
- Selecting a template opens the preview dialog.
- Using a template still starts a deck normally.

### 2. Live slide controls
Verify:

- `presentationLiveActionRegistry` returns always-on actions for every slide.
- Image slides expose Replace Image and Crop/Mask.
- Chart slides expose Chart Data.
- Stats slides expose Stats.
- Timeline slides expose Timeline.
- Process slides expose Process.
- Parallax slides expose Motion.
- Demo-mock slides expose Template Regions.

### 3. Interaction control model
Verify:

- `presentationInteractionControlService` builds a control model for every layout.
- The model includes content, layout, visual, brand, and export controls by default.
- Layout-specific controls appear only when relevant.

### 4. Resolver behavior
Verify:

- Text controls resolve to inline text mode.
- Layout controls resolve to layout mode.
- Style controls resolve to style mode.
- Image controls resolve to media or crop mode.
- Brand controls resolve to brand mode.
- QA controls resolve to QA mode.
- Notes and export controls resolve correctly.

### 5. Existing editor regression
Verify existing behavior still works:

- Add slide
- Duplicate slide
- Delete slide
- Reorder slides
- Drag/drop image onto slide
- Shift/drop image as new slide
- Import PPTX
- Export PPTX
- Inline edit overlay
- Parallax editor
- Demo template property editor
- Brand Assets Library
- Presentation mode

## Manual smoke test path

1. Open Presentation Studio.
2. Pick a prebuilt PowerPoint template.
3. Open it in the editor.
4. Change slide layout.
5. Edit text inline.
6. Drag a new image onto a slide.
7. Switch to a chart/stats/timeline/process slide.
8. Confirm the live action registry exposes the right controls.
9. Export to PPTX.
10. Reopen the exported deck in PowerPoint or Keynote.

## Pass criteria

The Presentation Studio passes when:

- Tests pass.
- Lint passes.
- Build passes.
- Existing editor behavior remains intact.
- New template previews render correctly.
- Live controls expose the right actions by slide type.
- No logo or brand asset data is sent to model prompts.
