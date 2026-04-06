
## Phase 1: Direct Brand Picker (browse BrandHUB brands without copying URLs)

**Problem**: Users must copy share URLs from BrandHUB and paste them into EventKIT.

**Solution**: Add a "Browse BrandHUB" tab to the BrandHubImportModal that:
1. Create a new edge function `browse-brandhub-brands` that queries BrandHUB's public brands REST API to list available brands with thumbnails
2. Add a searchable brand gallery grid inside the import modal with brand cards showing logo, name, colors
3. One-click import from the gallery — no URL copying needed
4. Support filtering by industry/category

## Phase 2: More Visual Assets in Generation Pipeline

**Problem**: BrandHUB has color combinations, display banner specs, gradients, booth templates, and icon sets that aren't fully injected into generation prompts.

**Solution**:
1. Update `brandContextLoader.ts` to pull additional AI knowledge entries (color combos, gradients CSS, display specs, division data) and inject them into the BrandContext
2. Enhance `promptCompiler.ts` to include gradient CSS values, approved color combinations, and display banner safe-zone rules in generation prompts
3. Add brand icon references as visual inputs alongside photography references in `brandImageryResolver.ts`
4. Include sponsor logos as base64 references when generating sponsor-related assets (step-and-repeat, sponsor walls)

## Phase 3: Auto-Sync on Changes

**Problem**: When BrandHUB data updates, EventKIT brands go stale.

**Solution**:
1. Add `brandhub_last_checked` timestamp column to `brands` table
2. Create a `sync-brandhub-brand` edge function that re-fetches and diffs changes
3. On studio load, if brand has `brandhub_share_token` and last sync > 24h ago, trigger background sync
4. Show a subtle "Brand updated" indicator in the studio header when new data is available
5. Add manual "Re-sync" button on the brand selector dropdown

## Phase 4: Two-Way Sync (Push Assets Back to BrandHUB)

**Problem**: Generated EventKIT assets can't be pushed back to BrandHUB's asset library.

**Solution**:
1. Create a `push-to-brandhub` edge function that uploads generated assets to BrandHUB's storage and registers them in the brand's imagery library
2. Add "Push to BrandHUB" button on individual assets and batch export
3. Map EventKIT asset types to BrandHUB imagery categories (social → social, merch → collateral, etc.)
4. Include generation metadata (prompt, style, fonts used) as asset descriptions in BrandHUB

---

**Implementation order**: Phase 1 → 2 → 3 → 4 (each builds on the previous)
