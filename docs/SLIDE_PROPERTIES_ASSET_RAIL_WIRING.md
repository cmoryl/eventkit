# Slide Properties Asset Rail Wiring

## Goal

Improve the `/agent/powerpoint` editor layout where the AI agent sits on the left, the live slide canvas sits in the middle, and the slide properties rail sits on the right.

The target user experience is a right-side properties rail that can search, preview, filter, validate, and apply all relevant assets without leaving the editor.

## Added components

### `SlideAssetSearchPanel`

Source: `src/components/slides/SlideAssetSearchPanel.tsx`

Provides the right-rail asset surface for:

- current slide image previews
- BrandHub image previews
- approved brand imagery categories
- source filters for All, Slide, Brand, and Hub assets
- source-aware category chips with counts
- automatic category reset when the source changes
- search by label, source, category, or URL
- click-to-apply image behavior
- guarded paste web image URL behavior
- Enter-key support for valid pasted URLs
- clear/reset filters when search scopes become too narrow
- accessible pressed states on source and category filters
- accessible labels for the library, search, reset, pasted image, and preview apply controls
- shortcut to open the larger Brand Assets library

### `BrandAssetsLibrary` upgrades

Source: `src/components/brand/BrandAssetsLibrary.tsx`

The existing Brand Assets browser now supports:

- All tab across every file type
- global search across assets, decks, docs, videos, events, and products
- larger preview cards
- selected reference count
- optional `onUseImage` hook for applying an image to the active slide

## Wiring script

Source: `scripts/wire-slide-asset-search-panel.mjs`

Dry run:

```bash
node scripts/wire-slide-asset-search-panel.mjs
```

Apply source patch:

```bash
node scripts/wire-slide-asset-search-panel.mjs --apply
```

The apply mode patches `src/components/slides/SlideEditor.tsx` to:

1. import `SlideAssetSearchPanel`
2. expose BrandHub files from `useBrandHubFiles`
3. mount the panel above the existing Slide Images section
4. apply selected assets directly to the active slide
5. wire the Brand Assets modal `onUseImage` callback into the active slide

## Validation markers

The wiring script now validates the patched output before passing. Required markers include:

- `SlideAssetSearchPanel` import
- `files: brandFiles` exposure from `useBrandHubFiles`
- mounted `<SlideAssetSearchPanel />`
- `brandFiles={brandFiles}` prop wiring
- Brand Assets `onUseImage` callback
- preserved `onReferenceSelectionChange={setReferenceFiles}` behavior

## Static contract coverage

Source: `src/components/slides/SlideAssetSearchPanel.static.test.ts`

The static contract test verifies:

- source filters remain available
- source-aware category filtering remains present
- category scope resets when the source filter changes
- selected filter chips expose pressed state semantics
- asset preview apply controls keep accessible labels
- primary controls keep accessible labels
- Brand imagery, BrandHub, and active slide assets stay in one searchable asset model
- pasted URL behavior remains guarded before applying to a slide

## Verification

`node scripts/test-presentation-studio.mjs` now runs:

- toolbar migration dry run
- asset rail wiring dry run
- presentation asset verification
- editor flow, replay, and E2E coverage tests
- slide asset panel static contract test

Use `node scripts/test-presentation-studio.mjs --apply-asset-panel` locally when ready to apply the live source migration.
