## Beat-Gamma sprint for /agent/powerpoint

Goal: leapfrog Gamma in six concrete moves, all shipping in one sprint. We build on the SlideEditor + voice agent + BrandHub stack we already have.

### What ships

**1. Smart Layouts library** (extends the new section panel)
- Add a tabbed `SlideSmartLayoutsPanel`: Basic / Structure / Data / Media.
- New structural layouts beyond the current 12: `timeline-horizontal`, `timeline-vertical`, `stat-grid`, `gallery-3up`, `gallery-grid`, `process-arrow`, `comparison-vs`, `columns-3`, `kpi-trio`, `pull-callout`, `quote-card`.
- Each tile renders a real mini-preview using a tiny `<SlideRenderer>` scale, draggable to canvas / thumbnail rail (drop wiring already exists).
- Layouts are template entries (see #3), not just raw `SlideLayout` values, so they carry seeded copy and slot defaults.

**2. Accent image system** (Gamma's signature visual move)
- New `SlideData.accentImage?: { url, position: 'top'|'left'|'right'|'background', overlay: 'none'|'frosted'|'faded'|'clear', intensity: 0..1, focalX, focalY }`.
- `SlideRenderer` / `SlideLayout` honor accent position with proper layout shift (image takes one column / full bleed).
- New `AccentImagePanel` in inspector: position selector (5 swatch buttons), overlay style, intensity slider, focal-point picker.
- BrandHub asset rail gains a second click-target: "Use as accent image" (and dropping an image while holding `Alt` on the canvas sets it as accent instead of body image).
- Backwards compatible: slides without `accentImage` render exactly as today.

**3. Named-slot templates** (deterministic, vs Gamma's loose prompt sub)
- New file `src/components/slides/slideTemplateRegistry.ts` exporting `SLIDE_TEMPLATES: SlideTemplate[]` where each template has:
  - `id`, `category`, `label`, `layout`, `slots: { name, type, default, required }[]`, `seed: Partial<SlideData>`.
- Helper `applySlideTemplate(template, values, brand)` returns a fully-populated `SlideData`, validating required slots and falling back to defaults.
- Slot editor in inspector when a slide was created from a template: simple key/value form, validates types (string/number/image-url/stat).
- Powers both the Smart Layouts panel (#1) and the voice agent (#4).

**4. Voice-driven live editing** (we already have ElevenLabs)
- Extend `PowerPointAgent.tsx` `clientTools` with: `insertSlide({ templateId, values })`, `setSlideField({ field, value })`, `setAccentImage({ position, overlay })`, `applyBrandImage({ assetName, role })`, `goToSlide({ index })`, `duplicateActive()`, `deleteActive()`.
- A new `useSlideEditorBridge` context exposes mutating callbacks from `SlideEditor` to `PowerPointAgent` so voice commands hit the live editor state.
- Voice + Smart Layouts means "add a stat slide with 99 percent retention" works end-to-end. No new edge functions needed — uses the existing `elevenlabs-token` function and the agent's already-configured Agent ID.

**5. Live AI-output drag-onto-canvas**
- Replace AI Slide Generator's "Replace deck" with "Generated slides tray": a horizontal strip of generated card thumbnails docked under the canvas.
- Each thumbnail is draggable (reuses `SLIDE_SECTION_MIME` shape) so users drop generated slides into precise positions instead of nuking the deck. Old "Replace deck" remains as a secondary button.

**6. Pixel-perfect brand lock**
- New `BrandLockBar` in the editor header showing active brand chip + a lock toggle. When locked, all newly-inserted slides:
  - Inherit `bgColor`, accent color, fonts from active brand.
  - Auto-apply the brand's compositor-baked logo URL (primary / mono / reversed) chosen via slide background luminance.
  - Reject AI-generated palettes that drift from brand tokens (toast + auto-correct).
- Pulls existing `brandColors` / `brandFonts` already plumbed into `SlideRenderer`.

### Architecture sketch

```
src/components/slides/
  SlideEditor.tsx                    (mount panels, expose bridge)
  SlideSectionLibraryPanel.tsx       (REPLACED by ↓ )
  SlideSmartLayoutsPanel.tsx         (#1, tabbed, real-preview tiles)
  AccentImagePanel.tsx               (#2)
  SlideTemplateSlotEditor.tsx        (#3)
  GeneratedSlidesTray.tsx            (#5)
  BrandLockBar.tsx                   (#6)
  slideTemplateRegistry.ts           (#3, source of truth)
  slideTypes.ts                      (+ accentImage, + templateId/slotValues on SlideData)
  SlideRenderer.tsx / SlideLayout.tsx (render accentImage)

src/pages/PowerPointAgent.tsx        (expanded clientTools, BrandLockBar mount)
src/hooks/useSlideEditorBridge.ts    (#4, context bridge for voice)
```

### Out of scope (deliberately deferred)

- Card model with toggles / nested cards (multi-week refactor; revisit after this sprint).
- Web publishing (deck-as-site) — separate sprint.
- Server-side template storage in Supabase — registry ships client-side first; we add a `slide_templates` table later if users want to save custom ones.

### Verification

- Typecheck clean.
- `/agent/powerpoint?tab=editor` loads with no console errors.
- Drag a Smart Layout tile onto canvas → new slide inserts with seeded copy.
- Drag a BrandHub image onto a slide → normal swap. Hold Alt → becomes accent image.
- Voice "add a stat slide with three columns" → slide appears live; sidebar logs the tool call.
- Lock brand → newly inserted slides pick up brand colors and logo automatically.

### Approach

Single sprint, executed in one pass (no check-ins between phases per saved preference). Order: types → registry → smart layouts panel → accent images → bridge + voice tools → AI tray → brand lock → polish.