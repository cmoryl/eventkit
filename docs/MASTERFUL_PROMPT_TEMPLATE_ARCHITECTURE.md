# Masterful Prompt Template Architecture

EventKit now uses a compiled prompt architecture instead of relying on one broad style sentence.

## Core idea

Every generated asset receives a layered prompt stack:

1. User/event prompt
2. Master asset-family template
3. Brand brain context
4. Cross-asset consistency rules
5. Exact-logo safe-zone rules
6. Level-5 DNA and visual anchors
7. Production quality gate
8. Scene/output mode rules

This makes default generations more consistent, more production-aware, and less generic.

## Asset families

`src/services/masterfulPromptTemplateService.ts` maps individual `AssetType` values into creative/production families:

- `banner`
- `social_post`
- `social_story`
- `presentation`
- `signage`
- `badge`
- `lanyard`
- `merchandise`
- `apparel`
- `backdrop`
- `qr_wifi_functional`
- `email_header`
- `environmental`
- `abstract_pattern`
- `content`
- `generic`

Each family has:

- render mode: `ai-first`, `hybrid`, or `deterministic`
- intent
- hierarchy rules
- layout intelligence
- imagery direction
- motif rules
- logo-safe-zone rules
- production checks
- negative prompt rules

## Render mode logic

### AI-first

Used where the model is strong at mood, atmosphere, campaign visuals, and visual exploration.

Examples:

- social posts
- stories
- abstract patterns

### Hybrid

Used where AI creates the visual system/background and the app should control exact elements like logos, final copy, QR codes, and functional text.

Examples:

- banners
- slides
- signage
- badges
- apparel
- environmental graphics

### Deterministic

Used where accuracy and function are more important than image invention.

Examples:

- QR/WiFi assets
- lanyards
- content-first assets

## Integration point

`src/services/aiBrain/promptCompiler.ts` imports `buildMasterfulPromptTemplateBlock` and injects the master template block into every compiled image-generation prompt before Level-5 DNA, anchors, uniqueness, quality gates, and scene rules.

## Logo rule

The model still never renders the visible logo.

The master prompt template reserves a blank logo-safe zone. The exact source logo is then applied by deterministic overlay after generation.

## Production quality gate

The compiler now enforces:

- clear hierarchy
- no equal-weight clutter
- blank logo zone when overlay is required
- readable text/content zones
- brand color, typography, motif, and layout consistency
- no fake logos, fake UI, fake sponsors, or nonsense micro-details
- realistic physical mounting for environmental/print scenes

## Next layer

The next production step is storing prompt templates and template versions in the cloud brand brain so teams can approve, A/B test, roll back, and promote prompt versions by asset family.
