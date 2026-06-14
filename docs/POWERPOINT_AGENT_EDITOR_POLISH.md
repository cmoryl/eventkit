# PowerPoint Agent Editor Polish

## Goal

Improve the `/agent/powerpoint` editor experience so the AI agent, live slide canvas, and slide properties rail feel like one production editing workspace.

The current focus is the editor-left AI agent panel that sits beside the inline `SlideEditor`.

## Prepared migration

Source: `scripts/prepare-powerpoint-agent-sidebar-polish.mjs`

Dry run:

```bash
node scripts/prepare-powerpoint-agent-sidebar-polish.mjs
```

Apply source patch:

```bash
node scripts/prepare-powerpoint-agent-sidebar-polish.mjs --apply
```

The apply mode patches `src/pages/PowerPointAgent.tsx` to:

1. tighten the AI agent sidebar subtitle
2. add live editor context chips
3. show active brand context in the sidebar
4. show editor slide count in the sidebar
5. improve the empty sidebar prompt
6. add accessible labels to the sidebar edit input and send action

## Validation markers

The migration validates these markers before passing:

- `Refine, edit, and send deck changes`
- `Live editor`
- `Ask the agent to rewrite a slide`
- `aria-label="Ask the presentation agent for a deck edit"`
- `aria-label="Send deck edit request"`

## Verification

`node scripts/test-presentation-studio.mjs` now includes the PowerPoint agent sidebar polish migration in dry-run mode.

Use this when ready to apply the live source migration:

```bash
node scripts/test-presentation-studio.mjs --apply-powerpoint-sidebar
```

This runs the sidebar patch alongside the existing Presentation Studio verification path so drift is caught before the UI is changed.
