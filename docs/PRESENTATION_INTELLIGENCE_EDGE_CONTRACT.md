# Presentation Intelligence Edge Contract

This defines the server-side contract for bringing the Presentation Deck Brain into Supabase Edge Functions.

## Added helper

`supabase/functions/_shared/presentation-intelligence.ts`

This helper provides:

- `PresentationIntelligencePayload`
- `sanitizePresentationIntelligenceForModel`
- `buildPresentationIntelligencePromptBlock`
- `getPresentationLogoDataUrlForDeterministicLayer`

## Purpose

The client-side Presentation Deck Brain can include sensitive or large fields, such as exact source logo data URLs. The edge function must never place source logo image data into the model prompt.

The helper separates two concerns:

1. **Model-safe prompt intelligence**
   - brand name
   - export profile
   - template
   - style systems
   - brand tokens
   - PowerPoint production rules
   - QA checklist
   - logo-safe-zone instructions

2. **Deterministic PowerPoint layer data**
   - exact source logo data URL
   - intended for `pptxgenjs` insertion only
   - never sent to the model prompt

## Integration target

`supabase/functions/generate-deck/index.ts`

The next edge update should:

```ts
import {
  buildPresentationIntelligencePromptBlock,
  getPresentationLogoDataUrlForDeterministicLayer,
  type PresentationIntelligencePayload,
} from '../_shared/presentation-intelligence.ts';
```

Then extend `DeckRequest`:

```ts
interface DeckRequest {
  // existing fields...
  presentationIntelligence?: PresentationIntelligencePayload;
}
```

Then add to the user prompt:

```ts
const presentationIntelligenceBlock = buildPresentationIntelligencePromptBlock(req.presentationIntelligence);
```

And include that block in the prompt before the source/template sections.

For deterministic logo insertion:

```ts
const logoDataUrl = getPresentationLogoDataUrlForDeterministicLayer(req.presentationIntelligence);
```

Use `logoDataUrl` only in `pptxgenjs` rendering, not in model messages.

## Hard rule

The model may plan a logo-safe zone, but it must never generate, redraw, infer, recolor, or approximate a logo. Real logo pixels must come from source assets and be inserted as an editable PowerPoint image layer.
