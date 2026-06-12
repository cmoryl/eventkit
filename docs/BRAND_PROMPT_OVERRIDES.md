# Brand Prompt Overrides

Brand Prompt Overrides let each brand customize the universal EventKit template system without breaking the core safety and production rules.

## Purpose

Universal master templates answer:

> How should this asset family be designed?

Brand Prompt Overrides answer:

> How should this specific brand handle this asset family differently?

## Scope

An override can target:

- `global`
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

Global overrides compile into every asset family. Scoped overrides compile only into that asset family.

## Status

Only `approved` overrides enter generation.

- `draft` — saved but not used yet
- `approved` — compiled into prompts
- `archived` — removed from active use

## Rule categories

Each override can define:

- strategy notes
- hierarchy rules
- layout rules
- imagery rules
- motif rules
- typography rules
- production rules
- negative rules
- QA rules

## Integration

`src/services/aiBrain/promptCompiler.ts` now injects:

1. masterful asset-family template
2. full brand set style system block
3. approved brand-specific prompt override block
4. Level-5 DNA
5. layout rules
6. quality gate
7. output mode / scene rules
8. brand intelligence

## UI

Route:

`/brand-prompt-overrides`

Users can create, edit, approve, archive, and delete brand prompt overrides.

## Hard rule

Brand overrides are powerful, but they cannot override:

- exact logo enforcement
- accessibility requirements
- production safety rules
- no-fake-logo policy
- no invented sponsors/claims policy

## Cloud storage

Migration:

`supabase/migrations/20260612214500_create_brand_creative_direction.sql`

Adds:

- `brand_style_system_selections`
- `brand_prompt_overrides`

Current frontend behavior still uses local storage for immediate UX. These tables prepare the production cloud layer for teams, approvals, and shared brand brain governance.
