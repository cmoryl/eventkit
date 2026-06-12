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
- Safe Supabase environment handling

## Next priority: visible compliance in Studio

Add a Brand Score panel to the studio workspace that shows:

- Overall brand score
- Color score
- Typography score
- Logo score
- Layout score
- Accessibility score
- Export readiness score
- Brand drift score
- Blocking issues
- Suggested fixes

The panel should use `preflightAssetSet` and `getAssetSetPreflightSummary` from `src/services/assetPreflightService.ts`.

## Generator enforcement layer

Every asset generator should receive the active BrandProfile and current mode.

Required behavior:

- Locked mode blocks off-brand colors and fonts.
- Guided mode warns and suggests fixes.
- Inspired mode allows wider exploration but marks outputs as not final-compliant when needed.
- Experimental mode allows exploration and clearly labels outputs as exploratory.

## Export enforcement layer

Before export, run all selected assets through preflight.

Export buttons should support:

- Export approved only
- Export with warnings
- Block export when locked mode has errors
- Generate fix suggestions
- Create a preflight report inside the ZIP export

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
