# Brand Brain Cloud Sync

The Brand Brain is the persistent brand intelligence layer for EventKit.

It combines:

- `BrandProfile` rules: colors, typography, logo rules, imagery, layout, accessibility, export rules.
- Brand guide assets: exact logos, SVGs, transparent PNGs, photography, illustrations, icons, patterns, textures, do examples, and don't examples.
- Generation behavior: prompt guidance, reference images, pattern references, and exact-logo overlay enforcement.

## Supabase persistence

Migration:

`supabase/migrations/20260612202000_create_brand_brain_assets.sql`

Creates:

- `public.brand_brains`
- `public.brand_brain_assets`
- private Storage bucket `brand-brain-assets`

The safe default access model is user-owned via `auth.uid()`. `workspace_id` is included as a future team-sharing expansion point, but the initial policies intentionally do not expose cross-user data.

## Frontend services

### Local asset brain

`src/services/brandAssetLibraryService.ts`

Handles local brand guide assets and generation context construction. This preserves local-only behavior when Supabase is not configured.

### Cloud sync and hydration

`src/services/brandAssetCloudService.ts`

Handles:

- creating/upserting a cloud brand brain for the active `BrandProfile`
- uploading brand guide files to Supabase Storage
- upserting asset metadata into `brand_brain_assets`
- pulling cloud assets back into the local generation library
- deleting cloud asset metadata/storage files when possible
- building a cloud-backed generation context with local fallback
- using a short hydration cache so generation does not repeatedly download the same brand brain assets

## UI

Routes:

- `/brand-brain` — overview of the active brand brain, readiness, cloud state, what enters generation, and recent assets.
- `/brand-assets` — asset library management for the active brand.

The Brand Guide Assets page supports:

- add assets
- set primary logo
- sync cloud
- pull cloud
- delete assets
- filter by type/usage

## Generation behavior

During generation, `useAIOrchestrator` loads the active brand's saved asset context and injects it into:

- master style direction
- per-asset prompt blocks
- reference image arrays
- pattern image arrays
- exact-logo enforcement

The primary logo source is selected in this order:

1. session-uploaded logo
2. cloud/local Brand Guide primary logo

The logo hard rule remains unchanged: AI does not redraw logos. The exact uploaded/source logo is composited after generation when logo visibility policy requires it.

## Next production layer

Add workspace/team policies when the app has a formal organization/workspace permission model.

Recommended next tables:

- `workspaces`
- `workspace_members`
- `brand_brain_permissions`

Then update RLS so brand assets can be shared across team members without making the storage bucket public.
