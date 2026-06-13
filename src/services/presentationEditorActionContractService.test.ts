import { describe, expect, it } from 'vitest';
import { editorActionGroups } from './presentationEditorActionAuditService';
import { getPresentationEditorActionsByGroup, presentationEditorActionContracts } from './presentationEditorActionContractService';

describe('presentationEditorActionContractService', () => {
  it('has canonical actions for every consolidated editor group', () => {
    for (const group of editorActionGroups) {
      expect(getPresentationEditorActionsByGroup(group.id).length).toBeGreaterThan(0);
    }
  });

  it('keeps every action in a known consolidated group', () => {
    const knownGroups = new Set(editorActionGroups.map((group) => group.id));
    for (const action of presentationEditorActionContracts) {
      expect(knownGroups.has(action.group)).toBe(true);
      expect(action.label.length).toBeGreaterThan(0);
      expect(action.currentSlideEditorHook.length).toBeGreaterThan(0);
    }
  });

  it('does not define duplicate action ids', () => {
    const ids = presentationEditorActionContracts.map((action) => action.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('marks required preflight actions as export blockers', () => {
    const blockers = presentationEditorActionContracts.filter((action) => action.blocksExportUntilComplete).map((action) => action.id);
    expect(blockers).toContain('brand_logo_check');
    expect(blockers).toContain('review_run_qa');
    expect(blockers).toContain('review_export_check');
  });
});
