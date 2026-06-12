# EventKit BrandKit Engine Roadmap

## Product thesis

EventKit should become a universal brand-aware asset engine: select or upload a brand, generate the complete campaign/event kit, validate every output, and export production-ready files without brand drift.

## Current foundation

- Universal BrandProfile type system
- Locked and guided brand modes
- Starter brand presets
- TransPerfect 2026 as a locked preset
- Brand compliance validator
- Asset preflight service
- Brand debug route at `/brand-debug`
- Studio Brand Preflight panel
- Downloadable preflight report
- Brand-safe export service foundation
- Brand export policy service
- Safe Supabase environment handling

## Current implementation notes

The app now has the core services needed for a production preflight loop:

- `src/services/brandComplianceValidator.ts`
- `src/services/assetPreflightService.ts`
- `src/services/brandSafeExportService.ts`
- `src/services/brandExportPolicy.ts`
- `src/hooks/useBrandSafeExport.ts`
- `src/components/brand/BrandPreflightPanel.tsx`

## Next priority: export enforcement wiring

The export foundation exists. The next pass should wire `useBrandSafeExport` into:

- Download All
- Advanced Export
- Batch Print Export
- Individual Asset Download

Expected behavior:

- Locked mode blocks export when preflight contains errors.
- Guided mode allows export with warnings.
- Inspired mode allows export but labels output as brand-inspired.
- Experimental mode allows export but marks output as non-final exploration.
- ZIP exports include `brand-preflight-report.txt` and `eventkit-export-manifest.json`.

## Generator enforcement layer

Every asset generator should receive the active BrandProfile and current mode.

Required behavior:

- Locked mode blocks off-brand colors and fonts.
- Guided mode warns and suggests fixes.
- Inspired mode allows wider exploration but marks outputs as not final-compliant when needed.
- Experimental mode allows exploration and clearly labels outputs as exploratory.

## Brand ingestion layer

Build ingestion from:

- Uploaded logo
- Uploaded brand guide PDF
- Website URL
- Screenshots
- Manual brand questionnaire
- Color palette
- Font selection
- Approved examples
- Restricted examples

The ingestion output should be a BrandProfile draft that users can edit before activating.

## Preset expansion

Add more starter presets:

- Sports Event
- Luxury Event
- Nonprofit
- Education
- Healthcare
- Legal
- Finance
- Creator Brand
- Local Business
- Conference / Expo

## Admin layer

Admins should be able to lock:

- Colors
- Fonts
- Logos
- Templates
- Export dimensions
- Generator prompts
- Accessibility rules
- Image style
- Approval status

## Pitch-ready target

The final product should be explainable in one sentence:

> Upload your brand. Generate every event and campaign asset. Stay compliant automatically.
