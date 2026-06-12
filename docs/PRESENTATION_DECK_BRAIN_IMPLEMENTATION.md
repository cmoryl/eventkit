# Presentation Deck Brain Implementation

This is the first build step from the PowerPoint Agent + Presentation Studio audit.

## Added services

### `src/services/presentationDeckBrainService.ts`

Builds a deck-specific Brand Brain payload for PowerPoint generation.

It combines:

- active `BrandProfile`
- Brand Guide assets
- exact source logo availability
- selected full brand set style systems
- approved presentation/global prompt overrides
- brand colors, fonts, gradients
- PowerPoint production rules
- export profile rules
- deck QA checklist
- a compiled `PRESENTATION DECK BRAIN` prompt block

The payload is designed to be sent to `generate-deck` as `presentationIntelligence` and appended into `themeOverride` as a backwards-compatible fallback.

### `src/services/powerpointToolRegistry.ts`

Defines the advanced user-facing PowerPoint creation tools the agent should expose and reason about:

- generate outline
- build deck
- import source deck
- extract template DNA
- apply brand system
- enforce logo-safe zones
- repair slide hierarchy
- compress text density
- convert bullets to chart
- convert bullets to timeline
- convert slide to KPI grid
- add case study section
- add appendix
- expand speaker notes
- adapt for audience
- audit deck
- export editable PPTX
- prepare video storyboard

The registry also exports a prompt block for the agent.

### `src/services/presentationDeckQualityService.ts`

Adds deck QA scoring for:

- slide count alignment
- exact source logo availability
- active style systems
- missing titles
- missing speaker notes
- text density
- bullet overload
- repeated layouts

## Next wiring step

Update `src/pages/PowerPointAgent.tsx` so `buildInvokePayload` gets a hydrated Presentation Deck Brain before calling `generate-deck`.

The intended payload addition:

```ts
{
  presentationIntelligence: deckBrain,
  themeOverride: buildPresentationThemeOverride(deckBrain, existingThemeOverride)
}
```

Then update `supabase/functions/generate-deck/index.ts` so the edge function formally accepts `presentationIntelligence` and injects its `promptBlock` into the deck planning prompt.

## Why this matters

This makes Presentation Studio use the same intelligence layer as the rest of EventKit:

Brand assets + exact logos + style systems + prompt overrides + PowerPoint production rules + QA checks.
