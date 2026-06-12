# Gamma Research Integration for Presentation Studio

## Purpose

This document converts the Gamma research report into implementation guidance for EventKit / Presentation Studio.

The most important architectural takeaway is that Gamma behaves like a card-based, AI-native content system rather than a classic slide editor. For EventKit, that means Presentation Studio should evolve toward a shared content graph that can support presentations, documents, webpages, social assets, and graphics without losing deterministic PowerPoint export.

## Product principles to adopt

1. Keep EventKit as the source of truth.
2. Use Gamma-style workflows as inspiration, not as a live editing dependency.
3. Separate theme tokens, layout templates, generation styles, and export/runtime behavior.
4. Treat external Gamma-style APIs as generation or handoff adapters, not document-editing APIs.
5. Build deterministic enterprise templating with named slots and validation.

## Immediate updates mapped into the codebase

### 1. Gamma-inspired research service

File: `src/services/gammaPresentationResearchService.ts`

Adds:

- creation modes
- deck style presets
- capability matrix
- card/block primitives
- theme token model
- Deck Brain prompt block

### 2. Gamma-inspired studio panel

File: `src/components/powerpoint/GammaInspiredStudioPanel.tsx`

Adds a UI panel that surfaces:

- Generate / Paste / Import / Template / Agent modes
- Ship-now, Next, Later, and Research priority filters
- capability cards
- card/block primitive list
- Deck Brain prompt block

## Capabilities to fold into Presentation Studio

### Ship now

- Card/content graph model
- Creation mode layer
- Deck style presets: Minimal, Visual, Classic, Consultant
- Deeper theme token model
- Smart layout blocks
- Editable data blocks
- Deterministic template slots

### Next

- Fluid card + fixed export frame support
- Right-side insert rail
- Accent image system
- Advanced present runtime
- Export fidelity snapshots

### Later

- Toggles, nested cards, footnotes
- Site publishing
- Card-level analytics
- Enterprise governance UI

### Research

- Optional Gamma generation adapter
- Optional MCP/assistant adapter pattern
- Export/import handoff workflows

## Data model recommendation

Use this internal hierarchy:

- Workspace
- Artifact
- Page
- Card
- Block
- Theme
- Template
- Share Policy
- Generation Job
- Export Job
- Analytics Event

Slides should become one export/rendering view of cards. This preserves PowerPoint output while enabling Gamma-like docs/sites later.

## Important Gamma parity notes

- Gamma's public API is generation-centric, not an editing backend.
- Gamma's template substitution is prompt-guided and not a full deterministic variable compiler.
- EventKit should implement stronger named slots, fallback policies, validation, and preview checks.
- Exports should be tested separately from editor/present rendering.
- Brand logos and exact assets should remain deterministic layers, not model-generated artwork.

## Next engineering steps

1. Wire `GammaInspiredStudioPanel` into the PowerPoint/Presentation Studio area as a research-backed strategy panel.
2. Add `gammaCreationPresets` to PowerPoint Agent creation-mode selection.
3. Add `GammaDeckStyle` to the Presentation Deck Brain payload.
4. Expand saved templates into named-slot templates.
5. Add an insert rail using `gammaCardBlocks` as the first block registry.
6. Add accent-image controls to the live media/image inspector.
7. Add export fidelity checks to the deck QA service.
