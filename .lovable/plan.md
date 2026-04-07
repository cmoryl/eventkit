

# Achieving Consistent Renderings Across Assets

## The Problem

Currently, each asset generation is essentially independent — the AI receives brand context and style instructions but generates each design from scratch with no shared visual "DNA." This leads to:
- Different color treatments, gradients, and compositions across assets
- Inconsistent typography rendering and layout styles
- No visual thread connecting a banner to a badge to a social post
- The Master Style Director exists but its output isn't reliably injected into every generation call

## Root Causes

1. **Master Style Direction is underutilized** — `masterStyleDirector.ts` generates a unified direction but it's not wired into the single-asset `AssetGenerationCanvas` flow, only batch generation
2. **No style seed image** — each generation starts from zero visual context; there's no "anchor image" to reference
3. **Variation prompts diverge** — the 4 variations use different style suffixes ("modern minimalist," "bold dynamic," etc.) which push renders apart rather than keeping them cohesive
4. **No shared visual reference** — the AI has no way to see what other assets in the kit look like

## Plan

### 1. Wire Master Style Direction into single-asset generation
- In `AssetGenerationCanvas.tsx`, call `generateMasterStyleDirection()` once when the studio opens (or reuse a cached result)
- Inject the `buildMasterDirectionPromptBlock()` output into every generation prompt, both initial and regeneration
- Cache the direction per event+brand combo so it's instant on subsequent assets

### 2. Add "Style Anchor" — first generated asset becomes the visual reference
- After the first successful asset generation in a session, store its image URL as a "style anchor"
- Pass this anchor image as a `STYLE REFERENCE` to all subsequent generations with the instruction: "Match the exact visual treatment, color application, and composition style of this reference"
- Store the anchor in a React context (`StyleAnchorContext`) so it persists across studio navigations
- Allow users to manually pick which generated image becomes the anchor via a "Pin as Style Anchor" button

### 3. Tighten variation prompts for cohesion
- Change the 4 variation suffixes from divergent styles to minor composition tweaks within the same style: "layout variant A: centered hero," "layout variant B: asymmetric," etc.
- Keep color treatment, typography, and mood identical across all 4 — only vary spatial arrangement
- This ensures all variations feel like siblings, not cousins

### 4. Inject style anchor into batch generation
- Update `BatchGenerationModal.tsx` to generate the first asset, use it as the style anchor, then pass it as a reference image to all subsequent batch items
- This creates a "chain of consistency" — each asset references the same visual anchor

### 5. Add a "Consistency Score" indicator (optional UX polish)
- After generation, show a small badge indicating whether the Master Style Direction was applied
- Display "Kit-consistent" when the anchor image was used as a reference

## Technical Details

**Files to create:**
- `src/contexts/StyleAnchorContext.tsx` — React context storing the current style anchor image URL and master direction

**Files to modify:**
- `src/components/studio/AssetGenerationCanvas.tsx` — integrate master direction + style anchor into generation calls; tighten variation prompts; add "Pin as Style Anchor" button
- `src/components/studio/BatchGenerationModal.tsx` — chain first result as anchor for remaining batch items
- `src/components/studio/CreationStudio.tsx` — wrap with `StyleAnchorProvider`
- `supabase/functions/generate-image/index.ts` — accept and use `masterDirection` field in the request body to prepend to prompts
- `supabase/functions/_shared/prompt-builder.ts` — add helper to merge master direction block into the full prompt

**Data flow:**
```text
Studio opens → generateMasterStyleDirection() → cache result
    ↓
User generates Asset A → master direction injected into prompt → result stored as style anchor
    ↓
User generates Asset B → master direction + Asset A image as STYLE REFERENCE → visually consistent
    ↓
Batch generation → Asset 1 generated → becomes anchor → Assets 2-N reference it
```

