import type { ExportFidelityReport } from './presentationExportFidelityService';
import type { PresentationAgentQALoopReport } from './presentationAgentQALoopService';

export type ExportReadinessDecision = 'ready' | 'ready_with_notes' | 'needs_fixes';

export interface PresentationExportReadinessResult {
  decision: ExportReadinessDecision;
  canProceed: boolean;
  needsReview: boolean;
  score: number;
  requiredFixes: string[];
  notes: string[];
  nextActions: string[];
}

export const evaluatePresentationExportReadiness = (input: {
  exportFidelity: ExportFidelityReport;
  agentQA: PresentationAgentQALoopReport;
  allowReviewedProceed?: boolean;
}): PresentationExportReadinessResult => {
  const requiredFixes = [
    ...input.exportFidelity.issues
      .filter((issue) => issue.severity === 'fail')
      .map((issue) => issue.recommendation),
    ...input.agentQA.gates
      .filter((gate) => gate.status === 'fail')
      .flatMap((gate) => gate.fixes.length ? gate.fixes : [gate.message]),
  ];

  const notes = [
    ...input.exportFidelity.issues
      .filter((issue) => issue.severity === 'warning')
      .map((issue) => issue.recommendation),
    ...input.agentQA.gates
      .filter((gate) => gate.status === 'warning')
      .flatMap((gate) => gate.fixes.length ? gate.fixes : [gate.message]),
  ];

  const score = Math.round((input.exportFidelity.score + input.agentQA.score) / 2);
  const hasRequiredFixes = requiredFixes.length > 0;
  const hasNotes = notes.length > 0;
  const decision: ExportReadinessDecision = hasRequiredFixes
    ? 'needs_fixes'
    : hasNotes
      ? 'ready_with_notes'
      : 'ready';

  return {
    decision,
    canProceed: decision !== 'needs_fixes' || Boolean(input.allowReviewedProceed),
    needsReview: decision !== 'ready',
    score,
    requiredFixes,
    notes,
    nextActions: hasRequiredFixes
      ? requiredFixes.slice(0, 5)
      : hasNotes
        ? notes.slice(0, 5)
        : ['Export is ready.'],
  };
};
