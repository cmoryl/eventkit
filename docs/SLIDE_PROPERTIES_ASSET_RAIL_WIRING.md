# Slide Properties Asset Rail Wiring

## Goal

Improve the `/agent/powerpoint` editor layout where the AI agent sits on the left, the live slide canvas sits in the middle, and the slide properties rail sits on the right.

The target user experience is a right-side properties rail that can search, preview, and apply all relevant assets without leaving the editor.

## Added components

### `SlideAssetSearchPanel`

Source: `src/components/slides/SlideAssetSearchPanel.tsx`

Provides the right-rail asset surface for:

- current slide image previews
- BrandHub image previews
- approved brand imagery categories
- search by label, source, category, or URL
- click-to-apply image behavior
- paste web image URL behavior
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

## Verification

`node scripts/test-presentation-studio.mjs` now runs the asset rail wiring script in dry-run mode so CI detects if the SlideEditor insertion points drift.

Use `node scripts/test-presentation-studio.mjs --apply-asset-panel` locally when ready to apply the live source migration.
