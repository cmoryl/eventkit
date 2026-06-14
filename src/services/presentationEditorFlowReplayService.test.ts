import { describe, expect, it } from 'vitest';
import { applyPresentationEditorReplayAction, replayPresentationEditorUserFlow, validatePresentationEditorReplaySuite } from './presentationEditorFlowReplayService';

describe('presentation editor flow replay simulator', () => {
  it('replays the blank-to-export flow into an exported deck', () => {
    const result = replayPresentationEditorUserFlow('blank-to-export');
    expect(result.pass).toBe(true);
    expect(result.finalState.hasDeck).toBe(true);
    expect(result.finalState.qaPassed).toBe(true);
    expect(result.finalState.exportChecked).toBe(true);
    expect(result.finalState.exported).toBe(true);
  });

  it('blocks export when QA and preflight are missing', () => {
    const state = applyPresentationEditorReplayAction({
      hasDeck: true,
      hasBrand: false,
      hasEdits: false,
      logoChecked: false,
      qaPassed: false,
      exportChecked: false,
      exported: false,
      reusableSaved: false,
      presentationPreviewed: false,
      warnings: [],
    }, 'review_export_pptx');

    expect(state.exported).toBe(false);
    expect(state.warnings.length).toBeGreaterThan(0);
  });

  it('keeps non-export critical flows from exporting early', () => {
    const repair = replayPresentationEditorUserFlow('import-to-repair');
    const reuse = replayPresentationEditorUserFlow('edit-and-reuse');
    expect(repair.pass).toBe(true);
    expect(repair.finalState.exported).toBe(false);
    expect(reuse.pass).toBe(true);
    expect(reuse.finalState.reusableSaved).toBe(true);
  });

  it('validates the full critical-flow replay suite', () => {
    const suite = validatePresentationEditorReplaySuite();
    expect(suite.pass).toBe(true);
    expect(suite.exportFlow?.finalState.exported).toBe(true);
  });
});
