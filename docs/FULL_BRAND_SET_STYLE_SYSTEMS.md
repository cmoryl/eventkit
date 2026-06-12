# Full Brand Set Style Systems

EventKit now supports reusable style systems for complete brand sets.

A style system is not a one-off visual preset. It is a full-set creative direction layer that tells the Brand Brain how the same brand should behave across:

- banners
- social posts and stories
- signage
- badges and credentials
- lanyards
- decks/presentations
- merch/apparel
- backdrops
- environmental graphics
- functional QR/WiFi assets
- email headers and digital assets

## Style systems currently available

- Enterprise Precision
- Modular Campaign System
- Cinematic Editorial
- Liquid Glass Depth
- Human Moments
- Abstract Transformation
- Premium Minimal
- Hospitality Warmth
- Sports Energy
- Luxury Editorial
- Product Tech
- Environmental Immersive

## How they work

`src/services/brandStyleSystemService.ts` defines the reusable systems. Each system contains:

- full-set behavior
- visual DNA
- color behavior
- typography behavior
- layout behavior
- motif behavior
- imagery behavior
- production behavior
- best-use cases
- avoid rules
- asset-family translation guidance

The service can either infer style systems from a brand profile and its uploaded Brand Guide assets, or the user can select style systems manually.

## UI

Route:

`/brand-style-systems`

Users can:

- choose a brand
- review inferred style systems
- manually select one or more style systems
- save the selected systems for that brand
- restore inferred systems

## Prompt integration

`brandAssetLibraryService` injects the active style systems into the Brand Brain prompt block. That means style-system guidance flows into generation automatically because the active Brand Brain prompt block is already injected into master direction and per-asset generation.

## Blending rules

When multiple style systems are active:

- primary system controls structure
- secondary system controls atmosphere
- tertiary system controls accents/details
- density, crop, and scale may change by asset type
- core art direction must not drift

## Goal

This lets different brands have different full-set creative systems without breaking the universal EventKit template logic.

Example:

- TransPerfect can blend Enterprise Precision + Modular Campaign System + Abstract Transformation + Human Moments.
- Gas Alley can blend Cinematic Editorial + Sports Energy + Product Tech.
- Vinwood can use Hospitality Warmth + Premium Minimal.
- A SaaS brand can use Product Tech + Modular Campaign System + Liquid Glass Depth.
