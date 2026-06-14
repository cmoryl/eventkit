---
name: Editor Layers & Smart Drop
description: Free-floating Layers panel reorders/hides textBoxes; gap drop-zones in slide rail accept smart sections at exact positions; collapsible nav rail persists in localStorage.
type: feature
---
- LayersPanel (src/components/slides/LayersPanel.tsx) is the Layers nav-rail tab. Edits `slide.textBoxes`: rename, reorder (front↔back), toggle `__hidden`, duplicate, delete. Hidden text boxes stay in the payload but are filtered out by InlineEditOverlay's renderer.
- Built-in slot layers (title/subtitle/body/stats/chart/image/bg) appear as read-only rows beneath the editable text-box layers.
- Slide rail uses `GapDropZone` strips between thumbnails. Section drags (SLIDE_SECTION_MIME) drop INTO the gap (insertSectionAfter index − 1) instead of replacing/merging a thumbnail. Reorder drags also light up gap zones.
- EditorNavRail has a collapsible expanded mode (160px) with inline labels; collapsed mode (44px) keeps tooltips. State persisted at `editor:navrail:expanded`.
- New atoms in smartObjectRegistry (atom-*) are all float-only — they push styled textBoxes to the slide at drop position. Industry-standard set: progress-bar, sparkline, tag-list, avatar-group, icon-text, ticker, arrow, social, timestamp, badge-stack.
- New Smart Layouts in slideTemplateRegistry: testimonial-card, pricing-tiers, before-after, roadmap-quarters, bento-grid, kpi-grid-six, stat-comparison, definition-card, contact-card, milestone-callout, image-grid-2x2, sponsor-wall, awards-row, social-handles.
