# Presentation Studio Intelligence Runtime Wiring

## Objective

Connect the new Presentation Studio Intelligence services and panels into the live PowerPoint Agent and editor experience.

## Built pieces

- Gamma workflow services
- deck style picker
- template slot service
- content graph service
- export fidelity service and panel
- Agent QA loop service and panel
- competitive edge service and panel
- event history service and panel
- intelligence orchestrator
- payload composer
- Supabase persistence migration
- cloud persistence service
- lifecycle helpers
- runtime context adapter

## Runtime wiring path

1. Add an Intelligence panel or tab in the editor sidebar.
2. Build runtime context from mode, slides, brand, source, template, events, and review state.
3. Render production readiness, export readiness, Agent QA, export fidelity, competitive edge, and event history.
4. Record lifecycle events for source, brand, template, outline, deck build, edits, QA checks, review, and export.
5. Save intelligence snapshots before final export.
6. Include the intelligence payload composer in deck generation requests.
7. Preserve existing generation and editor behavior.

## Acceptance criteria

- Intelligence score is visible.
- Export readiness is visible before export.
- Event history persists per presentation.
- Lifecycle events are logged.
- Deck generation receives the composed intelligence prompt block.
- Existing editor and export behavior still works.
