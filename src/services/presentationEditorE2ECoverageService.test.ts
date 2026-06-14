import { describe, expect, it } from 'vitest';
import { buildPresentationEditorE2ECoveragePromptBlock, buildPresentationEditorE2ECoverageReport } from './presentationEditorE2ECoverageService';

describe('presentation editor E2E coverage report', () => {
  it('returns a ready verdict when matrix, replay, and export gates pass', () => {
    const report = buildPresentationEditorE2ECoverageReport();
    expect(report.verdict).toBe('ready');
    expect(report.score).toBeGreaterThanOrEqual(95);
    expect(report.actionCoverage).toBe(100);
    expect(report.pairwiseCoverage).toBe(100);
    expect(report.replayCoverage).toBe(100);
    expect(report.exportGateCoverage).toBe(100);
  });

  it('builds a prompt block for agent/debug reporting', () => {
    const prompt = buildPresentationEditorE2ECoveragePromptBlock();
    expect(prompt).toContain('PRESENTATION EDITOR E2E COVERAGE REPORT');
    expect(prompt).toContain('Verdict: ready');
  });
});
