# Presentation Studio Editor QA Runbook

## Purpose

This runbook defines the manual editor QA pass that should be used alongside the automated Presentation Studio checks.

## Required automated checks

Before manual QA, confirm:

- Presentation Studio workflow is passing.
- Presentation Assets workflow is passing.
- `scripts/test-presentation-studio.mjs` includes editor combination, replay, and E2E coverage tests.

## Manual editor journeys

### 1. Create to export

1. Start a blank deck.
2. Run AI generate or add a slide.
3. Apply a brand theme.
4. Edit layout and text.
5. Run QA.
6. Run export preflight.
7. Export PPTX.

Expected result: export is available only after QA and preflight are satisfied.

### 2. Template to branded deck

1. Open templates.
2. Select a presentation template.
3. Open brand assets.
4. Run logo check.
5. Replace or insert image content.
6. Run QA and export preflight.

Expected result: brand and logo checks remain visible before export.

### 3. Import to repair

1. Import a PPTX.
2. Run brand repair.
3. Adjust style and layout.
4. Fix issues.
5. Run QA.

Expected result: imported content is repaired before export readiness is shown.

### 4. Edit and reuse

1. Add a slide.
2. Duplicate it.
3. Edit text and layout.
4. Save deck recipe.
5. Save as template.
6. Save snapshot.

Expected result: the edited deck can be saved as reusable systems without triggering export.

### 5. View and present loop

1. Add a slide.
2. Toggle grid view.
3. Adjust zoom.
4. Pick transition.
5. Start present mode.
6. Return to QA and fixes.

Expected result: presentation preview does not bypass QA.

## Negative-path checks

- Try QA before creating a deck.
- Try export preflight before QA.
- Try present mode before a deck exists.
- Try PPTX export before QA and preflight.

Expected result: the editor blocks the unsafe path and shows a review state.

## Current validation surfaces

- Editor Action Audit
- Editor User-Flow Combination Matrix
- Editor Replay Simulator
- E2E coverage embedded in the Replay panel

## Pass criteria

- All automated workflows pass.
- All manual journeys complete.
- Negative paths are blocked.
- Export is available only after QA and preflight.
- Reuse actions save without forcing export.
