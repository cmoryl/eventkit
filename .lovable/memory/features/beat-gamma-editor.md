---
name: Beat-Gamma Editor Layer
description: Smart Layouts + Accent Images + Brand Lock + AI draft tray + voice live-editing on /agent/powerpoint deck editor
type: feature
---
Editor surface that goes head-to-head with Gamma on the PowerPoint agent page.

Components:
- `SlideSmartLayoutsPanel` — tabbed library of named-slot templates (`SLIDE_BLOCK_TEMPLATES` in `slideTemplateRegistry.ts`). Drag MIME `application/x-eventkit-section`.
- `AccentImagePanel` + `AccentImageLayer` — Gamma-style accent overlays (background/top/left/right with frosted/faded/clear). Lives on `SlideData.accentImage`.
- `BrandLockBar` + `applyBrandLockToSlide` — toggle in toolbar. Persisted per brand at `eventkit:brand-lock:<brandId>`. Normalizes new + AI slides to active brand colors.
- `GeneratedSlidesTray` — floating bottom strip of AI draft slides. Each card draggable via `SLIDE_SECTION_MIME`.
- `ShortcutsOverlay` — `?` key cheatsheet for keyboard, drag, voice shortcuts.

Editor bus (`src/lib/slideEditorBus.ts`) lets external surfaces (voice agent) call into the live editor: `insertTemplate`, `insertSection`, `setSlideField`, `setAccentImage`, `applyBrandImage`, `toggleBrandLock`, `applyBrandLockToAll`, `getDraftCount`, `insertDraft`, `dismissDraftTray`, `goToSlide`, `duplicateActive`, `deleteActive`.

Voice tools (ElevenLabs, `VoiceAgentPanel.tsx`): `listSmartLayouts`, `insertSlide`, `setSlideField`, `setAccentImage`, `toggleBrandLock`, `applyBrandToAllSlides`, `listDraftTray`, `insertDraftSlide`, `dismissDraftTray`, `goToSlide`, `duplicateActiveSlide`, `deleteActiveSlide`. Dynamic system prompt lists them only when editor is open.

Keyboard: `?` toggles cheatsheet, `⌘/Ctrl+L` toggles brand lock, `Esc` closes overlays. Toolbar surfaces a quick **Insert ▾** popover that lists every `SLIDE_BLOCK_TEMPLATES` entry. Title shows "BRAND LOCK" + "N DRAFTS" status badges.

Alt+drop of a BrandHub image onto the canvas applies it as accent image instead of body image; SlideAssetSearchPanel exposes a per-tile "Accent" action that calls `setAccentImageForSlide`.
