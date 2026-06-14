---
name: Editor Nav Rail & Smart Objects
description: Industry-standard left NavRail + Insert drawer (Slides/Objects/Media), Smart Objects with snap-or-float DnD, expanded slide template library
type: feature
---

The slide editor (`src/components/slides/SlideEditor.tsx`) follows the Canva/Figma pattern: a persistent 44px **left NavRail** (`EditorNavRail.tsx`) with icon tabs that swap a single 280px drawer.

NavRail tabs:
- **Slides** (Layers icon) — action-only; toggles thumbnail rail visibility (`thumbRailVisible` state).
- **Insert** (Plus icon) — drawer renders `InsertDrawerTabs` with three sub-tabs: Slides (SlideSmartLayoutsPanel), Objects (SmartObjectsPanel), Media (SlideAssetSearchPanel).
- **Themes** (Palette) — placeholder drawer for future theme picker.
- **AI** (Sparkles) — action-only; opens AISlideGenerator.
- **Comments** (MessageSquare) — placeholder drawer.

**Smart Objects** (`smartObjectRegistry.ts`) are partial-slide patches with two modes:
- `snap` — merges into typed slide fields (e.g. KPI tile → `stats[]`).
- `float` — pushes entries into `slide.textBoxes[]` at drop position (% of slide).

Each object declares `defaultMode` + `supports[]`. Drag MIME `application/x-eventkit-object` carries `{ id, mode? }`. Hold **Alt** while dragging or dropping to force `float` mode. Drop coords (px → %) flow through canvas drop handler; click-to-insert uses center (50/50) with defaultMode.

12 objects shipped: stat-kpi, stat-trio, stat-big-number, text-callout, text-pull-quote, text-caption, text-cta-button, text-kicker, shape-divider, shape-badge, chart-bar, media-image-frame.

Slide template registry expanded to 25 entries — added: big-quote-hero, closing-cta, qa-slide, mission-statement, three-up-grid, stairs-process, ranked-stats, logo-wall, gallery-grid.

Legacy `SlideSectionLibraryPanel.tsx` deleted; all flows go through `SlideSmartLayoutsPanel` + `SmartObjectsPanel`. The right-side inspector no longer duplicates the smart-layouts library.
