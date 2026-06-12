# EventKit BrandKit Engine

EventKit is a universal BrandKit and EventKit platform for creating brand-aware campaign, event, social, presentation, signage, and export-ready assets.

The goal is simple: upload or select a brand, generate the full asset system, and keep every output aligned with the active brand profile.

## Product direction

EventKit is not a single-brand tool. It supports reusable brand profiles, locked presets, custom uploaded brands, and guided creative expansion.

Core modes:

- **Locked** — strict compliance for approved brand systems.
- **Guided** — brand-safe variation with controlled flexibility.
- **Inspired** — creative expansion based on brand DNA.
- **Experimental** — exploration mode, not final-compliant.

## Brand architecture

The app now includes a universal brand profile foundation:

- `src/types/brandProfile.ts`
- `src/brandPresets/`
- `src/services/brandProfileService.ts`
- `src/services/brandComplianceValidator.ts`

TransPerfect 2026 is included as one locked preset, not as a globally hardcoded product identity.

## What the engine should validate

Every generated asset should be checked for:

- Color compliance
- Typography compliance
- Logo safety
- Clear space and layout consistency
- Accessibility and contrast readiness
- Export dimensions
- Brand drift

## Local development

```sh
git clone https://github.com/cmoryl/eventkit.git
cd eventkit
npm i
cp .env.example .env
npm run dev
```

## Environment variables

Use `.env.example` as the safe template. Do not commit real `.env` files.

## Tech stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn-ui
- Supabase
- PDF/PPTX/export tooling

## Next implementation layer

The next step is wiring the active `BrandProfile` into every generation and export path so each asset runs through `brandComplianceValidator` before final export.
