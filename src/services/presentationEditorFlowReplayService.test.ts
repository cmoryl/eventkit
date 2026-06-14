import { describe, expect, it } from 'vitest';
import { applyPresentationEditorReplayAction, replayPresentationEditorUserFlow, validatePresentationEditorReplaySuite } from './presentationEditorFlowReplayService';

const baseReplayState = {
  hasDeck: false,
  hasBrand: false,
  hasEdits: false,
  logoChecked: false,
  qaPassed: false,
  exportChecked: false,
  exported: false,
  reusableSaved: false,
  presentationPreviewed: false,
  warnings: [],
};

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
    const state = applyPresentationEditorReplayAction({ ...baseReplayState, hasDeck: true }, 'review_export_pptx');

    expect(state.exported).toBe(false);
    expect(state.warnings.length).toBeGreaterThan(0);
  });

  it('blocks preflight before QA has passed', () => {
    const state = applyPresentationEditorReplayAction({ ...baseReplayState, hasDeck: true }, 'review_export_check');
    expect(state.exportChecked).toBe(false);
    expect(state.warnings).toContain('Export preflight blocked: QA has not passed.');
  });

  it('blocks presentation preview before a deck exists', () => {
    const state = applyPresentationEditorReplayAction(baseReplayState, 'view_present');
    expect(state.presentationPreviewed).toBe(false);
    expect(state.warnings).toContain('Present blocked: no deck exists.');
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
